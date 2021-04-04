//#region imports
import * as _ from 'lodash';
import * as path from 'path';
import { Helpers, Project } from 'tnp-helpers';
import { config } from 'tnp-config';
import { CliTest } from './cli-test.backend';
import { CLASS } from 'typescript-class-helpers';
import { BaseProjectStructure } from './base-project-structure.backend';
import { MetaMd } from './meta-content-md.backend';
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

  public static InstanceNearestTo(cwd: string) {
    const proj = Project.nearestTo(cwd);
    return this.Instance(proj.location);
  }

  //#endregion

  //#region create test
  public async createTest(testNameOrPathToTestFolder: string[] | string) {
    Helpers.log(`Create test from node-cli-tester`);
    if (_.isString(testNameOrPathToTestFolder)) {
      testNameOrPathToTestFolder = [testNameOrPathToTestFolder];
    }
    for (let index = 0; index < testNameOrPathToTestFolder.length; index++) {
      const p = testNameOrPathToTestFolder[index];
      const c = CliTest.from(this.cwd, path.isAbsolute(p) ? path.basename(p) : p);
      await c.regenerateFiles();
    }
  }
  //#endregion

  //#region create test and add file
  public async createTestAndAddFiles(testName: string, absoluteFilePathes: string[], editorCwd: string = process.cwd()) {
    await this.createTest(testName);
    await this.addFilesToTest(testName, absoluteFilePathes, editorCwd);
  }
  //#endregion

  //#region add file to test
  public async addFilesToTest(testNameOrPathToTestFolder: string, filePath: string[], editorCwd: string = process.cwd()) {
    const c = CliTest.from(this.cwd, path.isAbsolute(testNameOrPathToTestFolder) ? path.basename(testNameOrPathToTestFolder) : testNameOrPathToTestFolder);
    // c.metaMd.all.find(a => a.readonlyMetaJson.orgFileBasenames)
    await c.metaMd.add(filePath, editorCwd, CLASS.getFromObject(this));
  }

  public async addFilesToMdContent(testNameOrPathToTestFolder: string, mdContentFileBasenameOrPath: string | null, filePaths: string[], editorCwd: string = process.cwd()) {
    const c = CliTest.from(this.cwd, path.isAbsolute(testNameOrPathToTestFolder) ? path.basename(testNameOrPathToTestFolder) : testNameOrPathToTestFolder);

    const mdContentFileBasename = !!mdContentFileBasenameOrPath && (path.isAbsolute(mdContentFileBasenameOrPath)
      ? path.basename(mdContentFileBasenameOrPath) : mdContentFileBasenameOrPath);
    const m = mdContentFileBasename && c.metaMd.all.find(a => a.basename === mdContentFileBasename);
    if (m) {
      const NodeCliTestrClass = CLASS.getFromObject(this);
      m.addFiles(filePaths, c.testDirnamePath, editorCwd, NodeCliTestrClass.foundProjectsFn, c.cwd);
    } else {
      await this.addFilesToTest(testNameOrPathToTestFolder, filePaths, editorCwd);
    }
  }
  //#endregion

  //#region get all tests names
  protected getAllTestsNames() {
    const names = CliTest.allFrom(this.cwd).map(c => {
      return { label: c.testName, option: c.testDirnamePath };
    });
    Helpers.outputToVScode(names);
  }

  protected getMdContentFilesForTest(testNameOrPathToTestFolder: string) {
    const c = CliTest.from(this.cwd, path.isAbsolute(testNameOrPathToTestFolder) ? path.basename(testNameOrPathToTestFolder) : testNameOrPathToTestFolder);
    const toOutput = [
      { label: `< create new ${config.file.meta_config_md} file >`, option: null },
      ...c.metaMd.all.map(c => {
        const v = c.filePath;
        return { option: v, label: `add to "${path.basename(v)}"` }
      })
    ];
    Helpers.outputToVScode(toOutput);
  }

  //#endregion

  //#region regenerate
  public async regenerateEnvironment(timeHash: string, tempFolder = config.folder.tmpTestsEnvironments) {
    if (!path.isAbsolute(tempFolder)) {
      tempFolder = path.join(this.cwd, tempFolder);
    }
    const c = CliTest.getBy(this.cwd, timeHash);
    const m = c?.metaMd.all.find(a => a.readonlyMetaJson.timeHash === timeHash);
    if (m) {
      m.recreate(tempFolder, this.cwd)
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
