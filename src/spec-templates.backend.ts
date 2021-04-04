//#region imports
import * as _ from 'lodash';
import { CLASS } from 'typescript-class-helpers';
import { Helpers } from 'tnp-helpers';
//#endregion

//#region base imports contant
const baseImports = `
import * as _ from 'lodash';
import * as path from 'path';
import chalk from 'chalk';
import { describe, before, beforeEach, it } from 'mocha';
import { expect } from 'chai';
import { CLASS } from 'typescript-class-helpers';
import { Helpers } from 'tnp-helpers';
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
${
''  // testMeta
}
   const projFolder = '${_.first(projPath.split('/'))}';
   const tmpTestEnvironmentFolder = 'tmp-tests-environments';
   const cwd = path.resolve(path.join(__dirname, \`../../../../\${tmpTestEnvironmentFolder}\`, cwdHash));
   const relativePathToFile = {
     ${pathToFiles.map( pathToFile => `${_.camelCase(pathToFile)} : \`\${projFolder}/${projPath.split('/').slice(1).join('/')}/${pathToFile}\``)
     .join(',\n     ')}
   };
   const absolutePathToTestFile = {
     ${pathToFiles.map( pathToFile => `${_.camelCase(pathToFile)} : path.join(cwd,relativePathToFile.${_.camelCase(pathToFile)})`)
    .join(',\n     ')}
   };
   Helpers.remove(cwd);
   await NodeCliTester.InstanceNearestTo(path.dirname(cwd)).regenerateEnvironment(cwdHash,tmpTestEnvironmentFolder);
   const $Project = Project || CLASS.getBy('Project') as typeof Project;
   const proj = $Project.From(path.join(cwd,projFolder));
   //#endregion

   // @ts-ignore
   expect(proj.runCommandGetString(\`${this.DEFAULT_COMMAND}\`)).to.be.eq('hello world');
 });
`;


    const testsImports = `
${
''  // baseImports
}
${
'' // import { Project } from '${this.PROJECT_ENTITY_LOCATION}';
}

`;
    return '\n'
      + testsImports.trim()
      + `
describe('${projPath}',()=> {
  const cwdHash = '${timeHash}';
${describes}
});
  `.trim() + '\n\n';
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
