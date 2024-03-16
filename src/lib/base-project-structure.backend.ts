//#region imports
import { _, path } from 'tnp-core';
import { Helpers, BaseProject as Project } from 'tnp-helpers';
//#endregion

export class BaseProjectStructure {
  static BASE_STRUCTURES_FOLDER = 'base-structures';
  get baseStructureHash() {
    return path.basename(this.cwd);
  }

  get projectPathBasename() {
    return _.first(path.basename(this.cwd).split('__'))
  }

  constructor(
    private cwd: string
  ) {

  }

  copyto(destinationCwd: string, basename?: string) {
    Helpers.copy(this.cwd, path.join(destinationCwd, basename ? basename : this.projectPathBasename));
  }

  static allBaseStructures(cwd) {
    const folderPath = path.join(cwd, this.BASE_STRUCTURES_FOLDER);
    return Helpers.foldersFrom(folderPath).map(f => new BaseProjectStructure(f));
  }

  static generate<P extends Project = Project>(project: P) {
    const that = this;
    const orgCwd = path.join(project.location);
    const files = []; //= project.forEmptyStructure();
    const filesWithoutLinks = files.filter(f => !f.relativeLinkFrom);
    let hash = files.length.toString();
    for (let index = 0; index < filesWithoutLinks.length; index++) {
      const file = filesWithoutLinks[index];
      const abasolutePAth = path.join(orgCwd, file.relativePath);
      hash += (file.relativePath.length + 1).toString() +
        (Helpers.isFolder(abasolutePAth) ? '' : (Helpers.readFile(abasolutePAth)?.length + 1).toString());
    }
    hash = `${project.name}__${Helpers.checksum(hash)}`;
    return {
      insideIfNotExists(destinationCwd: string) {
        const destStruct = path.join(destinationCwd, that.BASE_STRUCTURES_FOLDER, hash);
        if (Helpers.exists(destStruct)) {
          Helpers.log(`Base structure with name: ${hash}`);
          return hash;
        }
        Helpers.removeFolderIfExists(destStruct);
        for (let index = 0; index < filesWithoutLinks.length; index++) {
          const file = filesWithoutLinks[index];
          const orgPath = path.join(orgCwd, file.relativePath);
          const destPath = path.join(destStruct, file.relativePath);
          Helpers.mkdirp(path.dirname(destPath));
          if (Helpers.isFolder(orgPath)) {
            if (file.includeContent) {
              Helpers.copy(orgPath, destPath)
            } else {
              Helpers.mkdirp(destPath);
            }
          } else {
            if (file.includeContent) {
              Helpers.copyFile(orgPath, destPath);
            } else {
              Helpers.writeFile(destPath, '');
            }
          }
        }
        return hash;
      }
    }
  }

}
