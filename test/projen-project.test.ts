import { ProjenProject } from '../src';

test('ProjenProject', () => {
  const project = new ProjenProject({
    name: 'foo-project',
    defaultReleaseBranch: 'main',
  });
  const fileNames = project.files.map(_ => _.path);
  ['package.json'].forEach(fileName => {
    expect(fileNames).toContain(fileName);
  });
});