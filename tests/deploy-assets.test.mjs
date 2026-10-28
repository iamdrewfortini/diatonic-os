import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('node 1 deployment serves the exact showcase sources', async () => {
  for (const file of ['index.html', 'style.css', 'app.mjs', 'core.mjs']) {
    assert.deepEqual(await readFile(new URL('../deploy/showcase/assets/' + file, import.meta.url)), await readFile(new URL('../showcase/' + file, import.meta.url)), file);
  }
});
