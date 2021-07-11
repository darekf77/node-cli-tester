//#region imports
//#region @backend
import { path, _ } from 'tnp-core';
import { Helpers, Project } from 'tnp-helpers';
import { config } from 'tnp-config';
import { CliTest } from './cli-test.backend';
import { CLASS } from 'typescript-class-helpers';
import { MetaMd } from './meta-content-md.backend';
//#endregion
//#endregion

export class NodeCliTester {
  //#region @backend
  //#region singleton
  private static _instances = {};

  private static ACTIONS = {
    REGENERATE_LAST_HASH: 'regenerate-last-env-hash'
  }
  public static classFn = NodeCliTester;
  public static projectClassFn = Project;

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
    // @LAST
    const proj = Project.nearestTo(cwd);
    if (!proj) {
      Helpers.error(`Nearsest project instance not found for ${cwd} `, false, true);
    }
    return this.Instance(proj.location);
  }

  //#endregion

  //#region get menu options

  //#region get menu options / all tests names
  protected getAllTestsNames() {
    const names = CliTest.allFrom(this.cwd).map(c => {
      return { label: c.testName, option: c.testDirnamePath };
    });
    Helpers.outputToVScode(names);
  }
  //#endregion

  //#region get menu options / all meta-content.md files for test (path as option)
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

  //#region get menu options / all meta-content.md files for test (hash as option)
  protected getMdContentFilesWithHash(testNameOrPathToTestFolder: string) {
    const c = CliTest.from(this.cwd, path.isAbsolute(testNameOrPathToTestFolder) ? path.basename(testNameOrPathToTestFolder) : testNameOrPathToTestFolder);
    const toOutput = [
      ...c.metaMd.all.map(c => {
        return { option: c.readonlyMetaJson.timeHash, label: `add to "${path.basename(c.filePath)}"` }
      })
    ];
    Helpers.outputToVScode(toOutput);
  }
  //#endregion

  //#region get menu options / all tests names (with additional options for regenerate)
  protected getAllTestsNamesForRegenerate() {
    const last = this.lastRegenerateMenuItem;
    const specialOptions = [
      ...(last ? [last] : [])
    ];

    const names = [
      ...specialOptions,
      ...CliTest.allFrom(this.cwd).map(c => {
        return { label: c.testName, option: c.testDirnamePath };
      }),
    ];
    Helpers.outputToVScode(names);
  }
  //#endregion

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

  //#region add files to

  //#region add files to / test
  public async addFilesToTest(testNameOrPathToTestFolder: string, filePath: string[], editorCwd: string = process.cwd()) {
    const c = CliTest.from(this.cwd, path.isAbsolute(testNameOrPathToTestFolder)
      ? path.basename(testNameOrPathToTestFolder) : testNameOrPathToTestFolder);
    await c.metaMd.add(filePath, editorCwd, CLASS.getFromObject(this));
  }
  //#endregion

  //#region add files to / meta-content.md files
  public async addFilesToMdContent(
    testNameOrPathToTestFolder: string,
    mdContentFileBasenameOrPath: string | null, filePaths: string[],
    editorCwd: string = process.cwd()
  ) {
    const c = CliTest.from(this.cwd, path.isAbsolute(testNameOrPathToTestFolder)
      ? path.basename(testNameOrPathToTestFolder) : testNameOrPathToTestFolder);

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

  //#endregion

  //#region regenerate

  //#region regenerate / last regenerate hash file path
  private get lastRegenerateHashFile() {
    return path.join(this.cwd, 'tmp-last-regenerate-hash-env');
  }
  //#endregion

  //#region regenerate / get last regenerate manu item
  private get lastRegenerateMenuItem(): { label: string; option: any; } {
    const lashHash = Helpers.readFile(this.lastRegenerateHashFile, '').trim();
    if (lashHash) {
      const allTests = CliTest.allFrom(this.cwd);
      let machingMdFile: MetaMd;
      allTests.find(a => a.metaMd.all.find(b => {
        if (b.readonlyMetaJson.timeHash === lashHash) {
          machingMdFile = b;
          return true;
        }
        return false;
      }));
      if (machingMdFile) {
        const NodeCliTesterClass = (CLASS.getFromObject(this) as typeof NodeCliTester);
        const res = {
          label: ` < regenerate last hash env "${machingMdFile.readonlyMetaJson.timeHash}" `
            + `for project: "${machingMdFile.readonlyMetaJson.firstProjectBasename}" in `
            + `${machingMdFile.basename} >`,
          option: { action: NodeCliTesterClass.ACTIONS.REGENERATE_LAST_HASH }
        };
        return res;
      }
    }
    return void 0;
  }
  //#endregion

  //#region regenerate / aliases
  public async regenerate(timeHash: string) {
    await this.regenerateEnvironment(timeHash);
  }
  public async regenerateLast() {
    const NodeCliTesterClass = (CLASS.getFromObject(this) as typeof NodeCliTester);
    await this.regenerateEnvironment(NodeCliTesterClass.ACTIONS.REGENERATE_LAST_HASH);
  }

  //#endregion

  //#region regenerate / regenerate environment function
  public async regenerateEnvironment(timeHash: string, tempFolder = config.folder.tmpTestsEnvironments, onlyIfNotExists = false) {
    const NodeCliTesterClass = (CLASS.getFromObject(this) as typeof NodeCliTester);
    if (timeHash === NodeCliTesterClass.ACTIONS.REGENERATE_LAST_HASH) {
      timeHash = Helpers.readFile(this.lastRegenerateHashFile, '');
    }
    if (!path.isAbsolute(tempFolder)) {
      tempFolder = path.join(this.cwd, tempFolder);
    }
    const c = CliTest.getBy(this.cwd, timeHash);
    const m = c?.metaMd.all.find(a => a.readonlyMetaJson.timeHash === timeHash);
    if (m) {
      const ProjectClass = NodeCliTesterClass.projectClassFn;
      m.recreate(tempFolder, this.cwd, ProjectClass, onlyIfNotExists);
      Helpers.writeFile(this.lastRegenerateHashFile, timeHash);
    } else {
      Helpers.error(`Not able to find test with hash ${timeHash}`, false, true);
    }
  }
  //#endregion

  //#endregion

  //#endregion
}
