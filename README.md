# projen-project
This is a projen template for creating other projen templates.


## Usage

### Creating a new projen template repo
```
npx projen new \
  --from @rlmartin-projen/projen-project \
  --projenrc-ts
```


### Terminology: scaffolding vs generated
When creating a new projen project template, it is best to be clear about which files are generated once vs which are under control of the template.


#### Scaffolding
Scaffolding files are generated only once - at the time of project creation - and from that point forward are the responsibility of the developer. These can be edited freely and will never get overwritten by projen.


#### Generated
Generated files should never be touched by the developer, because the projen template will overwrite any changes. This is indicated even down to the the level of the filesystem, because generated files are marked as read-only. While developers can change those permissions, this is not advised because the subsequent run of `npx projen` will discard any manual edits made to those files.


### Adding simple template files
Template files that are either static or use simple parameterization can be placed in either the `files/scaffolding` or `files/generated` folders. 

Files with a `.liquid` extension will be run through the [Liquid](https://shopify.github.io/liquid/) templating engine, with project-level options passed into the engine. 

Files with any other extension will be copied as-is into the project.

Template file names are also run through the templating engine, and can thus include dynamic naming.


#### Convenience properties
For some commonly-used string properties, a convenience property is automatically injected and accessible for use in templates. These all begin with an underscore (`_`) and include sub-properties for common string formats: `camel`, `kebab`, `pascal`, `snake`, `title`. The currently-supported convenience properties are:

- `_name`
