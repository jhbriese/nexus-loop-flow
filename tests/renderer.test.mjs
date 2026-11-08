import test from 'node:test';
import assert from 'node:assert/strict';
// Exercises the shipped renderer protocol, not a copy of the animation loop.
// Mock graphics context checks control flow; it is not a visual/browser test.
test('Messwertupdates resetten keine Phase; stabiler Takt, Clipping und Pause',async()=>{
 let handler,raf,draws=0,clips=0;
 const messages=[];
 const gradient={addColorStop(){}};
 const context=new Proxy({},{get:(_o,k)=>{
  if(k==='clearRect')return()=>{draws++};
  if(k==='clip')return()=>{clips++};
  if(k==='createLinearGradient')return()=>gradient;
  if(k==='measureText')return text=>({width:String(text).length*8});
  return()=>{};
 },set:()=>true});
 const canvas={width:1,height:1,getContext:()=>context};
 globalThis.postMessage=m=>messages.push(m);
 globalThis.addEventListener=(_kind,fn)=>handler=fn;
 globalThis.requestAnimationFrame=fn=>{raf=fn;return 1};globalThis.cancelAnimationFrame=()=>{};
 await import('../com.jan.loopflow/renderer.mjs');
 const props={duty:80,rpm:340,lph:340/98*60,unit:'l/h',status:'LIVE',animation:true,accent:'#60d5f5',graphMax:300,quality:3,now:Date.now(),history:[]};
 handler({data:{type:'init',canvas,size:{width:360,height:230,pixelRatio:1.5},props,visible:true}});
 assert.equal(canvas.width,1080);assert.equal(canvas.height,690);
 for(let i=0;i<=60;i++)raf(i*1000/60);
 const before=draws;
 handler({data:{type:'props',props:{...props,rpm:341,lph:341/98*60}}});
 assert.equal(draws,before,'Kein synchrones Bild mit Animationszeit Null');
 raf(61*1000/60);assert.equal(draws,before+1);
 assert(before>=29&&before<=32,`Erwartet ~30 fps, gemessen ${before}`);
 const priorClips=clips;
 for(let i=62;i<=120;i++)raf(i*1000/60);
 assert(clips>priorClips+25);
 handler({data:{type:'resize',size:{width:360,height:150,pixelRatio:1.5}}});assert.equal(canvas.height,450);
 handler({data:{type:'props',props:{...props,animation:false}}});const stopped=draws;
 for(let i=121;i<=150;i++)raf(i*1000/60);assert.equal(draws,stopped);
 assert(!messages.some(m=>m.type==='error'));
});
