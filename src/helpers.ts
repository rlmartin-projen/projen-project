import * as fs from 'fs';
import * as path from 'path';
import { Liquid } from 'liquidjs';
import { GithubWorkflow } from 'projen/lib/github';
import { NodeProject, NodeProjectOptions } from 'projen/lib/javascript';
import { JobPermission } from 'projen/lib/github/workflows-model';
import { FileType, ProjectFile } from './core';

export interface AllCases {
  readonly camel: string;
  readonly kebab: string;
  readonly pascal: string;
  readonly snake: string;
  readonly title: string;
}

export function allCases(str: string): AllCases {
  return {
    camel: camelCase(str),
    kebab: kebabCase(str),
    pascal: pascalCase(str),
    snake: snakeCase(str),
    title: titleCase(str),
  };
}

export function camelCase(str: string) {
  return kebabCase(str)
    .replace(
      /-(.)(\w*)/g,
      (_, first, rest) => `${first.toUpperCase()}${rest}`,
    );
}

export function kebabCase(str: string): string {
  return snakeCase(str).replace(/_/g, '-');
}

export function loadFiles<T extends object>(fullPath: string, options: T, fileType: FileType): ProjectFile[] {
  const liquidEngine = new Liquid();
  const liquidExt: RegExp = /.liquid$/i;
  return walkDirectory(fullPath).map(fileName => {
    const contents = fs.readFileSync(fileName, 'utf-8');
    fileName = fileName.replace(`${fullPath}${path.sep}`, '');
    if (fileName.match(liquidExt)) {
      return {
        fileName: liquidEngine.parseAndRenderSync(fileName.replace(liquidExt, ''), options),
        contents: liquidEngine.parseAndRenderSync(contents, options),
        fileType,
      };
    } else {
      return {
        fileName: liquidEngine.parseAndRenderSync(fileName, options),
        contents,
        fileType,
      };
    }
  });
}

export interface PackageName {
  readonly org?: string;
  readonly name: string;
  readonly version?: string;
}

export function packageToString(packageName: PackageName): string {
  return `${packageName.org ? '@' : ''}${packageName.org ?? ''}${packageName.org ? '/' : ''}${packageName.name}${packageName.version ? '@' : ''}${packageName.version ?? ''}`;
}

export function parsePackageName(str: string): PackageName {
  const parts = str.match(/^(@([^\/]+)\/)?([^@\/]+)(@(.+))?$/);
  if (parts) {
    return {
      org: parts[2],
      name: parts[3],
      version: parts[5],
    };
  } else {
    throw new Error('Invalid package name');
  }
}

export function pascalCase(str: string) {
  return camelCase(str)
    .replace(/^\w/, s => s.toUpperCase());
}

export function snakeCase(str: string): string {
  return str
    .replace(/[A-Z]/g, s => ` ${s}`)
    .toLowerCase()
    .replace(/\W+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_/, '')
    .replace(/_$/, '');
}

export function squashPackageNames(packageNames: PackageName[]): { [key: string]: PackageName } {
  return packageNames.reduce((currentMap, packageName) => {
    currentMap[(packageName.org?.toLowerCase() === 'types' ? '@types' : '') + packageName.name] = packageName;
    return currentMap;
  }, Object.assign({}));
}

// Will ensure that a package appears only once in the list, using the
// version that is last in the list.
// If a package appears in the list under two different orgs, they are
// considered the same package, to allow for overriding using forks.
export function squashPackages(packages: string[]): string[] {
  const parsed = packages.map(parsePackageName);
  const deduped = squashPackageNames(parsed);
  return Object.values(deduped).map(packageToString);
}

export function titleCase(str: string): string {
  return pascalCase(str)
    .replace(/[A-Z]/g, s => ` ${s}`)
    .trim();
}

export function unifyNpmReleaseTrigger(project: NodeProject, options: NodeProjectOptions, unifiedName: string = 'release-all') {
  const { defaultReleaseBranch, npmTrustedPublishing, releaseToNpm, releaseBranches } = options;
  // When publishing to NPM with trusted publishing, only one release workflow
  // file can be specified. In this case, unify the release workflows under a single file.
  if (project.github && releaseToNpm && npmTrustedPublishing && releaseBranches) {
    const releaseBranchNames = Object.keys(releaseBranches);
    const mainReleaseName = 'release';
    // Add workflow_call trigger to release workflows so they can be called as
    // reusable workflows from release-all.yml.
    for (const workflowName of [mainReleaseName, ...releaseBranchNames.map(name => `release-${name}`)]) {
      project.github.tryFindWorkflow(workflowName)?.on({ workflowCall: {} });
    }

    const releaseAll = new GithubWorkflow(project.github, unifiedName, {});
    releaseAll.on({
      push: {
        branches: [defaultReleaseBranch, ...releaseBranchNames],
      },
    });
    releaseAll.addJob('publish-prod', {
      if: `github.ref_name == '${defaultReleaseBranch}'`,
      uses: `./.github/workflows/${mainReleaseName}.yml`,
      permissions: {
        idToken: JobPermission.WRITE,
        contents: JobPermission.WRITE,
      },
    });
    releaseBranchNames.forEach(name => {
      releaseAll.addJob(`publish-${name}`, {
        if: `github.ref_name == '${name}'`,
        uses: `./.github/workflows/release-${name}.yml`,
        permissions: {
          idToken: JobPermission.WRITE,
          contents: JobPermission.WRITE,
        },
      });
    });
  }
}

function walkDirectory(dir: string) {
  var results: string[] = [];
  var list: string[] = [];
  try {
    list = fs.readdirSync(dir);
  } catch {
    // Ignore for missing directories
  }
  list.forEach(file => {
    file = path.join(dir, file);
    var stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      /* Recurse into a subdirectory */
      results = results.concat(walkDirectory(file));
    } else {
      /* Is a file */
      results.push(file);
    }
  });
  return results;
}
