import { Mode } from '../../mode/mode';
import { RegisterAction } from '../base';
import { TextEditor } from '../../textEditor';
import { VimState } from '../../state/vimState';
import { BaseMovement } from '../baseMotion';
import { Position } from 'vscode';

abstract class BasePythonMovement extends BaseMovement {
  modes = [Mode.Normal, Mode.Visual, Mode.VisualLine];
  abstract pattern: RegExp;
  isJump = true;
}

export abstract class PythonForwardMovement extends BasePythonMovement {
  public async execAction(position: Position, vimState: VimState): Promise<Position> {
    if (vimState.document.languageId !== 'python') {
      return position;
    }

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

export abstract class PythonBackwardMovement extends BasePythonMovement {
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
