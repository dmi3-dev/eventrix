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

import Controller from './controller.ts';
import {
  ListContainerProperty,
  ListItemContainerProperty,
} from '@evenrealities/even_hub_sdk';
import { VIEW } from '../utils/consts.ts';

export default class Options extends Controller {
  private static _inst: Options;
  public static get inst(): Options {
    if (!Options._inst) Options._inst = new Options();
    return Options._inst;
  }
  private constructor() {
    super();
  }

  show = async () => {
    await this.rebuildPage({
      listObject: [
        // main fullscreen text renderer
        new ListContainerProperty({
          xPosition: 0,
          yPosition: 0,
          width: VIEW.width,
          height: VIEW.height,
          containerID: 1,
          isEventCapture: 0,
          itemContainer: new ListItemContainerProperty(), // todo resume here
        }),
      ],
    });
  };
}
