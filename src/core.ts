import { Project, SampleFile, TextFile, cdk } from 'projen';
import { allCases, AllCases, loadFiles, packageToString, parsePackageName, squashPackageNames, squashPackages } from './helpers';

export enum FileType {
  SCAFFOLDING, GENERATED
}

interface InternalProjenProjectOptions {
  readonly _name: AllCases;
}

export interface ProjectFile {
  readonly fileName: string;
  readonly contents: string;
  readonly fileType: FileType;
}

export interface ProjectSettings<O extends cdk.JsiiProjectOptions> {
  readonly options: O;
  readonly files: ProjectFile[];
}

export function loadSettings<O extends cdk.JsiiProjectOptions>(options: O): ProjectSettings<O> {
  const dependencies = ['projen@~0'];
  const bundledDependencies = ['liquidjs@~9'];
  const packageName = parsePackageName(options.name);
  const devDepsMap = squashPackageNames((options.devDeps ?? []).map(parsePackageName));
  if (devDepsMap['projen-project']) {
    dependencies.push(packageToString(devDepsMap['projen-project']));
    delete devDepsMap['projen-project'];
  }
  const projectOpts: O & InternalProjenProjectOptions = {
    ...options,
    sampleCode: false, // Needed to prevent a default index.ts from being generated, which happens elsewhere.
    tsconfig: {
      compilerOptions: {
        outDir: 'dist',
        declaration: false,
      },
    },
    deps: squashPackages([...(options.deps ?? []), ...bundledDependencies, ...dependencies]),
    devDeps: Object.values(devDepsMap).map(packageToString),
    peerDeps: squashPackages([...(options.peerDeps ?? []), ...dependencies]),
    bundledDeps: squashPackages([...(options.bundledDeps ?? []), ...bundledDependencies]),
    _name: allCases(packageName.name),
  };
  const files = [
    ...loadFiles('../files/scaffolding', projectOpts, FileType.SCAFFOLDING),
    ...loadFiles('../files/generated', projectOpts, FileType.GENERATED),
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
      case FileType.SCAFFOLDING:
        new SampleFile(project, fileName, { contents });
        break;
      case FileType.GENERATED:
        new TextFile(project, fileName, { lines: contents.split('\n') });
        break;
      default:
        throw `fileType [${fileType}] not implemented.`;
    }
  });
}