import { typescript } from 'projen';
import { addFiles, loadSettings } from './core';

export interface ProjenProjectOptions extends typescript.TypeScriptProjectOptions {
}

/**
 * Projen for a projen project template
 *
 * @pjid projen
 */
export class ProjenProject extends typescript.TypeScriptProject {
  constructor(options: ProjenProjectOptions) {
    const { options: projectOpts, files } = loadSettings(options);
    super(projectOpts);
    // Files from templates
    addFiles(this, files);
  }
}
