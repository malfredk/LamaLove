import { appendFileSync } from 'node:fs';
import { isForecastWindow } from './config.mjs';
import { osloTime } from './selection.mjs';

const publish = process.env.EVENT !== 'schedule' || isForecastWindow(osloTime(new Date()).date);
const output = `publish=${publish}\n`;
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, output);
else process.stdout.write(output);
