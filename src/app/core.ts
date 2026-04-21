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

import type PageController from './pageController.ts';
import Model from './model.ts';
import {
  OsEventTypeList,
  waitForEvenAppBridge,
} from '@evenrealities/even_hub_sdk';
import AppLogger from './app-logger.ts';
import MatrixRain from './matrix-rain.ts';
import Options from './options.ts';

export default class Core {
  private static _inst: Core;
  public static get inst(): Core {
    if (!Core._inst) Core._inst = new Core();
    return Core._inst;
  }
  private constructor() {}

  private _activeControoler: PageController | null = null;

  // todo: maybe use that to switch between pages instead of active
  pages = {
    main: MatrixRain.inst,
    options: Options.inst,
  };

  log = AppLogger.log;

  get bridge() {
    return Model.state.bridge!;
  }

  static initialize = async (mainController: PageController) => {
    if (!Model.state.bridge) {
      Model.state.bridge = await waitForEvenAppBridge();
    }
    Core.inst.log('initializing');
    await mainController.initPage();
    Core.setActiveController(mainController);
    Core.inst._initEvents();
  };

  static setActiveController(controller: PageController) {
    Core.inst._activeControoler = controller;
  }

  private _initEvents() {
    this.log('initializing events');
    this.bridge.onEvenHubEvent(event => {
      this.log(event);
      const { sysEvent, textEvent, listEvent } = event;

      if (!sysEvent && !textEvent && !listEvent) return;

      // documentation says, click and double click will be caught by textEvent
      // however my tests show that it is caught by sysEvent. Adding to be handled
      const eventType =
        sysEvent?.eventType ?? textEvent?.eventType ?? listEvent?.eventType;

      switch (eventType) {
        case OsEventTypeList.CLICK_EVENT:
        case undefined: // SDK normalizes 0 to undefined in some cases
          this._activeControoler?.onClick?.(event);
          break;
        case OsEventTypeList.DOUBLE_CLICK_EVENT:
          this._activeControoler?.onDobleClick(event);
          break;
        case OsEventTypeList.SCROLL_TOP_EVENT:
          this._activeControoler?.onScrollUp?.(event);
          break;
        case OsEventTypeList.SCROLL_BOTTOM_EVENT:
          this._activeControoler?.onScrollDown?.(event);
          break;

        // // for future reference
        // case OsEventTypeList.FOREGROUND_ENTER_EVENT:
        // case OsEventTypeList.FOREGROUND_EXIT_EVENT:
        // case OsEventTypeList.ABNORMAL_EXIT_EVENT:
        // case OsEventTypeList.SYSTEM_EXIT_EVENT:
        // case OsEventTypeList.IMU_DATA_REPORT:
        //   break;
        default:
          break;
      }
    });
    this.log('events initialized');
  }
}
