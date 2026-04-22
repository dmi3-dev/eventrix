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
import Core from './core.ts';
import MatrixRain from './matrix-rain.ts';

export default class Menu extends PageController {
  readonly name: Page = 'menu';

  readonly settings = ['back', 'restart', 'settings'];

  _cachedPage = {
    listObject: [
      // main fullscreen text renderer
      new ListContainerProperty({
        xPosition: 0,
        yPosition: 0,
        width: VIEW.width,
        height: VIEW.height,
        containerID: 1,
        containerName: 'menu',
        isEventCapture: 1,
        itemContainer: new ListItemContainerProperty({
          itemCount: 3,
          itemName: this.settings,
        }),
      }),
    ],
  };

  private static _inst: Menu;
  public static get inst(): Menu {
    if (!Menu._inst) Menu._inst = new Menu();
    return Menu._inst;
  }
  private constructor() {
    super();
  }

  showPausePage = () => {
    this.rebuildPage();
  };

  onClick = (event: EvenHubEvent) => {
    const selectedOption = event?.listEvent?.currentSelectItemIndex ?? 0;
    this.log('clicked', this.settings[selectedOption]);
    switch (this.settings[selectedOption]) {
      case 'back':
        Core.inst.goBack();
        MatrixRain.inst.start();
        break;
      case 'restart':
        Core.inst.goBack();
        MatrixRain.inst.restart();
        break;
      case 'settings':
        Core.inst.goToPage('settings');
        break;
      default:
        break;
    }
  };
}
