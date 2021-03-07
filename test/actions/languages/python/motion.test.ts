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

  test("test line()", () => {
    // GIVEN
    const line = 1;
    const _lines = [
      "line 1",
      "line 2",
      "line 3"
    ];
    // Create the simplest duck-type that matches PythonDocument's use of
    // the passed in PythonDocument object
    const doc = {lineCount: 3, lineAt: (line: number) => {
      return {text: _lines[line]}}
    } as TextDocument;
    const pydoc = new PythonDocument(doc, line);

    // WHEN
    const text = pydoc.line;

    // THEN
    assert(text === _lines[1])
  })

  test("test inc()", () => {
    // GIVEN
    const line = 1;
    const _lines = [
      "line 1",
      "line 2",
      "line 3"
    ];
    // Create the simplest duck-type that matches PythonDocument's use of
    // the passed in PythonDocument object
    const doc = {lineCount: 3, lineAt: (line: number) => {
      return {text: _lines[line]}}
    } as TextDocument;
    const pydoc = new PythonDocument(doc, line);

    // WHEN: Starting at 2nd-last line attempt two .inc()
    const text_0 = pydoc.line;
    const flag_1 = pydoc.inc()
    const text_1 = pydoc.line;
    const flag_2 = pydoc.inc();
    const text_2 = pydoc.line;

    // THEN: First inc() succeeds next fails because of EoF
    assert(flag_1);
    assert(! flag_2);

    assert(text_0 === _lines[1]);
    assert(text_1 === _lines[2]);
    assert(text_2 === _lines[2]);
  })

  test("test dec()", () => {
    // GIVEN
    const line = 1;
    const _lines = [
      "line 1",
      "line 2",
      "line 3"
    ];
    // Create the simplest duck-type that matches PythonDocument's use of
    // the passed in PythonDocument object
    const doc = {lineCount: 3, lineAt: (line: number) => {
      return {text: _lines[line]}}
    } as TextDocument;
    const pydoc = new PythonDocument(doc, line);

    // WHEN: Starting at 2nd-last line attempt two .inc()
    const text_0 = pydoc.line;
    const flag_1 = pydoc.dec()
    const text_1 = pydoc.line;
    const flag_2 = pydoc.dec();
    const text_2 = pydoc.line;

    // THEN: First inc() succeeds next fails because of EoF
    assert(flag_1);
    assert(! flag_2);

    assert(text_0 === _lines[1]);
    assert(text_1 === _lines[0]);
    assert(text_2 === _lines[0]);
  })
});
