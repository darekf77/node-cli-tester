import { _ } from 'tnp-core';
import { Helpers } from 'tnp-helpers';
import { NodeCliTester } from './node-cli-tester.backend';

export async function run<T extends NodeCliTester = NodeCliTester>(
  argsv: string[], instance: T = NodeCliTester.Instance() as any
) {

  const command: Lowercase<keyof NodeCliTester> = argsv.shift().toLowerCase() as any;
  for (const key in instance) {
    if (key.toLowerCase() === command && _.isFunction(instance[key])) {
      const argsToPass = argsv
        .filter(a => !a.startsWith('--'))
        .map(a => parseArr(a));
      await Helpers.runSyncOrAsync([key, instance], ...argsToPass);
    }
  }
  process.exit(0);
}

function parseArr(a: string) {
  if (a === 'null') {
    return null;
  }
  if (a.startsWith('[') && a.endsWith(']')) {
    const elems = a.slice(1, a.length - 1).split(',');
    return elems;
  }
  return a;
}
