import * as _ from 'lodash';
import * as path from 'path';
import { describe, before, beforeEach, it } from 'mocha';
import { expect } from 'chai';
import { Helpers } from 'tnp-helpers';
import { MetaMd } from '../meta-content-md.backend';
// import type { MetaMdJSON } from '../meta-content-md.backend';
import { TestTemplates } from '../spec-templates.backend';
import { config } from 'tnp-config';
TestTemplates.testPart; // TODO QUICK FIX for CLASS.getBy in test

// const instance = BrowserDB.instance;
const readOnlyFileForTemplate = path.join(process.cwd(), `tmp-meta-md-file-example.ts.${config.file.meta_config_md}`);


describe('tnp-helpers meta-content.md', () => {

  beforeEach(async () => {
    // Helpers.log(`readOnlyFileForTemplate: ${readOnlyFileForTemplate}`)
    Helpers.removeFileIfExists(readOnlyFileForTemplate);
    Helpers.writeFile(readOnlyFileForTemplate, await metaContentFile());
  })

  it('Should properly extract json metadata', () => {
    const ins = MetaMd.instanceFrom(readOnlyFileForTemplate);
    const json5json = Helpers.parse(json5Part(), true);
    expect(_.isEqual(ins.readonlyMetaJson, json5json)).to.be.true;
  });

  it('Should properly extact file content', () => {
    const ins = MetaMd.instanceFrom(readOnlyFileForTemplate);
    expect(ins.fileContent).to.be.eq(tsPart());
  });

})

async function metaContentFile() {
  return await MetaMd.create(json5Part() as any, tsPart());
}

function json5Part() {
  return `
{
  "projects": {
    "nes-ui" : {
        "githash": "52e7c19d7bd44a3dac2db62f86251ecd353383e0"
    },
    "nes-ui/node_modules/es-common" : {
        "githash": "52e7c19d7bd44a3dac2db62f86251ecd353383e0"
    },
  },
  // path to file
  "orgFileBasename": "es-common-module.ts",
  "timehash": '24234234',
}
  `.trim();
}

function tsPart() {
  return `
  // @ts-ignore
import { NgModule } from 'es-common/src/decorators';

// @ts-ignore
@NgModule()
// @ts-ignore
export class EsCommonModule { }

  `.trim();
}
