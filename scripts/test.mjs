import {readdirSync} from 'node:fs';
import {join} from 'node:path';
import {root,run} from './paths.mjs';
const files=readdirSync(join(root,'tests')).filter(n=>n.endsWith('.test.mjs')).sort().map(n=>join(root,'tests',n));
run(process.execPath,['--test',...files]);
