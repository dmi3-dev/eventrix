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
  type EvenHubEvent,
  ListContainerProperty,
  ListItemContainerProperty,
} from '@evenrealities/even_hub_sdk';
import { VIEW } from '../utils/consts.ts';
import type { Page } from '../utils/types.ts';
import PageController from './page-controller.ts';

export default class Settings extends PageController {
  readonly name: Page = 'settings';

  _cachedPage = {
    listObject: [
      // main fullscreen text renderer
      new ListContainerProperty({
        xPosition: 0,
        yPosition: 0,
        width: VIEW.width,
        height: VIEW.height,
        containerID: 1,
        isEventCapture: 1,
        itemContainer: new ListItemContainerProperty({
          itemCount: 3,
          itemName: ['back', 'restart', 'options'],
        }),
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

  showPausePage = () => {
    this.rebuildPage();
  };

  onClick = (event: EvenHubEvent) => {
    this.log('clicked', event);
  };
}
