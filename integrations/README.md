# Optional imaging research checkout

`ohif/` is a separately cloned OHIF workspace (https://github.com/OHIF/Viewers), commit `d493d1c`, version `3.14.0-beta.91`. Its dependencies were installed earlier with Node 24 and `corepack pnpm install --frozen-lockfile` using pnpm 12.8.1. It is excluded from Clinahir source control and not imported into the Vite build.

No PACS, DICOM ingestion, clinical viewer or real medical data integration is enabled. Future work needs a separately reviewed architecture, interoperability, data protection, authorization and clinical-use plan. The checkout contains its own dependency tree and upstream Git history; clone it independently when needed, rather than copying those files into the app bundle.
