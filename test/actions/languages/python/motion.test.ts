import * as assert from 'assert';
import { Position, TextDocument } from 'vscode';
import { execPythonSectionMotion, PythonDocument } from '../../../../src/actions/languages/python/motion';

suite("test PythonDocument lint functionality", () => {
  test("test constructor", () => {
    // GIVEN
    const position = {line: 42, character: 0} as Position;
    const doc = {lineCount: 139} as TextDocument;

    // WHEN
    const pydoc = new PythonDocument(doc, position);

    // THEN: Object construction succeeds
  });

  let _lines: string[];
  let doc: TextDocument;

  setup(() => {
    _lines = [
      "line 1",
      "line 2",
      "line 3"
    ];
    // Create the simplest duck-type that matches PythonDocument's use of
    // the passed in PythonDocument object
    doc = {lineCount: 3, lineAt: (line: number) => {
      return {text: _lines[line]}}
    } as TextDocument;
  });

  test("test line()", () => {
    // GIVEN
    const position = {line: 1, character: 0} as Position;
    const pydoc = new PythonDocument(doc, position);

    // WHEN
    const text = pydoc.line;

    // THEN
    assert(text === _lines[1])
  })

  test("test inc()", () => {
    // GIVEN
    const position = {line: 1, character: 0} as Position;
    const pydoc = new PythonDocument(doc, position);

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
    const position = {line: 1, character: 0} as Position;
    const pydoc = new PythonDocument(doc, position);

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
  });
});


suite("Test PythonDocument find functionality", () => {

  let _lines: string[];
  let doc: TextDocument;

  setup(() => {
    _lines = [
      "'''Module docstring.'''",
      "",
      "def first(x, y):",
      "# a mis-placed comment",
      "    pass",
      "",
      "p = 42",
      "",
      "def second(a, b):",
      "",
      "    def inner():",
      "        pass"
    ];

    doc = {lineCount: 12, lineAt: (line: number) => {
      return {text: _lines[line]}}
    } as TextDocument;
  });

  test("test findNextFunctionStart", () => {
    // GIVEN
    const position = {line: 0, character: 0} as Position;
    const pydoc = new PythonDocument(doc, position);

    // WHEN
    const new_position = pydoc.findNextFunctionStart();

    // THEN
    assert(new_position.line === 2);
    assert(new_position.char === 0);
  });
});
