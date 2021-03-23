//#region imports
import * as _ from 'lodash';
import * as path from 'path';
import { config } from 'tnp-config';
import { Helpers } from 'tnp-helpers';
import { MetaMd } from './meta-content-md.backend';
//#endregion

export class CliTest {
  protected readonly NAME_FOR_CLI_TESTS_FOLDER = 'cli-tests';
  readonly testDirnamePath: string;

  //#region singleton  / static inst
  private static instances = {};
  static from(
    testName: string,
    cwd: string,
  ) {
    if (!CliTest.instances[cwd]) {
      CliTest.instances[cwd] = {};
    }
    if (!CliTest.instances[cwd][testName]) {
      CliTest.instances[cwd][testName] = new CliTest(testName, cwd);
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
      add(originalFilePath: string) {
        MetaMd.preserveFile(originalFilePath, that.testDirnamePath);
      }
    }
  }
  //#endregion

  //#region getters / pathes

  private get packageJson5Path() {
    return path.join(this.testDirnamePath, config.file.package_json5);
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
    public testName: string,
    cwd: string = process.cwd()
  ) {
    this.testDirnamePath = path.join(
      cwd,
      this.NAME_FOR_CLI_TESTS_FOLDER,
      _.kebabCase(this.testName),
    )
  }
  //#endregion

  //#region public api

  //#region clear
  public clear() {
    Helpers.foldersFrom(this.testDirnamePath).forEach(c => Helpers.removeFolderIfExists(c));
  }
  //#endregion

  //#region regenerate
  public regenerate() {
    if (!Helpers.exists(this.testDirnamePath)) {
      Helpers.mkdirp(this.testDirnamePath);
    }
    this.regeneratePackageJson5();
    this.regenerateSpecTs();
    this.regenerateGitIgnore();
  }
  //#endregion

  //#endregion

  //#region private methods

  //#region regenerate spec ts
  private regenerateSpecTs() {
    if (!Helpers.exists(this.specTsPath)) {
      Helpers.writeFile(this.specTsPath,
        //#region content of *.spec.ts
        `
import * as _ from 'path';
import { describe, before, beforeEach, it } from 'mocha';
import { expect } from 'chai';
import { recreateEnvironment  } from 'node-cli-tester';

describe('${_.startCase(this.testName)}', () => {

  // PUT ALL YOUR TESTS HERE

  // @ts-ignore
  it('should works example unit test', () => {
    expect(1).to.be.gt(0)
  });
});
`
        //#endregion
      );
    }
  }
  //#endregion

  //#region regenerate package json 5
  private regeneratePackageJson5() {
    if (!Helpers.exists(this.packageJson5Path)) {
      Helpers.writeFile(this.packageJson5Path,
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
