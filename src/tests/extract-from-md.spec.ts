import { _, path } from 'tnp-core';
import { describe, before, beforeEach, it } from 'mocha';
import { expect } from 'chai';
import { Helpers } from 'tnp-core';
import { extract, MetaMd } from '../meta-content-md.backend';
// import type { MetaMdJSON } from '../meta-content-md.backend';
import { TestTemplates } from '../spec-templates.backend';
import { config } from 'tnp-core';
TestTemplates.testPart; // TODO QUICK FIX for CLASS.getBy in test



describe('extracat from md', () => {

  it('should extract', () => {

    const mdFile = Helpers.readFile([__dirname, 'extract-from.md'])

    const arr = extract(mdFile, MetaMd.FILE_CONTENT_PART);
    const [less, html, js, ts, tsx] = arr;
    const a = { less, html, js, ts, tsx };
    for (const key in a) {
      if (Object.prototype.hasOwnProperty.call(a, key)) {
        const fileContent = a[key];
        const file = Helpers.readFile([__dirname, 'extract-from-md-files', `${key}file.${key}`]) || 'huj';
        expect(fileContent.replace(/\s/g,'')).to.be.eq(file.replace(/\s/g,''));
      }
    }

  });

})
