import { existsSync } from 'node:fs';
import { app, sdkCli, run } from './paths.mjs';
if(!existsSync(sdkCli))throw new Error('SDK fehlt. Zuerst npm run setup ausführen.');
run(process.execPath,[sdkCli,'validate',app]);
