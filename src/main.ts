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

import './style.css';
import MatrixRain from './app/matrix-rain.ts';
import Core from './app/core.ts';
import Model from './app/model.ts';
import { SAVEABLE_KEYS } from './app/state.ts';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="app">
    <div class="title">
      <h1>Code Rain</h1>
    </div>

    <div class="description">
      <h4>Most useless app on Even Hub, but it would be wrong not to make it for this display.</h4>
      <p>TODO</p>
    </div>

    <div class="code" id="logs">${Model.state.logData}</div>
  </div>
`;

const main = async () => {
  await Core.inst.initialize();
  await Model.loadState(SAVEABLE_KEYS);
  await MatrixRain.inst.init();
};

main();
