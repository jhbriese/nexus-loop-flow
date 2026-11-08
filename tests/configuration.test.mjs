import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

let sequence=0;
const flatten=node=>!node?[]:Array.isArray(node)?node.flatMap(flatten):typeof node==='object'?[node,...flatten(node.props?.children)]:[];
const channels=[{id:'p',name:'Pump Header',rpm:3800,dutyPercent:80},{id:'f',name:'Flow Header',rpm:340,dutyPercent:100}];
const sources=[{id:'water',name:'Water',category:'Motherboard',value:32.4},{id:'cpu',name:'CPU',category:'CPU',value:65}];
const defaults={pump:'p',flow:'f',factor:98,unit:'l/h',animation:true,accent:'#60d5f5',graphMax:300,quality:3,configured:true};
// Hook runner with effect dependency tracking, executing the built bundle.
async function harness(config=defaults,{settings={},legacy={},locale='de'}={}){
 let root,slot=0,changed=false,pending=[],surface='page',now=100000,failed=false;
 const slots=[],writes=[],actions=[];
 let data={channels:structuredClone(channels),sources:structuredClone(sources)};
 const shared={value:structuredClone(config),ready:true,revision:1,update:async fn=>{
   shared.value=fn(shared.value);shared.revision++;writes.push(structuredClone(shared.value));return true;
 }};
 const dispatch=async action=>{actions.push(action);if(failed)throw Error('offline');return {ok:true,result:data};};
 const jsx=(type,props)=>({type,props});
 globalThis.__nexusRuntime={
  React:{
   useState:value=>{const i=slot++;if(!(i in slots))slots[i]={value:typeof value==='function'?value():value};return[slots[i].value,next=>{const v=typeof next==='function'?next(slots[i].value):next;if(!Object.is(v,slots[i].value)){slots[i].value=v;changed=true;}}];},
   useRef:value=>{const i=slot++;if(!(i in slots))slots[i]={current:value};return slots[i];},
   useEffect:(fn,deps)=>{const i=slot++;const prev=slots[i];if(!prev||deps.some((d,n)=>!Object.is(d,prev.deps[n]))){slots[i]={deps,cleanup:prev?.cleanup};pending.push(()=>{slots[i].cleanup?.();slots[i].cleanup=fn();});}}
  },
  JsxRuntime:{jsx,jsxs:jsx},UI:new Proxy({},{get:(_,key)=>String(key)}),
  SDK:{mount:f=>root=f,useLocale:()=>locale,useAppData:()=>shared,useDispatch:()=>dispatch,useLocalState:d=>[{...d,...legacy},()=>{}],useSettings:()=>settings,useSurface:()=>surface,usePreview:()=>false,useTick:()=>now}
 };
 await import('../com.jan.loopflow/widget.mjs?test='+ ++sequence);
 const render=()=>{let tree;for(let n=0;n<12;n++){changed=false;slot=0;pending=[];tree=root();pending.forEach(fn=>fn());if(!changed)return tree;}throw Error('Render did not settle');};
 const api={shared,writes,actions,render,nodes:()=>flatten(render()),setSurface:v=>surface=v,setLocale:v=>locale=v,
  setNow:v=>now=v,async poll(next,fail=false){data=next;failed=fail;const effect=slots.find(s=>s?.deps?.[0]===dispatch);effect.cleanup?.();effect.deps=[];render();await Promise.resolve();return render();},
  close:()=>slots.forEach(s=>s?.cleanup?.())};
 render();await Promise.resolve();render();return api;
}
const delay=()=>new Promise(resolve=>setTimeout(resolve,420));

test('PC: echte Quellen, Kurvengrenze, Faktor und Autospeichern',async t=>{
 const h=await harness();t.after(h.close);
 const nodes=h.nodes(),selects=nodes.filter(n=>n.type==='Select');
 assert.equal(selects.length,4);
 assert.deepEqual(selects[0].props.options.map(o=>o.value),['','p','f']);
 assert.equal(selects[1].props.disabled,true);
 assert.deepEqual(selects[2].props.options.map(o=>o.value),['','p','f']);
 assert.deepEqual(selects[3].props.options.map(o=>o.value),['','water','cpu']);
 assert.equal(nodes.filter(n=>n.type==='Button').length,0);
 assert.equal(nodes.find(n=>n.type==='Collapsible').props.open,false);
 nodes.find(n=>n.type==='Input').props.onValueChange('100,5');
 selects[3].props.onChange('water');h.render();await delay();h.render();
 assert.equal(h.writes.length,1);assert.equal(h.shared.value.factor,100.5);
 assert.equal(h.shared.value.temperature,'water');assert.equal(h.shared.value.pump,'p');assert.equal(h.shared.value.flow,'f');
 h.nodes().find(n=>n.type==='Input').props.onValueChange('');h.render();await delay();
 assert.equal(h.writes.length,1,'Leerer Faktor wird nicht gespeichert');
 assert(h.nodes().some(n=>n.props?.value==='Bitte einen positiven Faktor eingeben.'));
 assert(h.actions.every(a=>a==='cooling.state'));
});

test('Display: getrennte RPM, Temperatur-Nullwert, Ausfälle und Sprachwechsel',async t=>{
 const h=await harness({...defaults,temperature:'water'});t.after(h.close);h.setSurface('cell');
 let tree=h.render();assert.equal(tree.type,'Canvas');assert.equal(flatten(tree).length,1);
 assert.equal(tree.props.props.pumpRpm,3800);assert.equal(tree.props.props.rpm,340);assert.equal(tree.props.props.waterTemperature,32.4);
 await h.poll({channels:[{...channels[0],dutyPercent:0},channels[1]],sources:[{...sources[0],value:0}]});
 tree=h.render();assert.equal(tree.props.props.duty,0);assert.equal(tree.props.props.waterTemperature,0);assert.equal(tree.props.props.animation,true);
 await h.poll({channels,sources:[]});assert.equal(h.render().props.props.waterTemperature,null);assert.equal(h.render().props.props.showTemperature,true);
 await h.poll({channels,sources},true);tree=h.render();
 for(const key of ['duty','rpm','pumpRpm','waterTemperature','lph'])assert.equal(tree.props.props[key],null,key);
 assert.equal(tree.props.props.status,'Keine aktuellen Daten');
 h.setLocale('en-US');assert.equal(h.render().props.props.status,'No current data');
 await h.poll({channels,sources});h.setNow(Date.now()+8000);
 assert.equal(h.render().props.props.waterTemperature,null,'Veraltete Temperatur wird nicht als live angezeigt');
});

test('Neustart: gespeicherte Quellen, Animation und alte Kachelwerte bleiben erhalten',async t=>{
 const h=await harness({...defaults,temperature:'water',animation:false});t.after(h.close);h.setSurface('cell');
 assert.equal(h.render().props.props.animation,false);assert.equal(h.render().props.props.showTemperature,true);
 assert.equal(h.writes.length,0,'Start überschreibt keine bestehende Konfiguration');
 h.close();
 const old=await harness({configured:false},{legacy:{pump:'p',flow:'f',factor:120,unit:'l/min',animation:true}});t.after(old.close);old.setSurface('cell');
 assert.equal(old.shared.value.factor,120);assert.equal(old.shared.value.pump,'p');assert.equal(old.shared.value.flow,'f');
 assert.equal(old.shared.value.temperature,'');assert.equal(old.render().props.props.animation,true);
});

test('Fehlende Auswahl bleibt sichtbar; Kachel-Overrides bleiben wirksam',async t=>{
 const h=await harness({...defaults,temperature:'unplugged'},{settings:{pumpSource:'Flow Header'}});t.after(h.close);
 const select=h.nodes().filter(n=>n.type==='Select')[3];
 assert.equal(select.props.value,'unplugged');assert(select.props.options.some(o=>o.value==='unplugged'));
 h.setSurface('cell');assert.equal(h.render().props.props.pumpRpm,340);
 const manifest=JSON.parse(readFileSync(new URL('../com.jan.loopflow/manifest.json',import.meta.url)));
 assert.equal(manifest.id,'com.jan.loopflow');assert.deepEqual(manifest.capabilities.dispatch,['cooling.state']);
 assert.deepEqual(manifest.capabilities['net.fetch'],[]);
});
