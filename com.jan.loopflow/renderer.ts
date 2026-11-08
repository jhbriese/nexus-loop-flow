import { defineRenderer } from '@hello-nexus/sdk/renderer';
import { draw, motionBounds, type Drawing } from './draw';
defineRenderer(ctx => {
  const g=ctx.canvas.getContext('2d');
  if(!g)throw new Error('Canvas 2D nicht verfügbar');
  let phaseMs=0, budget=0, dirty=true;
  const render=(motionOnly=false)=>{
    const {width,height,pixelRatio}=ctx.size;
    const requested=Number(ctx.props.quality);
    const ratio=Math.max(pixelRatio,Math.min(4,Math.max(1,Number.isFinite(requested)?requested:3)));
    const bw=Math.max(1,Math.round(width*ratio)),bh=Math.max(1,Math.round(height*ratio));
    const resized=ctx.canvas.width!==bw||ctx.canvas.height!==bh;
    if(resized){ctx.canvas.width=bw;ctx.canvas.height=bh;}
    g.setTransform(ratio,0,0,ratio,0,0);
    g.save();
    if(motionOnly&&!resized){const b=motionBounds(width,height);g.beginPath();g.rect(b.x,b.y,b.width,b.height);g.clip();}
    draw(g,width,height,ctx.props as unknown as Drawing,phaseMs);
    g.restore();
    dirty=false;
  };
  ctx.onFrame((dt)=>{
    if(!ctx.props.animation){if(dirty)render();return;}
    phaseMs+=dt*1000;budget+=dt;
    // Accumulated time avoids the uneven cadence of two strict 30-Hz gates.
    const due=budget+1e-6>=1/30;
    if(dirty||due){
      const partial=!dirty;
      if(due)budget=Math.max(0,budget-Math.floor((budget+1e-6)*30)/30);
      render(partial);
    }
  });
  ctx.onProps(()=>{dirty=true;if(!ctx.props.animation)render();});
  ctx.onResize(()=>{dirty=true;render();});
  ctx.onVisibility(visible=>{if(visible)dirty=true;});
  render();ctx.ready();
});
