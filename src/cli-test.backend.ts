import * as _ from 'lodash';
import * as path from 'path';
import * as json5writer from 'json5-writer';
import * as json5 from 'json5';
import { config } from 'tnp-config';
import { Helpers } from 'tnp-helpers';

export class CliTest {
  protected readonly NAME_FOR_CLI_TESTS_FOLDER = 'cli-tests';

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

  get folderName() {
    return _.kebabCase(this.testName);
  }
  get packageJson5Path() {
    return path.join(this.testDirnamePath, config.file.package_json5);
  }

  get packageJsonPath() {
    return path.join(this.testDirnamePath, config.file.package_json);
  }
  get gitignorePath() {
    return path.join(this.testDirnamePath, config.file._gitignore);
  }
  get specTsPath() {
    return path.join(this.testDirnamePath, `${this.folderName}.spec.ts`);
  }
  get testDirnamePath() {
    return path.join(
      this.cwd,
      this.NAME_FOR_CLI_TESTS_FOLDER,
      this.folderName,
    )
  }
  constructor(
    public testName: string,
    public cwd: string = process.cwd()
  ) {

  }

  public regenerate() {
    if (!Helpers.exists(this.testDirnamePath)) {
      Helpers.mkdirp(this.testDirnamePath);
    }
    this.regeneratePackageJson5();
    this.regenerateSpecTs();
    this.regenerateGitIgnore();
  }

  private regenerateSpecTs() {
    if (!Helpers.exists(this.specTsPath)) {
      Helpers.writeFile(this.specTsPath,
        //#region content of *.spec.ts
        `import { describe } from 'mocha';
import { expect, use } from 'chai';

describe('${_.startCase(this.folderName)}', () => {
  // @ts-ignore
  it('should works', () => {
    expect(1).to.be.gt(0)
  });
});
`
        //#endregion
      );
    }
  }

  private regeneratePackageJson5() {
    if (!Helpers.exists(this.packageJson5Path)) {
      Helpers.writeFile(this.packageJson5Path,
        //#region content of package.json5
        `{
  // generated from basename
  "name": "${this.folderName}",
  "tnp": {
    "type": "cli-test"
  },
  "version": "0.0.0",
  // git ignroe all files except this
  "files-list": []
  }`
        //#endregion
      );
    }
  }

  private regenerateGitIgnore() {
    const writer = json5writer.load(Helpers.readFile(this.packageJson5Path));
    const packageJson5 = Helpers.readJson(this.packageJson5Path);

    Helpers.writeFile(this.gitignorePath,
      //#region content of .gitignore
      `
/**/*.*
!/.gitignore
!/${path.basename(this.specTsPath)}
!/package.json
!/package.json5
!/nes-ui/node_modules/es-common/src/es-common-module.ts

      `
      //#endregion
    );

  }


}
