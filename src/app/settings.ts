/*
 * Copyright (c) 2026 dmi3
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { TextContainerProperty } from '@evenrealities/even_hub_sdk';
import {
  CYCLES_DESC,
  DPS_DESC,
  INTRO_DESC,
  LENGTH_DESC,
  MATRIX,
  MATRIX_TEXT_ID,
  MAX,
  MENU_HEIGHT,
  MENU_TEXT_ID,
  MENU_WIDTH,
  MIN,
  MONO_SPACE,
  NUM_OPTION,
  OPTIONS,
  OPTIONS_TOOLTIP,
  OPTIONS_TOOLTIP_RESTART,
  PADDING,
  RIGHT_X_POS,
  SETTING_TEXT_ID,
  SETTINGS_TOOLTIP,
  SPEED_DESC,
  TOOLTIP_TEXT_ID,
  VIEW,
  Y_POS,
} from '../utils/consts.ts';
import type { Container, NumericOptionType, Page } from '../utils/types.ts';
import PageController from './page-controller.ts';
import Core from './core.ts';
import Model from './model.ts';
import { round } from '../utils/utils.ts';
import MatrixRain from './matrix-rain.ts';

export default class Settings extends PageController {
  readonly name: Page = 'settings';

  inMenu = true;
  optionIndex = 0;

  private _menuContainer = new TextContainerProperty({
    xPosition: 1,
    yPosition: Y_POS,
    width: MENU_WIDTH,
    height: MENU_HEIGHT,
    containerID: MENU_TEXT_ID,
    borderWidth: 2,
    borderColor: 1,
    paddingLength: PADDING,
    content: this.menuString,
    isEventCapture: 0,
    containerName: 'menu',
  });

  private _settingContainer = new TextContainerProperty({
    xPosition: RIGHT_X_POS,
    yPosition: Y_POS,
    width: VIEW.width - RIGHT_X_POS,
    height: MENU_HEIGHT,
    containerID: SETTING_TEXT_ID,
    borderWidth: 2,
    borderColor: 1,
    paddingLength: PADDING,
    content: ' ',
    isEventCapture: 0,
    containerName: 'description',
  });

  private _matrixContainer = new TextContainerProperty({
    xPosition: 0,
    yPosition: 0,
    width: VIEW.width,
    height: VIEW.height,
    content: this.matrixString,
    containerID: MATRIX_TEXT_ID,
    isEventCapture: 0,
  });

  private _tooltipContainer = new TextContainerProperty({
    xPosition: 0,
    yPosition: Y_POS + MENU_HEIGHT,
    width: VIEW.width,
    height: 50,
    paddingLength: PADDING,
    content: ' ',
    containerID: TOOLTIP_TEXT_ID,
    isEventCapture: 0,
  });

  _cachedPage: Partial<Container> = {
    createHiddenController: true,
    textObject: [
      this._menuContainer,
      this._settingContainer,
      this._tooltipContainer,
      this._matrixContainer,
    ],
  };

  private static _inst: Settings;
  public static get inst(): Settings {
    if (!Settings._inst) Settings._inst = new Settings();
    return Settings._inst;
  }
  private constructor() {
    super();
  }

  get option() {
    return OPTIONS[this.optionIndex];
  }

  get menuString() {
    return OPTIONS.map((o, i) =>
      i === this.optionIndex ? `・${o}・` : `${MONO_SPACE}${o}`,
    ).join('\n');
  }

  get matrixString() {
    if (this.optionIndex !== 0) return ' ';
    return Model.state.fullScreenBuffer
      .map((c, i) =>
        // replacing first 6 characters in each row with empty space
        // to clear up where menu shows up
        // and clearing last row for tooltips
        i % MATRIX.width < 6 || i > MATRIX.width * (MATRIX.height - 1)
          ? MONO_SPACE
          : c,
      )
      .join('');
  }

  get settingString() {
    switch (this.optionIndex) {
      case 1:
        return `Drops per second: ${this.state.dps} ${DPS_DESC}`;
      case 2:
        return `Speed: ${this.state.speed} ${SPEED_DESC}`;
      case 3:
        return `Drop max length: ${this.state.maxLength} ${LENGTH_DESC} ${this.state.maxLength}.`;
      case 4:
        return `Drop max cycles: ${this.state.maxCycles} ${CYCLES_DESC} ${this.state.maxCycles}.`;
      case 5:
        return `Intro enabled: ${this.state.isPlayIntro ? 'Yes' : 'No'} ${INTRO_DESC}`;
      default:
        return '';
    }
  }

  async rebuildPage() {
    this.updateCachedPage();
    return super.rebuildPage();
  }

  updateCachedPage() {
    this._matrixContainer.content = this.matrixString;
    this._menuContainer.content = this.menuString;
    this._settingContainer.content = this.settingString;
    this._tooltipContainer.content = this.inMenu
      ? this.optionIndex
        ? OPTIONS_TOOLTIP
        : OPTIONS_TOOLTIP_RESTART
      : SETTINGS_TOOLTIP;

    // updating active border to indicate which container is active
    this._menuContainer.borderColor = this.inMenu ? 2 : 0;
    const settingMult = this.optionIndex === 0 ? 0 : 1;
    this._settingContainer.borderColor = (this.inMenu ? 0 : 2) * settingMult;
  }

  update() {
    if (this.inMenu) {
      this.updateText(MENU_TEXT_ID, this.menuString);
      if (this.optionIndex < 2 || this.optionIndex === OPTIONS.length - 1) {
        // this.updateText(MATRIX_TEXT_ID, this.matrixString);
        this.rebuildPage();
      }
    }
    this.updateText(SETTING_TEXT_ID, this.settingString);
  }

  onClick = () => {
    if (this.option === 'restart') {
      Core.inst.goBack();
      MatrixRain.inst.restart();
    } else {
      // switching focus/control between menu and setting
      this.inMenu = !this.inMenu;
      this.rebuildPage();
    }
  };

  onScrollUp = () => {
    if (this.inMenu) {
      this.optionIndex =
        (this.optionIndex - 1 + OPTIONS.length) % OPTIONS.length;
    } else {
      switch (this.optionIndex) {
        case 1:
        case 2:
        case 3:
        case 4:
          this._increaseNumValue(NUM_OPTION[this.optionIndex]);
          break;
        case 5:
          this.state.isPlayIntro = !this.state.isPlayIntro;
          break;
        default:
          break;
      }
    }
    this.update();
  };

  onScrollDown = () => {
    if (this.inMenu) {
      this.optionIndex = (this.optionIndex + 1) % OPTIONS.length;
    } else {
      switch (this.optionIndex) {
        case 1:
        case 2:
        case 3:
        case 4:
          this._decreaseNumValue(NUM_OPTION[this.optionIndex]);
          break;
        case 5:
          this.state.isPlayIntro = !this.state.isPlayIntro;
          break;
        default:
          break;
      }
    }
    this.update();
  };

  private _increaseNumValue(valueType: NumericOptionType) {
    let value = Model.state[valueType];
    const hasDecimals = MIN[valueType] < 1 && MIN[valueType] > 0;
    if (hasDecimals && value < 1) {
      value = round(value + 0.1, 1);
    } else {
      value = Math.floor(value + 1);
    }
    Model.state[valueType] = Math.max(
      MIN[valueType],
      Math.min(MAX[valueType], value),
    );
  }

  private _decreaseNumValue(valueType: NumericOptionType) {
    let value = Model.state[valueType];
    const hasDecimals = MIN[valueType] < 1 && MIN[valueType] > 0;
    if (hasDecimals && value < 1.1) {
      value = round(value - 0.1, 1);
    } else {
      value = Math.floor(value - 1);
    }
    Model.state[valueType] = Math.max(
      MIN[valueType],
      Math.min(MAX[valueType], value),
    );
  }
}
