```ts @testPart

describe('wvs-ui/external/WVS-es-oos-ui',()=> {
  const cwdHash = 'ks3iee40';


  it('Should pass the test with hash ' + cwdHash // chalk.hidden(cwdHash)
    , async  () => {
   //#region resolve variables

   const projFolder = 'wvs-ui';
   const tmpTestEnvironmentFolder = 'tmp-tests-environments';
   const cwd = path.resolve(path.join(crossPlatformPath(__dirname), `../../../../${tmpTestEnvironmentFolder}`, cwdHash));
   const relativePathToFile = {
     oosVoalalaOrderChartsPageLess : `external/WVS-es-oos-ui/src/oos-Voalala/components/oos-pc-order-page/oos-Voalala-order-charts-page/oos-Voalala-order-charts-page.less`,
     oosVoalalaOrderChartsPageHtml : `external/WVS-es-oos-ui/src/oos-Voalala/components/oos-pc-order-page/oos-Voalala-order-charts-page/oos-Voalala-order-charts-page.html`,
     oosVoalalaOrderChartsPageServiceJs : `external/WVS-es-oos-ui/src/oos-Voalala/components/oos-pc-order-page/oos-Voalala-order-charts-page/oos-Voalala-order-charts-page-service.js`,
     oosVoalalaOrderChartsPageControllerJs : `external/WVS-es-oos-ui/src/oos-Voalala/components/oos-pc-order-page/oos-Voalala-order-charts-page/oos-Voalala-order-charts-page-controller.js`,
     oosVoalalaOrderChartsPageModuleJs : `external/WVS-es-oos-ui/src/oos-Voalala/components/oos-pc-order-page/oos-Voalala-order-charts-page/oos-Voalala-order-charts-page-module.js`
   };
   const absolutePathToTestFile = {
     oosVoalalaOrderChartsPageLess : path.join(cwd, projFolder, relativePathToFile.oosVoalalaOrderChartsPageLess),
     oosVoalalaOrderChartsPageHtml : path.join(cwd, projFolder, relativePathToFile.oosVoalalaOrderChartsPageHtml),
     oosVoalalaOrderChartsPageServiceJs : path.join(cwd, projFolder, relativePathToFile.oosVoalalaOrderChartsPageServiceJs),
     oosVoalalaOrderChartsPageControllerJs : path.join(cwd, projFolder, relativePathToFile.oosVoalalaOrderChartsPageControllerJs),
     oosVoalalaOrderChartsPageModuleJs : path.join(cwd, projFolder, relativePathToFile.oosVoalalaOrderChartsPageModuleJs)
   };
   await NodeCliTester.InstanceNearestTo(cwd).regenerateEnvironment(cwdHash,tmpTestEnvironmentFolder);
   const $Project = Project || CLASS.getBy('Project') as typeof Project;
   const proj = $Project.From(path.join(cwd,projFolder));
   //#endregion

   // @ts-ignore
   expect(proj.runCommandGetString(`navi helloworld`)).to.be.eq('hello world');
 });

});


```

```json5 @jsonPart
{
  "orgFileBasenames": [
    "oos-Voalala-order-charts-page.less",
    "oos-Voalala-order-charts-page.html",
    "oos-Voalala-order-charts-page-service.js",
    "oos-Voalala-order-charts-page-controller.js",
    "oos-Voalala-order-charts-page-module.js"
  ],
  "orgRelativePathes": [
    "wvs-ui/external/WVS-es-oos-ui/src/oos-Voalala/components/oos-pc-order-page/oos-Voalala-order-charts-page/oos-Voalala-order-charts-page.less",
    "wvs-ui/external/WVS-es-oos-ui/src/oos-Voalala/components/oos-pc-order-page/oos-Voalala-order-charts-page/oos-Voalala-order-charts-page.html",
    "wvs-ui/external/WVS-es-oos-ui/src/oos-Voalala/components/oos-pc-order-page/oos-Voalala-order-charts-page/oos-Voalala-order-charts-page-service.js",
    "wvs-ui/external/WVS-es-oos-ui/src/oos-Voalala/components/oos-pc-order-page/oos-Voalala-order-charts-page/oos-Voalala-order-charts-page-controller.js",
    "wvs-ui/external/WVS-es-oos-ui/src/oos-Voalala/components/oos-pc-order-page/oos-Voalala-order-charts-page/oos-Voalala-order-charts-page-module.js"
  ],
  "projects": {
    "wvs-ui/external/WVS-es-oos-ui": {
      "githash": "17aea4c60fefb6b1ec4ba4b62bb0f1795a39b6a0",
      "name": "es-oos-ui",
      "baseStructureHash": "es-oos-ui__ab3dbeca1d4ef05c6352b82bf524bdbc"
    },
    "wvs-ui": {
      "githash": "47c989cbbafa9eb76bcf61de938a4405bd6d37c8",
      "name": "wvs-ui",
      "baseStructureHash": "wvs-ui__28669ed3ff2f5f5f9fa8772e51d71c44"
    }
  },
  "firstProjectBasename": "wvs-ui",
  "timeHash": "ks3iee40"
}
```

```less @fileContentPart
es-field.oos-Voalala-order-charts-select {
  display: block;
  width: auto;
}
```

```html @fileContentPart
<es-panel-header>
  <es-panel-title><span translate>OrderStar charts</span></es-panel-title>
  <es-panel-actions></es-panel-actions>
</es-panel-header>
```

```js @fileContentPart
import _ from 'lodash';
export default class oosVoalalaOrderChartsPageService {
  constructor($q, esCurrency, esMomentService) {
    this.$q = $q;
    this.esCurrency = esCurrency;
    this.esMomentService = esMomentService;
  }  
}
```

```ts @fileContentPart
import _ from 'lodash';
import { Subscriber } from 'rxjs';
export default class oosVoalalaOrderChartsPageController {
  constructor(s: Subscriber) {   }   
}
```

```tsx @fileContentPart
<div>
  <h1>Hello</h1>
</div>;
<div>
  <h1>Hello</h1>
  World
</div>;
const CustomComp = (props) => <div>{props.children}</div>
<CustomComp>
  <div>Hello World</div>
  {"This is just a JS expression..." + 1000}
</CustomComp>
```
