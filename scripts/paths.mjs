import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
export const root=dirname(dirname(fileURLToPath(import.meta.url)));
export const upstream=join(root,'.cache','nexus');
export const app=join(root,'com.jan.loopflow');
export const sdkCli=join(upstream,'nexus-web','sdk','cli','nexus-app.mjs');
export const nexusCommit='edcec8541600d5ac934175b681297aa272500cff';
export const webCommit='d5e5c1dcb34682458604540826bc39a20b03c9e8';
export function run(command,args,options={}){
 const result=spawnSync(command,args,{cwd:root,stdio:'inherit',...options});
 if(result.error)throw result.error;
 if(result.status!==0)throw new Error(`${command} fehlgeschlagen (Exit ${result.status})`);
 return result;
}
export function output(command,args){return run(command,args,{stdio:['ignore','pipe','inherit'],encoding:'utf8'}).stdout.trim();}
