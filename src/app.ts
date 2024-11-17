//#region @notForNpm
//#region @browser
    import { NgModule } from '@angular/core';
    import { Component, OnInit } from '@angular/core';

    @Component({
      selector: 'app-node-cli-tester',
      template: 'hello from node-cli-tester'
    })
    export class $ { componentName } implements OnInit {
      constructor() { }

      ngOnInit() { }
    }

    @NgModule({
      imports: [],
      exports: [NodeCliTesterComponent],
      declarations: [NodeCliTesterComponent],
      providers: [],
    })
    export class $ { moduleName } { }
    //#endregion

    //#region @backend
    async function start(port: number) {

    }

    export default start;

//#endregion

//#endregion


//#region  node-cli-tester component 
//#region @browser
@Component({ template: 'hello world fromr node-cli-tester' })
export class NodeCliTesterComponent {}
//#endregion
//#endregion


//#region  node-cli-tester module 
//#region @browser
@NgModule({ declarations: [NodeCliTesterComponent], imports: [CommonModule], exports: [NodeCliTesterComponent] })
export class NodeCliTesterModule {}
//#endregion
//#endregion