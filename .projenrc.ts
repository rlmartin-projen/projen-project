import { typescript } from 'projen';
import { NpmAccess } from 'projen/lib/javascript';

const dependencies = ['projen@^0'];
const bundledDependencies = ['liquidjs@^9'];
const majorVersion = 0;

const project = new typescript.TypeScriptProject({
  authorName: 'Ryan Martin',
  authorEmail: 'rlmartin@gmail.com',
  defaultReleaseBranch: 'main',
  name: '@rlmartin-projen/projen-project',
  repository: 'git@github.com:rlmartin/projen-project.git',
  projenrcTs: true,
  releaseToNpm: true,
  npmAccess: NpmAccess.PUBLIC,
  majorVersion,
  releaseBranches: {
    dev: { prerelease: 'dev', npmDistTag: 'dev', majorVersion },
  },
  deps: dependencies.concat(bundledDependencies),
  peerDeps: dependencies,

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();