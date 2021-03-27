//#region imports
import * as glob from 'glob';
import * as path from 'path';
import * as _ from 'lodash';
import { config } from 'tnp-config';
import { Helpers, Project } from 'tnp-helpers';
import type { TestTemplates } from './spec-templates.backend';
import { CLASS } from 'typescript-class-helpers';
//#endregion

//#region models
export interface MetaMdJSONProject {
  githash?: string;
  isLinkFrom?: string; tests
}

export type MetaMdJSONProjects = { [projPath: string]: MetaMdJSONProject; };

export interface MetaMdJSON {
  orgFileBasename: string;
  timeHash: string;
  projects: MetaMdJSONProjects;
}
//#endregion

/**
 * Special forma of .md for keeping metadata, testfile, and test template for file
 */
export class MetaMd {

  //#region static fields
  static readonly JSON_PART = '@jsonPart';
  static readonly FILE_CONTENT_PART = '@fileContentPart';
  static readonly TEST_PART = '@testPart';

  //#region static fields / create
  static create(json: MetaMdJSON, fileContent: string, testContent?: string) {
    return create((_.isObject(json) ? Helpers.stringify(json) : json) as any, fileContent, testContent);
  }
  //#endregion

  //#region static fields / preserve file
  static preserveFile(
    originalAnyTypeFile: string,
    destinationFolder: string,
    editorCwd = process.cwd(),
    foundProjectFn: (projects: Project[]) => Project[] = void 0
  ) {
    const properDestName = `${path.basename(originalAnyTypeFile)}.meta-content.md`;
    if (!Helpers.isFolder(destinationFolder)) {
      Helpers.error(`[tnp-helpers][meta-content-md] Destination folder "${destinationFolder}"
       is not a folder`, false, true)
    }
    const orgFileBasename = path.basename(originalAnyTypeFile);
    let foundedProjectsInPath = Project.allProjectFrom(originalAnyTypeFile, editorCwd);
    if (foundProjectFn) {
      foundedProjectsInPath = foundProjectFn(foundedProjectsInPath);
    }
    console.log(foundedProjectsInPath.map(p => p.location))
    const mostBaseLocationFound = _.minBy(foundedProjectsInPath, p => p.location.length).location;
    const projects = foundedProjectsInPath
      .reduce((a, b) => {
        return _.merge(a, {
          [path.join(path.basename(mostBaseLocationFound), b.location.replace(mostBaseLocationFound, ''))]: {
            githash: b.git.lastCommitHash()
          }
        } as MetaMdJSONProjects)
      }, {} as MetaMdJSONProjects);
    const timeHash = (+new Date).toString(36);
    const c = MetaMd.create({
      orgFileBasename,
      projects,
      timeHash,
    }, Helpers.readFile(originalAnyTypeFile));

    Helpers.writeFile(path.join(destinationFolder, properDestName), c);
  }
  //#endregion

  //#region static fields / handle instance from meta-content.md file
  static instanceFrom(filePath: string): MetaMd {
    return new MetaMd(filePath);
  }

  static allInstancesFrom(folderPath: string): MetaMd[] {
    return glob.sync(`${folderPath}/*.${config.file.meta_config_md}`).map(f => {
      return MetaMd.instanceFrom(f);
    });
  }
  //#endregion

  //#endregion

  //#region getters
  private get json(): MetaMdJSON {
    const content = Helpers.readFile(this.filePath) || '';
    try {
      const extracted = extract(content, MetaMd.JSON_PART);
      const parsed = Helpers.parse(extracted, true);
      return parsed;
    } catch (error) {
      return {} as any;
    }
  }

  public get readonlyMetaJson() {
    return Object.freeze(this.json);
  }

  public get fileContent(): string {
    const content = Helpers.readFile(this.filePath) || '';
    return extract(content, MetaMd.FILE_CONTENT_PART);
  }

  private get testContent(): string {
    const content = Helpers.readFile(this.filePath) || '';
    return extract(content, MetaMd.TEST_PART);
  }
  //#endregion

  //#region constructor
  constructor(
    private readonly filePath: string,
  ) { }
  //#endregion

  //#region recreate files/content/env before any tests
  /**
   * recate original files before any unit/intergration test
   */
  public recreateIn(cwd = process.cwd()) {
    // recreat whole structure

  }
  //#endregion

}

//#region create
function create(json5string: string, fileContent: string, testContent?: string) {
  const metadataJSON = Helpers.parse<MetaMdJSON>(json5string, true);
  // Helpers.log(`metadataJSON.orgFileBasename: ${metadataJSON.orgFileBasename}`)
  const ext = path.extname(metadataJSON.orgFileBasename).replace(/^\./, '');
  const filePath = metadataJSON.orgFileBasename; // TODO

  if (!testContent) {
    const projPath = _.maxBy(_.keys(metadataJSON.projects).map(projRelPath => {
      return { path: projRelPath, length: projRelPath.length };
    }), c => c.length)?.path || '';
    const TestTemplatesClass = CLASS.getBy('TestTemplates') as typeof TestTemplates;
    testContent = TestTemplatesClass.testPart(filePath, projPath, metadataJSON.timeHash);
  }

  return `
  \`\`\`json5 ${MetaMd.JSON_PART}
${json5string}
   \`\`\`

   \`\`\`${ext} ${MetaMd.FILE_CONTENT_PART}
${fileContent}
   \`\`\`

   \`\`\`ts ${MetaMd.TEST_PART}
${testContent}
   \`\`\`

    `.split('\n').map(l => {
    return l.trim().startsWith('\`\`\`') ? l.trimLeft() : l;
  }).join('\n').trim() + '\n';
}

//#endregion

//#region extract data parts from content md file
function extract(content: string, PART_TO_FIND: string) {
  if (!content) {
    return;
  }
  const lines = [];
  const allLines = content.split('\n');
  let pushingActive = false;
  for (let index = 0; index < allLines.length; index++) {
    const orgLine = (allLines[index] || '');
    const line = orgLine.trim();
    if (pushingActive) {
      if (line.startsWith('\`\`\`')) {
        break;
      } else {
        lines.push(orgLine);
      }
    }
    if (line.startsWith('\`\`\`') && (line.search(PART_TO_FIND) !== -1)) {
      pushingActive = true;
    }
  }
  return lines.join('\n');
}
//#endregion

