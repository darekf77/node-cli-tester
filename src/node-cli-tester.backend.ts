import * as _ from 'lodash';
import * as path from 'path';
import { Helpers } from 'tnp-helpers';
import { config } from 'tnp-config';


export class NodeCliTester {
  //#region singleton
  private static _instances = {};
  public static classFn = NodeCliTester;
  protected NAME_FOR_CLI_TESTS_FOLDER = 'cli-tests';

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

  async createTest(testName: string) {
    Helpers.log(`Create test from node-cli-tester`);
    const folderName = _.kebabCase(testName);
    const testFolderPath = path.join(this.cwd, this.NAME_FOR_CLI_TESTS_FOLDER, folderName);
    Helpers.mkdirp(testFolderPath);
    const testPackageJsonPath = path.join(
      this.cwd,
      this.NAME_FOR_CLI_TESTS_FOLDER,
      folderName,
      config.file.package_json,
    );
    Helpers.writeFile(testPackageJsonPath, `{
      // generated from basename
      "name": "${folderName}",
      "tnp": {
        "type": "cli-test"
      },
      "version": "0.0.0",
      // git ignroe all files except this
      "files-list": [
        "nes-ui/node_modules/es-common/src/es-common-module.ts",
      ]
    }`);
  }

  async createTestAndAddFile(testName: string, filePath: string) {
    await this.createTest(testName);
    await this.addFileToTest(testName, filePath)
  }


  addFileToTest(testName: string, filePath: string) {
    // const folderName
  }

  getAllTestsNames() {

  }

  startTest(testName: string) {

  }

  createBaseStructure(pathToBaseStructure: string) {

  }

}
