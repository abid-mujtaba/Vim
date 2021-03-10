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
    return this.lineAt(this._line);
  }

  lineAt(line_number: number): string {
    return this._document.lineAt(line_number).text;
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

  // Use PythonDocument instance to move to specified class boundary
  static moveClassBoundary(
    document: TextDocument,
    position: Position,
    forward: boolean,
    start: boolean
  ): Position {
    switch (start) {
      case true:
        switch (forward) {
          case true:
            return new this(document, position).findNextClassStart() || position;
          case false:
            return new this(document, position).findPrevClassStart() || position;
        }
    }

    // TODO: Remove default value when all cases have been specified
    return position;
  }

  // Is the current position ahead of the original position
  _isAhead(): boolean {
    if (this._line < this._originalLine) {
      return false;
    }

    if (this._line > this._originalLine) {
      return true;
    }

    return this._character > this._originalCharacter;
  }

  // Is the current position behind the original position
  // Because of the requirement that two equal positions NOT be considered
  // ahead or behind this is NOT the boolean negation of _isAhead()
  _isBehind(): boolean {
    if (this._line === this._originalLine) {
      return this._character < this._originalCharacter;
    }

    return !this._isAhead();
  }

  _isConstructLine(pattern: RegExp): boolean {
    const index = this.line.search(pattern);

    if (index >= 0) {
      this._character = index; // Move to start of construct
      return true;
    }

    return false;
  }

  _isFunctionLine(): boolean {
    return this._isConstructLine(/(?<=\s*)def .+/);
  }

  _isClassLine(): boolean {
    return this._isConstructLine(/(?<=\s*)class .+/);
  }

  /*
   * Find the next start of the specified construct.
   * The passed in isConstruct method (bound to the object) is used to determine if
   * a line contains the construct.
   */
  _findNextConstructStart(isConstruct: () => boolean): Position | null {
    while (!(isConstruct() && this._isAhead())) {
      if (!this.inc()) {
        return null;
      }
    }

    return new Position(this._line, this._character);
  }

  findNextFunctionStart(): Position | null {
    return this._findNextConstructStart(this._isFunctionLine.bind(this));
  }

  findNextClassStart(): Position | null {
    return this._findNextConstructStart(this._isClassLine.bind(this));
  }

  _findPrevConstructStart(isConstruct: () => boolean): Position | null {
    while (!(isConstruct() && this._isBehind())) {
      if (!this.dec()) {
        return null;
      }
    }

    return new Position(this._line, this._character);
  }

  findPrevFunctionStart(): Position | null {
    return this._findPrevConstructStart(this._isFunctionLine.bind(this));
  }

  findPrevClassStart(): Position | null {
    return this._findPrevConstructStart(this._isClassLine.bind(this));
  }

  static _textIndentation(line: string): number | null {
    const index: number = line.search(/\S/);

    // Return null if line is empty, just whitespace, or starts with a comment
    if (index === -1 || line[index] === '#') {
      return null;
    }

    return index;
  }

  indentation(): number {
    let line_number: number = this._line;
    let _indentation: number | null;

    do {
      _indentation = PythonDocument._textIndentation(this.lineAt(line_number));

    } while(! _indentation && line_number-- >= 0);  // Find indentation or top of file

    return _indentation || 0;
  }

  findCurrentFunctionStart(): Position | null {
    return null;
  }
}

// Uses the specified findFunction to execute the motion coupled to the shortcut (keys)
abstract class BasePythonMovement extends BaseMovement {
  findFunction: string;

  public async execAction(position: Position, vimState: VimState): Promise<Position> {
    const document = vimState.document;
    switch (document.languageId) {
      case 'python':
        return new PythonDocument(document, position)[this.findFunction]() || position;

      default:
        return position;
    }
  }
}

@RegisterAction
class MovePythonNextFunctionStart extends BasePythonMovement {
  keys = [']', 'm'];
  findFunction = 'findNextFunctionStart';
}

@RegisterAction
class MovePythonPrevFunctionStart extends BasePythonMovement {
  keys = ['[', 'm'];
  findFunction = 'findPrevFunctionStart';
}
