import * as path from 'path';
import { SampleFile, TextFile, javascript } from 'projen';
import { JsiiProjectOptions } from 'projen/lib/cdk';
import { JestOptions, TypescriptConfigOptions } from 'projen/lib/javascript';
import { TypeScriptProject, TypeScriptProjectOptions } from 'projen/lib/typescript';
import { allCases, AllCases, loadFiles, packageToString, parsePackageName, squashPackageNames, squashPackages } from './helpers';

export enum FileType {
  SCAFFOLDING, GENERATED,
}

interface InternalProjenProjectOptions {
  readonly _name: AllCases;
}

export interface ProjectFile {
  readonly fileName: string;
  readonly contents: string;
  readonly fileType: FileType;
}

export interface ProjectSettings {
  readonly options: any;
  readonly files: ProjectFile[];
}

export type NodeVersion = 24 | 20 | 18;
export interface SharedOptions {
  readonly bundledDependencies: string[];
  readonly dependencies: string[];
  readonly jestVersion: string;
  readonly jsiiVersion: string;
  readonly nodeVersion: NodeVersion;
}

export const sharedOptions: SharedOptions = {
  bundledDependencies: ['liquidjs@~10'],
  dependencies: ['projen@~0'],
  jestVersion: '29',
  jsiiVersion: '~5',
  nodeVersion: 24,
};

export function loadSettings(
  options: any,
  filesDir: string,
  isProjenProject: boolean = false,
): ProjectSettings {
  const { dependencies, jestVersion, jsiiVersion, nodeVersion: nodeVersionDefault } = sharedOptions;
  const bundledDependencies = isProjenProject ? sharedOptions.bundledDependencies : [];
  const packageName = parsePackageName(options.name);
  const nodeVersion = options.nodeVersion ?? nodeVersionDefault;
  const devDepsMap = squashPackageNames((options.devDeps ?? []).map(parsePackageName));
  if (devDepsMap['projen-project'] && isProjenProject) {
    dependencies.push(packageToString(devDepsMap['projen-project']));
    delete devDepsMap['projen-project'];
  }
  var tsconfig: TypescriptConfigOptions | undefined = undefined;
  if ('tsconfig' in options) {
    tsconfig = options.tsconfig as TypescriptConfigOptions;
  }
  var jestOptions: JestOptions | undefined = undefined;
  if ('jestOptions' in options) {
    jestOptions = options.jestOptions as JestOptions;
  }
  const projectOpts: (javascript.NodeProjectOptions | TypeScriptProjectOptions) & InternalProjenProjectOptions & JsiiProjectOptions = {
    ...options,
    sampleCode: false, // Needed to prevent a default index.ts from being generated, which happens elsewhere.
    tsconfig: {
      ...tsconfig,
      compilerOptions: {
        ...tsconfig?.compilerOptions,
        outDir: options.artifactsDirectory ?? 'dist',
        declaration: false,
      },
    },
    deps: squashPackages([...(options.deps ?? []), ...bundledDependencies, ...dependencies]),
    devDeps: Object.values(devDepsMap).map(packageToString),
    peerDeps: squashPackages([...(options.peerDeps ?? []), ...dependencies]),
    bundledDeps: squashPackages([...(options.bundledDeps ?? []), ...bundledDependencies]),
    jestOptions: {
      jestVersion,
      ...jestOptions,
    },
    jsiiVersion,
    minNodeVersion: `${nodeVersion}.0.0`,
    workflowNodeVersion: nodeVersion,
    _name: allCases(packageName.name),
  };
  const files = [
    ...loadFiles(path.join(filesDir, 'scaffolding'), projectOpts, FileType.SCAFFOLDING),
    ...loadFiles(path.join(filesDir, 'generated'), projectOpts, FileType.GENERATED),
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

export function addFiles(project: TypeScriptProject, files: ProjectFile[]) {
  files.forEach(file => {
    const { fileName, contents, fileType } = file;
    if (fileName === 'README.md') return; // readme is set in project creation above, so skip here
    if (fileName === '.seed') return; // Ignore this; used only to create dirs in this template.
    project.tryRemoveFile(fileName);
    switch (fileType) {
      case FileType.SCAFFOLDING:
        new SampleFile(project, fileName, { contents });
        break;
      case FileType.GENERATED:
        new TextFile(project, fileName, { lines: contents.split('\n') });
        if (fileName.match(/\.[j|t]s$/i)) project.eslint?.addIgnorePattern(fileName);
        break;
      default:
        throw `fileType [${fileType}] not implemented.`;
    }
  });
}