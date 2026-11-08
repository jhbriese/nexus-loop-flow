# Loop Flow 1.3.2 – für Nexus 3.1.8

Animierter Behälter, Wassertemperatur, Pumpenblock mit % und RPM, Durchfluss und Verlaufsdiagramm.

## Stand 1.3.2

- Standardhintergrund und passende Innenränder von Nexus; ohne Überschrift und unteren Balken.
- Neues Pumpenrad-Symbol mit transparentem Hintergrund für „Mehr anzeigen“ und die App-Auswahl.
- PUMPE neben DURCHFLUSS: groß gemeldete %, darunter Pumpen-RPM.
- Optionaler Temperatursensor mit Text ohne eigenen Hintergrund im Tank.
- Wellenlinie bei vorhandenem Durchfluss auch bei 0/fehlendem Pumpen-Prozentwert.
- Display weiterhin ohne Bedienelemente; Wellenphase läuft über Messwertupdates hinweg weiter.
- PC-Einstellung: Dropdowns für Pumpen-/Flow-Lüfter und Temperatur, Faktor-Eingabefeld.
- Sprache automatisch aus Nexus: Deutsch, Englisch, Französisch, Spanisch, Italienisch,
  Portugiesisch, Niederländisch, Polnisch; sonst Englisch.
- Änderungen werden automatisch gespeichert; zusätzliche Darstellungseinstellungen sind eingeklappt.
- Native Kachel-Einstellungen enthalten nur den Hinweis auf die App-Seite, keine Quellen-Textfelder.
- Kurvenauswahl derzeit nicht möglich: Nexus 3.1.8 gibt Widgets keine Kurvenliste frei.

## Update / Installation unter Windows

1. ZIP vollständig entpacken.
2. Nexus über das Symbol neben der Windows-Uhr mit **Quit / Beenden** vollständig beenden.
   Das Schließen des Fensters reicht nicht.
3. Windows PowerShell **als Administrator** öffnen und in den entpackten Ordner mit `Install.ps1` wechseln.
   Dann ausführen:

   ```powershell
   powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\Install.ps1
   ```

   Die Ausführungsfreigabe gilt nur für diesen Aufruf. Das Skript kopiert die vier Laufzeitdateien
   nach `%ProgramData%\Nexus\apps\com.jan.loopflow` und sichert die vorherige Version dieses Widgets.
   Andere Widgets, Pumpensteuerung und Lüfterprofile werden nicht geändert.
   Alternativ den Ordner `com.jan.loopflow` mit Administratorrechten nach `%ProgramData%\Nexus\apps` kopieren.
4. Nexus starten. Die bestehende Kachel sollte sich aktualisieren. Falls nicht, Windows neu starten.
   Die App heißt weiterhin **Loop Flow**, intern jetzt Version **1.3.2**.
5. Bei Erstinstallation auf dem Y70 ein **Loop Flow**-Widget hinzufügen (4×4 empfohlen).

## Konfiguration am PC in Nexus

1. In der linken Nexus-Navigation **Mehr anzeigen / Show more → Loop Flow** öffnen.
   Es ist keine zusätzliche Kachel auf dem Desktop-Dashboard nötig.
   Optional kann die App in der Seitenleiste angeheftet werden.
2. Unter **Lüfter Pumpe** den Pumpenkanal und unter **Lüfter Flow-Sensor** den Flow-Kanal wählen.
   Beide Dropdowns enthalten die von Nexus erkannten Kanäle mit Namen und aktuellen RPM.
3. **Temperatursensor Wassertemperatur** bei Bedarf auswählen, ansonsten **Keiner**.
   Faktor (Barrow: 98; Punkt oder Komma möglich), Einheit und Wellenanimation einstellen.
   **Änderungen werden nach kurzer Verzögerung automatisch gespeichert.**
4. Unter **Darstellung** sind Wasserfarbe, Diagramm-Maximum und Zeichenauflösung verfügbar.
   Diese Zusatzoptionen sind normalerweise eingeklappt.

**Kurve Pumpe** ist mit einer Erklärung deaktiviert: Die für Widgets freigegebene
`cooling.state`-Schnittstelle liefert Lüfter und Temperaturquellen, aber keine Kurven.
Die gewünschte rein lesende Kurvenauswahl ist damit auf Nexus 3.1.8 nicht möglich.

Falls Loop Flow in der Navigation noch nicht auftaucht: Nexus vollständig neu starten
und Mehr anzeigen erneut öffnen. Alternativ wie bisher eine Loop-Flow-Kachel im Nexus-
Desktop-Dashboard anklicken. Das bleibt ein optionaler zweiter Einstieg.

Diese Einstellungen werden im aktiven Nexus-Profil für die App gespeichert und gemeinsam von
allen Loop-Flow-Kacheln verwendet. Auf dem Gehäusedisplay gibt es keine Bedienelemente mehr.
Die Desktop-Kachel dient als Einstieg in die App-Seite; nicht die Konfiguration über den Touch aufrufen.

Die normalen Widget-Einstellungen zeigen ausschließlich den Hinweis auf die oben beschriebene
PC-App-Seite. Der native Kachel-Editor kann in Nexus 3.1.8 keine dynamischen Dropdowns für diese
Quellen darstellen. Die bisherigen Textfelder sind entfernt. Bereits gespeicherte abweichende
Kachelquellen werden weiterhin berücksichtigt; vorhandene Konfigurationen bleiben erhalten.
Beim Update von 1.1/1.2 startet der neue Temperatursensor ohne Auswahl.

Beim Update einer bestehenden 1.0-Kachel werden deren Quellen, Faktor, Einheit und Animation
nach Möglichkeit automatisch in die App-Konfiguration übernommen. Bei mehreren unterschiedlich
konfigurierten alten Kacheln gewinnt die zuerst übernommene. Farbe und Diagramm-Maximum starten beim Wechsel von 1.0 mit den neuen
App-Standardwerten. Werden die Quellen nicht übernommen, die beiden Dropdowns neu auswählen.

## Schärfe

Die App zeichnet standardmäßig mit **3-facher interner Auflösung**, einstellbar von 1 bis 4.
Nexus begrenzt die Canvas-Auflösung normalerweise auf maximal Faktor 1,5. Auf einem nachträglich
skalierten Panel kann das insbesondere kleine Schrift unscharf machen. Das Widget verwendet
einen eigenen größeren Bildpuffer; die Anzeige benötigt keine zusätzliche Titelzeile.

Wenn die Schrift weiter unscharf wirkt: Unter Darstellung die Zeichenauflösung in der App auf 4 stellen. Sie wird automatisch gespeichert.
Windows sollte das Y70 in seiner nativen Auflösung betreiben (beim Touch Infinite 682×2560).
Eine zusätzliche Skalierung/Streaming-Stufe von Nexus kann die erreichbare Schärfe weiterhin begrenzen.
Das neue Rendering ist lokal geprüft; der sichtbare Schärfegewinn auf deinem Y70 muss dort beurteilt werden.

## Messwerte

- Behälterfüllung und PUMPE zeigen `dutyPercent`, also die von Nexus gemeldete Ansteuerung.
  Das ist **kein gemessener Wasserstand**. Bei fehlendem Prozentwert oder nur lesbarem Kanal: „— %“.
- Bei 0/fehlendem PWM und positivem Durchfluss zeigt eine Wellenlinie Bewegung ohne Füllfläche.
  Nexus kann einen fehlenden PWM-Sensorwert bereits als 0 liefern; dann bleibt die Anzeige 0 %.
  Pumpen-RPM werden unabhängig davon ausgelesen, keine Umrechnung von RPM in Prozent.
- Wassertemperatur: ausgewählte Quelle in °C, fehlende/veraltete Daten „— °C“;
  ohne ausgewählten Sensor entfällt das Overlay. 0 °C ist ein gültiger Wert.
- Durchfluss: **RPM ÷ Faktor = l/min**, für l/h zusätzlich × 60.
  Standard 98 gemäß deiner Barrow-Anleitung: **340 RPM → 3,47 l/min → 208 l/h**.
- Der Faktor bedeutet „angezeigte RPM pro l/min“. Falls das Mainboard die Impulse anders auswertet,
  den Faktor entsprechend kalibrieren. Kein zusätzlicher versteckter Faktor 2.
- Verlauf: maximal letzte 120 Sekunden seit Öffnen; bei Quellen-/Faktorwechsel zurückgesetzt.
  Diagrammskala in l/h, Standard 300. Auf kleinen Kacheln ggf. ohne Verlauf.
- Abfrage alle 2 Sekunden, Wellen maximal 30 Bilder/s und nur im sichtbaren Canvas.
- Fehlende Daten erscheinen als „—“. Fehler bzw. mehr als 7 Sekunden ohne erfolgreiche Aktualisierung
  führen zu „Keine aktuellen Daten“. Echte 0 RPM bleiben 0.
- Das Widget liest nur `cooling.state`, ändert keine Kühlungssteuerung und benötigt keine Netzwerkabfragen.

## Prüfung und Vorschau

Build und Manifest mit offizieller SDK-CLI von Nexus v3.1.8 geprüft, 9 Node-Tests erfolgreich.
Zusätzlich 80 Größen-/Sprach-/Einheitenvarianten in Chromium geprüft, inklusive Transparenz,
Animation bei 0/fehlendem PWM, geclipptem Neuzeichnen und echtem Renderer-Worker.
Live-Konfiguration, Messwerte und Darstellung auf dem Y70 sind weiterhin vor Ort zu prüfen.

`preview/review.png` zeigt die aktuelle Version; `Loop_Flow_Vorschau.png` ist eine ältere Referenz.
`preview/index.html` nutzt dieselbe Zeichenfunktion, ohne Live-Verbindung. Start:
`npm run preview`, dann `http://localhost:8765`.

## Entfernen

Kacheln aus dem Layout entfernen, Nexus beenden, nur
`%ProgramData%\Nexus\apps\com.jan.loopflow` löschen und Nexus wieder starten.
Optionale Sicherungen liegen unter `%ProgramData%\Nexus\custom-widget-backups`.

## Quellcode / Build

Quellcode und manifest.json sind beigefügt. Gebaut mit der offiziellen Nexus-SDK-CLI aus
nexus-web `d5e5c1dcb34682458604540826bc39a20b03c9e8` (Nexus v3.1.8):

```sh
node nexus-web/sdk/cli/nexus-app.mjs build /pfad/zu/com.jan.loopflow
node nexus-web/sdk/cli/nexus-app.mjs validate /pfad/zu/com.jan.loopflow
```

Die CLI benötigt esbuild. Das Widget nutzt die mit Nexus gelieferte SDK-Laufzeit.
Privates Zusatzwidget, nicht offiziell von HYTE veröffentlicht.
