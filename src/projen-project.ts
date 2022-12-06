import { cdk } from 'projen';
import { addFiles, loadSettings } from './core';

export interface ProjenProjectOptions extends cdk.JsiiProjectOptions {
}

/**
 * Projen for a projen project template
 *
 * @pjid projen
 */
export class ProjenProject extends cdk.JsiiProject {
  constructor(options: ProjenProjectOptions) {
    const { options: projectOpts, files } = loadSettings(options, true);
    super(projectOpts);
    // Files from templates
    addFiles(this, files);
  }
}
