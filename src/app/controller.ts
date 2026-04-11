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
  OsEventTypeList,
  TextContainerProperty,
  TextContainerUpgrade,
  waitForEvenAppBridge,
} from '@evenrealities/even_hub_sdk';
import {
  BUF_SIZE,
  DEFAULT_DPS,
  MATRIX,
  MATRIX_TEXT_ID,
  MAX_DPS,
  MIN_DPS,
  MONO_SPACE,
  VIEW,
} from '../utils/consts.ts';
import type { Drop } from '../utils/types.ts';
import { getRandomMatrixChar, toMonospace } from '../utils/utils.ts';
import FpsConuter from './fps-conuter.ts';

export default class MatrixRain {
  private static _inst: MatrixRain;
  public static get inst(): MatrixRain {
    if (!MatrixRain._inst) MatrixRain._inst = new MatrixRain();
    return MatrixRain._inst;
  }
  private constructor() {}

  // even objects
  private _bridge?: EvenAppBridge;
  private _textUpdate = new TextContainerUpgrade({
    containerID: MATRIX_TEXT_ID,
    content: '',
  });

  // timers for processing
  private _runTimer?: number;
  private _dropGenTimer?: number;
  private _dpsSetTimer?: number;

  // drpos rendered on screen
  private _drops = new Set<Drop>();
  private _buffer: string[] = [];
  private _dropsPerSec = DEFAULT_DPS;

  private _showFps = false;
  private _showDps = false;
  private _logEnabled = false;
  private _log = '';
  private _dpsStringLength = 0;

  /** initializes the bridge and creates startup page */
  initialize = async () => {
    if (!this._bridge) {
      this._bridge = await waitForEvenAppBridge();
    }

    const pageContainer = new CreateStartUpPageContainer({
      containerTotalNum: 2,
      textObject: [
        // controller container to avoid shifts of main text on swipes
        new TextContainerProperty({ containerID: 1, isEventCapture: 1 }),
        // main fullscreen text renderer
        new TextContainerProperty({
          xPosition: 0,
          yPosition: 0,
          width: VIEW.width,
          height: VIEW.height,
          content: '',
          containerID: MATRIX_TEXT_ID,
          isEventCapture: 0,
        }),
      ],
    });

    await this._bridge.createStartUpPageContainer(pageContainer);
    this._setupEvents();
  };

  /** starts interwals to generate and process drops */
  start = async (withLogEnabled = false) => {
    this._logEnabled = withLogEnabled;
    this.stop();
    if (!this._bridge) await this.initialize();

    if (this._dropsPerSec < 1) this._dropsPerSec = 1;

    this._dropGenTimer = setInterval(
      this.generateDrop,
      1000 / this._dropsPerSec,
    );
    this._runTimer = setInterval(this.processDrops, 200);
  };

  stop = () => {
    clearInterval(this._runTimer);
    clearInterval(this._dropGenTimer);
    this._runTimer = undefined;
    this._dropGenTimer = undefined;
    this._buffer = new Array(BUF_SIZE).fill(MONO_SPACE);
    this._drops.clear();
    this._dropsPerSec = DEFAULT_DPS;
    this._dpsStringLength = 0;
    this._log = '';
  };

  /** minimal html for app web view */
  renderApp = () => {
    const app = document.querySelector<HTMLDivElement>('#app')!;
    app.innerHTML = `
    <div class="app">
      <div class="title">
        <h1>eventrix</h1>
      </div>

      <div class="description">
        <h4>Most useless app on EvenHub, but it would be wrong not to make it for this display.</h4>
        <p>It's generating <span class="highlight">${this._dropsPerSec}</span> drops per second. Swipe UP/DOWN to 
        change drop rate.</p>
      </div>

      <div class="code">${this._log}</div>

      <div class="row">
        <button class="button" id="restartButton">RESET</button>
        <button class="button" id="exitButton">EXIT</button>
      </div>
    </div>
  `;

    const exitButton = document.querySelector<HTMLButtonElement>('#exitButton');
    exitButton?.addEventListener('click', () => {
      this._bridge?.shutDownPageContainer(1);
    });
    const restartButton =
      document.querySelector<HTMLButtonElement>('#restartButton');
    restartButton?.addEventListener('click', () => {
      this.start();
      this.renderApp();
    });
  };

  /** the rate of rerender in glasses is very limited. We are getting 5 FPS
   * for full screen text. Making it handle the next re-render once previous
   * is done, leaving it outside of main run logic. */
  reRenderGlasses = async () => {
    if (this._showFps) {
      FpsConuter.countFps();
      FpsConuter.fpsMonoString
        .split('')
        .forEach((c, i) => (this._buffer[i] = c));
    }

    if (this._showDps) {
      const dpsString = `dps:${this._dropsPerSec}`;
      this._dpsStringLength = dpsString.length;
      toMonospace(dpsString)
        .split('')
        .forEach((c, i) => (this._buffer[i + MATRIX.width] = c));
    }

    // first blocking to wait for render making it render
    // this._textUpdate.content = MONO_MATRIX_CHARS;
    this._textUpdate.content = this._buffer.join('');
    await this._bridge?.textContainerUpgrade(this._textUpdate);

    if (this._runTimer) await this.reRenderGlasses();
  };

  toggleFps = () => {
    this._showFps = !this._showFps;
    this._buffer[0] = MONO_SPACE;
    this._buffer[1] = MONO_SPACE;
  };

  setDps = (dps: number) => {
    this._dropsPerSec = Math.max(MIN_DPS, Math.min(MAX_DPS, dps));
    this._showDps = true;

    // handle showing changed value with auto timeout to hide
    clearTimeout(this._dpsSetTimer);
    this._dpsSetTimer = setTimeout(() => {
      this._showDps = false;
      for (let i = 0; i < this._dpsStringLength; i++) {
        this._buffer[MATRIX.width + i] = MONO_SPACE;
      }
    }, 2000);

    // change drop generation interval
    clearInterval(this._dropGenTimer);
    this._dropGenTimer = setInterval(
      this.generateDrop,
      1000 / this._dropsPerSec,
    );
    this.renderApp();
  };

  generateDrop = () => {
    const head = Math.floor(Math.random() * MATRIX.width);
    const len = Math.ceil(Math.random() * MATRIX.height) + 3;
    const tail = head - len * MATRIX.width;
    const interval = Math.floor(Math.random() * 3);
    this._drops.add({ head, tail, interval, step: 0 });
  };

  /* Processing drop objects to add characters to buffer */
  processDrops = () => {
    for (const drop of this._drops) {
      if (drop.head < BUF_SIZE) {
        // we only add characters to buffer if head is within bounds
        this._buffer[drop.head] = getRandomMatrixChar();
      }
      if (drop.tail < BUF_SIZE) {
        // erasing space behind drop end
        this._buffer[drop.tail] = MONO_SPACE;
      } else {
        // drop is fully out of view, removing it
        this._drops.delete(drop);
      }

      // interval is randomly generated, it adds extra variety to drops
      // motion, making some of them slower while continuing circuling
      // throught random characters, like in real matrix rain
      if (drop.interval < 2 || drop.step++ % drop.interval === 0) {
        // adding full width essentially moves it down in Y position
        drop.head += MATRIX.width;
        drop.tail += MATRIX.width;
      }
    }
  };

  /** for dev use */
  log = (msg: any) => {
    if (!this._logEnabled) return;

    if (typeof msg !== 'string') {
      msg = JSON.stringify(msg, null, 2);
    }
    this._log = msg;
    // enable during dev
    this.renderApp();
  };

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~ private methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  private _setupEvents = () => {
    this._bridge?.onEvenHubEvent(event => {
      const { textEvent, sysEvent } = event;

      this.log(event);

      // documentation says, click and double click will be caught by textEvent
      // however my tests show that it is caught by sysEvent. Adding handling
      // in both
      if (sysEvent) {
        if (sysEvent.eventType === OsEventTypeList.DOUBLE_CLICK_EVENT) {
          this._bridge?.shutDownPageContainer(1);

          // click event is always undefined
        } else if (!sysEvent.eventType) {
          this.toggleFps();
        }
      }

      if (textEvent) {
        const eventType = textEvent.eventType;
        switch (eventType) {
          case OsEventTypeList.CLICK_EVENT:
          case undefined: // SDK normalizes 0 to undefined in some cases
            this.toggleFps();
            break;
          case OsEventTypeList.DOUBLE_CLICK_EVENT:
            this._bridge?.shutDownPageContainer(1);
            break;
          case OsEventTypeList.SCROLL_TOP_EVENT:
            this.setDps(this._dropsPerSec + 1);
            break;
          case OsEventTypeList.SCROLL_BOTTOM_EVENT:
            this.setDps(this._dropsPerSec - 1);
            break;
          default:
            break;
        }
      }
    });
  };
}
