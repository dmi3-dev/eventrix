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
  RebuildPageContainer,
  TextContainerProperty,
} from '@evenrealities/even_hub_sdk';
import { CONTROLLER_TEXT_ID } from '../utils/consts.ts';
import Model from './model.ts';
import type { Container } from '../utils/types.ts';
import AppLogger from './app-logger.ts';
import Core from './core.ts';

export default abstract class PageController {
  // used to auto rebuild page from what was initiated or custom rebuilt
  protected abstract _cachedPage: Partial<Container>;
  log = AppLogger.log;

  get bridge() {
    return Model.state.bridge!;
  }

  /** todo */
  async rebuildPage(onBack?: () => void, containders?: Partial<Container>) {
    if (!this.bridge) {
      this.log('rebuildPage called before Core initialized');
      return;
    }

    // if containers provided, override the cached one
    if (containders) {
      this._cachedPage = this._getUpdatedContainers(containders);
    } else {
      if (
        this._cachedPage.createHiddenController ||
        !this._cachedPage.containerTotalNum
      ) {
        // processing initial cached page
        this._cachedPage = this._getUpdatedContainers(this._cachedPage);
      }
    }

    if (onBack) {
      this.onBack = onBack;
    }

    await this.bridge.rebuildPageContainer(
      new RebuildPageContainer({ ...this._cachedPage }),
    );
    Core.setActiveController(this);
  }

  /** this is used once at the start and must be executed before any other
   * logic that uses bridge. It only needed to be called by a single controller,
   * then other controllers can call rebuildPage */
  async initPage() {
    if (!this.bridge) {
      this.log('Bridge not initialized.');
      return;
    }

    // updating cached page, at this time it most likely doesn't have count
    // and has invisible controller not yet created
    this._cachedPage = this._getUpdatedContainers(this._cachedPage);
    await this.bridge.createStartUpPageContainer(
      new CreateStartUpPageContainer({
        ...this._cachedPage,
      }),
    );
  }

  setCachedPage = (containders: Partial<Container>) => {
    this._cachedPage = this._getUpdatedContainers(containders);
  };

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

  private _getUpdatedContainers(containers: Partial<Container>) {
    const { listObject, imageObject, createHiddenController } = containers;
    let { textObject } = containers;
    if (createHiddenController) {
      textObject = [
        ...(textObject ?? []),
        new TextContainerProperty({
          containerID: CONTROLLER_TEXT_ID,
          isEventCapture: 1,
        }),
      ];
    }

    const textAndListCount =
      (textObject?.length ?? 0) + (listObject?.length ?? 0);
    const imgCount = imageObject?.length ?? 0;

    if (textAndListCount > 8) {
      this.log('Text and list count exceeded limit of 8.');
    }

    if (textAndListCount > 4) {
      this.log('Image count exceeded limit of 4.');
    }

    return {
      textObject,
      listObject,
      imageObject,
      containerTotalNum: textAndListCount + imgCount,
    };
  }
}
