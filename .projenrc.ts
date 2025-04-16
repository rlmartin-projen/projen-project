import { cdk } from 'projen';
import { NpmAccess } from 'projen/lib/javascript';
import { sharedOptions } from './src/core';

const majorVersion = 0;
const { bundledDependencies, dependencies, jestVersion, jsiiVersion, nodeVersion } = sharedOptions;

const project = new cdk.JsiiProject({
  author: 'Ryan Martin',
  authorAddress: 'rlmartin@gmail.com',
  defaultReleaseBranch: 'main',
  name: '@vestahealthcare/projen-project',
  repositoryUrl: 'https://github.com/vestahealthcare/projen-project',
  projenrcTs: true,
  releaseToNpm: true,
  npmAccess: NpmAccess.PUBLIC,
  npmDistTag: 'latest',
  npmRegistryUrl: 'https://npm.pkg.github.com',
  minNodeVersion: `${nodeVersion}.0.0`,
  workflowNodeVersion: nodeVersion.toString(),
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
  jsiiVersion,
  tsconfigDev: {
    compilerOptions: {
      outDir: 'dist',
    },
  },
  jestOptions: {
    jestVersion,
  },

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();
