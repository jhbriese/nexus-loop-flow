// Optional real Chromium checks. Setup (kept outside project dependencies):
// npm install --prefix .cache/visual-check --no-save --package-lock=false playwright@1.59.1
// CHROME_PATH can point to an existing Chrome/Chromium executable.
import {createServer} from 'node:http';
import {readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {root,sdkCli,upstream} from './paths.mjs';
import {chromium} from '../.cache/visual-check/node_modules/playwright/index.mjs';

// Exercise the pinned host's real SettingControl, not a guessed manifest UI.
// An icon-select with no options emits just its label and an empty layout box.
const manifest=JSON.parse(await readFile(join(root,'com.jan.loopflow/manifest.json'),'utf8'));
const settingsBase=join(upstream,'nexus-web/src/panel/widgets/marketplace');
const settingsSource=await readFile(join(settingsBase,'MarketplaceWidgetSettings.tsx'),'utf8');
const {transform}=createRequire(sdkCli)('esbuild');
const compiled=await transform(settingsSource.slice(settingsSource.indexOf('function SettingControl(')),{loader:'tsx'});
const React={createElement:(type,props,...children)=>({type,props,children})};
const SettingControl=new Function('React','styles','SETTINGS_ICONS',compiled.code+';return SettingControl;')(React,new Proxy({},{get:(_,key)=>key}),{});
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const renderNode=node=>{
 if(node==null)return '';if(Array.isArray(node))return node.map(renderNode).join('');
 if(typeof node!=='object')return escape(node);
 assert(['div','span'].includes(node.type),'Settings hint must contain no input/select/button');
 return '<'+node.type+(node.props?.className?' class="'+escape(node.props.className)+'"':'')+'>'+renderNode(node.children)+'</'+node.type+'>';
};
assert(!manifest.settings.some(s=>['pumpSource','flowSource'].includes(s.key)));
const hint=manifest.settings.map(entry=>renderNode(SettingControl({entry,value:undefined,onChange:()=>{throw Error('Read-only hint');}}))).join('');
assert(hint.includes('Mehr anzeigen → Loop Flow'));
const settingsCss=await readFile(join(settingsBase,'MarketplaceWidgetSettings.module.scss'),'utf8');
const settingsHtml='<meta charset="utf-8"><style>body{background:#080808;color:#eee;font:16px system-ui;margin:0;padding:24px}h2{font-size:16px;color:#aaa;margin:0 0 24px}'+settingsCss+'</style><h2>Loop Flow</h2>'+hint;

const routes=new Map([
 ['/', ['preview/index.html','text/html; charset=utf-8']],
 ['/draw.mjs',['preview/draw.mjs','text/javascript']],
 ['/renderer.mjs',['com.jan.loopflow/renderer.mjs','text/javascript']],
]);
const server=createServer(async(req,res)=>{
 if(req.url==='/settings'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}).end(settingsHtml);return;}
 const route=routes.get(req.url);if(!route){res.writeHead(404).end();return;}
 try{res.writeHead(200,{'Content-Type':route[1]});res.end(await readFile(join(root,route[0])));}catch{res.writeHead(500).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const page=await browser.newPage({viewport:{width:1056,height:1100},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:'+server.address().port);
 await page.waitForFunction(()=>document.querySelector('#full').width>1);
 await page.locator('#animate').uncheck();
 await page.waitForTimeout(100);
 await page.screenshot({path:join(root,'preview/review.png'),fullPage:true});
 await page.locator('.tile').first().screenshot({path:join(root,'preview/review-widget.png')});
 await page.locator('#duty').fill('0');
 await page.waitForTimeout(100);
 await page.locator('.tile').first().screenshot({path:join(root,'preview/review-zero.png')});
 const result=await page.evaluate(async()=>{
  const {draw,motionBounds}=await import('/draw.mjs');
  const props={duty:80,rpm:340,pumpRpm:3800,waterTemperature:32.4,showTemperature:true,lph:340/98*60,unit:'l/h',locale:'de',status:'LIVE',animation:true,accent:'#60d5f5',graphMax:300,now:100000,history:Array.from({length:61},(_,i)=>({at:100000-(60-i)*2000,value:208+Math.sin(i*.32)*3}))};
  const canvas=document.createElement('canvas'),g=canvas.getContext('2d',{willReadFrequently:true});
  const failures=[];let cases=0;
  const paint=(p,t)=>{draw(g,canvas.width,canvas.height,p,t);return g.getImageData(0,0,canvas.width,canvas.height).data.slice();};
  const different=(a,b)=>a.some((v,i)=>v!==b[i]);
  for(const [w,h] of [[650,300],[360,230],[360,150],[360,360],[180,120]]){
   canvas.width=w;canvas.height=h;
   for(const locale of ['de','en','fr','es','it','pt-BR','nl','pl']){
    for(const unit of ['l/h','l/min']){
     let textCalls=[];const original=g.fillText.bind(g);
     g.fillText=(text,x,y)=>{const width=g.measureText(text).width;const left=g.textAlign==='center'?x-width/2:x; if(left<-.5||left+width>w+.5||y>h+.5)textCalls.push({text,x,y,width,w,h});original(text,x,y);};
     paint({...props,locale,unit},1000);g.fillText=original;
     if(textCalls.length)failures.push({locale,unit,overflow:textCalls});cases++;
    }
   }
  }
  canvas.width=650;canvas.height=300;
  const pixels=paint(props,0);
  if(pixels[3]!==0)failures.push('Canvas background is not transparent');
  for(const duty of [0,null,80,100]){
   const p={...props,duty};const a=paint(p,0),b=paint(p,1300);
   if(!different(a,b))failures.push('No animation at duty '+duty);
   const paused={...p,animation:false};
   if(different(paint(paused,0),paint(paused,1300)))failures.push('Animation off still moves');
  }
  if(different(paint({...props,duty:0,lph:0},0),paint({...props,duty:0,lph:0},1300)))failures.push('Flow shown despite true zero');
  // Compare a real clipped repaint to a full repaint, including temperature.
  paint(props,0);const bounds=motionBounds(650,300);g.save();g.beginPath();g.rect(bounds.x,bounds.y,bounds.width,bounds.height);g.clip();
  draw(g,650,300,props,1300);g.restore();
  const partial=g.getImageData(0,0,650,300).data.slice(),full=paint(props,1300);
  // Compare premultiplied channels: RGB in almost transparent pixels is not
  // visually meaningful. Clipped Canvas paths have slightly different AA.
  let largeDiff=0;
  partial.forEach((v,i)=>{const alpha=i-i%4+3;const a=i%4===3?v:v*partial[alpha]/255;const b=i%4===3?full[i]:full[i]*full[alpha]/255;if(Math.abs(a-b)>8)largeDiff++;});
  if(largeDiff)failures.push({partialRepaint:largeDiff});
  // Run the actual shipped worker, including starting hidden and resuming.
  const display=document.createElement('canvas');display.style.cssText='width:650px;height:300px';document.body.append(display);
  const worker=new Worker('/renderer.mjs',{type:'module'}),offscreen=display.transferControlToOffscreen();
  const workerErrors=[];const ready=new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(Error('Worker ready timeout')),5000);worker.onmessage=e=>{if(e.data.type==='ready'){clearTimeout(timeout);resolve();}if(['error','rejection'].includes(e.data.type))workerErrors.push(e.data.message);};worker.onerror=e=>workerErrors.push(e.message);});
  worker.postMessage({type:'init',canvas:offscreen,size:{width:650,height:300,pixelRatio:1},props:{...props,duty:0,quality:1},visible:false},[offscreen]);
  await ready;worker.postMessage({type:'visible',visible:true});
  const snapshot=()=>{g.clearRect(0,0,650,300);g.drawImage(display,0,0,650,300);return g.getImageData(0,0,650,300).data.slice();};
  await new Promise(r=>setTimeout(r,150));const before=snapshot();await new Promise(r=>setTimeout(r,160));const after=snapshot();
  if(!different(before,after))failures.push('Real worker does not animate after becoming visible');
  worker.postMessage({type:'props',props:{...props,duty:0,quality:1,animation:false}});
  await new Promise(r=>setTimeout(r,100));const stopped=snapshot();await new Promise(r=>setTimeout(r,150));
  if(different(stopped,snapshot()))failures.push('Real worker did not stop');
  worker.terminate();display.remove();failures.push(...workerErrors);
  return {cases,failures};
 });
 await writeFile(join(root,'preview/visual-check.json'),JSON.stringify(result,null,2)+'\n');
 assert.deepEqual(errors,[]);assert.deepEqual(result.failures,[]);
 const settingsPage=await browser.newPage({viewport:{width:600,height:220},deviceScaleFactor:1});
 await settingsPage.goto('http://127.0.0.1:'+server.address().port+'/settings');
 assert.equal(await settingsPage.locator('input,textarea,select,button').count(),0);
 await settingsPage.screenshot({path:join(root,'preview/review-settings.png')});
 console.log('Chromium: '+result.cases+' Layout-/Sprachvarianten, Transparenz, Wellen, Clipping und echter Renderer-Worker erfolgreich.');
 console.log('Nativer Einstellungsrenderer: Hinweis ohne Eingabefelder erfolgreich.');
 console.log('Vorschau: preview/review.png und preview/review-zero.png');
}finally{await browser?.close();server.close();}
