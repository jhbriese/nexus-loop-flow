import test from 'node:test';
import assert from 'node:assert/strict';
import {messages,number,languages} from '../com.jan.loopflow/i18n.ts';
test('Nexus-Sprachen: vollständige Texte, Sprachregionen und Zahlenformate',()=>{
 for(const [locale,strings] of Object.entries(languages)){
  assert.deepEqual(Object.keys(strings).sort(),Object.keys(languages.en).sort(),locale);
  assert(Object.values(strings).every(s=>typeof s==='string'&&s.length));
 }
 assert.equal(messages('de-DE').title,'Wasserkühlung');assert.equal(messages('pt-BR').pump,'BOMBA');
 assert.equal(messages('ja').title,'Water cooling');assert.equal(number(32.4,1,'de-DE'),'32,4');
 assert.equal(number(32.4,1,'en-US'),'32.4');assert.equal(number(0,1,'de'),'0,0');
 assert.equal(number(null,1,'de'),'—');assert.equal(number(NaN,1,'de'),'—');
});
