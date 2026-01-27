//#region imports
import * as glob from 'glob';
import { _, path, Utils } from 'tnp-core/src';
import { config } from 'tnp-core/src';
import { Helpers, BaseProject as Project } from 'tnp-helpers/src';
import type { TestTemplates } from './spec-templates.backend';
import { CLASS } from 'typescript-class-helpers/src';
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
    foundProjectsFn: (projects: Project[]) => Project[] = (a) => a,
    baseProjectsStructurePath: string, // navi-cli folder or current folder,
    overrideThisFileName = void 0 as string,
    overrideTimehash = void 0
  ) {

    const properDestName = overrideThisFileName ? overrideThisFileName :
      `${path.basename(_.first(originalAnyTypeFiles))}.${config.file.meta_config_md}`; // TODO later menu to confirm name

    if (!Helpers.isFolder(destinationFolder)) {
      Helpers.error(`[tnp-helpers][meta-content-md] Destination folder "${destinationFolder}"
       is not a folder`, false, true)
    }

    let foundedProjectsInPath = resolveFoundedProject(originalAnyTypeFiles, editorCwd, foundProjectsFn);
    const mostBaseLocationFound = _.minBy(foundedProjectsInPath, p => p.location.length).location;
    // console.log(foundedProjectsInPath.map(p => p.location))
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
    const timeHash = overrideTimehash ? overrideTimehash : (+new Date).toString(36);

    const c = await MetaMd.create({
      orgFileBasenames: originalAnyTypeFiles.map(a => path.basename(a)),
      orgRelativePathes: originalAnyTypeFiles.map(a => {
        return path.join(path.basename(mostBaseLocationFound), a.replace(mostBaseLocationFound, ''))
      }),
      projects,
      firstProjectBasename: path.basename(mostBaseLocationFound),
      timeHash,
    }, originalAnyTypeFiles.map(a => Helpers.readFile(a)));

    Helpers.writeFile(path.join(destinationFolder, properDestName), c);
  }
  //#endregion

  async addFiles(
    newFilesPathes: string[],
    destinationFolder: string,
    editorCwd?: string,
    foundProjectFn: (projects: Project[]) => Project[] = void 0,
    baseProjectsStructurePath?: string, // navi-cli folder or current folder
  ) {
    let foundedProjectsInPath = resolveFoundedProject(newFilesPathes, editorCwd, foundProjectFn);
    const mostBaseLocationFound = _.minBy(foundedProjectsInPath, p => p.location.length).location;

    newFilesPathes = Utils.uniqArray([
      ...newFilesPathes,
      ...this.readonlyMetaJson.orgRelativePathes.map(a => {
        return path.join(path.dirname(mostBaseLocationFound), a)
      }),
    ]);

    newFilesPathes.forEach(f => {
      if (!Helpers.exists(f)) {
        Helpers.error(`File doesn't exists`, false, true);
      }
    })

    await MetaMd.preserveFiles(
      newFilesPathes,
      destinationFolder,
      editorCwd,
      foundProjectFn,
      baseProjectsStructurePath,
      path.basename(this.filePath),
      this.readonlyMetaJson.timeHash,
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
    const extracted = extract(content, MetaMd.FILE_CONTENT_PART)[i];
    return extracted;
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
  public recreate(testCwd: string, cwdProj: string, ProjectClass: typeof Project = Project, onlyIfNotExists = false) {
    // recreat whole structure
    const hashDir = path.join(testCwd, this.json.timeHash);
    if (onlyIfNotExists && Helpers.exists(hashDir)) {
      return;
    }
    Helpers.removeFolderIfExists(hashDir);
    Helpers.mkdirp(hashDir);

    const firstToFind = this.json.projects[this.json.firstProjectBasename].baseStructureHash;
    const allBaseStructures = BaseProjectStructure.allBaseStructures(cwdProj);
    const baseStructure = allBaseStructures.find(p => p.baseStructureHash === firstToFind);
    if (!baseStructure) {
      Helpers.error(`[node-cli-test][regenerate] base structure was not generated for ${firstToFind}`, false, true);
    }
    baseStructure.copyto(hashDir);
    _.keys(this.json.projects)
      .filter(key => key !== this.json.firstProjectBasename)
      .map(key => {
        const baseStructureHashChild = this.json.projects[key].baseStructureHash;
        const childBaseStruct = allBaseStructures.find(p => p.baseStructureHash === baseStructureHashChild);
        if (childBaseStruct) {
          childBaseStruct.copyto(path.join(
            hashDir,
            path.dirname(key)
          ), path.basename(key));
        }
      })

    this.readonlyMetaJson.orgRelativePathes.forEach((f, i) => {
      const fileToWritePath = path.join(hashDir, f);
      Helpers.writeFile(fileToWritePath, this.fileContentByIndex(i));
    });

    const proj = ProjectClass.ins.From(path.join(hashDir, this.readonlyMetaJson.firstProjectBasename));
    const linksToLInk = []; // proj?.forEmptyStructure().filter(f => !!f.relativeLinkFrom) || [];
    linksToLInk.forEach(l => {
      const source = path.resolve(path.join(proj.location, l.relativeLinkFrom));
      if (Helpers.exists(source)) {
        const dest = path.resolve(path.join(proj.location, l.relativePath));
        Helpers.createSymLink(source, dest);
      } else {
        Helpers.log(`[cli-tester][recreate-env] not exist ${source}`);
      }
    });
  }
  //#endregion

}

//#region create
async function create(json5string: string, fileContents: string[], testContent?: string) {
  const metadataJSON = Helpers.parse<MetaMdJSON>(json5string, true);
  // Helpers.log(`metadataJSON.orgFileBasename: ${metadataJSON.orgFileBasename}`)

  if (!testContent) {
    const projPath = _.maxBy(_.keys(metadataJSON.projects).map(projRelPath => {
      return { path: projRelPath, length: projRelPath.length };
    }), c => c.length)?.path || '';
    let TestTemplatesClass = CLASS.getBy('TestTemplates') as typeof TestTemplates;
    if (!TestTemplatesClass) {
      TestTemplatesClass = await (await import('./spec-templates.backend')).TestTemplates;
    }
    testContent = TestTemplatesClass.testPart(metadataJSON.orgRelativePathes, projPath, metadataJSON.timeHash);
  }

  const filesContestString = fileContents.map((fileContent, i) => {
    const ext = path.extname(metadataJSON.orgFileBasenames[i]).replace(/^\./, '');
    return `\`\`\`${ext} ${MetaMd.FILE_CONTENT_PART}
${fileContent}
\`\`\``
  }).join('\n\n')

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
export function extract(content: string, PARTS_TO_FIND: string): string[] {
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
  return parts.filter(f => !!f.trim())
}
//#endregion

//#region resolve founded projects
function resolveFoundedProject(originalAnyTypeFiles: string[], editorCwd: string, foundProjectFn: Function) {
  let foundedProjectsInPath = [];
  for (let index = 0; index < originalAnyTypeFiles.length; index++) {
    const fileAbsPath = originalAnyTypeFiles[index];
    foundedProjectsInPath = [
      ...foundedProjectsInPath,
      ...Project.ins.allProjectFrom(fileAbsPath, editorCwd)
    ];
    if (foundProjectFn) {
      foundedProjectsInPath = foundProjectFn(Utils.uniqArray<Project>(foundedProjectsInPath, 'location'));
    }
  }
  foundedProjectsInPath = Utils.uniqArray<Project>(foundedProjectsInPath, 'location');
  return foundedProjectsInPath;
}
//#endregion

//#endregion

