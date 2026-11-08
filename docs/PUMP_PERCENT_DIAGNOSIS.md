# Pumpen-Prozentanzeige nach Neustart – 08.11.2026

## Nachtrag: vollständiges Beenden und erneutes Starten von Nexus

Jan beendete Nexus selbst vollständig und startete es erneut. Danach war die Anzeige korrekt.
Eine erneute lokale Leseprüfung um 15:51 Uhr (Europe/Berlin) bestätigt bei unverändertem
Service v3.1.9-beta.1 und unveränderter Flat-Kurve mit 80 %:

| Messung | Vor Nexus-Neustart | Nach Nexus-Neustart |
|---|---|---|
| Pumpen-RPM | 3154 | 4017 |
| `GET /cooling/fans`: `dutyPercent` | 0 | 80 |
| Widget-Aktion `cooling.state`: `dutyPercent` | 0 | 80 |
| Gespeicherter Kurven-Sollwert | 80 | 80 |

Das Widget erhält und zeigt einen gültigen Prozentwert somit grundsätzlich korrekt.
Die gleichzeitig gestiegene reale Drehzahl spricht dafür, dass zuvor auch die Ansteuerung
abweichend gewesen sein könnte; ein reiner Darstellungsfehler ist keine ausreichende Erklärung.
Ein Initialisierungs-/Startreihenfolgeproblem im Nexus-Service bzw. Hardwarezugriff ist plausibel,
aber ohne reproduzierten Kaltstart nicht bewiesen. Es wurde weder ein weiterer Neustart noch
eine Änderung an der Pumpensteuerung durch den Agenten ausgelöst.

Die bisherige Aussage zur Schnittstellengrenze bleibt bestehen: Ein separater Sollwert ist
für Widgets nicht verfügbar. Er würde jedoch den vermuteten Ansteuerungsfehler nicht beheben,
sondern nur die gewünschte Einstellung unabhängig von der Rückmeldung anzeigen.
Die folgenden Abschnitte dokumentieren die erste Messung im fehlerhaften Zustand.

## Ergebnis der lokalen, rein lesenden Diagnose

Nexus liefert für dieselbe Pumpe zwei unterschiedliche Werte: Die Kurvenberechnung meldet
80 %, der Hardware-/Telemetriekanal dagegen 0 %. Loop Flow zeigt den von der Widget-Schnittstelle
gelieferten Telemetriewert korrekt an. Die Quelle ist richtig ausgewählt; die Pumpenkurve ist
vorhanden und wird weiterhin berechnet. Ein Verlust dieser gespeicherten Kurve ist damit nicht
die Erklärung für die Anzeige.

Laufender Service: **v3.1.9-beta.1**, über `/ping` bestätigt. Installiertes Widget-Manifest:
1.3.0. Projektstand: 1.3.1. Das Build-SDK bleibt auf Nexus 3.1.8 gepinnt.

## Beobachtungen

Pumpenkanal: `/lpc/it8688e/0/control/2` (Nexus-Name „Pumpe“, Rohname „Fan #3“).
Die gespeicherte Loop-Flow-Konfiguration wählt exakt diese ID.

| Quelle | Beobachteter Wert |
|---|---|
| `GET /cooling/curves`, zugeordnete Kurve „Pumpe“ | Typ `Flat`, `flat.speed: 80` |
| WebSocket `cooling-curves`, `calculatedSpeed` | 80 |
| WebSocket `cooling-curves`, `actualSpeed` | 80 |
| WebSocket `cooling-curves`, passender Ausgang `appliedSpeed` | 80 |
| WebSocket `cooling-realtime`, passender Kanal | `speed: 0`, `pwm: 0`, `rpm: 3154` |
| `GET /cooling/fans` | `dutyPercent: 0`, `mode: Curve`, `controlled: true` |
| Widget-Aktion `cooling.state` | `dutyPercent: 0`, `rpm: 3154`, `mode: Curve` |

Die beiden WebSocket-Signale wurden in drei aufeinanderfolgenden Frames verglichen;
die Abweichung blieb bestehen. RPM schwankten bei früheren Einzelabfragen leicht.
Die Widget-Antwort besitzt nur `channels` und `sources`, keinen getrennten Sollwert.

## Einordnung anhand des konkreten Service-Codes

- `WindowsFanControlProvider.GetFanChannels()` setzt
  `DutyPercent = (int)(m.ControlSensor.Value ?? 0f)` und liest die RPM separat vom Tachosensor.
  Eine fehlende PWM-Rückmeldung wird damit bereits im Service zu 0.
- `CoolingActions.cs` reicht `GetFanChannels()` an das Widget weiter.
- `CurveEngine` veröffentlicht die berechneten/geglätteten Zielwerte und den Zielwert je
  Ausgang über `cooling-curves`. Trotz ihrer Namen sind `actualSpeed` und `appliedSpeed`
  hier **kein unabhängiger Hardware-Nachweis** für die physisch anliegende PWM.
- Die relevante Provider- und Widget-Aktionslogik ist zwischen Nexus 3.1.8 und dem
  laufenden 3.1.9-beta.1 unverändert. Verglichener 3.1.9-Service-Commit:
  `4bde382baf21c1c1423a365896bcfca315385e34` (Nexus-Tag-Commit
  `2026352c074d542780f5229f80196aed25a021c6`). Die Checkouts wurden nicht umgestellt.

Damit ist die Grenze des Fehlers eingegrenzt: Der Prozentwert kommt bereits mit 0 aus Nexus.
Nicht bewiesen ist, ob der PWM-Sensor 0 oder keinen Wert liefert, ob die Hardware den
Start-Sollwert tatsächlich übernommen hat oder warum der Zustand erst nach Neustarts auffällt.
Es wurde kein Neustart und kein verändernder Pumpentest ausgelöst.

## Konsequenz für eine Korrektur

Die vorhandene Widget-Aktion kann den eingestellten Sollwert nicht liefern. Eine saubere
Lösung für die Anzeige der **eingestellten** Prozentzahl wäre, den berechneten Zielwert pro
Kanal zusätzlich über die freigegebene Widget-Schnittstelle bereitzustellen und von der
Hardware-Rückmeldung zu unterscheiden. Auch die Null-/Fehlwertbehandlung gehört in den Service.

Keine feste 80 hinterlegen, keinen alten Wert über Neustarts als Live-Wert ausgeben und keine
Prozentzahl aus RPM ableiten. Echte 0-%-Werte müssen weiterhin darstellbar bleiben.
Die lokale Diagnose konnte mit normalen authentifizierten Lesezugriffen und Topic-Abonnements
arbeiten; daraus folgt kein entsprechender Zugriff für das sandboxed Widget.

Es wurden keine Kühlungsprofile, Pumpeneinstellungen, App-Daten oder produktiven Dateien
verändert. Authentifizierung nur lokal über den regulären `/pair`-Weg; keine Tokens gespeichert.
Keine Änderung am Widget-Quellcode, daher kein neuer Build/Testlauf für diese Diagnose nötig.
