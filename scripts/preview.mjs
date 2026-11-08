import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {join,resolve,sep,extname} from 'node:path';
import {root} from './paths.mjs';
const base=join(root,'preview');
const server=createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
  const file=resolve(base,'.'+(pathname==='/'?'/index.html':pathname));
  if(!file.startsWith(base+sep)){res.writeHead(403);res.end();return;}
  const body=await readFile(file);
  res.writeHead(200,{'Content-Type':{'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.png':'image/png'}[extname(file)]??'application/octet-stream','Cache-Control':'no-store'});res.end(body);
 }catch{res.writeHead(404);res.end('Nicht gefunden');}
});
server.listen(8765,'127.0.0.1',()=>console.log('Designvorschau: http://127.0.0.1:8765 (Beispieldaten, keine Live-Sensoren)'));
