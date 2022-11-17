import * as fs from 'fs';
import * as path from 'path';
import { Liquid } from 'liquidjs';
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

export function loadFiles<T extends object>(dir: string, options: T, fileType: FileType): ProjectFile[] {
  const liquidEngine = new Liquid();
  const liquidExt: RegExp = /.liquid$/i;
  const fullPath = path.join(__dirname, dir);
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
}

export function parsePackageName(str: string): PackageName {
  const parts = str.split('/');
  switch (parts.length) {
    case 1:
      return {
        name: parts[0],
      };
    case 2:
      return {
        org: parts[0].replace(/^@/, ''),
        name: parts[1],
      };
    default:
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

export function titleCase(str: string): string {
  return pascalCase(str)
    .replace(/[A-Z]/g, s => ` ${s}`)
    .trim();
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
