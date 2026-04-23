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
  TextContainerProperty,
  TextContainerUpgrade,
} from '@evenrealities/even_hub_sdk';
import {
  BUF_SIZE,
  MATRIX,
  MATRIX_TEXT_ID,
  MAX_DPS,
  MIN_DPS,
  MONO_SPACE,
  REFRESH_DENOM,
  VIEW,
} from '../utils/consts.ts';
import type { Container, Drop, Intro, Page, Stage } from '../utils/types.ts';
import {
  getRandomMatrixChar,
  round,
  sleep,
  toMonospace,
} from '../utils/utils.ts';
import FpsConuter from './fps-conuter.ts';
import PageController from './page-controller.ts';
import Model from './model.ts';
import Core from './core.ts';

export default class MatrixRain extends PageController {
  readonly name: Page = 'main';

  private static _inst: MatrixRain;
  public static get inst(): MatrixRain {
    if (!MatrixRain._inst) MatrixRain._inst = new MatrixRain();
    return MatrixRain._inst;
  }
  private constructor() {
    super();
  }

  _cachedPage: Partial<Container> = {
    createHiddenController: true,
    textObject: [
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
  };

  // even objects
  private _textUpdate = new TextContainerUpgrade({
    containerID: MATRIX_TEXT_ID,
    content: '',
  });

  // timers for processing
  private _runTimer?: number;
  private _dropGenTimer?: number;

  // drpos rendered on screen
  private readonly _drops = new Set<Drop>();
  private readonly _buffer: string[] = new Array(BUF_SIZE).fill(MONO_SPACE);

  private _process: Record<Stage, () => void> = {
    wakeup: () => this._processIntro(),
    hasYou: () => this._processIntro(),
    rain: () => this._processDrops(),
  };
  private _stage: Stage = 'rain';
  private _isRunning = false;
  private _intro: Intro = {
    wakeup: 'Wake up, Neo...',
    hasYou: toMonospace('The Matrix has you...'),
    step: 0,
    substep: 0,
    wakeupOffset: 0,
    hasOffset: 0,
  };
  private _interval: Record<Stage, number> = {
    wakeup: 205, // giving it slightly more time than typical glasses refresh rate
    hasYou: 205,
    rain: 1000 / REFRESH_DENOM,
  };

  /** initializes the bridge and creates startup page */
  async initPage() {
    // updating wakeup message with actual username
    const userInfo = await this.bridge.getUserInfo();
    const fifthRow = MATRIX.width * 4;
    const center = MATRIX.width / 2 + fifthRow;
    let wakeup = `Wake up, ${userInfo.name}...`;
    this._intro.wakeupOffset = Math.floor(center - wakeup.length / 2);

    if (wakeup.length > MATRIX.width - 1) {
      // uername is too long and won't fit, so we break the message with new lines
      wakeup = `Wake up,\n${userInfo.name}\n...`;
      this._intro.wakeupOffset = Math.floor(fifthRow);

      // we added \n which make buffer overflow and show scrollbar in text contrainer
      // clearing all rows after where we show the text to aovoid it
      // it's ok, it will be reset to proper mono space buffer after wakeup stage
      for (let i = center; i < BUF_SIZE; i++) {
        this._buffer[i] = '';
      }
    }

    this._intro.wakeup = toMonospace(wakeup);

    // also calculating offset for next message
    this._intro.hasOffset = Math.floor(center - this._intro.hasYou.length / 2);
  }

  /** starts interwals to generate and process drops */
  start = async () => {
    this._isRunning = true;
    this._setStage(this._stage);
    this.renderWebApp();
    this.log('started');
    await this.reRender();
  };

  stop = async () => {
    this._isRunning = false;
    clearInterval(this._runTimer);
    clearInterval(this._dropGenTimer);
    this._runTimer = undefined;
    this._dropGenTimer = undefined;
    await sleep(200);
    this.log('stopped');
  };

  restart = async () => {
    await this.reset();
    await this.start();
  };

  reset = async () => {
    await this.stop();
    this._stage = 'wakeup';
    this._resetIntroSteps();
    this._clearBuffer();
    this._drops.clear();
    await this.reRender();
    await sleep(200);
    this.log('reset');
  };

  onBack() {
    super.onBack();
    this.start();
  }

  onClick = async () => {
    await this.stop();
    Core.inst.goToPage('menu');
  };

  onScrollUp = () => {
    if (Model.state.dps < 1) {
      this._setDps(round(Model.state.dps + 0.1, 1));
    } else {
      this._setDps(Math.floor(Model.state.dps + 1));
    }
  };

  onScrollDown = () => {
    if (Model.state.dps < 1.1) {
      this._setDps(round(Model.state.dps - 0.1, 1));
    } else {
      this._setDps(Math.floor(Model.state.dps - 1));
    }
  };

  /** minimal html for app web view */
  // todo: move out
  renderWebApp = () => {
    const app = document.querySelector<HTMLDivElement>('#app')!;
    app.innerHTML = `
    <div class="app">
      <div class="title">
        <h1>eventrix</h1>
      </div>

      <div class="description">
        <h4>Most useless app on Even Hub, but it would be wrong not to make it for this display.</h4>
        <p>It's generating <span class="highlight">${Model.state.dps}</span> drops per second. Swipe UP/DOWN to 
        change drop rate.</p>
      </div>

      <div class="code" id="logs">${Model.state.logData}</div>

      <div class="row" id="buttonContainer">
        <button class="button" id="playButton">${this._isRunning ? 'STOP' : 'START'}</button>
      </div>
    </div>
  `;

    const playButton =
      document.querySelector<HTMLButtonElement>('#playButton')!;

    playButton?.addEventListener('click', async () => {
      if (!this._isRunning) {
        this.log('START');
        await this.start();
      } else {
        this.log('STOP');
        await this.reset();
      }
    });
  };

  /** the rate of rerender in glasses is very limited. We are getting 5 FPS
   * for full screen text. Making it handle the next re-render once previous
   * is done, leaving it outside of main run logic. */
  reRender = async () => {
    if (Model.state.isShowFps) {
      FpsConuter.countFps();
      FpsConuter.fpsMonoString
        .split('')
        .forEach((c, i) => (this._buffer[i] = c));
    }

    // first blocking to wait for render making it render
    // this._textUpdate.content = MONO_MATRIX_CHARS;
    this._textUpdate.content = this._buffer.join('');
    const t = Date.now();
    await this.bridge?.textContainerUpgrade(this._textUpdate);

    if (this._isRunning) {
      // adding delay for simulator
      if (Date.now() - t < 50) await sleep(180);
      await this.reRender();
    }
  };

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~ private methods ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  /** updates stage and restarts timers with needed interval*/
  private _setStage = (stage: Stage) => {
    this._stage = stage;
    clearInterval(this._runTimer);
    this._runTimer = setInterval(
      this._process[this._stage],
      this._interval[this._stage],
    );
    if (this._stage === 'rain') {
      this._generateDrop();
      clearInterval(this._dropGenTimer);
      this._dropGenTimer = setInterval(
        this._generateDrop,
        1000 / Model.state.dps,
      );
    }
  };

  /** processing intro stages */
  private _processIntro = () => {
    const { wakeup, step, wakeupOffset, hasYou, hasOffset } = this._intro;

    if (this._stage === 'wakeup') {
      if (step < wakeup.length) {
        this._buffer[step + wakeupOffset] = wakeup[step];
        this._intro.step++;
      } else {
        // adding delay before next stage to give it a second to stay on screen
        setTimeout(() => {
          this._resetIntroSteps();
          this._clearBuffer();
          this._setStage('hasYou');
        }, 1000);
      }
    } else {
      if (step < hasYou.length) {
        this._buffer[step + hasOffset] = hasYou[step];
        this._intro.step++;
      } else {
        this._resetIntroSteps();
        // adding delay before next stage to give it a second to stay on screen
        // not clearing, because it looks cool when it rains over the text
        setTimeout(() => this._setStage('rain'), 1000);
      }
    }
  };

  private _resetIntroSteps = () => {
    this._intro.substep = 0;
    this._intro.step = 0;
  };

  /* Processing drop objects to add characters to buffer */
  private _processDrops = () => {
    // if (this._delay++ % Math.ceil(rainMs / Model.state.speed) !== 0) return;
    for (const drop of this._drops) {
      // increment substep by speed
      drop.substep += Model.state.speed / REFRESH_DENOM;
      // get the rouned step to increment
      const step = Math.round(drop.substep);
      if (step <= drop.step) continue;
      drop.step = step;

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
      if (step % drop.interval === 0) {
        // adding full width essentially moves it down in Y position
        drop.head += MATRIX.width;
        drop.tail += MATRIX.width;
      }
    }
  };

  private _generateDrop = () => {
    if (this._stage !== 'rain') return;
    const head = Math.floor(Math.random() * MATRIX.width);
    const len = Math.ceil(Math.random() * (Model.state.maxLength - 2)) + 2;
    const tail = head - len * MATRIX.width;
    const interval = Math.floor(Math.random() * Model.state.maxCycles) + 1;
    this._drops.add({
      head,
      tail,
      interval,
      step: 0,
      substep: 0,
      delay: 0,
    });
  };

  private _toggleFps = () => {
    Model.state.isShowFps = !Model.state.isShowFps;
    this._buffer[0] = MONO_SPACE;
    this._buffer[1] = MONO_SPACE;
  };

  private _setDps = (dps: number) => {
    Model.state.dps = Math.max(MIN_DPS, Math.min(MAX_DPS, dps));

    // change drop generation interval
    clearInterval(this._dropGenTimer);
    this._dropGenTimer = setInterval(
      this._generateDrop,
      1000 / Model.state.dps,
    );
    const highlight = document.querySelector<HTMLDivElement>('.highlight');
    if (highlight) highlight.innerHTML = `${Model.state.dps}`;
  };

  /** fills entire buffer with mono spaces */
  private _clearBuffer = () => {
    for (let i = 0; i < BUF_SIZE; i++) {
      this._buffer[i] = MONO_SPACE;
    }
  };
}
