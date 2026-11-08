import { messages, number } from './i18n';
export interface Drawing {
  duty: number | null; rpm: number | null; lph: number | null; unit: string;
  pumpRpm?:number|null;waterTemperature?:number|null;showTemperature?:boolean;locale?:string;
  status: string; animation: boolean; accent: string; graphMax: number;
  history: Array<{ at: number; value: number }>; now: number;
}
export function layout(w:number,h:number) {
  // Same logical 14 px inset as Nexus's MonitoringWidget .performance.
  // The host scales both widgets; do not scale this inset a second time.
  const s=Math.max(.35,Math.min(w/420,h/240)),pad=14;
  const rx=pad+.75*s,ry=pad+6*s,rw=w*.20,rh=Math.max(30*s,h-pad-ry-.75*s);
  const tx=rx+rw+18*s,gap=18*s,column=(w-pad-tx-gap)/2;
  return {s,pad,rx,ry,rw,rh,tx,gap,column};
}
// Only this rectangle contains per-frame motion. Text and history change
// with telemetry, so the renderer leaves their pixels alone between updates.
export function motionBounds(w:number,h:number) {
  const {s,rx,ry,rw,rh}=layout(w,h);
  return {x:rx-2*s,y:ry-7*s,width:rw+4*s,height:rh+10*s};
}
export function draw(g: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number, h: number, p: Drawing, t: number) {
  if (w < 10 || h < 10) return;
  const accent = /^#[\da-f]{6}$/i.test(p.accent) ? p.accent : '#60d5f5';
  const {s,pad,rx,ry,rw,rh,tx,gap,column}=layout(w,h);
  const m=messages(p.locale),n=(value:number|null|undefined,digits=0)=>number(value,digits,p.locale);
  const font = (size: number, weight = 500) => { g.font = `${weight} ${size*s}px system-ui, sans-serif`; };
  const text = (value: string, x: number, y: number, size: number, color = '#edf8ff', weight = 500) => {
    font(size, weight); g.fillStyle = color; g.fillText(value, x, y);
  };
  const fitted=(value:string,x:number,y:number,size:number,width:number,color='#f5f5f5',weight=650)=>{
    font(size,weight);
    while(g.measureText(value).width>width&&size>5){size-=.5;font(size,weight);}
    text(value,x,y,size,color,weight);
  };
  const round = (x: number, y: number, width: number, height: number, r: number) => {
    g.beginPath(); g.roundRect(x, y, width, height, r);
  };
  g.clearRect(0, 0, w, h);
  // Keep the canvas transparent: Nexus owns the standard card background.
  g.textAlign='left';
  const top=pad+12*s,bottom=h-pad;
  // Stylized reservoir. Its fill follows pump duty; no liquid level is measured.
  g.strokeStyle = '#9babad'; g.lineWidth = 1.5*s;
  round(rx, ry, rw, rh, 14*s); g.stroke();
  g.fillStyle = '#363b3d'; round(rx+rw*.27, ry-5*s, rw*.46, 6*s, 2*s); g.fill();
  g.save(); round(rx+3*s, ry+3*s, rw-6*s, rh-6*s, 11*s); g.clip();
  if (p.duty !== null && p.duty > 0) {
    const y = ry+rh-3*s - (rh-6*s)*p.duty/100;
    const phase = p.animation ? t*.0012 : .5;
    const amplitude = Math.min(3*s, (rh-6*s)*p.duty/100*.25, (rh-6*s)*(100-p.duty)/100*.25);
    for (let wave=0; wave<2; wave++) {
      g.beginPath();
      for (let i=0; i<=40; i++) {
        const x=rx+rw*i/40;
        const py=y + Math.sin(i/40*Math.PI*2 + phase*(wave ? -1 : 1)+wave*1.8)*amplitude;
        if (!i) g.moveTo(x,py); else g.lineTo(x,py);
      }
      g.lineTo(rx+rw,ry+rh); g.lineTo(rx,ry+rh); g.closePath();
      const fill=g.createLinearGradient(0,y,0,ry+rh); fill.addColorStop(0,accent+(wave ? '99' : '65')); fill.addColorStop(1,accent+'15');
      g.fillStyle=fill; g.fill();
      g.strokeStyle=accent+(wave ? 'dd' : '66'); g.lineWidth=1.2*s; g.stroke();
    }
    if (p.animation && p.duty > 12 && p.lph !== null && p.lph > 0) {
      for(let i=0;i<3;i++) {
        const yy=ry+rh-((t*.012 + i*rh/3) % Math.max(1,rh*(p.duty/100)-8*s));
        g.strokeStyle=accent+'66'; g.beginPath(); g.arc(rx+rw*(.3+i*.19),yy,1.5*s,0,Math.PI*2);g.stroke();
      }
    }
  }
  // A moving stroke indicates measured flow even if Nexus reports 0% or no
  // PWM. It adds no filled area and does not invent a pump duty / water level.
  if((p.duty===null||p.duty===0)&&p.lph!==null&&p.lph>0){
    g.beginPath();
    for(let i=0;i<=40;i++){
      const x=rx+5*s+(rw-10*s)*i/40;
      const y=ry+rh-10*s+Math.sin(i/40*Math.PI*2+(p.animation?t*.0012:.5))*2*s;
      if(i===0)g.moveTo(x,y);else g.lineTo(x,y);
    }
    g.strokeStyle=accent;g.lineWidth=1.6*s;g.stroke();
  }
  g.restore();
  for(let i=1;i<=3;i++) { const yy=ry+rh*i/4;g.strokeStyle='#63819480';g.beginPath();g.moveTo(rx+rw-8*s,yy);g.lineTo(rx+rw-3*s,yy);g.stroke(); }
  if(p.showTemperature){
    const center=ry+rh*.53;
    g.textAlign='center';
    fitted(`${n(p.waterTemperature,1)} °C`,rx+rw/2,center+7*s,23,rw-16*s,'#f5f5f5',700);
    g.textAlign='left';
  }
  fitted(m.flow,tx,top,12,column,'#a3a3a3');
  const px=tx+column+gap;
  fitted(m.pump,px,top,12,column,'#a3a3a3');
  const val=p.lph === null ? null : p.unit === 'l/min' ? p.lph/60 : p.lph;
  const digits=p.unit === 'l/min' ? 2 : 0;
  const metric=(value:string,unit:string,x:number)=>{
    font(14,600);const unitWidth=g.measureText(unit).width;
    fitted(value,x,top+48*s,48,Math.max(10*s,column-unitWidth-5*s));
    const valueWidth=g.measureText(value).width;
    text(unit,x+valueWidth+5*s,top+48*s,14,accent,600);
  };
  metric(n(val,digits),p.unit,tx);
  metric(n(p.duty),'%',px);
  fitted(`${n(p.lph===null?null:p.unit==='l/min'?p.lph:p.lph/60,p.unit==='l/min'?0:2)} ${p.unit==='l/min'?'l/h':'l/min'}`,tx,top+69*s,12,column,'#a3a3a3',500);
  fitted(`${n(p.rpm)} RPM`,tx,top+86*s,12,column,'#a3a3a3',500);
  fitted(`${n(p.pumpRpm)} RPM`,px,top+69*s,12,column,'#a3a3a3',500);
  // Filled line history of actual flow samples, fixed to the last 120 seconds.
  if (bottom>top+118*s) {
    const cx=tx,cy=top+103*s,cw=w-pad-cx,ch=bottom-cy-16*s;
    const max=Number.isFinite(p.graphMax)&&p.graphMax>0?p.graphMax:300;
    g.save();g.beginPath();g.rect(cx,cy,cw,ch);g.clip();
    for(let i=0;i<3;i++) {const yy=cy+ch*i/2;g.strokeStyle='#8aafc215';g.beginPath();g.moveTo(cx,yy);g.lineTo(cx+cw,yy);g.stroke();}
    const segments: Array<Array<{at:number;value:number}>>=[];
    for(const sample of p.history.filter(x=>Number.isFinite(x.value)&&x.at>=p.now-120000&&x.at<=p.now)) {
      const last=segments[segments.length-1];
      if(!last||sample.at-last[last.length-1].at>6500) segments.push([sample]);else last.push(sample);
    }
    for(const seg of segments) {
      if(seg.length<2)continue;
      const x=(at:number)=>cx+(at-(p.now-120000))/120000*cw;
      const y=(v:number)=>cy+ch-Math.min(1,Math.max(0,v/max))*ch;
      g.beginPath();seg.forEach((v,i)=>i?g.lineTo(x(v.at),y(v.value)):g.moveTo(x(v.at),y(v.value)));
      g.lineTo(x(seg[seg.length-1].at),cy+ch);g.lineTo(x(seg[0].at),cy+ch);g.closePath();
      const a=g.createLinearGradient(0,cy,0,cy+ch);a.addColorStop(0,accent+'5c');a.addColorStop(1,accent+'08');g.fillStyle=a;g.fill();
      g.beginPath();seg.forEach((v,i)=>i?g.lineTo(x(v.at),y(v.value)):g.moveTo(x(v.at),y(v.value)));
      g.strokeStyle=accent;g.lineWidth=1.6*s;g.stroke();
    }
    g.restore();fitted(m.history,tx,bottom-3*s,10,w-pad-tx,'#858585',500);
  }
  if(p.status!=='LIVE') {
    fitted(p.status,tx,h-5*s,9,w-tx-pad,'#d6b780',500);
  }
}
