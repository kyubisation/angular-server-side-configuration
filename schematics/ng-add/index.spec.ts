import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { join } from 'path';

describe('ng-add', () => {
  const collectionPath = join(__dirname, '../collection.json');

  it('works', () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = runner.runSchematic('ng-add', {}, Tree.empty());

    expect(tree.files).toEqual([]);
  });
});
