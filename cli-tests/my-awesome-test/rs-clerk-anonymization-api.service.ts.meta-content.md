```json5 @jsonPart
{
  "orgFileBasename": "rs-clerk-anonymization-api.service.ts",
  "projects": {
    "plt-ui/external/PLT-es-rs-ui": {
      "githash": "235a486795744d98f08e44837c263abc6ebe577a"
    },
    "plt-ui": {
      "githash": "6985d745aa7bbebb7892dfe9494102daf6dbc2ba"
    }
  }
}
```

```ts @fileContentPart
import { EsAnonymizeApi } from 'es-common/src/components/es-anonymize-api/es-anonymize-api';
import { Injectable, $Inject } from 'es-common/src/decorators';
import { AnonymizationDialogConfig, EsAnonymizeDialogService } from 'es-common/src/components/es-anonymize-dialog/es-anonymize-dialog.service';
import { IPromise } from 'angular';
import { AnonymizationLevel } from 'es-global-ui/src/global-anonymization/global-anonymization-common/global-anonymization.model';

interface Teller {
  tellerId: number;
  retailerOid: number;
}

@Injectable(RsClerkAnonymizationApiService.name)
@$Inject([
  'esDbService',
  'gettextCatalog',
  EsAnonymizeDialogService.name,
])
export class RsClerkAnonymizationApiService extends EsAnonymizeApi {

  constructor(
    esDbService,
    protected gettextCatalog,
    protected esAnonymizeDialogService: EsAnonymizeDialogService
  ) {
    super(esDbService.init({
      id: 'rsTellerAnonymize',
      source: 'tellers',
      strategy: 'esHttp'
    }));
  }

  anonymizeIfConfirmed(model: Teller, entityOid: string | number): IPromise<{}> {
    return this.esAnonymizeDialogService.show(
      this.getAnonymizeDialogConfig(model)
    )
      .then((anonymizationLevels: AnonymizationLevel[]) => this.anonymize(entityOid, {
        anonymizationLevels,
        owningEntityOid: model.retailerOid
      }));
  }

  getAnonymizeDialogConfig(model: Teller): AnonymizationDialogConfig {
    return {
      requiredLevel: AnonymizationLevel.Teller,
      anonymizationLevels: [AnonymizationLevel.Teller, AnonymizationLevel.Audit],
      dialogTitle: `${this.gettextCatalog.getString('Anonymize Clerk')} - ${model.tellerId}`,
    };
  }
}
```

```ts @testPart
import * as _ from 'lodash';
import * as path from 'path';
import { describe, before, beforeEach, it } from 'mocha';
import { expect } from 'chai';
import { CLASS } from 'typescript-class-helpers';
import { Helpers, Project } from 'tnp-helpers';
import { NodeCliTester  } from 'node-cli-tester';

describe('plt-ui/external/PLT-es-rs-ui',()=> {

  it('Should pass the test with hash kmpvm4ry', async  () => {
// const testName = this.test.title;
// const testFullName = this.test.fullTitle();
   const cwd = path.join(__dirname,'kmpvm4ry');
   const relativePathToFile = 'plt-ui/external/PLT-es-rs-ui/rs-clerk-anonymization-api.service.ts';
   const absolutePathToTestFile = path.join(cwd,relativePathToFile);
   Helpers.remove(cwd);
   const Project = CLASS.getByName('Project') as typeof Project;
   const proj = Project.From(cwd);
   proj.run(`my-command-to-run with params`,{ biggerBuffer: false }).sync()
   expect(true).to.not.be.true;
 })

})


```
