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

import {
  TextContainerProperty,
  TextContainerUpgrade,
} from '@evenrealities/even_hub_sdk';
import {
  CYCLES_DESC,
  DESC_TEXT_ID,
  DPS_DESC,
  EDIT_TEXT_ID,
  INTRO_DESC,
  LENGTH_DESC,
  MATRIX,
  MATRIX_TEXT_ID,
  MENU_TEXT_ID,
  MONO_SPACE,
  SPEED_DESC,
  VIEW,
} from '../utils/consts.ts';
import type { Container, Page } from '../utils/types.ts';
import PageController from './page-controller.ts';
import Core from './core.ts';
import Model from './model.ts';
import { toMonospace } from '../utils/utils.ts';
import MatrixRain from './matrix-rain.ts';

const MENU_WIDTH = 115;
const MENU_HEIGHT = 187;
const Y_POS = Math.round(VIEW.height / 2 - MENU_HEIGHT / 2);
const RIGHT_X_POS = MENU_WIDTH + 20;

const OPTIONS = ['restart', 'dps', 'speed', 'length', 'cycles', 'intro'];

const TITLES = [
  ' ',
  toMonospace('drops per second'),
  toMonospace('speed'),
  toMonospace('drop max length'),
  toMonospace('drop max cycles'),
  toMonospace('skip intro'),
];

const DESC = [
  ' ',
  DPS_DESC,
  SPEED_DESC,
  LENGTH_DESC,
  CYCLES_DESC,
  INTRO_DESC,
  // RESTART_DESC,
];

export default class Settings extends PageController {
  readonly name: Page = 'settings';

  optionIndex = 0;

  _cachedPage: Partial<Container> = {
    createHiddenController: true,
    textObject: [
      new TextContainerProperty({
        xPosition: 0,
        yPosition: 0,
        width: VIEW.width,
        height: VIEW.height,
        content: this.bufferString,
        containerID: MATRIX_TEXT_ID,
        isEventCapture: 0,
      }),
      new TextContainerProperty({
        xPosition: 1,
        yPosition: Y_POS,
        width: MENU_WIDTH,
        height: MENU_HEIGHT,
        containerID: MENU_TEXT_ID,
        borderWidth: 2,
        borderColor: 2,
        paddingLength: 8,
        content: this.optionsString,
        isEventCapture: 0,
        containerName: 'menu',
      }),
      new TextContainerProperty({
        xPosition: RIGHT_X_POS,
        yPosition: 0,
        width: VIEW.width - RIGHT_X_POS,
        height: VIEW.height - Y_POS,
        containerID: DESC_TEXT_ID,
        content: ' ',
        isEventCapture: 0,
        containerName: 'description',
      }),
      new TextContainerProperty({
        xPosition: RIGHT_X_POS,
        yPosition: VIEW.height - 100,
        width: VIEW.width - RIGHT_X_POS,
        height: 50,
        containerID: EDIT_TEXT_ID,
        content: ' value edit ',
        isEventCapture: 0,
        containerName: 'value-edit',
      }),
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

  get optionsString() {
    return OPTIONS.map((o, i) =>
      i === this.optionIndex ? `・${o}・` : `${MONO_SPACE}${o}`,
    ).join('\n');
  }

  get bufferString() {
    this.log(this.option);
    if (this.optionIndex !== 0) return ' ';
    return Model.state.fullScreenBuffer
      .map((c, i) =>
        // replacing all the first characters in each row with empty space
        // to clear up where menu shows up
        i % MATRIX.width < 6 ? MONO_SPACE : c,
      )
      .join('');
  }

  async rebuildPage() {
    this.updateCachedPage();
    return super.rebuildPage();
  }

  updateCachedPage() {
    this._cachedPage.textObject?.forEach((c, i) => {
      if (i === 0) c.content = this.bufferString;
      else if (i === 1) c.content = this.optionsString;
    });
  }

  update() {
    this.bridge.textContainerUpgrade(
      new TextContainerUpgrade({
        containerID: MENU_TEXT_ID,
        content: this.optionsString,
      }),
    );
    if (
      this.optionIndex === 0 ||
      this.optionIndex === 1 ||
      this.optionIndex === OPTIONS.length - 1
    ) {
      this.bridge.textContainerUpgrade(
        new TextContainerUpgrade({
          containerID: MATRIX_TEXT_ID,
          content: this.bufferString,
        }),
      );
    }
    this.bridge.textContainerUpgrade(
      new TextContainerUpgrade({
        containerID: DESC_TEXT_ID,
        content: TITLES[this.optionIndex] + DESC[this.optionIndex],
      }),
    );
  }

  onClick = () => {
    this.log('clicked', this.option);
    switch (this.option) {
      case 'restart':
        Core.inst.goBack();
        MatrixRain.inst.restart();
        break;
      // case 'dps':
      //   break;
      // case 'speed':
      //   break;
      // case 'max length':
      //   break;
      // case 'max cycles':
      //   break;
      // case 'skip intro':
      //   break;
      default:
        break;
    }
  };

  onScrollDown = () => {
    this.optionIndex = (this.optionIndex + 1) % OPTIONS.length;
    this.log('onScrollDown', this.optionIndex);
    this.update();
  };

  onScrollUp = () => {
    this.optionIndex = (this.optionIndex - 1 + OPTIONS.length) % OPTIONS.length;
    this.log('onScrollDown', this.optionIndex);
    this.update();
  };
}
