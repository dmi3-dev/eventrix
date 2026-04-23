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

type Option =
  | 'back'
  | 'DPS'
  | 'speed'
  | 'max length'
  | 'max cycles'
  | 'skip intro';

export default class Settings extends PageController {
  readonly name: Page = 'settings';

  readonly options: Option[] = [
    'back',
    'DPS',
    'speed',
    'max length',
    'max cycles',
    'skip intro',
  ];

  _cachedPage = {
    listObject: [
      // main fullscreen text renderer
      new ListContainerProperty({
        xPosition: 1,
        yPosition: 1,
        width: 135,
        height: VIEW.height - 2,
        containerID: 20,
        containerName: 'settings',
        isEventCapture: 1,
        borderWidth: 2,
        borderColor: 2,
        paddingLength: 5,
        itemContainer: new ListItemContainerProperty({
          itemCount: this.options.length,
          itemName: this.options,
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

  onClick = (event: EvenHubEvent) => {
    const selectedOption = event?.listEvent?.currentSelectItemIndex ?? 0;
    this.log('clicked', this.options[selectedOption]);
    switch (this.options[selectedOption]) {
      case 'back':
        Core.inst.goBack('main');
        break;
      // case 'DPS':
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
        this.rebuildPage();
        break;
    }
  };
}
