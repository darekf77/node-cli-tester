import { _ } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';
import { NodeCliTester } from './node-cli-tester';

export async function run<T extends NodeCliTester = NodeCliTester>(
  argsv: string[], instance: T = NodeCliTester.Instance() as any
) {

  // const command: Lowercase<keyof NodeCliTester> = argsv.shift().toLowerCase() as any;
  // TODO
  // const command = argsv.shift().toLowerCase() as any; // TODO up tsc version
  // for (const key in instance) {
  //   if (key.toLowerCase() === command && _.isFunction(instance[key])) {
  //     const argsToPass: string[] = argsv
  //       .filter(a => !a.startsWith('--'))
  //       .map(a => parseArr(a)) as any;
  //     await Helpers.runSyncOrAsync({ functionFn: [key, instance], arrayOfParams: argsToPass });
  //   }
  // }
  // process.exit(0);
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
