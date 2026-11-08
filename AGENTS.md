# Loop Flow – Arbeitsanweisungen für Codex

Vor Änderungen `PROJECT_CONTEXT.md` und `docs/ARCHITECTURE.md` lesen. Aktueller Ausgangspunkt:
Widget **1.3.2** für **HYTE Nexus 3.1.8**, App-ID `com.jan.loopflow`.

## Verbindliche Produktentscheidungen

- Auf dem Y70 nur Anzeige: keine Überschrift, Einstellknöpfe oder Konfiguration per Touch.
- Innenränder wie im Nexus-Monitoring-Widget: 14 logische Pixel, ohne zusätzliche Skalierung im Canvas.
- Native Nexus-Kachelfarbe durch transparenten Canvas; kein eigener Hintergrund und kein unterer Prozentbalken.
- Durchfluss und PUMPE als benachbarte Blöcke; Pumpe groß in %, darunter echte Pumpen-RPM.
- Einstellungen ausschließlich auf der PC-App-Seite: Pumpenlüfter, Flow-Lüfter und optionaler
  Temperatursensor als Dropdowns, Faktor als Eingabefeld, Einheit, Wellenanimation. Automatisch speichern.
- „Kurve Pumpe“ soll laut Jan ausschließlich der Anzeige dienen. Nexus 3.1.8 stellt Widgets
  keine Kurvenliste bereit: Auswahl derzeit deaktiviert mit Erklärung, keine erfundenen Kurven.
- Farbe, Auflösung und Diagrammskala unter eingeklapptem „Darstellung“.
- Behälterfüllung zeigt gemeldete Pumpenansteuerung in %, niemals einen behaupteten Wasserstand.
  Bei 0/fehlender Ansteuerung und positivem Durchfluss nur eine animierte Wellenlinie ohne Füllfläche.
- Ausgewählte Wassertemperatur als Text ohne eigenen Hintergrund im Tank;
  keine Auswahl = kein Overlay, Signal fehlt = „— °C“.
- Native Kachel-Einstellungen zeigen nur den Hinweis „Nexus-Seitenleiste → Mehr anzeigen → Loop Flow“;
  keine Pumpen-/Flow-Textfelder mehr. Bereits gespeicherte Alt-Overrides bleiben aus Kompatibilität lesbar.
- Sprache über `useLocale()` von Nexus: DE/EN/FR/ES/IT/PT/NL/PL, sonst Englisch; Zahlen lokalisiert.
- Flow aus ausgewähltem RPM-Kanal, Faktor frei einstellbar; Standard 98 RPM pro l/min.
- Keine Pumpen-/Lüftersteuerung hinzufügen oder bestehende Profile ändern, sofern Jan das nicht beauftragt.
- App-ID und vorhandene Daten erhalten; Upgrades sollen kein neues Widget neben dem bisherigen erzeugen.
- App-Symbol: stilisiertes Pumpenrad mit transparentem Hintergrund; Nexus verwendet es als Silhouette.

## Entwicklungsregeln

- Quellcode in `com.jan.loopflow/*.ts` und `index.tsx` ändern; generierte `.mjs` über `npm run build` erzeugen.
- SDK über `npm run setup` auf den festgehaltenen Stand holen. Nicht stillschweigend auf neuere Nexus-Version wechseln.
- SDK-README kann veraltet sein. Bei Widersprüchen konkreten Code des gepinnten SDK/Service prüfen.
- Keine rohen HTML-/SVG-Elemente im SDK-React-Baum: nur registrierte SDK-UI-Komponenten.
  Eigene Grafik läuft in `renderer.ts` via Canvas.
- Fehlende Messwerte als „—“ bzw. Fehlerstatus behandeln, echte Nullwerte beibehalten.
- Zeit der Wellenanimation bei Telemetrie-Updates nicht zurücksetzen. Animierte Teilfläche clippen.
- Nach relevanten Änderungen `npm run build`, `npm run validate`, `npm test` ausführen.
  Relevante visuelle Änderungen zusätzlich in Vorschau/Nexus prüfen. Lokale Mocks sind kein Hardwaretest.
- Installationsskript nicht ungefragt ausführen: Das normale Setup/Build verändert die produktive Nexus-Installation nicht.
- Mit Jan auf Deutsch, knapp und konkret kommunizieren. Neue Funktionen nur bei Auftrag ergänzen.

## Einstieg

`START_HERE.md` enthält den kurzen Übergabeprompt. `INSTALLATION.md` dokumentiert die
vorhandene private Windows-Installation. Version 1.3.2 ist lokal geprüft, noch nicht produktiv installiert.
