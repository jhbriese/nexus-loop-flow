# Projektkontext – Stand 1.3.2 vom 08.11.2026

## App-Symbol und Nexus-Issue-Entwurf in 1.3.2

Jan wünschte ein stilisiertes Pumpenrad für „Mehr anzeigen“. `icon.svg` enthält jetzt
sechs geschwungene Schaufeln, Nabe und Außenring auf transparentem Grund. Der bisherige
deckende Hintergrund wurde von Nexus als massive Silhouette dargestellt. Die neue
Form ist mit dem tatsächlichen Masken-CSS des Hosts bei 18/24/32 px und als farbiges
SVG im Browser geprüft (`preview/review-icon.png`, `preview/icon.html`). Build,
Manifestvalidierung und 9 Tests bestanden. App-ID und gespeicherte Einstellungen
bleiben erhalten. Keine produktive Installation vorgenommen.

Für das Neustartproblem wurde am 08.11.2026 über die GitHub-API nach offenen und
geschlossenen Issues in `hello-nexus/nexus`, `nexus-service` und `nexus-web` gesucht
(jeweils alle Einträge, keine weitere Seite). Kein passender Bericht gefunden.
Die Berichte über HydroShift-USB-Ausfälle (#27) und iCUE-LINK-Konflikte (#10) betreffen
andere Hardware und Abläufe. Englischer, kopierfertiger Bericht nach dem Bug-Template:
`docs/NEXUS_STARTUP_ISSUE.md`. Ziel laut CONTRIBUTING: `hello-nexus/nexus`.
Noch nicht veröffentlicht; `gh auth status` meldet keine Anmeldung.

Hardware/Software lokal ausgelesen: X570 AORUS ELITE, BIOS F40 (28.10.2025), Ryzen
7 5800X3D, Windows 11 Pro 26H2 Build 26300.9711, Radeon RX 6900 XT Treiber
32.0.21045.16010, PawnIO.sys und installierte PawnIOLib.dll jeweils 2.2.0.
Der PawnIO-Kerneltreiber läuft, Startmodus Manual. LibreHardwareMonitorLib
0.9.7-pre748 ist im Quellstand von Nexus 3.1.9-beta.1 deklariert; die Version wurde
nicht separat aus dem AOT-Programm extrahiert. Keine Seriennummern oder Tokens im Bericht.
Jan bestätigte ausdrücklich: **Alphacool Core 140mm Reservoir D5 mit VPP Apex Pumpe
(13889)**. Diese Angabe ersetzt die frühere Unsicherheit über das Pumpenmodell.

## Pumpenanzeige nach Neustart: live geprüft am 08.11.2026

**Nachtrag 15:51 Uhr:** Jan beendete Nexus vollständig und startete es erneut. Jetzt liefern
`cooling.state` und `/cooling/fans` übereinstimmend **80 % bei 4017 RPM** statt vorher 0 %
bei 3154 RPM; die gespeicherte Flat-Kurve blieb auf 80 %. Das Widget kann den Wert korrekt
anzeigen. Der gleichzeitige RPM-Anstieg spricht gegen eine ausschließlich kosmetische Störung;
ein Nexus-/Hardware-Initialisierungsproblem ist plausibel, aber nicht abschließend bewiesen.
Kein Neustart oder Steuerungseingriff durch den Agenten. Diagnoseprotokoll unten verlinkt.

Jan meldete erneut 0 % trotz vorhandener Pumpen-RPM. Die lokale Diagnose bestätigt auf dem
inzwischen laufenden **Nexus v3.1.9-beta.1**: richtige Pumpen-ID `/lpc/it8688e/0/control/2`,
gespeicherte Flat-Kurve „Pumpe“ mit 80 %, interne Kurvenberechnung ebenfalls 80 %; gleichzeitig
Hardware-/Widget-Telemetrie 0 % bei etwa 3154 RPM. Kein Beleg für verlorene Kurveneinstellungen.
Ob die PWM-Rücklesung fehlt oder die Hardware den Sollwert nicht übernommen hat, bleibt offen;
die internen Sollwerte beweisen keine physisch anliegende PWM. Kein Steuerungstest durchgeführt.
Details und konkrete Datenquellen: `docs/PUMP_PERCENT_DIAGNOSIS.md`.
Das Widget bekommt weiterhin keinen separaten Sollwert. Kein Workaround durch RPM-Schätzung
oder feste 80, keine Quellcode-/Installationsänderung für diese Untersuchung.
Das Build-SDK bleibt 3.1.8. Produktiv wurde ein Widget-Manifest 1.3.0 vorgefunden;
1.3.1 liegt hier gebaut bereit.

## Anpassungen in 1.3.1

Auf Jans Folgeauftrag sind die Überschrift „Wasserkühlung“ und der Hintergrund der
Temperaturanzeige entfernt. Der Tank nutzt den freigewordenen Platz. Die Innenränder sind
14 logische Pixel wie `.performance` des gepinnten Nexus-Monitoring-Widgets; der Host übernimmt
die gemeinsame Skalierung. Die Animationsgrenzen werden aus derselben Tankgeometrie abgeleitet.

Die beiden nativen Textfelder sind aus dem Manifest entfernt. Stattdessen erscheint ausschließlich
der Hinweis auf **Nexus-Seitenleiste → Mehr anzeigen → Loop Flow** und das automatische Speichern.
Technik: `icon-select` mit leerer Optionsliste rendert im konkreten Nexus-3.1.8-Host nur sein Label,
keine Eingabefelder oder Schaltflächen. Dies wurde mit der tatsächlichen `SettingControl`-Funktion
aus dem gepinnten Host in der Browserprüfung verifiziert. Alte gespeicherte Kachel-Overrides
werden weiterhin gelesen; keine Konfiguration oder Profildatei wurde gelöscht.

Build, Manifestvalidierung, 9 Node-Tests und 80 Browser-Layoutvarianten erfolgreich.
Zusätzlich Einstellhinweis ohne Controls geprüft. Aktuelle Bilder: `preview/review-widget.png`
und `preview/review-settings.png`. Keine produktive Installation und kein Y70-Hardwaretest.

## Vorheriger Stand 1.3.0

### Änderungsauftrag und Ergebnis 1.3.0

Jan hat anhand zweier Screenshots die Version 1.3 beauftragt:
Standard-Kachelhintergrund, untere Linie entfernen, Titel „Wasserkühlung“, Pumpe als eigenen
Block neben Durchfluss (groß %, klein RPM), optionale Wassertemperatur im Tank und mehrsprachige Anzeige.
Die PC-Konfiguration bietet Lüfter Pumpe, Kurve Pumpe, Lüfter Flow-Sensor, Faktor-Eingabefeld
(Standard 98) und Wassertemperatursensor. Einheit, Animation und eingeklappte Darstellung bleiben.
Jan bestätigte ausdrücklich: Kurvenauswahl **nur für die Anzeige**, keine Zuweisung/Steuerung.

Umgesetzt in 1.3.0, App-ID und `configuration-v2` beibehalten. Temperatur ist optional und wird
aus `cooling.state.result.sources` gelesen. Sprache über `useLocale()`: DE, EN, FR, ES, IT,
PT (auch pt-BR), NL, PL; andere Sprachen Englisch. Native Manifest-Texte bleiben Deutsch,
weil der Einstellungseditor dieser Nexus-Version diese Labels nicht lokalisiert.

Zwei Grenzen im gepinnten Service/Host konkret geprüft:

- `CoolingActions.cs` / `AppCoolingStateDto` liefern nur `channels` und `sources`, **keine Kurven**.
  „Kurve Pumpe“ ist daher deaktiviert und erklärt den fehlenden Zugriff. Es gibt keine Dummy-Liste,
  keine direkte Service-Anbindung, keine neuen Netzwerkrechte und keine Schreibaktionen.
- `MarketplaceWidgetSettings.tsx` hat keine dynamischen Sensor-/Kanal-Picker. Bild 2 zeigt diese
  native Kachel-Einstellung, nicht die PC-App-Seite. Dropdowns über **Nexus-Seitenleiste → Mehr
  anzeigen → Loop Flow**. Bestehende optionale Kachel-Overrides bleiben erhalten und haben Vorrang;
  ihre Labels weisen jetzt auf die Dropdown-Seite hin.

Im Screenshot steht Pumpenansteuerung 0 %. Der alte Renderer zeichnet dann keinen Wasserbereich.
Jetzt zeigt eine bewegte Wellenlinie bei positivem Flow auch bei 0/fehlendem PWM Aktivität an;
sie fügt keine Füllfläche hinzu. Die vorhandene Wellenphase und die gespeicherte Animationseinstellung
bleiben erhalten. Der Windows-Service setzt fehlende PWM-Sensordaten selbst auf 0
(`WindowsFanControlProvider.GetFanChannels`); diese Null ist im Widget nicht von einer echten
Null unterscheidbar. Die konkrete Ursache nach Jans Neustart ist ohne Live-Messung nicht bestätigt.

Prüfung: Build, offizielle Manifestvalidierung, 9 Node-Tests; zusätzlich Chromium mit 80 Größen-/
Sprach-/Einheitenvarianten, transparentem Hintergrund, 0/fehlendem PWM, 80/100 %, Animation aus,
geclipptem Neuzeichnen und echtem OffscreenCanvas-Renderer-Worker (auch verborgen starten/fortsetzen).
Vorschauen: `preview/review.png`, `preview/review-zero.png`; `npm run preview` ist interaktiv.
Kein aktueller Nexus-/Y70-Hardwaretest und **keine produktive Installation**. Kein Git-Commit erstellt;
die übernommenen Projektdateien waren bereits unversioniert.

## Historische Übergabe 1.2 (nachfolgend unverändert als Kontext)

## Ziel und aktueller Stand

Jan hat seinen wassergekühlten PC in ein **HYTE Y70 Touch Infinite** umgebaut.
Er nutzt **Nexus 3.1.8**. Gemeinsam wurde das private Widget **Loop Flow 1.2.0** erstellt.
Es zeigt die Pumpenansteuerung in Prozent und den aus dem Tachosignal eines
**Barrow SLF-V3** berechneten Durchfluss. Der Quellcode des ausgelieferten Pakets ist hier beigefügt.

Jan hat die Gestaltung positiv bewertet. Nach Version 1.1 meldete er gelegentliche Ruckler
und eine zu umständliche Konfiguration. Version 1.2 korrigiert die Animation und vereinfacht
den PC-Dialog. Danach schrieb Jan „Super genau so ;)“ und stellte Fragen zur Pumpenregelung.
Eine gesonderte Messung von Bildrate oder CPU/GPU-Last auf seinem PC liegt nicht vor.
Der letzte Auftrag ist dieser Export, kein neuer Funktionsauftrag.

## Bestätigte Produktwünsche

- Stilisiertes gefülltes **Bassin / Reservoir** mit Wellenanimation.
- **Füllung und Balken = Pumpenansteuerung in %**. Es gibt keinen Wasserstandssensor.
- Durchfluss als Text in **l/h oder l/min**, ergänzend jeweils andere Einheit und rohe RPM.
- Gefülltes Liniendiagramm für den Durchflussverlauf, zwei Minuten.
- Pumpen- und Flow-Kanal frei aus den von Nexus vorhandenen Kanälen auswählbar.
- Umrechnungsfaktor frei einstellbar.
- Anzeige auf dem Gehäusedisplay ohne Überschrift/Kopfzeile und ohne Einstellbutton.
- Die Frage nach dem Ort der Konfiguration hat Jan ausdrücklich mit **„Nur am PC“** beantwortet.
- Konfiguration kompakt: zwei Dropdowns, Faktor, Einheit und Wellenanimation.
  Erweiterte Darstellung eingeklappt; Autospeichern statt zusätzlichem Speichern-Schritt.

## Hardware und Messsignal

- Mainboard laut vorheriger Diskussion: **Gigabyte X570 Aorus Elite Rev. 1.0**.
- Gehäuse: HYTE Y70 Touch Infinite, Display üblicherweise 682 × 2560.
- Durchflusssensor: **Barrow SLF-V3**, 3-Pin-Lüfteranschluss, als RPM ausgelesen.
- Pumpe/Reservoir: **Alphacool Core 140mm Reservoir D5 mit VPP Apex Pumpe (13889)**,
  am 08.11.2026 von Jan ausdrücklich bestätigt; nicht automatisch ausgelesen.
- Radiatoren: 280-mm EK CoolStream CE und 360-mm EK-Radiator, ungefähr 45 mm dick.
- GPU: AORUS RX 6900 XT Xtreme Waterforce WB.
- CPU/Mainboard-Block: EK Quantum Momentum Aorus X570 Elite laut früherer Konfiguration.
- Kreislauf vom Nutzer bestätigt:
  **Pumpe/Reservoir → 280er Radiator → 360er Radiator → Flow-Sensor → GPU → CPU → Pumpe**.
- Bei **80 % Pumpe** etwa **340 RPM** am Flow-Sensor; beobachtete Anzeige ungefähr 210–220 l/h.

## Umrechnung – maßgeblich ist die beigefügte Nutzeranleitung

In der Barrow-SLF-V3-Anleitung (lokal unter `references/`, nicht im Repository), Punkt 5, steht ausdrücklich:
**98 IMP/L** und im Beispiel **angezeigte Drehzahl geteilt durch 98 ergibt L/min**.
Das Widget folgt exakt dieser vom Nutzer bereitgestellten Umrechnungsanweisung:

```text
l/min = angezeigte RPM / Faktor
l/h   = angezeigte RPM / Faktor * 60
Faktor = 98 als Standard
340 RPM → 3,469387… l/min → 208,163265… l/h
```

Die technische Bezeichnung IMP/L und das RPM-Beispiel sind nicht völlig eindeutig, wenn ein
Mainboard Impulse nach der üblichen Lüfterkonvention interpretiert. Andere Webquellen nennen
zudem abweichende Zahlen. **Keinen stillen Faktor 2 hinzufügen und 98 nicht ungefragt ändern.**
Der Faktor ist gerade deshalb konfigurierbar. Die absolute Kalibrierung wurde nicht unabhängig
mit Referenz-Durchflussmesser oder volumetrischer Messung bestätigt.

Der Pumpenprozentwert stammt aus `dutyPercent` des ausgewählten Pumpenkanals.
Nicht aus Pumpen-RPM schätzen und nicht als gemessenen Füllstand darstellen.

## Entwicklung und Entscheidungen

### 1.0

- Funktionsfähiges SDK-Widget mit Kopfzeile „Loop Flow“ und „Einstellen“-Button.
- Konfiguration direkt in der Kachel, zwei vorhandene Kanal-Dropdowns.
- Canvas-Reservoir, Prozentbalken, Durchflusstext und Verlauf.
- Nutzerfoto bestätigt: Werte wurden auf dem realen Y70 angezeigt (etwa 209 l/h).

### 1.1

- Kopfzeile und Button entfernt, weil sie auf dem Display stören.
- Einstellungsseite als Nexus-App-Page; Konfiguration über `useAppData` profilweit geteilt.
- Migration vorhandener Kachel-Einstellungen aus `useLocalState`.
- Zeichenauflösung von maximal 1,5 (Nexus-Host) auf eigenen Puffer mit Standardfaktor 3 erhöht,
  optional 4; Schrift vergrößert. Nutzer bewertete das Erscheinungsbild positiv.
- Konfiguration war zu lang/umständlich; Animation ruckelte gelegentlich.

### 1.2 – aktueller Code

- **Ursache für einen Ruckler:** Renderer zeichnete bei jedem Props-Update mit Animationszeit 0.
  Da `now` jede Sekunde aktualisiert wird, sprang die Welle regelmäßig in ihre Anfangsphase zurück.
- Renderer besitzt jetzt eine fortlaufende `phaseMs`, gespeist aus dem Frame-Delta.
  Props-Änderungen markieren nur `dirty`; kein synchrones Zwischenbild mit Zeit 0.
- Bildrate über Zeitakkumulator begrenzt statt einer zweiten strikten Zeitabstandsschranke.
  Floating-Point-Grenzfall im Akkumulator wurde im Regressionstest gefunden und behoben.
- Zwischen Telemetrie-/Layoutupdates wird nur `motionBounds()` um den Behälter geclippt und neu gezeichnet.
  Schrift und Verlauf bleiben in diesen Frames erhalten. Größerer Bildpuffer bleibt für die Schärfe aktiv.
- PC-Seite: zwei Kanal-Dropdowns, Faktor, Einheit, Animation, Autospeichern nach 350 ms.
  Darstellungseinstellungen unter `Collapsible`, anfangs geschlossen.
- Einstieg direkt über **Nexus-Seitenleiste → Mehr anzeigen / Show more → Loop Flow**.
  Keine zusätzliche Desktop-Kachel nötig; Klick auf eine Desktop-Kachel bleibt ein alternativer Einstieg.

## Speichern und Migration

- App-ID unverändert `com.jan.loopflow`, Version 1.2.0.
- `useAppData<Config>('configuration-v2', DEFAULTS)` speichert die gemeinsame Konfiguration.
- Defaults: Faktor 98, l/h, Wellen an, Farbe #60d5f5, Diagrammmaximum 300 l/h,
  interne Zeichenauflösung 3; keine automatisch geratenen Kanal-IDs.
- Beim Start einer alten Kachel: alte Quellen/Faktor/Einheit/Animation werden übernommen,
  sofern die gemeinsame Konfiguration noch nicht eingerichtet ist.
- Native Widget-Einstellungen enthalten optionale Textfelder `pumpSource`/`flowSource`
  für eine abweichende Quelle pro Kachel. Exakte ID zuerst, eindeutiger Name als Fallback.
- Die tatsächlichen Nutzer-Kanal-IDs und Nexus-Profildateien liegen **nicht** im Export.

## Tests und ehrliche Grenzen

Bereits in der ursprünglichen Umgebung geprüft:

- Build und Manifest mit offizieller CLI des gepinnten Nexus-SDK.
- Umrechnung, Nullwerte, fehlende/ungültige Daten und Prozentgrenzen.
- Rendering mehrerer Größen, Einheiten, 0/100 % und fehlender Werte in nativer Canvas-Implementierung.
- Gebauter Renderer über tatsächliche Worker-Init/Props/Resize-Nachrichten.
- Version 1.2: Messwertupdate zeichnet kein Zwischenbild mit Phase 0; ungefähr 30-fps-Takt
  bei simulierten 60-Hz-Ticks; Teilbereichszeichnung; deaktivierte Animation.
- SDK-Schnittstelle mit gemockten Hooks: Display nur Canvas, kompakte PC-Seite mit zwei Dropdowns,
  Darstellung geschlossen, automatische Speicherung ohne Speichern-Button.

Die im Export reproduzierbaren Node-Tests arbeiten für den Renderer mit einem **gemockten
Grafikkontext**. Sie ersetzen keinen visuellen Test auf dem Y70 und keinen vollständigen
Browser-/Nexus-End-to-End-Test. Der Nutzer hat den realen Betrieb grundsätzlich bestätigt.
Langzeitverhalten, CAS-Konflikte mehrerer gleichzeitig bearbeitender App-Seiten und die
tatsächliche Last/Framerate auf dem PC sind nicht systematisch vermessen.

## Pumpenberatung nach Fertigstellung – keine Softwareänderung

210–220 l/h wurden als plausible Größenordnung für den beschriebenen Loop eingeschätzt,
mit Vorbehalt der Kalibrierung. Empfehlung: Pumpe zunächst konstant lassen, wenn leise und
Temperaturen gut. Bei Geräuschen eine geringere feste Ansteuerung unter vergleichbarer Last testen.
Eine spätere Pumpenkurve möglichst sanft nach Wassertemperatur; Radiatorlüfter temperaturabhängig.
Es wurde keine Pumpenkurve angelegt und keine Steuerung ins Widget eingebaut.

## Andere Nexus-Themen aus dem Gespräch

- Nexus 2 wird nicht mehr weiterentwickelt; Nutzer arbeitet mit Nexus 3.1.8.
- Discord-Widget: Website-Dokumentation listete es, aber der damals geprüfte 3.1.8-Quellcode
  registrierte kein integriertes Discord-Widget. Frühere Behauptung, es sei verfügbar, wurde korrigiert.
- Windows-Randgesten störten auf dem Y70. Es wurde eine Windows-Einstellung/Richtlinie besprochen,
  nicht im Widget implementiert. Kein Bestätigungsnachweis, ob die Registry-Änderung ausgeführt wurde.
- PowerShell blockierte anfänglich `Install.ps1`. Erfolgreicher Startweg wurde erklärt:
  `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\Install.ps1` im Admin-Terminal.
  Keine dauerhafte Änderung der Execution Policy empfohlen.

## Sinnvolle nächste Schritte bei weiterem Auftrag

1. Projekt/Teststand übernehmen, Anforderungen erhalten.
2. Bei erneutem Ruckeln zuerst Messwert-/Props-Frequenz, echte Framerate, Pixelpuffergröße und
   Rendering-Last auf dem Y70 messen; keine neue Gestaltung auf Verdacht.
3. Bei Konfigurationsproblemen zunächst vorhandene Nexus-Kanalnamen/IDs und Speicherstatus prüfen.
4. Änderungen bauen/validieren und den Nutzer nur um wirklich fehlende Hardwareinformationen bitten.
