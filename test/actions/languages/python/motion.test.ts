import * as assert from 'assert';
import { TextDocument } from 'vscode';
import { PythonDocument } from '../../../../src/actions/languages/python/motion';

suite("test PythonDocument", () => {
  test("test constructor", () => {
    // GIVEN
    const line = 42;
    const doc = {lineCount: 139} as TextDocument;

    // WHEN
    const pydoc = new PythonDocument(doc, line);

    // THEN: Object construction succeeds
  });
});
