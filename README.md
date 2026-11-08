# Loop Flow – Projekt für Orca / Codex

Aktueller Stand **Widget 1.3.2 für Nexus 3.1.8**, inklusive bearbeitbarem Quellcode,
bereits gebauten Dateien, Tests, Installationsskript und Kontext der bisherigen Entwicklung.

Normaler Nexus-Kachelhintergrund und passende Innenränder, keine Überschrift,
Pumpenblock mit % und RPM, optionale Wassertemperatur ohne eigenen Hintergrund,
Faktor-Eingabefeld und acht Sprachen nach Nexus-Einstellung.
PC-Konfiguration: **Seitenleiste → Mehr anzeigen → Loop Flow**. Der native Kachel-Editor
unterstützt keine dynamischen Kanal-Dropdowns. Kühlungskurven stellt Nexus 3.1.8 Widgets
nicht bereit; „Kurve Pumpe“ ist daher deaktiviert. Keine Kühlungssteuerung.
Die nativen Kachel-Einstellungen zeigen nur den Hinweis auf die App-Seite, keine Textfelder.
Das App-Symbol ist ein stilisiertes Pumpenrad mit transparentem Hintergrund, auch für
die einfarbige Darstellung in der Nexus-Seitenleiste. Vorschau: `preview/icon.html`.

Die Version ist lokal geprüft, noch nicht produktiv installiert. Aktuelle Vorschau:
`preview/review.png`; interaktiv mit `npm run preview`.

## In Orca starten

1. Dieses Paket vollständig entpacken.
2. Den Ordner **Loop_Flow_Orca_Codex** als Projekt in Orca öffnen.
3. Codex mit dem Text aus **START_HERE.md** starten. Die Projektanweisungen stehen in **AGENTS.md**.

Du musst die bisherige Unterhaltung nicht manuell zusammenfassen. Entscheidungen,
Hardware, Fehlerursachen und Grenzen der bisherigen Prüfung sind in **PROJECT_CONTEXT.md** festgehalten.
Der Export enthält kein bestehendes Git-Repository; bei Bedarf im entpackten Ordner `git init`
ausführen und einen ersten Commit anlegen, bevor du Orca-Worktrees verwendest.

## Entwickeln

Voraussetzungen: **Git, Node.js 24 und npm** im jeweiligen Windows-/WSL-/Worktree-Umfeld.
Die Skripte verwenden plattformunabhängige Pfade und keine Bash-Befehle.

```text
npm run setup
npm run build
npm run validate
npm test
npm run preview
```

- **setup:** Holt nur die benötigte, exakt gepinnte Nexus-SDK-Quelle und esbuild 0.25.0.
  Internetzugang zu GitHub und npm wird benötigt. Ändert keine produktive Nexus-Installation.
- **build:** Erzeugt `widget.mjs`, `renderer.mjs` und `preview/draw.mjs` neu.
- **validate:** Prüft das Manifest mit der offiziellen SDK-CLI.
- **test:** Prüft Berechnung, Fehlerwerte sowie den tatsächlichen Renderer-Nachrichtenablauf.
  Läuft auch ohne Setup mit den bereits beigefügten gebauten Dateien.
- **preview:** Öffne `http://127.0.0.1:8765` im Browser. Designvorschau mit Beispieldaten,
  keine Live-Verbindung und kein vollständiger Emulator des Nexus-Einstellungsdialogs.

Als Orca-Setup-Befehl für einen neuen Worktree kannst du **`npm run setup`** verwenden,
sofern Node/npm und Git dort bereits verfügbar sind. `.cache` wird pro Checkout erzeugt und nicht versioniert.

## Dateien

| Pfad | Zweck |
|---|---|
| `AGENTS.md` | Anweisungen für Codex |
| `START_HERE.md` | Kurzer Prompt für die neue Sitzung |
| `PROJECT_CONTEXT.md` | Verlauf, Anforderungen, Hardware, aktueller Stand |
| `docs/ARCHITECTURE.md` | SDK, Datenfluss, Speicher, Rendering |
| `com.jan.loopflow/` | Quellcode und installierbare Laufzeitdateien |
| `scripts/` | Setup, Build, Validierung, Tests, Vorschau |
| `tests/` | Node-Regressionstests |
| `references/` | Barrow-Anleitung sowie Nutzerfoto und Video älterer Widget-Stände |
| `INSTALLATION.md`, `Install.ps1` | Installation des Widgets auf dem Windows-PC |

**Wichtig:** Die Live-Konfiguration benötigt Nexus und die beiden realen Kanäle am Mainboard.
Die tatsächlichen Kanal-IDs sind nicht aus dieser Unterhaltung exportierbar: sie werden in der
laufenden Nexus-Installation gespeichert und müssen über die Dropdowns ausgelesen werden.

## Installation einer gebauten Änderung

Nexus vollständig beenden. Im Projektordner PowerShell als Administrator starten und:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\Install.ps1
```

Anschließend Nexus starten. Das Skript sichert eine bestehende Version des Widgets.
Details und Deinstallation siehe **INSTALLATION.md**.

Die beigefügten Preview-Bilder/Fotos stammen teilweise aus Version 1.0/1.1; sie sind
Referenzen für das Design. Der maßgebliche Code und Manifeststand ist **1.3.2**.
