// noinspection JSUnusedGlobalSymbols

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
  type EvenHubEvent,
  OsEventTypeList,
  TextContainerProperty,
  waitForEvenAppBridge,
} from '@evenrealities/even_hub_sdk';
import { CONTROLLER_TEXT_ID } from '../utils/consts.ts';
import Model from './model.ts';

export default abstract class Controller {
  get bridge() {
    return Model.state.bridge!;
  }

  /** this must be executed before any other logic can use bridge */
  async initPage(
    containders: TextContainerProperty[],
    onBack?: () => void,
    useInvisibleController = true,
  ) {
    if (!Model.state.bridge) {
      Model.state.bridge = await waitForEvenAppBridge();
    }

    if (onBack) {
      this.onBack = onBack;
    }

    const textObject = [...containders];
    if (useInvisibleController) {
      textObject.push(
        // controller container to avoid shifts of main text on swipes
        new TextContainerProperty({
          containerID: CONTROLLER_TEXT_ID,
          isEventCapture: 1,
        }),
      );
    }

    const pageContainer = new CreateStartUpPageContainer({
      containerTotalNum: textObject.length,
      textObject,
    });

    await Model.state.bridge.createStartUpPageContainer(pageContainer);
    this._initEvents();
  }

  onClick?: (event: EvenHubEvent) => void;
  onDobleClick = (_: EvenHubEvent) => {
    // All ER apps use double click to go back and exit, should be overwritten
    // only in very special cases
    this.onBack();
  };
  onScrollUp?: (event: EvenHubEvent) => void;
  onScrollDown?: (event: EvenHubEvent) => void;
  onLongPress?: (event: EvenHubEvent) => void;

  onBack = () => {
    // exit by default, can be overwritten in initPage
    this.bridge.shutDownPageContainer(1);
  };

  /** for dev use */
  log = (...values: any[]) => {
    if (!Model.state.isLogEnabled) return;

    values.forEach((value: any) => {
      if (typeof value !== 'string') {
        value = JSON.stringify(value, null, 2);
      }
      Model.state.logData += `${value} `;
    });
    Model.state.logData += '\n';

    if (Model.state.logData.length > 5000) {
      Model.state.logData = Model.state.logData.slice(4000);
    }

    const code = document.querySelector<HTMLDivElement>('.code');
    if (code) {
      code.innerHTML = Model.state.logData;

      // scroll down if was at the bottom
      if (code.scrollTop + code.clientHeight >= code.scrollHeight - 30) {
        code.scrollTop = code.scrollHeight;
      }
    }
  };

  private _initEvents(): void {
    this.bridge.onEvenHubEvent(event => {
      const { sysEvent, textEvent, listEvent } = event;

      if (!sysEvent && !textEvent && !listEvent) return;

      this.log(event);

      // documentation says, click and double click will be caught by textEvent
      // however my tests show that it is caught by sysEvent. Adding to be handled
      const eventType =
        sysEvent?.eventType ?? textEvent?.eventType ?? listEvent?.eventType;

      switch (eventType) {
        case OsEventTypeList.CLICK_EVENT:
        case undefined: // SDK normalizes 0 to undefined in some cases
          this.onClick?.(event);
          break;
        case OsEventTypeList.DOUBLE_CLICK_EVENT:
          this.onDobleClick(event);
          break;
        case OsEventTypeList.SCROLL_TOP_EVENT:
          this.onScrollUp?.(event);
          break;
        case OsEventTypeList.SCROLL_BOTTOM_EVENT:
          this.onScrollDown?.(event);
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
  }
}
