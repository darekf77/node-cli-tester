```json5 @jsonPart
{
  "orgFileBasename": "rs-commission-class-list-component.ts",
  "projects": {}
}
```

```ts @fileContentPart
import { IPromise } from 'angular';

import { $Inject, Component } from 'es-common/src/decorators';
import { RsAccountingTypeService } from 'es-rs-ui/src/rs-accounting/rs-accounting-type.service';

import { RsCommissionClassListService } from './rs-commission-class-list-service';

import * as template from './rs-commission-class-list.html';

@Component({
  selector: 'rs-commission-class-list',
  template
})
@$Inject([RsCommissionClassListService.name, 'rsCommissionClassesApiService', RsAccountingTypeService.name])
export class RsCommissionClassListComponent {
  protected tableConfig = this.pageService.getTableConfig();
  protected list: any[] = [];
  protected searchPromise: IPromise<any[]>;
  protected filteredGlobally: any[] = [];
  protected isModularAccountingActive: boolean = this.rsAccountingTypeService.isModularAccountingProfileActive();

  constructor(
    protected pageService: RsCommissionClassListService,
    protected api,
    protected rsAccountingTypeService: RsAccountingTypeService
  ) {}

  public ngOnInit() {
    this.searchPromise = this.api.get();
    this.searchPromise.then((response) => (this.list = response));
  }
}
```

```ts @testPart
import * as _ from 'path';
import { describe, before, beforeEach, it } from 'mocha';
import { expect } from 'chai';
import { recreateEnvironment  } from 'node-cli-tester';

describe('es-common-module.ts test',()=> {

 it('Should pass the test with hash "kmld29rb", async  () => {
  const relativePathToFile = './kmld29rb//rs-commission-class-list-component.ts';
   recreateEnvironment(path.join(__dirname,relativePathToFile));
   expect(true).to.not.be(false);
 })

})
```
