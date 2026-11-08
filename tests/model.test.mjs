import test from 'node:test';
import assert from 'node:assert/strict';
import {flow,pumpPercent,rpmValue,numberDE} from '../com.jan.loopflow/model.ts';
test('Barrow-Umrechnung und andere Kalibrierung',()=>{
 assert.equal(flow(340,98,'l/h'),340/98*60);
 assert.equal(flow(340,98,'l/min'),340/98);
 assert.equal(flow(340,196,'l/h'),340/196*60);
 assert.equal(flow(0,98,'l/h'),0);
});
test('Fehlende Werte sind nicht Nullfluss',()=>{
 for(const rpm of [undefined,null,NaN,Infinity,-1])assert.equal(flow(rpm,98,'l/h'),null);
 for(const factor of [0,-1,NaN,Infinity,undefined])assert.equal(flow(340,factor,'l/h'),null);
 assert.equal(rpmValue({id:'f',name:'Flow',rpm:340,dutyPercent:null,rpmUnavailable:true}),null);
});
test('Pumpenprozent ist ein echter gemeldeter Prozentwert',()=>{
 const fan={id:'p',name:'Pumpe',rpm:3800,dutyPercent:80};
 assert.equal(pumpPercent(fan),80);
 assert.equal(pumpPercent({...fan,dutyPercent:0}),0);
 assert.equal(pumpPercent({...fan,readOnly:true}),null);
 for(const v of [null,-1,101,NaN])assert.equal(pumpPercent({...fan,dutyPercent:v}),null);
 assert.equal(numberDE(340/98,2),'3,47');assert.equal(numberDE(null),'—');
});
