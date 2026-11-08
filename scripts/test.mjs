import {readdirSync} from 'node:fs';
import {join} from 'node:path';
import {root,run} from './paths.mjs';
// Relative POSIX paths: node --test treats arguments as globs, so backslashes in UNC paths (\server\share) would be read as escapes.
const files=readdirSync(join(root,'tests')).filter(n=>n.endsWith('.test.mjs')).sort().map(n=>`tests/${n}`);
run(process.execPath,['--test',...files]);
