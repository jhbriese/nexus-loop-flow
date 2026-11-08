// Downloads only the pinned upstream SDK. Does not install the widget into Nexus.
import { existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { root, upstream, sdkCli, nexusCommit, webCommit, run, output } from './paths.mjs';
mkdirSync(dirname(upstream),{recursive:true});
if(!existsSync(upstream))run('git',['clone','--depth','1','--branch','v3.1.8','https://github.com/hello-nexus/nexus.git',upstream]);
if(output('git',['-C',upstream,'rev-parse','HEAD'])!==nexusCommit)throw new Error('Upstream-Checkout hat nicht den erwarteten Nexus-v3.1.8-Commit. .cache/nexus prüfen.');
run('git',['-C',upstream,'submodule','update','--init','--depth','1','nexus-web']);
if(output('git',['-C',upstream+'/nexus-web','rev-parse','HEAD'])!==webCommit)throw new Error('Unerwarteter nexus-web-Commit.');
const npmCli=process.env.npm_execpath;
if(!npmCli)throw new Error('Dieses Skript bitte mit npm run setup aufrufen.');
// Install beside the upstream CLI so Node resolves its esbuild dependency on Windows too.
run(process.execPath,[npmCli,'install','--prefix',dirname(sdkCli),'--no-save','--package-lock=false','--no-audit','--no-fund','esbuild@0.25.0']);
console.log(`SDK bereit. Projekt: ${root}\nWeiter: npm run build && npm run validate && npm test`);
