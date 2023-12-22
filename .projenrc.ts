import { cdk } from 'projen';
import { NpmAccess } from 'projen/lib/javascript';

const dependencies = ['projen@~0'];
const bundledDependencies = ['liquidjs@~10'];
const majorVersion = 0;
const nodeVersion = '20';

const project = new cdk.JsiiProject({
  author: 'Ryan Martin',
  authorAddress: 'rlmartin@gmail.com',
  defaultReleaseBranch: 'main',
  name: '@rlmartin-projen/projen-project',
  repositoryUrl: 'git@github.com:rlmartin/projen-project.git',
  projenrcTs: true,
  releaseToNpm: true,
  npmAccess: NpmAccess.PUBLIC,
  minNodeVersion: `${nodeVersion}.0.0`,
  workflowNodeVersion: nodeVersion,
  majorVersion,
  releaseBranches: {
    dev: { prerelease: 'dev', npmDistTag: 'dev', majorVersion },
  },
  devDeps: dependencies,
  deps: dependencies.concat(bundledDependencies),
  peerDeps: dependencies,
  bundledDeps: bundledDependencies,
  gitignore: [
    '!files/scaffolding/files/generated/.seed',
    '!files/scaffolding/files/scaffolding/.seed',
  ],
  depsUpgradeOptions: {
    workflowOptions: {
      branches: ['main'],
    },
  },
  jsiiVersion: '~5',

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();