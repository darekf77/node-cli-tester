//#region imports
import { _, path } from 'tnp-core/src';
import { config } from 'tnp-config/src';
import { Helpers } from 'tnp-helpers/src';
import { MetaMd } from './meta-content-md.backend';
import type { TestTemplates } from './spec-templates.backend';
import type { NodeCliTester } from './node-cli-tester';
import { CLASS } from 'typescript-class-helpers/src';
//#endregion

export class CliTest {
  static readonly NAME_FOR_CLI_TESTS_FOLDER = 'src/tests/tests-cli';
  readonly testDirnamePath: string;

  //#region singleton  / static inst
  private static instances = {};
  static allFrom(cwd: string): CliTest[] {
    const folderWithTests = path.join(cwd,
      this.NAME_FOR_CLI_TESTS_FOLDER);
    const folders = Helpers.foldersFrom(folderWithTests);
    const tests = folders.map(f => CliTest.from(f)).filter(f => !!f);
    return tests;
  }

  static getBy(cwd: string, timeHash: string): CliTest {
    return this.allFrom(cwd).find(c => !_.isUndefined(c.metaMd.all.find(c => c.readonlyMetaJson.timeHash === timeHash)));
  }

  static from(
    cwd: string,
    testName?: string,
  ) {
    if (!testName) {
      testName = path.basename(cwd);
      cwd = path.dirname(cwd);
    }
    if (!CliTest.instances[cwd]) {
      CliTest.instances[cwd] = {};
    }
    if (!CliTest.instances[cwd][testName]) {

      CliTest.instances[cwd][testName] = new CliTest(cwd, testName);
    }
    return CliTest.instances[cwd][testName] as CliTest;
  }
  //#endregion

  //#region getters

  //#region getters / meta md
  get metaMd() {
    const that = this;
    return {
      get all() {
        return MetaMd.allInstancesFrom(that.testDirnamePath);
      },
      async add(originalFilePath: string[], baseCwd: string, NodeCliTestrClass: typeof NodeCliTester) {
        await MetaMd.preserveFiles(
          originalFilePath,
          that.testDirnamePath,
          baseCwd,
          NodeCliTestrClass.foundProjectsFn,
          that.cwd,
        );
      }
    }
  }
  //#endregion

  //#region getters / pathes

  private get firedev_jsonc() {
    return path.join(this.testDirnamePath, config.file.firedev_jsonc);
  }

  private get packageJsonPath() {
    return path.join(this.testDirnamePath, config.file.package_json);
  }

  private get gitignorePath() {
    return path.join(this.testDirnamePath, config.file._gitignore);
  }

  private get specTsPath() {
    return path.join(this.testDirnamePath, `${_.kebabCase(this.testName)}.spec.ts`);
  }
  //#endregion

  //#endregion

  //#region constructor / init
  constructor(
    public cwd: string,
    public testName: string,

  ) {
    cwd = cwd.endsWith(CliTest.NAME_FOR_CLI_TESTS_FOLDER) ? cwd.replace(CliTest.NAME_FOR_CLI_TESTS_FOLDER, '') : cwd;
    this.cwd = cwd;
    this.testDirnamePath = path.join(
      cwd,
      CliTest.NAME_FOR_CLI_TESTS_FOLDER,
      _.kebabCase(this.testName),
    );
    const pathToTempEnvs = path.join(cwd, config.folder.tmpTestsEnvironments);
    const pathToEnvs = path.join(cwd, config.folder.testsEnvironments);
    Helpers.createSymLink(pathToTempEnvs,pathToEnvs,{
      continueWhenExistedFolderDoesntExists: true
    });

    if (Helpers.exists(this.firedev_jsonc)) {
      const testNameFromPJ5 = Helpers.readJson(this.firedev_jsonc, {}, true).description;
      if (testNameFromPJ5) {
        testName = testNameFromPJ5;
        this.testName = testName;
      }
    }
  }
  //#endregion

  //#region public api

  //#region regenerate
  public async regenerateFiles() {
    if (!Helpers.exists(this.testDirnamePath)) {
      Helpers.mkdirp(this.testDirnamePath);
    }
    this.regeneratePackageJson5();
    let TestTemplatesClass = CLASS.getBy('TestTemplates') as typeof TestTemplates;
    if (!TestTemplatesClass) {
      TestTemplatesClass = await (await import('./spec-templates.backend')).TestTemplates;
    }
    TestTemplatesClass.regenerateSpecTs(this.specTsPath, this.testName);
    this.regenerateGitIgnore();
  }

  //#endregion

  //#endregion

  //#region private methods

  //#region regenerate package json 5
  private regeneratePackageJson5() {
    if (!Helpers.exists(this.firedev_jsonc)) {
      Helpers.writeFile(this.firedev_jsonc,
        //#region content of package.json5
        `{
  // generated from basename
  "name": "${_.kebabCase(this.testName)}",
  "description": "${this.testName}",
  "tnp": {
    "type": "cli-test"
  },
  "version": "0.0.0",
  }`
        //#endregion
      );
    }
  }
  //#endregion

  //#region regenerate gitignore
  private regenerateGitIgnore() {

    Helpers.writeFile(this.gitignorePath,
      //#region content of .gitignore
      `
/**/*.*
!/.gitignore
!/${path.basename(this.specTsPath)}
!/package.json
!/package.json5
!/*.md

      `
      //#endregion
    );
  }
  //#endregion

  //#endregion
}
