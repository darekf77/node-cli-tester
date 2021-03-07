import * as _ from 'lodash';
import { Helpers } from 'tnp-helpers';
import { NodeCliTester } from './node-cli-tester.backend';

export async function run<T extends NodeCliTester = NodeCliTester>(
  argsv: string[], instance: T = NodeCliTester.Instance() as any
) {

  const command: Lowercase<keyof NodeCliTester> = argsv.shift() as any;
  for (const key in instance) {
    if (key.toLowerCase() === command && _.isFunction(instance[key])) {
      await Helpers.runSyncOrAsync(instance[key as any], ...argsv);
    }
  }
  process.exit(0);
}
