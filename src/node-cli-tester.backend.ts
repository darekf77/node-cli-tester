//#region imports
import * as _ from 'lodash';
import * as path from 'path';
import { Helpers } from 'tnp-helpers';
import { config } from 'tnp-config';
import { CliTest } from './cli-test.backend';
//#endregion


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
      NodeCliTester._instances[cwd] = new (this.classFn)(cwd);
    }
    return NodeCliTester._instances[cwd] as NodeCliTester;
  }
  //#endregion

  //#region create test
  async createTest(testName: string) {
    Helpers.log(`Create test from node-cli-tester`);
    const c = CliTest.from(testName, this.cwd);
    c.regenerate();
  }
  //#endregion

  //#region create test and add file
  async createTestAndAddFile(testName: string, filePath: string) {
    await this.createTest(testName);
    await this.addFileToTest(testName, filePath)
  }
  //#endregion

  //#region add file to test
  addFileToTest(testName: string, filePath: string) {
    // const folderName
  }
  //#endregion

  //#region get all tests names
  getAllTestsNames() {

  }
  //#endregion

  //#region start test
  startTest(testName: string) {

  }
  //#endregion

  //#region create base structure
  createBaseStructure(pathToBaseStructure: string) {

  }
  //#endregion

}
