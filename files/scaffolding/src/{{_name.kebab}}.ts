import { JsiiProject, JsiiProjectOptions } from 'projen/lib/cdk';
import { addFiles, loadSettings } from 'projen-project';

export interface {{_name.pascal}}Options extends JsiiProjectOptions {
}

export class {{_name.pascal}} extends JsiiProject {
  constructor(options: {{_name.pascal}}Options) {
    const { options: projectOpts, files } = loadSettings(options)
    super(projectOpts);
    addFiles(this, files);
    // Add non-templates resources here
  }
}
