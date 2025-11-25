//#region imports
import { path, _ } from 'tnp-core/src';
import { CLASS } from 'typescript-class-helpers/src';
import { Helpers } from 'tnp-helpers/src';
//#endregion

//#region base imports contant
const baseImports = `
import { _, path, crossPlatformPath } from 'tnp-core';
import chalk from 'chalk';
import { describe, before, beforeEach, it } from 'mocha';
import { expect } from 'chai';
import { CLASS } from 'typescript-class-helpers';
import { Helpers } from 'tnp-helpers';
import { config } from 'tnp-core';
import { NodeCliTester  } from 'node-cli-tester';
`.trim();

const testMeta = `
// const testName = this.test.title;
// const testFullName = this.test.fullTitle();
`.trim();
//#endregion
@CLASS.NAME('TestTemplates')
export class TestTemplates {
  public static DEFAULT_COMMAND = `echo "hello world"`;
  public static PROJECT_ENTITY_LOCATION = `tnp-helpers`;

  //#region create test part
  public static testPart(pathToFiles: string[], projPath: string, timeHash: string) {
    const describes = `

  it('Should pass the test with hash ' + cwdHash // chalk.hidden(cwdHash)
    , async  () => {
   //#region resolve variables
${''  // testMeta
      }
   const projFolder = '${_.first(projPath.split('/'))}';
   const tmpTestEnvironmentFolder = 'tmp-tests-environments';
   const cwd = path.resolve(path.join(crossPlatformPath(__dirname), \`../../../../\${tmpTestEnvironmentFolder}\`, cwdHash));
   const relativePathToFile = {
     ${pathToFiles.map(pathToFile => `${_.camelCase(path.basename(pathToFile))} : \`${pathToFile.split('/').slice(1).join('/')}\``)
        .join(',\n     ')}
   };
   const absolutePathToTestFile = {
     ${pathToFiles.map(pathToFile => `${_.camelCase(path.basename(pathToFile))} : path.join(cwd, projFolder, relativePathToFile.${_.camelCase(path.basename(pathToFile))})`)
        .join(',\n     ')}
   };
   await NodeCliTester.InstanceNearestTo(cwd).regenerateEnvironment(cwdHash,tmpTestEnvironmentFolder);
   const $Project = Project || CLASS.getBy('Project') as typeof Project;
   const proj = $Project.From(path.join(cwd,projFolder));
   //#endregion

   // @ts-ignore
   expect(proj.runCommandGetString(\`${this.DEFAULT_COMMAND}\`)).to.be.eq('hello world');
 });
`;


    const testsImports = `
${''  // baseImports
      }
${'' // import { Project } from '${this.PROJECT_ENTITY_LOCATION}';
      }

`;
    const result = '\n'
      + testsImports.trim()
      + `
describe('${projPath}',()=> {
  const cwdHash = '${timeHash}';
${describes}
});
  `.trim() + '\n\n';
    return result;
  }
  //#endregion

  //#region regenerate spec ts
  public static regenerateSpecTs(specTsPath: string, testRealName: string) {
    if (!Helpers.exists(specTsPath)) {
      Helpers.writeFile(specTsPath,
        //#region content of *.spec.ts
        `
${baseImports}
import { Project } from '${this.PROJECT_ENTITY_LOCATION}';

describe('${testRealName}', () => {

  // PUT ALL YOUR TESTS HERE

  it('should works example unit test', () => {
${testMeta}
    expect(1).to.be.gt(0)
  });

});
`.trim() + '\n'
        //#endregion
      );
    }
  }
  //#endregion

}
