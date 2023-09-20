import { allCases, camelCase, kebabCase, packageToString, parsePackageName, pascalCase, snakeCase, squashPackages, titleCase } from '../src/helpers';

test('allCases', () => {
  expect(allCases('Foo Bar')).toStrictEqual({
    camel: 'fooBar',
    kebab: 'foo-bar',
    pascal: 'FooBar',
    snake: 'foo_bar',
    title: 'Foo Bar',
  });
});

test('camelCase', () => {
  expect(camelCase('Foo Bar')).toBe('fooBar');
  expect(camelCase('!Foo ! Bar+')).toBe('fooBar');
  expect(camelCase('foo bar')).toBe('fooBar');
  expect(camelCase('fooBar')).toBe('fooBar');
  expect(camelCase('FooBar')).toBe('fooBar');
  expect(camelCase('___Foo___Bar___')).toBe('fooBar');
  expect(camelCase('foobar')).toBe('foobar');
  expect(camelCase('___FOO___BAR___')).toBe('fOOBAR');
  expect(camelCase('FOO BAR')).toBe('fOOBAR');
  expect(camelCase('FOOBAR')).toBe('fOOBAR');
});

test('kebabCase', () => {
  expect(kebabCase('Foo Bar')).toBe('foo-bar');
  expect(kebabCase('!Foo ! Bar+')).toBe('foo-bar');
  expect(kebabCase('foo bar')).toBe('foo-bar');
  expect(kebabCase('fooBar')).toBe('foo-bar');
  expect(kebabCase('FooBar')).toBe('foo-bar');
  expect(kebabCase('___Foo___Bar___')).toBe('foo-bar');
  expect(kebabCase('foobar')).toBe('foobar');
  expect(kebabCase('___FOO___BAR___')).toBe('f-o-o-b-a-r');
  expect(kebabCase('FOO BAR')).toBe('f-o-o-b-a-r');
  expect(kebabCase('FOOBAR')).toBe('f-o-o-b-a-r');
});

test('packageToString', () => {
  expect(packageToString({ name: 'foo-bar' })).toBe('foo-bar');
  expect(packageToString({ org: 'foo', name: 'bar' })).toBe('@foo/bar');
  expect(packageToString({ name: 'foo-bar', version: '1.0.0' })).toBe('foo-bar@1.0.0');
  expect(packageToString({ org: 'foo', name: 'bar', version: '1.0.0' })).toBe('@foo/bar@1.0.0');
});

test('parsePackageName', () => {
  expect(parsePackageName('foo-bar')).toStrictEqual({ org: undefined, name: 'foo-bar', version: undefined });
  expect(parsePackageName('@foo/bar')).toStrictEqual({ org: 'foo', name: 'bar', version: undefined });
  expect(parsePackageName('foo-bar@1.0.0')).toStrictEqual({ org: undefined, name: 'foo-bar', version: '1.0.0' });
  expect(parsePackageName('@foo/bar@1.0.0')).toStrictEqual({ org: 'foo', name: 'bar', version: '1.0.0' });
  expect(() => parsePackageName('@foo/bar/baz')).toThrowError('Invalid package name');
  expect(() => parsePackageName('foo/bar')).toThrowError('Invalid package name');
});

test('pascalCase', () => {
  expect(pascalCase('Foo Bar')).toBe('FooBar');
  expect(pascalCase('!Foo ! Bar+')).toBe('FooBar');
  expect(pascalCase('foo bar')).toBe('FooBar');
  expect(pascalCase('fooBar')).toBe('FooBar');
  expect(pascalCase('FooBar')).toBe('FooBar');
  expect(pascalCase('___Foo___Bar___')).toBe('FooBar');
  expect(pascalCase('foobar')).toBe('Foobar');
  expect(pascalCase('___FOO___BAR___')).toBe('FOOBAR');
  expect(pascalCase('FOO BAR')).toBe('FOOBAR');
  expect(pascalCase('FOOBAR')).toBe('FOOBAR');
});

test('snakeCase', () => {
  expect(snakeCase('Foo Bar')).toBe('foo_bar');
  expect(snakeCase('!Foo ! Bar+')).toBe('foo_bar');
  expect(snakeCase('foo bar')).toBe('foo_bar');
  expect(snakeCase('fooBar')).toBe('foo_bar');
  expect(snakeCase('FooBar')).toBe('foo_bar');
  expect(snakeCase('___Foo___Bar___')).toBe('foo_bar');
  expect(snakeCase('foobar')).toBe('foobar');
  expect(snakeCase('___FOO___BAR___')).toBe('f_o_o_b_a_r');
  expect(snakeCase('FOO BAR')).toBe('f_o_o_b_a_r');
  expect(snakeCase('FOOBAR')).toBe('f_o_o_b_a_r');
});

test('squashPackages', () => {
  expect(squashPackages(['foo-bar@1.0.0', 'foo-bar@0.0.1'])).toStrictEqual(['foo-bar@0.0.1']);
  expect(squashPackages(['foo-bar@1.0.0', 'foo-baz', 'foo-bar@0.0.1'])).toStrictEqual(['foo-bar@0.0.1', 'foo-baz']);
  expect(squashPackages(['@foo/foo-bar@1.0.0', '@baz/foo-bar@0.0.1'])).toStrictEqual(['@baz/foo-bar@0.0.1']);
  expect(squashPackages(['@foo/foo-bar@1.0.0', '@baz/foo-bar@0.0.1', '@types/foo-bar@0.0.2'])).toStrictEqual(['@baz/foo-bar@0.0.1', '@types/foo-bar@0.0.2']);
  expect(squashPackages(['@types/foo-bar@0.0.2', '@foo/foo-bar@1.0.0', '@baz/foo-bar@0.0.1'])).toStrictEqual(['@types/foo-bar@0.0.2', '@baz/foo-bar@0.0.1']);
});

test('titleCase', () => {
  expect(titleCase('Foo Bar')).toBe('Foo Bar');
  expect(titleCase('!Foo ! Bar+')).toBe('Foo Bar');
  expect(titleCase('foo bar')).toBe('Foo Bar');
  expect(titleCase('fooBar')).toBe('Foo Bar');
  expect(titleCase('FooBar')).toBe('Foo Bar');
  expect(titleCase('___Foo___Bar___')).toBe('Foo Bar');
  expect(titleCase('foobar')).toBe('Foobar');
  expect(titleCase('___FOO___BAR___')).toBe('F O O B A R');
  expect(titleCase('FOO BAR')).toBe('F O O B A R');
  expect(titleCase('FOOBAR')).toBe('F O O B A R');
});

