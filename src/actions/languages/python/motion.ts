import { Mode } from '../../../mode/mode';
import { RegisterAction } from '../../base';
import { TextEditor } from '../../../textEditor';
import { VimState } from '../../../state/vimState';
import { BaseMovement } from '../../baseMotion';
import { Position } from 'vscode';

// TODO: Remove
import { Logger } from '../../../util/logger';
const logger = Logger.get('motion');

export function foo(): String {
  return 'bar';
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
class MoveNextPythonMethodStart extends PythonForwardMovement {
  keys = [']', 'm'];
  pattern = /^\s*def /;
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
