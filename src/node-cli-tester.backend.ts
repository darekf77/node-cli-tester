//#region imports
import * as _ from 'lodash';
import * as path from 'path';
import { Helpers, Project } from 'tnp-helpers';
import { config } from 'tnp-config';
import { CliTest } from './cli-test.backend';
import { CLASS } from 'typescript-class-helpers';
//#endregion


export class NodeCliTester {

  //#region singleton
  private static _instances = {};

  public static classFn = NodeCliTester;
  public static foundProjectsFn: (projects: Project[]) => Project[] = void 0;

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
  public async createTest(testNameOrPathToTestFolder: string) {
    Helpers.log(`Create test from node-cli-tester`);
    const c = CliTest.from(this.cwd, path.isAbsolute(testNameOrPathToTestFolder) ? path.basename(testNameOrPathToTestFolder) : testNameOrPathToTestFolder);
    await c.regenerateFiles();
  }
  //#endregion

  //#region create test and add file
  public async createTestAndAddFile(testName: string, absoluteFilePath: string, editorCwd: string = process.cwd()) {
    await this.createTest(testName);
    await this.addFileToTest(testName, absoluteFilePath, editorCwd);
  }
  //#endregion

  //#region add file to test
  public async addFileToTest(testNameOrPathToTestFolder: string, filePath: string, editorCwd: string = process.cwd()) {
    const c = CliTest.from(this.cwd, path.isAbsolute(testNameOrPathToTestFolder) ? path.basename(testNameOrPathToTestFolder) : testNameOrPathToTestFolder);
    await c.metaMd.add(filePath, editorCwd, CLASS.getFromObject(this));
  }
  //#endregion

  //#region get all tests names
  protected getAllTestsNames() {
    Helpers.outputToVScode(CliTest.allFrom(this.cwd).map(c => {
      return { label: c.testName, option: c.testDirnamePath };
    }));
  }
  //#endregion

  //#region start test
  startTest(testName: string) {

  }
  //#endregion

  //#region regenerate
  protected regenerateCliTest(c: CliTest) {
    c.regenerateEnvironment()
  }

  public async regenerateEnvironment(timeHash: string) {
    const c = CliTest.getBy(this.cwd, timeHash);
    if (c) {
      this.regenerateCliTest(c);
    } else {
      Helpers.error(`Not able to find test with hash ${timeHash}`, false, true);
    }
  }
  //#endregion

  //#region create base structure
  createBaseStructure(pathToBaseStructure: string) {

  }
  //#endregion

}
