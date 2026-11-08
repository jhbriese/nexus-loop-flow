# Technische Architektur

## Stand 1.3.2

`icon.svg` zeigt ein sechsschaufeliges Pumpenrad mit transparenten Zwischenräumen.
Der Manifestpfad bleibt unverändert. `sidebarApps.tsx` verwendet für SDK-Apps
`AppIconMask` aus `AppIconImage.tsx`: CSS-Maske, Farbe `currentColor`, Größe 18 px.
Ein deckender SVG-Hintergrund würde deshalb nur als gefüllte Kachel erscheinen.
Die App-Auswahl zeigt dasselbe SVG in Cyan. Browser-Vorschau mit dem tatsächlichen
Masken-CSS des gepinnten Hosts: `preview/icon.html` und `preview/review-icon.png`.

App-ID und Speicherschlüssel bleiben unverändert. Der Canvas ist transparent und lässt die
Nexus-`panel-card` ihren Standardhintergrund zeichnen (siehe `src/panel/styles/tokens.scss`).
`draw.ts` teilt die rechte Fläche in Durchfluss und PUMPE; der frühere untere Balken entfällt.
`layout()` liefert gemeinsame Tankgeometrie für Zeichnung und `motionBounds()`.
Die Temperatur wird ohne Hintergrund innerhalb der animierten Fläche mitgezeichnet.
Die Anzeige hat keine Überschrift. Innenabstände entsprechen den 14 logischen Pixeln aus
`MonitoringWidget.module.scss` (`.performance`); der Host skaliert sie gemeinsam mit der Kachel.
Bei 0/fehlendem PWM und positivem Durchfluss zeichnet der Tank eine Wellenlinie ohne Füllung.

`useLocale()` liefert reaktiv die Nexus-Sprache. `i18n.ts` enthält vollständige Übersetzungen für
DE/EN/FR/ES/IT/PT/NL/PL und gecachte `Intl.NumberFormat`-Instanzen; andere Sprachen fallen auf Englisch zurück.
Statische Manifest-Labels werden vom 3.1.8-Einstellungseditor nicht übersetzt.

## Reproduzierbare Basis

| Quelle | Gepinnter Stand |
|---|---|
| `https://github.com/hello-nexus/nexus.git` | Tag `v3.1.8`, Commit `edcec8541600d5ac934175b681297aa272500cff` |
| `nexus-web`-Submodul | `d5e5c1dcb34682458604540826bc39a20b03c9e8` |
| Build-CLI | `nexus-web/sdk/cli/nexus-app.mjs` |
| esbuild für Export-Setup | `0.25.0` |

Das Setup klont nur `nexus-web`, nicht die übrigen Submodule. Die normalen Buildskripte
verwenden keine Pfade aus der vorherigen ChatGPT-Umgebung. `.cache` ist vollständig reproduzierbar.
Upstream-Quellen bleiben in ihrem Repository mit ihren jeweiligen Lizenzen; sie werden nicht mit
diesem Export weiterverteilt. Die lokale `.cache`-Kopie nicht in Projekt-Commits aufnehmen.

Zum Nachprüfen des Service-Protokolls bei Bedarf zusätzlich im Upstream-Checkout
`git submodule update --init --depth 1 nexus-service` ausführen. Das wird vom Widget-Build nicht benötigt.

## Laufzeit

- Manifest `nexus.app/1`, Runtime `sdk`, App-ID `com.jan.loopflow`.
- `index.tsx` ist echtes React, läuft jedoch in einem von Nexus bereitgestellten SDK-Web-Worker.
- Imports `@hello-nexus/sdk`, `@hello-nexus/sdk/ui`, `react` werden von der CLI auf
  `globalThis.__nexusRuntime` abgebildet. React wird nicht ins Widget gebündelt.
- Der Host rendert nur zugelassene SDK-UI-Elemente. Rohes HTML/SVG in JSX würde nicht funktionieren.
- `Canvas` startet das gebündelte `renderer.mjs` in einem getrennten Worker mit OffscreenCanvas.
- `renderer.ts` benutzt Canvas 2D und importiert `draw.ts`; die Vorschau verwendet dieselbe Zeichenfunktion.
- `useSurface()` unterscheidet `cell` und `page`. Manifest-`surfaces` benennt dagegen
  Zielgeräte: `y70`, `desktop`, `monitor`. Diese beiden Namensräume nicht verwechseln.
- `page: true` ist nötig, damit die App ihre PC-Einstellungsseite und den Navigationseintrag hat.

## Datenfluss

`useDispatch()` ruft ausschließlich die lesende Host-Aktion **`cooling.state`** auf.
Im Manifest steht sie in `capabilities.dispatch`; `capabilities.appData` erlaubt Konfigurationsspeicherung.
RGB-/Netzwerkberechtigungen sind aus. Keine Kühlungs-Schreibaktionen vorhanden.

Der Host liefert `result.channels`, je Kanal unter anderem:

```ts
{
  id: string;
  name: string;
  rpm: number | null;
  dutyPercent: number | null;
  readOnly?: boolean;
  rpmUnavailable?: boolean;
  deviceName?: string | null;
}
```

- Polling sequenziell alle 2 Sekunden, kein überlappendes `setInterval` für Netzwerkaufrufe.
- Gültige Antwort: aktueller Snapshot und Empfangszeitpunkt.
- Fehler oder mehr als 7 Sekunden ohne erfolgreiche Antwort: Anzeige ohne Live-Werte.
- UI-Zeit `useTick(1000)` steuert Statusprüfung/Verlauf, nicht die Wellenphase.
- Flow-Werte und Pumpenprozent werden getrennt aus frei ausgewählten Kanälen gelesen.
- Pumpen-RPM werden unabhängig vom Prozentwert desselben Pumpenkanals gelesen.
- `result.sources` enthält `{ id, name, category, value }` für die von Nexus angebotenen
  Temperatursensoren. `Config.temperature` wählt optional eine Quelle. Ohne Auswahl kein Overlay;
  bei ausgewählter fehlender/ungültiger/veralteter Quelle „— °C“; echte 0 °C bleibt erhalten.
- `model.ts` enthält Umrechnung und Null-/Fehlerbehandlung.
- Verlauf in React-State, nur während der jeweiligen Instanz lebt; maximal 61 Samples/120 Sekunden.

Die SDK-Dokumentation hatte teilweise veraltete Aussagen zu Sensor-/Action-Unterstützung.
Maßgeblich für diese Implementierung war die registrierte Host-Aktion in
`nexus-service/src/Widgets/AppActions/CoolingActions.cs` des gepinnten Standes.
`AppCoolingStateDto` enthält keine Kurvenliste. Die interne Nexus-REST-API ist kein freigegebener
Widget-Zugriff; die gewünschte Kurvenauswahl bleibt daher deaktiviert mit Hinweis.
Service-Submodul zur Prüfung: `4f14a253427337315412c9d9a5464eb563cf75e5`.
Der Windows-Provider liefert bei fehlendem Control-Sensorwert ebenfalls 0, sodass das Widget
hier keine verlässliche Unterscheidung von echter 0-%-Ansteuerung vornehmen kann.

## Konfiguration

Gemeinsames Konfigurationsdokument je App und Nexus-Profil:

```ts
useAppData<Config>('configuration-v2', DEFAULTS)
```

`Config` speichert Pumpen-/Flow-/Temperaturquelle, Faktor, Einheit, Animation, Farbe, Diagrammskala,
Auflösung und das Kennzeichen `configured`.
Autospeichern auf der PC-Page mit 350-ms-Debounce und einer lokalen Änderungsnummer,
damit das Abschließen einer älteren Schreiboperation keine neuere Eingabe als gespeichert markiert.
Das SDK nutzt CAS mit Revisionen und Konfliktwiederholung. Gleichzeitige Bearbeitung mehrerer
PC-Seiten ist damit nicht vollständig fachlich gemergt: der zuletzt erfolgreich geschriebene
vollständige Draft kann die andere Änderung überschreiben. Bisher nicht als Problem gemeldet.

`useLocalState` wird nur noch als Migrationsquelle für alte Version-1.0-Kacheln gelesen.
Historische `pumpSource`/`flowSource`-Overrides werden aus `useSettings()` pro Kachel weitergelesen.
Ihre Textfelder sind seit 1.3.1 nicht mehr im Manifest enthalten; gespeicherte Daten bleiben erhalten.
Ein String wird zuerst als exakte ID, dann als eindeutiger Kanalname interpretiert.
Eine mehrdeutige Namensauswahl wird nicht geraten.
Der Faktor ist ein SDK-`Input`, nimmt Punkt oder Komma an und speichert nur positive endliche Zahlen.
Ein leerer/ungültiger Zwischenstand bleibt lokal. Nicht mehr vorhandene Quellen behalten ihren
gespeicherten Wert und erscheinen mit einem Fehlhinweis als Dropdown-Option.

Die normale manifestbasierte Nexus-Einstellleiste unterstützt im geprüften Stand keine
dynamisch befüllten Sensor-Dropdowns. Deshalb rendert die eigene PC-App-Page ihre Dropdowns
mit dem echten `channels`-Ergebnis. Nicht wieder auf frei einzutippende IDs als Hauptbedienung zurückfallen.
Die native Einstellleiste zeigt nur `configurationHelp`: `icon-select` mit `options: []`.
`MarketplaceWidgetSettings.tsx` rendert dafür ausschließlich das Label und einen leeren
Layoutcontainer. Es gibt in diesem Stand keinen dedizierten Hinweis-Typ; `text` würde eine
editierbare Textarea erzeugen. Die konkrete Host-Funktion wird in `check-visual.mjs` geprüft.

## Rendering / Ruckler vermeiden

- Interne Pufferauflösung mindestens Host-DPR, standardmäßig Faktor 3, maximal 4.
  Nexus-Host begrenzt seinen eigenen DPR normalerweise auf 1,5.
- Puffergröße nur bei tatsächlicher Größen-/Qualitätsänderung setzen; sonst würde Canvas jedes Mal löschen.
- `phaseMs` wird im Renderer fortlaufend aus Frame-`dt` weitergezählt.
- Props-Update setzt `dirty`, zeichnet bei aktiver Animation erst auf dem nächsten Frame.
- **Nicht** `draw(..., 0)` aus `onProps` verwenden: Das war die Ursache wiederholter Wellenrücksprünge.
- Zeitakkumulator statt hartem `now - last >= 1000/30`, mit epsilon-sicherer Restberechnung.
- Vollbild-Neuzeichnung bei geänderten Props oder Resize; sonst Clipping auf `motionBounds()`.
  Auch im geclippten Pfad werden Zeichenbefehle ausgeführt, aber nur der kleine Behälterbereich rasterisiert.
- `draw.ts` konstruiert die Grafik; Änderungen an Geometrie des Behälters müssen auch
  die Bounds anpassen, damit bei Teilzeichnung keine Ränder stehen bleiben.
- Nexus gibt Frames nur im sichtbaren Canvas weiter; abgeschaltete Animation zeichnet nur neue Daten/Layout.

## Tests

- `model.test.mjs`: Rechenwerte, Grenzen, echte Nullwerte versus fehlende Werte.
- `renderer.test.mjs`: importiert das tatsächlich ausgelieferte `renderer.mjs`, simuliert
  die Worker-Protokollnachrichten und 60-Hz-Ticks; testet Zeichenzeitpunkte und Clipping.
- `configuration.test.mjs`: importiert das tatsächliche `widget.mjs`, führt Hooks/Effekte mit
  Abhängigkeitsvergleich aus; prüft drei Quellen-Dropdowns und die deaktivierte Kurvenauswahl,
  Faktoreingabe, Autospeichern, Migration/Neustart, Overrides, Temperatur-Nullwerte und Ausfälle.
- `i18n.test.mjs`: vollständige Übersetzungen, regionale Sprachcodes und Zahlenformatierung.
- `scripts/check-visual.mjs`: optionale Chromium-Prüfung des gebauten `draw.mjs` und echten
  Renderer-Workers, 80 Layout-/Sprachvarianten, Pixelprüfung von Transparenz/Animation/Clipping.
  Setup: `npm.cmd install --prefix .cache/visual-check --no-save --package-lock=false playwright@1.59.1`.
  Ausführen: `node scripts/check-visual.mjs`; nutzt installiertes Chrome oder `CHROME_PATH`.
  Prüft auch die echte `SettingControl`-Funktion des gepinnten Hosts: Konfigurationshinweis
  ohne Input, Textarea, Select oder Button. Screenshots und Ergebnis-JSON unter `preview/`.
  Keine Hardwaremessung.

Die Tests prüfen die gebauten `.mjs`; deshalb nach Quellcodeänderungen **zuerst bauen**.
Sie messen keine Hardwareperformance und ersetzen keine visuellen Tests in Nexus.

## Installation

Der Service entdeckt private Apps unter `%ProgramData%\Nexus\apps\<app-id>`.
Das Installationsskript kopiert nur `manifest.json`, `widget.mjs`, `renderer.mjs`, `icon.svg`.
Vorhandene Version dieses App-Ordners wird vorher in `custom-widget-backups` gesichert.
Keine Benutzerprofildaten oder Kühlungsprofile werden geändert.
Ein vollständiger Nexus-Neustart ist nach dem Ersetzen nötig.

Die beigefügten Windows-Skripte wurden im früheren Ablauf vom Nutzer verwendet;
der exportierte plattformunabhängige Build wird zusätzlich in der Exportumgebung geprüft.
