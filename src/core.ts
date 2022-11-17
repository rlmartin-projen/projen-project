import { Project, ProjectOptions, SampleFile, TextFile } from 'projen';
import { allCases, AllCases, loadFiles, parsePackageName } from './helpers';

export enum FileType {
  Scaffolding, Generated
}

interface InternalProjenProjectOptions {
  readonly _name: AllCases;
}

export interface ProjectFile {
  readonly fileName: string;
  readonly contents: string;
  readonly fileType: FileType;
}

export interface ProjectSettings<O extends ProjectOptions> {
  readonly options: O;
  readonly files: ProjectFile[];
}

export function loadSettings<O extends ProjectOptions>(options: O): ProjectSettings<O> {
  const packageName = parsePackageName(options.name);
  const projectOpts: O & InternalProjenProjectOptions = {
    ...options,
    sampleCode: false, // Needed to prevent a default index.ts from being generated, which happens elsewhere.
    tsconfig: {
      compilerOptions: {
        outDir: 'dist',
        declaration: false,
      },
    },
    _name: allCases(packageName.name),
  };
  const files = [
    ...loadFiles('../files/scaffolding', projectOpts, FileType.Scaffolding),
    ...loadFiles('../files/generated', projectOpts, FileType.Generated),
  ];
  return {
    options: {
      ...projectOpts,
      readme: {
        contents: files.find(_ => _.fileName === 'README.md')?.contents, // Need to load here and not later
      },
    },
    files,
  };
}

export function addFiles(project: Project, files: ProjectFile[]) {
  files.forEach(file => {
    const { fileName, contents, fileType } = file;
    if (fileName === 'README.md') return; // readme is set in project creation above, so skip here
    switch (fileType) {
      case FileType.Scaffolding:
        new SampleFile(project, fileName, { contents });
        break;
      case FileType.Generated:
        new TextFile(project, fileName, { lines: contents.split('\n') });
        break;
      default:
        throw `fileType [${fileType}] not implemented.`;
    }
  });
}