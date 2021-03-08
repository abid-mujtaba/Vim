import { Mode } from '../../../mode/mode';
import { RegisterAction } from '../../base';
import { TextEditor } from '../../../textEditor';
import { VimState } from '../../../state/vimState';
import { BaseMovement } from '../../baseMotion';
import { Position } from 'vscode';

// TODO: Remove
import { Logger } from '../../../util/logger';
import { TextDocument } from 'vscode';
const logger = Logger.get('motion');

/*
 * Utility class used to parse the lines in the document and
 * determine class and function boundaries
 */
export class PythonDocument {
  _document: TextDocument;
  _originalLine: number;
  _originalCharacter: number;
  _line: number;
  _character: number;
  _last: number;

  constructor(document: TextDocument, position: Position) {
    this._document = document;

    this._line = this._originalLine = position.line;
    this._character = this._originalCharacter = position.character;

    this._last = document.lineCount - 1; // Position of last line in document
  }

  get line(): string {
    return this._document.lineAt(this._line).text;
  }

  dec(): boolean {
    if (this._line > 0) {
      this._line--;
      return true;
    }

    return false;
  }

  inc(): boolean {
    if (this._line < this._last) {
      this._line++;
      return true;
    }

    return false;
  }

  _isAhead(): boolean {
    if (this._line < this._originalLine) {
      return false;
    }

    if (this._line > this._originalLine) {
      return true;
    }

    return this._character > this._originalCharacter;
  }

  _isFunctionLine(): boolean {
    // return !! this.line.match(/\s*def .+/);
    const index = this.line.search(/(?<=\s*)def .+/);

    if (index >= 0) {
      this._character = index; // Move to start of function
      return true;
    }

    return false;
  }

  findNextFunctionStart(): Position | null {
    while (!(this._isFunctionLine() && this._isAhead())) {
      if (!this.inc()) {
        return null;
      }
    }

    return new Position(this._line, this._character);
  }
}

abstract class BasePythonMovement extends BaseMovement {
  modes = [Mode.Normal, Mode.Visual, Mode.VisualLine];
  abstract pattern: RegExp;
  isJump = true;
}

abstract class PythonForwardMovement extends BasePythonMovement {
  public async execAction(position: Position, vimState: VimState): Promise<Position> {
    if (vimState.document.languageId !== 'python') {
      return position;
    }

    // TODO: Remove
    logger.warn(`Cursor is on line ${position.line} and characer ${position.character}`);

    let line = position.line;

    do {
      if (line === vimState.document.lineCount - 1) {
        return position;
      }

      line++;
    } while (!vimState.document.lineAt(line).text.match(this.pattern));

    return TextEditor.getFirstNonWhitespaceCharOnLine(vimState.document, line);
  }
}

abstract class PythonBackwardMovement extends BasePythonMovement {
  public async execAction(position: Position, vimState: VimState): Promise<Position> {
    if (vimState.document.languageId !== 'python') {
      return position;
    }

    let line = position.line;

    do {
      if (line === 0) {
        return position;
      }

      line--;
    } while (!vimState.document.lineAt(line).text.match(this.pattern));

    return TextEditor.getFirstNonWhitespaceCharOnLine(vimState.document, line);
  }
}

@RegisterAction
class MovePythonNextFunctionStart extends BaseMovement {
  keys = [']', 'm'];

  public async execAction(position: Position, vimState: VimState): Promise<Position> {
    const document = vimState.document;
    switch (document.languageId) {
      case 'python':
        return new PythonDocument(document, position).findNextFunctionStart() || position;

      default:
        return position;
    }
  }
}

@RegisterAction
class MovePrevPythonMethodStart extends PythonBackwardMovement {
  keys = ['[', 'm'];
  pattern = /^\s*def /;
}

export async function execPythonSectionMotion(
  forward: boolean,
  start: boolean,
  position: Position,
  vimState: VimState
) {
  if (forward) {
    return execPythonSectionForwardAction(position, vimState);
  } else {
    return execPythonSectionBackwardAction(position, vimState);
  }
}

async function execPythonSectionForwardAction(
  position: Position,
  vimState: VimState
): Promise<Position> {
  class MoveNextPythonClassStart extends PythonForwardMovement {
    keys = [];
    pattern = /^\s*class/;
  }

  return new MoveNextPythonClassStart().execAction(position, vimState);
}

async function execPythonSectionBackwardAction(
  position: Position,
  vimState: VimState
): Promise<Position> {
  class MovePrevPythonClassStart extends PythonBackwardMovement {
    keys = [];
    pattern = /^\s*class/;
  }

  return new MovePrevPythonClassStart().execAction(position, vimState);
}
