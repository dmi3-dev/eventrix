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
  OsEventTypeList,
  waitForEvenAppBridge,
} from '@evenrealities/even_hub_sdk';
import type { Page } from '../utils/types.ts';
import Model from './model.ts';
import AppLogger from './app-logger.ts';
import MatrixRain from './matrix-rain.ts';
import Settings from './settings.ts';
import Menu from './menu.ts';

export default class Core {
  private static _inst: Core;
  public static get inst(): Core {
    if (!Core._inst) Core._inst = new Core();
    return Core._inst;
  }
  private constructor() {}

  log = AppLogger.log;

  get bridge() {
    return Model.state.bridge!;
  }

  get state() {
    return Model.state;
  }

  get activePage() {
    if (!this.state.pages) {
      this.log('Pages not initialized');
      throw new Error('Pages not initialized');
    }
    const pageName = this.state.pageStack.at(-1);
    // trusting that it was initialized
    return this.state.pages![pageName ?? 'main'];
  }

  /** must be called at very start of the application */
  initialize = async () => {
    this.log('initializing core');
    if (!Model.state.bridge) {
      Model.state.bridge = await waitForEvenAppBridge();
    }

    this.state.pages = {
      main: MatrixRain.inst,
      menu: Menu.inst,
      settings: Settings.inst,
    };

    // starup page is created once at the start,
    // after that only page update and rebuild is called
    await this.bridge.createStartUpPageContainer(
      new CreateStartUpPageContainer({
        ...this.state.pages.main.getUpdatedContainers(),
      }),
    );
    this._initEvents();
  };

  goToPage = (page: Page) => {
    this.state.pageStack.push(page);
    this.log('going to', page, this.state.pageStack);
    this.activePage.rebuildPage();
  };

  goBack = (page?: Page) => {
    if (this.state.pageStack.length > 1) {
      if (page && this.state.pageStack.indexOf(page) > -1) {
        const index = this.state.pageStack.indexOf(page);
        this.state.pageStack = this.state.pageStack.slice(0, index + 1);
      } else {
        this.state.pageStack.pop();
      }
      this.log('back to', this.activePage.name, this.state.pageStack);
      this.activePage.onBack();
    } else {
      this.log('exit modal ');
      // exit application
      this.bridge.shutDownPageContainer(1);
    }
  };

  private _initEvents() {
    this.log('initializing events');
    this.bridge.onEvenHubEvent(event => {
      // this.log(event);
      const { sysEvent, textEvent, listEvent } = event;

      if (!sysEvent && !textEvent && !listEvent) return;

      // documentation says, click and double click will be caught by textEvent
      // however my tests show that it is caught by sysEvent. Adding to be handled
      const eventType =
        sysEvent?.eventType ?? textEvent?.eventType ?? listEvent?.eventType;

      switch (eventType) {
        case OsEventTypeList.CLICK_EVENT:
        case undefined: // SDK normalizes 0 to undefined in some cases
          this.activePage.onClick?.(event);
          break;
        case OsEventTypeList.DOUBLE_CLICK_EVENT:
          if (this.activePage.onDobleClick) {
            this.activePage.onDobleClick(event);
          } else {
            this.goBack();
          }
          break;
        case OsEventTypeList.SCROLL_TOP_EVENT:
          this.activePage.onScrollUp?.(event);
          break;
        case OsEventTypeList.SCROLL_BOTTOM_EVENT:
          this.activePage.onScrollDown?.(event);
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
