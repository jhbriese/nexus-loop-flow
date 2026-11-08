import { useEffect, useRef, useState } from 'react';
import { mount, useAppData, useDispatch, useLocalState, useSettings, useSurface, usePreview, useTick, useLocale } from '@hello-nexus/sdk';
import { Stack, Text, Input, Select, Scroll, Canvas, Stepper, Segmented, Toggle, Color, Collapsible } from '@hello-nexus/sdk/ui';
import { flow, pumpPercent, rpmValue, temperatureValue, type Fan, type TemperatureSource } from './model';
import { messages, number } from './i18n';
interface Config { pump:string;flow:string;temperature:string;factor:number;unit:string;animation:boolean;accent:string;graphMax:number;quality:number;configured:boolean }
const DEFAULTS:Config={pump:'',flow:'',temperature:'',factor:98,unit:'l/h',animation:true,accent:'#60d5f5',graphMax:300,quality:3,configured:false};
interface Snapshot { channels:Fan[];sources:TemperatureSource[];at:number;failed:boolean }
const DEMO:Fan[]=[{id:'demo-pump',name:'Pumpe (Vorschau)',dutyPercent:80,rpm:3800},{id:'demo-flow',name:'Barrow SLF-V3 (Vorschau)',dutyPercent:null,rpm:340,readOnly:true}];
function resolve<T extends {id:string;name:string}>(channels:T[],requested:string):T|undefined{
  const idMatch=channels.find(c=>c.id===requested);if(idMatch)return idMatch;
  const matches=channels.filter(c=>c.name===requested);return matches.length===1?matches[0]:undefined;
}
function App(){
 const settings=useSettings<{pumpSource?:string;flowSource?:string;factor?:number;unit?:string;animation?:boolean}>();
 const surface=useSurface(),preview=usePreview(),dispatch=useDispatch(),now=useTick(1000);
 const locale=useLocale(),m=messages(locale);
 const shared=useAppData<Config>('configuration-v2',DEFAULTS),config={...DEFAULTS,...shared.value};
 const [legacy]=useLocalState({pump:'',flow:'',factor:null as number|null,unit:'',animation:null as boolean|null});
 const migrationBusy=useRef(false);
 useEffect(()=>{
  if(preview||!shared.ready||config.configured||!legacy.pump||!legacy.flow||migrationBusy.current)return;
  migrationBusy.current=true;
  void shared.update(current=>current.configured?current:{...DEFAULTS,...current,pump:legacy.pump,flow:legacy.flow,factor:legacy.factor??settings.factor??98,unit:legacy.unit||settings.unit||'l/h',animation:legacy.animation??settings.animation??true,configured:true}).catch(()=>{}).finally(()=>{migrationBusy.current=false;});
 },[shared.ready,config.configured,legacy.pump,legacy.flow,preview]);
 const [draft,setDraft]=useState<Config>(DEFAULTS),[dirty,setDirty]=useState(false),[saveMessage,setSaveMessage]=useState<''|'saved'|'invalidFactor'|'saveFailed'>(''),[advanced,setAdvanced]=useState(false);
 const [factorText,setFactorText]=useState('98');
 const editVersion=useRef(0);
 useEffect(()=>{if(shared.ready&&!dirty){setDraft({...DEFAULTS,...shared.value});setFactorText(String(shared.value.factor??98));}},[shared.ready,shared.revision,dirty]);
 const change=(next:Partial<Config>)=>{if(!shared.ready)return;editVersion.current++;setDraft(d=>({...d,...next}));setDirty(true);setSaveMessage('');};
 useEffect(()=>{
  if(!shared.ready||!dirty)return;
  const version=editVersion.current;
  if(!Number.isFinite(draft.factor)||draft.factor<=0){setSaveMessage('invalidFactor');return;}
  const timer=setTimeout(()=>{
   void shared.update(current=>({...current,...draft,configured:true})).then(ok=>{
    if(editVersion.current!==version)return;
    if(ok){setDirty(false);setSaveMessage('saved');}else setSaveMessage('saveFailed');
   }).catch(()=>{if(editVersion.current===version)setSaveMessage('saveFailed');});
  },350);
  return()=>clearTimeout(timer);
 },[draft,dirty,shared.ready]);
 const [snap,setSnap]=useState<Snapshot>({channels:[],sources:[],at:0,failed:false});
 const [samples,setSamples]=useState<Array<{at:number;value:number}>>([]);
 useEffect(()=>{
  if(preview)return;let alive=true;let timer:ReturnType<typeof setTimeout>;
  const poll=async()=>{
   try{const r=await dispatch('cooling.state',{}) as {ok?:boolean;result?:{channels?:Fan[];sources?:TemperatureSource[]}};
    if(!r||r.ok===false||!Array.isArray(r.result?.channels))throw new Error('Keine Kühlungsdaten');
    if(alive)setSnap({channels:r.result.channels,sources:Array.isArray(r.result.sources)?r.result.sources:[],at:Date.now(),failed:false});
   }catch{if(alive)setSnap(s=>({...s,failed:true}));}
   if(alive)timer=setTimeout(poll,2000);
  };void poll();return()=>{alive=false;clearTimeout(timer);};
 },[dispatch,preview]);
 const channels=preview?DEMO:snap.channels;
 const sources:TemperatureSource[]=preview?[{id:'demo-water',name:m.waterSensor,value:32.4}]:snap.sources;
 const pumpId=preview?DEMO[0].id:settings.pumpSource?.trim()||(config.configured?config.pump:legacy.pump);
 const flowId=preview?DEMO[1].id:settings.flowSource?.trim()||(config.configured?config.flow:legacy.flow);
 const factor=config.configured?config.factor:legacy.factor??settings.factor??98;
 const unit=config.configured?config.unit:legacy.unit||settings.unit||'l/h';
 const animation=config.configured?config.animation:legacy.animation??settings.animation??true;
 const pump=resolve(channels,pumpId),sensor=resolve(channels,flowId);
 const stale=!preview&&(snap.failed||now-snap.at>7000),rpm=stale?null:rpmValue(sensor),duty=stale?null:pumpPercent(pump),lph=flow(rpm,factor,'l/h');
 const pumpRpm=stale?null:rpmValue(pump);
 const temperatureId=preview?'demo-water':config.temperature;
 const waterTemperature=stale?null:temperatureValue(resolve(sources,temperatureId));
 useEffect(()=>{setSamples([]);},[flowId,factor]);
 useEffect(()=>{if(lph===null||stale||preview)return;setSamples(s=>[...s.filter(x=>snap.at-x.at<=120000),{at:snap.at,value:lph}].slice(-61));},[snap.at,lph,stale,preview,flowId,factor]);
 const status=preview?m.preview:!pumpId||!flowId?m.selectSources:stale?m.noData:!pump||!sensor?m.missing:rpm===null?m.flowMissing:duty===null?m.pumpMissing:'LIVE';
 const drawing={duty,rpm,pumpRpm,waterTemperature,showTemperature:!!temperatureId,lph,unit,factor,status,locale,animation,accent:config.accent,graphMax:config.graphMax,quality:config.quality,now,history:preview?Array.from({length:61},(_,i)=>({at:now-(60-i)*2000,value:208+Math.sin(i*.32)*3})):samples};
 // The cell is display-only. Configuration lives on the Nexus desktop app page.
 if(surface!=='page')return <Canvas renderer="renderer.mjs" props={drawing}/>;
 const options=[{value:'',label:m.choose},...channels.map(c=>({value:c.id,label:`${c.deviceName?c.deviceName+' · ':''}${c.name} · ${number(rpmValue(c),0,locale)} RPM`}))];
 const withMissing=(opts:Array<{value:string;label:string}>,value:string)=>!value||opts.some(o=>o.value===value)?opts:[...opts,{value,label:`${m.missing}: ${value}`}];
 const temperatureOptions=[{value:'',label:m.none},...sources.map(s=>({value:s.id,label:`${s.category?s.category+' · ':''}${s.name} · ${number(temperatureValue(s),1,locale)} °C`}))];
 return <Scroll grow padding={16}><Stack direction="column" gap={10}>
  <Stack direction="row" justify="between" align="center">
   <Text value="Loop Flow" size={18} weight="semibold"/>
   <Text value={saveMessage?m[saveMessage]:dirty?m.saving:m.autoSave} size={12} tone="text-dim"/>
  </Stack>
  <Text value={m.pumpFan} weight="semibold"/>
  <Select disabled={!shared.ready} value={draft.pump} options={withMissing(options,draft.pump)} onChange={pump=>change({pump})}/>
  <Text value={m.pumpCurve} weight="semibold"/>
  <Select disabled value="" options={[{value:'',label:m.unavailable}]}/>
  <Text value={m.curveInfo} size={12} tone="text-dim"/>
  <Text value={m.flowFan} weight="semibold"/>
  <Select disabled={!shared.ready} value={draft.flow} options={withMissing(options,draft.flow)} onChange={flow=>change({flow})}/>
  {draft.pump&&draft.pump===draft.flow&&<Text value={m.sameSource} tone="warn"/>}
  <Text value={m.factor} weight="semibold"/>
  <Input disabled={!shared.ready} value={factorText} placeholder="98" onValueChange={value=>{setFactorText(value);change({factor:value.trim()?Number(value.replace(',','.')):NaN});}}/>
  <Text value={m.factorInfo} size={12} tone="text-dim"/>
  <Text value={m.waterSensor} weight="semibold"/>
  <Select disabled={!shared.ready} value={draft.temperature} options={withMissing(temperatureOptions,draft.temperature)} onChange={temperature=>change({temperature})}/>
  {!sources.length&&<Text value={m.noTemps} size={12} tone="text-dim"/>}
  <Segmented value={draft.unit} options={[{key:'l/h',label:'l/h'},{key:'l/min',label:'l/min'}]} onChange={unit=>change({unit})}/>
  <Toggle disabled={!shared.ready} label={m.animation} value={draft.animation} onChange={animation=>change({animation})}/>
  <Collapsible title={m.appearance} open={advanced} onToggle={()=>setAdvanced(!advanced)}>
   <Stack direction="column" gap={10}>
    <Stepper label={m.quality} value={draft.quality} min={1} max={4} step={1} onChange={quality=>change({quality})}/>
    <Stepper label={m.graphMax} value={draft.graphMax} min={10} max={10000} step={10} onChange={graphMax=>change({graphMax})}/>
    <Color value={draft.accent} onChange={accent=>change({accent})}/>
   </Stack>
  </Collapsible>
  {!channels.length&&<Text value={m.noChannels} tone="warn"/>}
  {duty===0&&<Text value={m.zeroDuty} size={12} tone="text-dim"/>}
 </Stack></Scroll>;
}
mount(App);
