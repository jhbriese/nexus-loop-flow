const en = {
  title:'Water cooling', flow:'FLOW', pump:'PUMP', history:'HISTORY · 2 MIN',
  pumpFan:'Pump fan', pumpCurve:'Pump curve', flowFan:'Flow sensor fan', factor:'Conversion factor: RPM → l/min',
  waterSensor:'Water temperature sensor', choose:'Please select …', none:'None', unavailable:'Unavailable',
  curveInfo:'Nexus 3.1.8 does not expose cooling curves to widgets. The pump display uses the reported fan channel values.',
  factorInfo:'l/min = RPM ÷ factor. Default: 98.', invalidFactor:'Enter a positive factor.',
  saved:'Saved', saving:'Saving …', autoSave:'Changes are saved automatically', saveFailed:'Save failed. Please change the value again.',
  sameSource:'Both sources use the same channel. Please check.', animation:'Wave animation', appearance:'Appearance',
  quality:'Drawing resolution (1–4)', graphMax:'Chart maximum (l/h)', noChannels:'No fan channels received from Nexus yet.',
  noTemps:'No temperature sensors received from Nexus yet.', missing:'Source unavailable', noData:'No current data',
  selectSources:'Select sources in Loop Flow', flowMissing:'Flow signal missing', pumpMissing:'Pump signal missing',
  preview:'PREVIEW · SAMPLE DATA', zeroDuty:'Nexus reports 0% for the pump. RPM and flow are shown independently.',
  overrides:'Per-tile source overrides, if set in the widget settings, take priority.',
};
type Messages = typeof en;
const de:Messages = {
  title:'Wasserkühlung', flow:'DURCHFLUSS', pump:'PUMPE', history:'VERLAUF · 2 MIN',
  pumpFan:'Lüfter Pumpe', pumpCurve:'Kurve Pumpe', flowFan:'Lüfter Flow-Sensor', factor:'Korrekturwert RPM → l/min',
  waterSensor:'Temperatursensor Wassertemperatur', choose:'Bitte wählen …', none:'Keiner', unavailable:'Nicht verfügbar',
  curveInfo:'Nexus 3.1.8 stellt Widgets keine Kühlungskurven bereit. Die Pumpenanzeige nutzt die gemeldeten Werte des Lüfterkanals.',
  factorInfo:'l/min = RPM ÷ Faktor. Standard: 98.', invalidFactor:'Bitte einen positiven Faktor eingeben.',
  saved:'Gespeichert', saving:'Speichert …', autoSave:'Änderungen werden automatisch gespeichert', saveFailed:'Speichern fehlgeschlagen – bitte erneut ändern.',
  sameSource:'Beide Quellen verwenden denselben Kanal. Bitte prüfen.', animation:'Wellenanimation', appearance:'Darstellung',
  quality:'Zeichenauflösung (1–4)', graphMax:'Diagramm-Maximum (l/h)', noChannels:'Noch keine Lüfterkanäle von Nexus empfangen.',
  noTemps:'Noch keine Temperatursensoren von Nexus empfangen.', missing:'Quelle nicht verfügbar', noData:'Keine aktuellen Daten',
  selectSources:'Quellen in Loop Flow einstellen', flowMissing:'Flow-Signal fehlt', pumpMissing:'Pumpensignal fehlt',
  preview:'VORSCHAU · BEISPIELWERTE', zeroDuty:'Nexus meldet 0 % für die Pumpe. RPM und Durchfluss werden unabhängig davon angezeigt.',
  overrides:'Abweichende Quellen pro Kachel haben Vorrang, falls sie in den Widget-Einstellungen gesetzt sind.',
};
const fr:Messages = {
  title:'Refroidissement liquide', flow:'DÉBIT', pump:'POMPE', history:'HISTORIQUE · 2 MIN',
  pumpFan:'Ventilateur de la pompe', pumpCurve:'Courbe de la pompe', flowFan:'Ventilateur du débitmètre', factor:'Facteur de conversion RPM → l/min',
  waterSensor:'Sonde de température de l’eau', choose:'Sélectionner …', none:'Aucune', unavailable:'Indisponible',
  curveInfo:'Nexus 3.1.8 ne fournit pas les courbes aux widgets. La pompe affiche les valeurs signalées par le canal du ventilateur.',
  factorInfo:'l/min = RPM ÷ facteur. Par défaut : 98.', invalidFactor:'Saisissez un facteur positif.',
  saved:'Enregistré', saving:'Enregistrement …', autoSave:'Enregistrement automatique', saveFailed:'Échec de l’enregistrement. Modifiez à nouveau la valeur.',
  sameSource:'Les deux sources utilisent le même canal. Vérifiez la sélection.', animation:'Animation des vagues', appearance:'Apparence',
  quality:'Résolution du dessin (1–4)', graphMax:'Maximum du graphique (l/h)', noChannels:'Aucun canal de ventilateur reçu de Nexus.',
  noTemps:'Aucune sonde de température reçue de Nexus.', missing:'Source indisponible', noData:'Aucune donnée actuelle',
  selectSources:'Sélectionnez les sources dans Loop Flow', flowMissing:'Signal de débit absent', pumpMissing:'Signal de pompe absent',
  preview:'APERÇU · EXEMPLES', zeroDuty:'Nexus signale 0 % pour la pompe. Les RPM et le débit sont affichés indépendamment.',
  overrides:'Les sources spécifiques à une tuile, définies dans les paramètres du widget, sont prioritaires.',
};
const es:Messages = {
  title:'Refrigeración líquida', flow:'CAUDAL', pump:'BOMBA', history:'HISTORIAL · 2 MIN',
  pumpFan:'Ventilador de la bomba', pumpCurve:'Curva de la bomba', flowFan:'Ventilador del caudalímetro', factor:'Factor de conversión RPM → l/min',
  waterSensor:'Sensor de temperatura del agua', choose:'Seleccionar …', none:'Ninguno', unavailable:'No disponible',
  curveInfo:'Nexus 3.1.8 no proporciona curvas a los widgets. La bomba muestra los valores del canal del ventilador.',
  factorInfo:'l/min = RPM ÷ factor. Predeterminado: 98.', invalidFactor:'Introduce un factor positivo.',
  saved:'Guardado', saving:'Guardando …', autoSave:'Los cambios se guardan automáticamente', saveFailed:'Error al guardar. Cambia el valor de nuevo.',
  sameSource:'Ambas fuentes usan el mismo canal. Revisa la selección.', animation:'Animación de ondas', appearance:'Apariencia',
  quality:'Resolución de dibujo (1–4)', graphMax:'Máximo del gráfico (l/h)', noChannels:'Nexus aún no ha enviado canales de ventiladores.',
  noTemps:'Nexus aún no ha enviado sensores de temperatura.', missing:'Fuente no disponible', noData:'Sin datos actuales',
  selectSources:'Selecciona las fuentes en Loop Flow', flowMissing:'Falta la señal de caudal', pumpMissing:'Falta la señal de la bomba',
  preview:'VISTA PREVIA · EJEMPLOS', zeroDuty:'Nexus indica 0 % para la bomba. Las RPM y el caudal se muestran por separado.',
  overrides:'Las fuentes específicas de cada mosaico en los ajustes del widget tienen prioridad.',
};
const it:Messages = {
  title:'Raffreddamento a liquido', flow:'PORTATA', pump:'POMPA', history:'CRONOLOGIA · 2 MIN',
  pumpFan:'Ventola della pompa', pumpCurve:'Curva della pompa', flowFan:'Ventola del flussometro', factor:'Fattore di conversione RPM → l/min',
  waterSensor:'Sensore temperatura dell’acqua', choose:'Seleziona …', none:'Nessuno', unavailable:'Non disponibile',
  curveInfo:'Nexus 3.1.8 non fornisce le curve ai widget. La pompa mostra i valori del canale della ventola.',
  factorInfo:'l/min = RPM ÷ fattore. Predefinito: 98.', invalidFactor:'Inserisci un fattore positivo.',
  saved:'Salvato', saving:'Salvataggio …', autoSave:'Le modifiche vengono salvate automaticamente', saveFailed:'Salvataggio non riuscito. Modifica nuovamente il valore.',
  sameSource:'Le due sorgenti usano lo stesso canale. Controlla la selezione.', animation:'Animazione delle onde', appearance:'Aspetto',
  quality:'Risoluzione del disegno (1–4)', graphMax:'Massimo del grafico (l/h)', noChannels:'Nessun canale ventola ricevuto da Nexus.',
  noTemps:'Nessun sensore di temperatura ricevuto da Nexus.', missing:'Sorgente non disponibile', noData:'Nessun dato aggiornato',
  selectSources:'Seleziona le sorgenti in Loop Flow', flowMissing:'Segnale di portata assente', pumpMissing:'Segnale della pompa assente',
  preview:'ANTEPRIMA · ESEMPI', zeroDuty:'Nexus indica 0 % per la pompa. RPM e portata vengono mostrati separatamente.',
  overrides:'Le sorgenti specifiche del riquadro nelle impostazioni del widget hanno la precedenza.',
};
const pt:Messages = {
  title:'Refrigeração líquida', flow:'FLUXO', pump:'BOMBA', history:'HISTÓRICO · 2 MIN',
  pumpFan:'Ventoinha da bomba', pumpCurve:'Curva da bomba', flowFan:'Ventoinha do sensor de fluxo', factor:'Fator de conversão RPM → l/min',
  waterSensor:'Sensor de temperatura da água', choose:'Selecionar …', none:'Nenhum', unavailable:'Indisponível',
  curveInfo:'O Nexus 3.1.8 não fornece curvas aos widgets. A bomba mostra os valores informados pelo canal da ventoinha.',
  factorInfo:'l/min = RPM ÷ fator. Padrão: 98.', invalidFactor:'Insira um fator positivo.',
  saved:'Salvo', saving:'Salvando …', autoSave:'As alterações são salvas automaticamente', saveFailed:'Falha ao salvar. Altere o valor novamente.',
  sameSource:'As duas fontes usam o mesmo canal. Verifique a seleção.', animation:'Animação das ondas', appearance:'Aparência',
  quality:'Resolução do desenho (1–4)', graphMax:'Máximo do gráfico (l/h)', noChannels:'Nenhum canal de ventoinha recebido do Nexus.',
  noTemps:'Nenhum sensor de temperatura recebido do Nexus.', missing:'Fonte indisponível', noData:'Sem dados atuais',
  selectSources:'Selecione as fontes no Loop Flow', flowMissing:'Sinal de fluxo ausente', pumpMissing:'Sinal da bomba ausente',
  preview:'PRÉVIA · EXEMPLOS', zeroDuty:'O Nexus informa 0 % para a bomba. RPM e fluxo são mostrados separadamente.',
  overrides:'As fontes específicas de cada bloco nas configurações do widget têm prioridade.',
};
const nl:Messages = {
  title:'Waterkoeling', flow:'DEBIET', pump:'POMP', history:'VERLOOP · 2 MIN',
  pumpFan:'Ventilator pomp', pumpCurve:'Pompcurve', flowFan:'Ventilator flowsensor', factor:'Omrekenfactor RPM → l/min',
  waterSensor:'Sensor watertemperatuur', choose:'Selecteer …', none:'Geen', unavailable:'Niet beschikbaar',
  curveInfo:'Nexus 3.1.8 geeft geen koelcurves door aan widgets. De pomp toont de gemelde waarden van het ventilatorkanaal.',
  factorInfo:'l/min = RPM ÷ factor. Standaard: 98.', invalidFactor:'Voer een positieve factor in.',
  saved:'Opgeslagen', saving:'Opslaan …', autoSave:'Wijzigingen worden automatisch opgeslagen', saveFailed:'Opslaan mislukt. Wijzig de waarde opnieuw.',
  sameSource:'Beide bronnen gebruiken hetzelfde kanaal. Controleer de selectie.', animation:'Golfanimatie', appearance:'Weergave',
  quality:'Tekenresolutie (1–4)', graphMax:'Grafiekmaximum (l/h)', noChannels:'Nog geen ventilatorkanalen van Nexus ontvangen.',
  noTemps:'Nog geen temperatuursensoren van Nexus ontvangen.', missing:'Bron niet beschikbaar', noData:'Geen actuele gegevens',
  selectSources:'Selecteer bronnen in Loop Flow', flowMissing:'Flowsignaal ontbreekt', pumpMissing:'Pompsignaal ontbreekt',
  preview:'VOORBEELD · DEMOGEGEVENS', zeroDuty:'Nexus meldt 0 % voor de pomp. RPM en debiet worden afzonderlijk getoond.',
  overrides:'Afwijkende bronnen per tegel in de widgetinstellingen hebben voorrang.',
};
const pl:Messages = {
  title:'Chłodzenie wodne', flow:'PRZEPŁYW', pump:'POMPA', history:'HISTORIA · 2 MIN',
  pumpFan:'Wentylator pompy', pumpCurve:'Krzywa pompy', flowFan:'Wentylator przepływomierza', factor:'Współczynnik RPM → l/min',
  waterSensor:'Czujnik temperatury wody', choose:'Wybierz …', none:'Brak', unavailable:'Niedostępne',
  curveInfo:'Nexus 3.1.8 nie udostępnia krzywych widżetom. Pompa wyświetla wartości zgłaszane przez kanał wentylatora.',
  factorInfo:'l/min = RPM ÷ współczynnik. Domyślnie: 98.', invalidFactor:'Wpisz dodatni współczynnik.',
  saved:'Zapisano', saving:'Zapisywanie …', autoSave:'Zmiany są zapisywane automatycznie', saveFailed:'Nie udało się zapisać. Zmień wartość ponownie.',
  sameSource:'Oba źródła używają tego samego kanału. Sprawdź wybór.', animation:'Animacja fal', appearance:'Wygląd',
  quality:'Rozdzielczość rysowania (1–4)', graphMax:'Maksimum wykresu (l/h)', noChannels:'Nie otrzymano kanałów wentylatorów z Nexus.',
  noTemps:'Nie otrzymano czujników temperatury z Nexus.', missing:'Źródło niedostępne', noData:'Brak aktualnych danych',
  selectSources:'Wybierz źródła w Loop Flow', flowMissing:'Brak sygnału przepływu', pumpMissing:'Brak sygnału pompy',
  preview:'PODGLĄD · PRZYKŁADOWE DANE', zeroDuty:'Nexus zgłasza 0 % dla pompy. RPM i przepływ są wyświetlane niezależnie.',
  overrides:'Źródła ustawione dla poszczególnych kafelków w ustawieniach widżetu mają pierwszeństwo.',
};
export const languages:Record<string,Messages>={en,de,fr,es,it,pt,nl,pl};
export function messages(locale='en'):Messages { return languages[locale.toLowerCase().split(/[-_]/)[0]]??en; }
const formats=new Map<string,Intl.NumberFormat>();
export function number(value:number|null|undefined, digits=0, locale='en'):string {
  if(typeof value!=='number'||!Number.isFinite(value))return '—';
  const key=`${locale}:${digits}`;
  if(!formats.has(key)){
    const options={minimumFractionDigits:digits,maximumFractionDigits:digits,useGrouping:false};
    try{formats.set(key,new Intl.NumberFormat(locale,options));}catch{formats.set(key,new Intl.NumberFormat('en',options));}
  }
  return formats.get(key)!.format(value);
}
