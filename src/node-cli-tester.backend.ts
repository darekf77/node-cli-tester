import * as path from 'path';
import { Helpers } from 'tnp-helpers';
import { config } from 'tnp-config';


export class NodeCliTester {
  //#region singleton
  private static _instances = {};
  public static classFn = NodeCliTester;

  protected constructor(
    protected readonly cwd = process.cwd()
  ) {
    const pathToScenarios = path.join(cwd, config.folder.scenarios);
    const pathToScenariosTemp = path.join(cwd, config.folder.tmpScenarios);
    if (!Helpers.exists(pathToScenarios)) {
      Helpers.createSymLink(pathToScenariosTemp, pathToScenarios,
        { continueWhenExistedFolderDoesntExists: true })
    }
  }
  public static Instance(cwd = process.cwd()) {
    if (!NodeCliTester._instances[cwd]) {
      NodeCliTester._instances[cwd] = new (NodeCliTester.classFn)(cwd);
    }
    return NodeCliTester._instances[cwd] as NodeCliTester;
  }
  //#endregion

  createTest(testName: string) {
    console.log(`Create test from node-cli-tester`);
  }

  addFileToTest(testName: string, filePath: string) {

  }

  getAllTestsNames() {

  }

  startTest(testName: string) {

  }

  createBaseStructure(pathToBaseStructure: string) {

  }

}
