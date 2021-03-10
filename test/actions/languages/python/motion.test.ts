import * as assert from 'assert';
import { Position, TextDocument } from 'vscode';
import { PythonDocument } from '../../../../src/actions/languages/python/motion';

suite('test PythonDocument lint functionality', () => {
  test('constructor', () => {
    // GIVEN
    const position = { line: 42, character: 0 } as Position;
    const doc_ = { lineCount: 139 } as TextDocument;

    // WHEN
    const pydoc = new PythonDocument(doc_, position);

    // THEN: Object construction succeeds
  });

  let _lines: string[];
  let doc: TextDocument;

  setup(() => {
    _lines = ['line 1', 'line 2', 'line 3'];
    // Create the simplest duck-type that matches PythonDocument's use of
    // the passed in PythonDocument object
    doc = {
      lineCount: _lines.length,
      lineAt: (line: number) => {
        return { text: _lines[line] };
      },
    } as TextDocument;
  });

  test('line()', () => {
    // GIVEN
    const position = { line: 1, character: 0 } as Position;
    const pydoc = new PythonDocument(doc, position);

    // WHEN
    const text = pydoc.line;

    // THEN
    assert(text === _lines[1]);
  });

  test('inc()', () => {
    // GIVEN
    const position = { line: 1, character: 0 } as Position;
    const pydoc = new PythonDocument(doc, position);

    // WHEN: Starting at 2nd-last line attempt two .inc()
    const text_0 = pydoc.line;
    const flag_1 = pydoc.inc();
    const text_1 = pydoc.line;
    const flag_2 = pydoc.inc();
    const text_2 = pydoc.line;

    // THEN: First inc() succeeds next fails because of EoF
    assert(flag_1);
    assert(!flag_2);

    assert(text_0 === _lines[1]);
    assert(text_1 === _lines[2]);
    assert(text_2 === _lines[2]);
  });

  test('dec()', () => {
    // GIVEN
    const position = { line: 1, character: 0 } as Position;
    const pydoc = new PythonDocument(doc, position);

    // WHEN: Starting at 2nd-last line attempt two .inc()
    const text_0 = pydoc.line;
    const flag_1 = pydoc.dec();
    const text_1 = pydoc.line;
    const flag_2 = pydoc.dec();
    const text_2 = pydoc.line;

    // THEN: First inc() succeeds next fails because of EoF
    assert(flag_1);
    assert(!flag_2);

    assert(text_0 === _lines[1]);
    assert(text_1 === _lines[0]);
    assert(text_2 === _lines[0]);
  });
});

suite('PythonDocument._isAhead', () => {
  let doc: TextDocument;

  setup(() => {
    doc = { lineCount: 0 } as TextDocument;
  });

  test('_isAhead true when current line > original', () => {
    // GIVEN
    const originalPosition = { line: 0, character: 0 } as Position;
    const pydoc = new PythonDocument(doc, originalPosition);

    pydoc._line = 1; // > original line
    pydoc._character = 0;

    // WHEN
    const result = pydoc._isAhead();

    // THEN
    assert(result);
  });

  test('_isAhead false when current line < original', () => {
    // GIVEN
    const originalPosition = { line: 2, character: 0 } as Position;
    const pydoc = new PythonDocument(doc, originalPosition);

    pydoc._line = 1; // < original line
    pydoc._character = 0;

    // WHEN
    const result = pydoc._isAhead();

    // THEN
    assert(!result);
  });

  test('_isAhead true when current line == original and current char > original', () => {
    // GIVEN
    const originalPosition = { line: 0, character: 1 } as Position;
    const pydoc = new PythonDocument(doc, originalPosition);

    pydoc._line = 0;
    pydoc._character = 2; // > original character

    // WHEN
    const result = pydoc._isAhead();

    // THEN
    assert(result);
  });

  test('_isAhead false when current line == original and current char < original', () => {
    // GIVEN
    const originalPosition = { line: 0, character: 2 } as Position;
    const pydoc = new PythonDocument(doc, originalPosition);

    pydoc._line = 0;
    pydoc._character = 1; // < original character

    // WHEN
    const result = pydoc._isAhead();

    // THEN
    assert(!result);
  });

  test('_isAhead false when current line == original and current char == original', () => {
    // GIVEN
    const originalPosition = { line: 0, character: 2 } as Position;
    const pydoc = new PythonDocument(doc, originalPosition);

    pydoc._line = 0;
    pydoc._character = 2; // == original character

    // WHEN
    const result = pydoc._isAhead();

    // THEN
    assert(!result);
  });
});

suite('PythonDocument._isBehind', () => {
  let doc: TextDocument;

  setup(() => {
    doc = { lineCount: 0 } as TextDocument;
  });

  test('_isBehind is false when current line > original', () => {
    // GIVEN
    const originalPosition = { line: 0, character: 0 } as Position;
    const pydoc = new PythonDocument(doc, originalPosition);

    pydoc._line = 1; // > original line
    pydoc._character = 0;

    // WHEN
    const result = pydoc._isBehind();

    // THEN
    assert(!result);
  });

  test('_isBehind is true when current line < original', () => {
    // GIVEN
    const originalPosition = { line: 2, character: 0 } as Position;
    const pydoc = new PythonDocument(doc, originalPosition);

    pydoc._line = 1; // < original line
    pydoc._character = 0;

    // WHEN
    const result = pydoc._isBehind();

    // THEN
    assert(result);
  });

  test('_isBehind is false when current line == original and current char > original', () => {
    // GIVEN
    const originalPosition = { line: 0, character: 1 } as Position;
    const pydoc = new PythonDocument(doc, originalPosition);

    pydoc._line = 0;
    pydoc._character = 2; // > original character

    // WHEN
    const result = pydoc._isBehind();

    // THEN
    assert(!result);
  });

  test('_isBehind is true when current line == original and current char < original', () => {
    // GIVEN
    const originalPosition = { line: 0, character: 2 } as Position;
    const pydoc = new PythonDocument(doc, originalPosition);

    pydoc._line = 0;
    pydoc._character = 1; // < original character

    // WHEN
    const result = pydoc._isBehind();

    // THEN
    assert(result);
  });

  test('_isBehind is false when current line == original and current char == original', () => {
    // GIVEN
    const originalPosition = { line: 0, character: 2 } as Position;
    const pydoc = new PythonDocument(doc, originalPosition);

    pydoc._line = 0;
    pydoc._character = 2; // == original character

    // WHEN
    const result = pydoc._isBehind();

    // THEN
    assert(!result);
  });
});

suite('PythonDocument._textIndentation', () => {
  test('indentation of line with none', () => {
    // GIVEN
    const line = "x = 42";

    // WHEN
    const indent = PythonDocument._textIndentation(line);

    // THEN
    assert(indent === 0);
  });

  test('indentation of line with 4 spaces', () => {
    // GIVEN
    const line = "    x = 42";

    // WHEN
    const indent = PythonDocument._textIndentation(line);

    // THEN
    assert(indent === 4);
  });

  test('indentation of line starting with a comment', () => {
    // GIVEN
    const line = "    # x = 42";

    // WHEN
    const indent = PythonDocument._textIndentation(line);

    // THEN
    assert(indent === null);
  });

  test('indentation of line containing only whitespace', () => {
    // GIVEN
    const line = "    ";

    // WHEN
    const indent = PythonDocument._textIndentation(line);

    // THEN
    assert(indent === null);
  })

  test('indentation of empty line', () => {
    // GIVEN
    const line = "";

    // WHEN
    const indent = PythonDocument._textIndentation(line);

    // THEN
    assert(indent === null);
  })
});

suite('PythonDocument.indentation', () => {
  let _lines: string[];
  let doc: TextDocument;

  setup(() => {
    _lines = [
      '    def foo():',
      '',
      '# comment starting at start of line',
      '        ',
      '        pass'
    ]

    doc = {
      lineCount: _lines.length,
      lineAt: (line: number) => {
        return { text: _lines[line] };
      }
    } as TextDocument;
  });

  test('line with indented code', () => {
    // GIVEN: Line of code with indentation
    const position = { line: 4, character: 0 } as Position;
    const pydoc = new PythonDocument(doc, position);

    // WHEN
    const indentation = pydoc.indentation();

    // THEN
    assert(indentation === 8);
  });

  test('empty line inside indented function', () => {
    // GIVEN: Line of code with indentation
    const position = { line: 1, character: 0 } as Position;
    const pydoc = new PythonDocument(doc, position);

    // WHEN
    const indentation = pydoc.indentation();

    // THEN
    assert(indentation === 4);
  });

  test('line starting with comment', () => {
    // GIVEN: Line of code with indentation
    const position = { line: 2, character: 8 } as Position;
    const pydoc = new PythonDocument(doc, position);

    // WHEN
    const indentation = pydoc.indentation();

    // THEN
    assert(indentation === 4);
  });

  test('line with only whitespace inside indented function', () => {
    // GIVEN: Line of code with indentation
    const position = { line: 3, character: 0 } as Position;
    const pydoc = new PythonDocument(doc, position);

    // WHEN
    const indentation = pydoc.indentation();

    // THEN
    assert(indentation === 4);
  });
});

suite('PythonDocument._isFunctionLine', () => {
  let _lines: string[];
  let doc: TextDocument;

  setup(() => {
    _lines = ['    def foo():', '        pass'];

    doc = {
      lineCount: _lines.length,
      lineAt: (line: number) => {
        return { text: _lines[line] };
      },
    } as TextDocument;
  });

  test('_isFunctionLine true, ._character updated', () => {
    // GIVEN
    const position = { line: 0, character: 7 } as Position;
    const pydoc = new PythonDocument(doc, position);

    // WHEN
    const result = pydoc._isFunctionLine();

    // THEN
    assert(result);
    assert(pydoc._character === 4);
  });

  test('_isFunctionLine false', () => {
    // GIVEN
    const position = { line: 1, character: 7 } as Position;
    const pydoc = new PythonDocument(doc, position);

    // WHEN
    const result = pydoc._isFunctionLine();

    // THEN
    assert(!result);
  });
});

suite('PythonDocument find function functionality', () => {
  let _lines: string[];
  let doc: TextDocument;

  setup(() => {
    _lines = [
      "'''Module docstring.'''",
      '',
      'def first(x, y):',
      '# a mis-placed comment',
      '    pass',
      '',
      'p = 42',
      '',
      'def second(a, b):',
      '',
      '    def inner():',
      '        pass',
    ];

    doc = {
      lineCount: _lines.length,
      lineAt: (line: number) => {
        return { text: _lines[line] };
      },
    } as TextDocument;
  });

  test('valid findNextFunctionStart, start of file', () => {
    // GIVEN
    const position = { line: 0, character: 0 } as Position;
    const pydoc = new PythonDocument(doc, position);

    // WHEN
    const new_position = pydoc.findNextFunctionStart();

    // THEN
    assert(new_position !== null);
    assert(new_position.line === 2);
    assert(new_position.character === 0);
  });

  test('valid findNextFunctionStart, past outer function', () => {
    // GIVEN
    const position = { line: 8, character: 2 } as Position;
    const pydoc = new PythonDocument(doc, position);

    // WHEN
    const new_position = pydoc.findNextFunctionStart();

    // THEN
    assert(new_position !== null);
    assert(new_position.line === 10);
    assert(new_position.character === 4);
  });

  test('Invalid findNextFunctionStart, past last function', () => {
    // GIVEN
    const position = { line: 10, character: 6 } as Position;
    const pydoc = new PythonDocument(doc, position);

    // WHEN
    const new_position = pydoc.findNextFunctionStart();

    // THEN
    assert(new_position === null);
  });

  test('valid findPrevFunctionStart, middle of function', () => {
    // GIVEN
    const position = { line: 3, character: 8 } as Position;
    const pydoc = new PythonDocument(doc, position);

    // WHEN
    const new_position = pydoc.findPrevFunctionStart();

    // THEN
    assert(new_position !== null);
    assert(new_position.line === 2);
    assert(new_position.character === 0);
  });

  test('valid findPrevFunctionStart, start of inner function', () => {
    // GIVEN
    const position = { line: 10, character: 4 } as Position;
    const pydoc = new PythonDocument(doc, position);

    // WHEN
    const new_position = pydoc.findPrevFunctionStart();

    // THEN
    assert(new_position !== null);
    assert(new_position.line === 8);
    assert(new_position.character === 0);
  });

  test('invalid findPrevFunctionStart, above first function', () => {
    // GIVEN
    const position = { line: 0, character: 7 } as Position;
    const pydoc = new PythonDocument(doc, position);

    // WHEN
    const new_position = pydoc.findPrevFunctionStart();

    // THEN
    assert(new_position === null);
  });
});

suite('PythonDocument find class functionality', () => {
  let _lines: string[];
  let doc: TextDocument;

  setup(() => {
    _lines = [
      "'''Module docstring.'''",
      '',
      'class First:',
      '# a mis-placed comment',
      '    def __init__(self):',
      '        pass',
      '',
      'p = 42',
      '',
      'class Second:',
      '',
      '    def __init__(self):',
      '        pass',
      '',
      '    class Inner:',
      '        def __init__(self):',
      '            pass',
    ];

    doc = {
      lineCount: _lines.length,
      lineAt: (line: number) => {
        return { text: _lines[line] };
      },
    } as TextDocument;
  });

  test('valid findNextClassStart, start of file', () => {
    // GIVEN
    const position = { line: 0, character: 0 } as Position;
    const pydoc = new PythonDocument(doc, position);

    // WHEN
    const new_position = pydoc.findNextClassStart();

    // THEN
    assert(new_position !== null);
    assert(new_position.line === 2);
    assert(new_position.character === 0);
  });

  test('valid findNextClassStart, past first class', () => {
    // GIVEN
    const position = { line: 8, character: 2 } as Position;
    const pydoc = new PythonDocument(doc, position);

    // WHEN
    const new_position = pydoc.findNextClassStart();

    // THEN
    assert(new_position !== null);
    assert(new_position.line === 9);
    assert(new_position.character === 0);
  });

  test('valid findNextClassStart, past second outer class', () => {
    // GIVEN
    const position = { line: 9, character: 3 } as Position;
    const pydoc = new PythonDocument(doc, position);

    // WHEN
    const new_position = pydoc.findNextClassStart();

    // THEN
    assert(new_position !== null);
    assert(new_position.line === 14);
    assert(new_position.character === 4);
  });

  test('Invalid findNextClassStart, past last class', () => {
    // GIVEN
    const position = { line: 14, character: 6 } as Position;
    const pydoc = new PythonDocument(doc, position);

    // WHEN
    const new_position = pydoc.findNextClassStart();

    // THEN
    assert(new_position === null);
  });
});
