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
  CreateStartUpPageContainer,
  EvenAppBridge,
  TextContainerProperty,
  TextContainerUpgrade,
  waitForEvenAppBridge,
} from '@evenrealities/even_hub_sdk';
import { MONO_MATRIX_CHARS, VIEW } from '../utils/consts.ts';

export default class AppController {
  private static _inst: AppController;
  public static get inst(): AppController {
    if (!AppController._inst) AppController._inst = new AppController();
    return AppController._inst;
  }

  private _bridge?: EvenAppBridge;

  private constructor() {}

  initMainPage = async () => {
    this._bridge = await waitForEvenAppBridge();

    const pageContainer = new CreateStartUpPageContainer({
      containerTotalNum: 2,
      textObject: [
        new TextContainerProperty({
          xPosition: 1,
          yPosition: 1,
          width: VIEW.WIDTH - 1,
          height: VIEW.HEIGHT - 1,
          borderWidth: 0,
          borderColor: 0,
          paddingLength: 0,
          containerID: 1,
          content: ' ',
          isEventCapture: 0,
          borderRadius: 0,
        }),
        new TextContainerProperty({
          xPosition: 1,
          yPosition: 1,
          width: VIEW.WIDTH - 1,
          height: VIEW.HEIGHT - 1,
          borderWidth: 0,
          borderColor: 0,
          paddingLength: 0,
          containerID: 11,
          content: ' ',
          isEventCapture: 1,
          borderRadius: 0,
        }),
      ],
    });

    await this._bridge.createStartUpPageContainer(pageContainer);
  };

  run = async () => {
    if (!this._bridge) {
      console.error('Brdige not initialized');
      return;
    }

    await this._bridge.textContainerUpgrade(
      new TextContainerUpgrade({
        containerID: 1,
        content: MONO_MATRIX_CHARS,
      }),
    );
  };
}
