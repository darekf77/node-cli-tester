//#region imports
import * as glob from 'glob';
import * as path from 'path';
import * as _ from 'lodash';
import { config } from 'tnp-config';
import { Helpers, Project } from 'tnp-helpers';
import type { TestTemplates } from './spec-templates.backend';
import { CLASS } from 'typescript-class-helpers';
import { BaseProjectStructure } from './base-project-structure.backend';
//#endregion

//#region models
export interface MetaMdJSONProject {
  githash?: string;
  name?: MetaMdJSONProjects;
  baseStructureHash?: string;
}

export type MetaMdJSONProjects = { [projPath: string]: MetaMdJSONProject; };

export interface MetaMdJSON {
  orgFileBasenames: string[];
  orgRelativePathes: string[];
  timeHash: string;
  firstProjectBasename: string;
  mostBaseLocationFound: string;
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
  static async create(json: MetaMdJSON, fileContent: string[], testContent?: string) {
    return await create((_.isObject(json) ? Helpers.stringify(json) : json) as any, fileContent, testContent);
  }
  //#endregion

  //#region static fields / preserve file
  static async preserveFiles(
    originalAnyTypeFiles: string[],
    destinationFolder: string,
    editorCwd: string,
    foundProjectFn: (projects: Project[]) => Project[] = (a) => a,
    baseProjectsStructurePath: string, // navi-cli folder or current folder,
    overrideThisFile = void 0 as string
  ) {
    const firstFile = overrideThisFile ?
      originalAnyTypeFiles.find(f => f.endsWith(overrideThisFile)) :
      _.first(originalAnyTypeFiles);
    const properDestName = `${path.basename(firstFile)}.${config.file.meta_config_md}`;
    if (!Helpers.isFolder(destinationFolder)) {
      Helpers.error(`[tnp-helpers][meta-content-md] Destination folder "${destinationFolder}"
       is not a folder`, false, true)
    }

    let foundedProjectsInPath = [];
    for (let index = 0; index < originalAnyTypeFiles.length; index++) {
      const fileAbsPath = originalAnyTypeFiles[index];
      foundedProjectsInPath = [
        ...foundedProjectsInPath,
        ...Project.allProjectFrom(fileAbsPath, editorCwd)
      ];
      if (foundProjectFn) {
        foundedProjectsInPath = foundProjectFn(Helpers.arrays.uniqArray<Project>(foundedProjectsInPath, 'location'));
      }
    }
    foundedProjectsInPath = Helpers.arrays.uniqArray<Project>(foundedProjectsInPath, 'location');
    console.log(foundedProjectsInPath.map(p => p.location))
    const mostBaseLocationFound = _.minBy(foundedProjectsInPath, p => p.location.length).location;
    const projects = foundedProjectsInPath
      .reduce((a, b) => {
        const baseStructureHash = BaseProjectStructure.generate(b).insideIfNotExists(baseProjectsStructurePath);
        return _.merge(a, {
          [path.join(path.basename(mostBaseLocationFound), b.location.replace(mostBaseLocationFound, ''))]: {
            githash: b.git.lastCommitHash(),
            name: b.name,
            baseStructureHash,
          }
        } as MetaMdJSONProject)
      }, {} as MetaMdJSONProjects);
    const timeHash = (+new Date).toString(36);

    const c = await MetaMd.create({
      orgFileBasenames: originalAnyTypeFiles.map(a => path.basename(a)),
      orgRelativePathes: originalAnyTypeFiles.map(a => {
        return path.join(path.basename(mostBaseLocationFound), a.replace(mostBaseLocationFound, ''))
      }),
      projects,
      firstProjectBasename: path.basename(mostBaseLocationFound),
      mostBaseLocationFound,
      timeHash,
    }, originalAnyTypeFiles.map(a => Helpers.readFile(a)));

    Helpers.writeFile(path.join(destinationFolder, properDestName), c);
  }
  //#endregion

  addFiles(
    newFilesPathes: string[],
    destinationFolder: string,
    editorCwd?: string,
    foundProjectFn: (projects: Project[]) => Project[] = void 0,
    baseProjectsStructurePath?: string, // navi-cli folder or current folder
  ) {
    const mostBaseLocationFound = this.readonlyMetaJson.mostBaseLocationFound;
    newFilesPathes = Helpers.arrays.uniqArray([
      ...newFilesPathes,
      ...this.readonlyMetaJson.orgRelativePathes.map(a => {
        return path.join(path.dirname(mostBaseLocationFound), a)
      }),
    ]);

    MetaMd.preserveFiles(
      newFilesPathes,
      destinationFolder,
      editorCwd,
      foundProjectFn,
      baseProjectsStructurePath,
      path.basename(this.filePath).replace(`.${config.file.meta_config_md}`, ''),
    );
  }


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
      const extracted = _.first(extract(content, MetaMd.JSON_PART));
      const parsed = Helpers.parse(extracted, true);
      return parsed;
    } catch (error) {
      return {} as any;
    }
  }

  public get readonlyMetaJson() {
    return Object.freeze(this.json);
  }

  public fileContentByIndex(i: number): string {
    const content = Helpers.readFile(this.filePath) || '';
    return extract(content, MetaMd.FILE_CONTENT_PART)[i];
  }

  get basename() {
    return path.basename(this.filePath);
  }

  get dirname() {
    return path.dirname(this.filePath);
  }
  //#endregion

  //#region constructor
  constructor(
    public readonly filePath: string,
  ) { }
  //#endregion

  //#region recreate files/content/env before any tests
  /**
   * recate original files before any unit/intergration test
   */
  public recreate(testCwd: string, cwdProj: string) {
    // recreat whole structure
    const hashDir = path.join(testCwd, this.json.timeHash);
    Helpers.mkdirp(hashDir);

    const firstToFind = this.json.projects[this.json.firstProjectBasename].baseStructureHash;
    const allBaseStructures = BaseProjectStructure.allBaseStructures(cwdProj);
    const proj = allBaseStructures.find(p => p.baseStructureHash === firstToFind);
    if (!proj) {
      Helpers.error(`[node-cli-test][regenerate] base structure was not generated for ${firstToFind}`, false, true);
    }
    proj.copyto(hashDir);
    this.readonlyMetaJson.orgRelativePathes.forEach((f, i) => {
      const fileToWritePath = path.join(hashDir, f);
      Helpers.writeFile(fileToWritePath, this.fileContentByIndex(i));
    })

  }
  //#endregion

}

//#region create
async function create(json5string: string, fileContents: string[], testContent?: string) {
  const metadataJSON = Helpers.parse<MetaMdJSON>(json5string, true);
  // Helpers.log(`metadataJSON.orgFileBasename: ${metadataJSON.orgFileBasename}`)
  const ext = path.extname(_.first(metadataJSON.orgFileBasenames)).replace(/^\./, '');
  // const filePath = _.first(); // TODO @LAST

  if (!testContent) {
    const projPath = _.maxBy(_.keys(metadataJSON.projects).map(projRelPath => {
      return { path: projRelPath, length: projRelPath.length };
    }), c => c.length)?.path || '';
    let TestTemplatesClass = CLASS.getBy('TestTemplates') as typeof TestTemplates;
    if (!TestTemplatesClass) {
      TestTemplatesClass = await (await import('./spec-templates.backend')).TestTemplates;
    }
    testContent = TestTemplatesClass.testPart(metadataJSON.orgFileBasenames, projPath, metadataJSON.timeHash);
  }

  const filesContestString = fileContents.map(fileContent => {
    return `\`\`\`${ext} ${MetaMd.FILE_CONTENT_PART}
${fileContent}
\`\`\``
  })

  return `
\`\`\`ts ${MetaMd.TEST_PART}
${testContent}
\`\`\`

\`\`\`json5 ${MetaMd.JSON_PART}
${json5string}
\`\`\`

${filesContestString}
`.split('\n').map(l => {
    return l.trim().startsWith('\`\`\`') ? l.trimLeft() : l;
  }).join('\n').trim() + '\n';
}

//#endregion


//#region extract data parts from content md file
function extract(content: string, PARTS_TO_FIND: string): string[] {
  if (!content) {
    return;
  }
  const parts = [] as string[];
  let lines = [];
  const allLines = content.split('\n');
  let pushingActive = false;
  for (let index = 0; index < allLines.length; index++) {
    const orgLine = (allLines[index] || '');
    const line = orgLine.trim();
    if (pushingActive) {
      if (line.startsWith('\`\`\`')) {
        parts.push(lines.join('\n'));
        lines = []
      } else {
        lines.push(orgLine);
      }
    }
    if (line.startsWith('\`\`\`') && (line.search(PARTS_TO_FIND) !== -1)) {
      pushingActive = true;
    }
  }
  return parts;
}
//#endregion


//#endregion

