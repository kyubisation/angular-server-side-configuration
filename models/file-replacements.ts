export interface LegacyFileReplacement {
  src: string;
  replaceWith: string;
}

export interface FileReplacement {
  replace: string;
  with: string;
}

export interface FileReplacements extends Array<FileReplacement | LegacyFileReplacement> {
}
