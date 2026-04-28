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

import type { NumericOptionType } from './types.ts';

export const IS_DEV = import.meta.env.VITE_APP_ENV === 'dev';

export const VIEW = {
  width: 576,
  height: 288,
};

// this is how many monospace characters can fit in the view
export const MATRIX = {
  width: 28,
  height: 10,
};

// making buffer less than can fit, because some combo of characters
// makes it go next line, overflowing buffer and adding visible scrollbar
// using this hack until I find that combo and remove it
export const BUF_SIZE = MATRIX.width * MATRIX.height - 2;

export const CONTROLLER_TEXT_ID = 1000;
export const MATRIX_TEXT_ID = 10;
export const MENU_TEXT_ID = 20;
export const SETTING_TEXT_ID = 21;
export const TOOLTIP_TEXT_ID = 22;

export const REFRESH_DENOM = 15;
export const MIN_DROP_LEN = 2;
export const MIN_CYCLES = 0;

export const PADDING = 8;
export const MENU_WIDTH = 115;
export const MENU_HEIGHT = 187;
export const Y_POS = Math.round(VIEW.height / 2 - MENU_HEIGHT / 2);
export const RIGHT_X_POS = MENU_WIDTH + PADDING;

export const OPTIONS = ['restart', 'dps', 'speed', 'length', 'cycles', 'intro'];

export const NUM_OPTION: Record<number, NumericOptionType> = {
  1: 'dps',
  2: 'speed',
  3: 'maxLength',
  4: 'maxCycles',
};

export const MIN: Record<NumericOptionType, number> = {
  dps: 0.1,
  speed: 0.1,
  maxCycles: MIN_CYCLES,
  maxLength: MIN_DROP_LEN,
};

export const MAX: Record<NumericOptionType, number> = {
  dps: REFRESH_DENOM * 2,
  speed: REFRESH_DENOM,
  maxCycles: 10,
  maxLength: 20,
};

export const MONO_SPACE = '\u3000';
export const MONO_MATRIX_CHARS =
  'ㄌㄛㄜㄝㄞㄟㄠㄡㄢㄣㄤㄥㄦ个丫丬中丮丰丱串丳临〆丸' +
  '丹为々主丼丽乂乃久乇么义日火水木金土年月時分秒人大' +
  '小上下左右前後東西南北０１２３４５６７８９ＡＢＣＤ' +
  'ＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺａｂｃ' +
  'ｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ＄＆';

// 「」『』〔〕・

export const DPS_DESC = `

Change how many drops are generated in one second.`;

export const SPEED_DESC = `

Change the speed of drops. This only changes ticks of animation and won't affect the frame rate of the display which is limited to 5 fps by hardware.`;

export const LENGTH_DESC = `

Change the maximum length of drops. Each drop is generated with the random length from ${MIN_DROP_LEN} to`;

export const CYCLES_DESC = `

The drop can cycle through several characters before moving down. Each drop is generated with the random number of cycles from ${MIN_CYCLES} to`;

export const INTRO_DESC = `

Choose to play or skip the greetings intro before starting code rain.`;

export const OPTIONS_TOOLTIP_RESTART = `DBL TAP: close ${MONO_SPACE} TAP: restart simulation ${MONO_SPACE} ↑/↓: change option`;
export const OPTIONS_TOOLTIP = `DBL TAP: close ${MONO_SPACE} TAP: select to edit ${MONO_SPACE} ↑/↓: change option`;
export const SETTINGS_TOOLTIP = `DBL TAP: close ${MONO_SPACE} TAP: back to menu ${MONO_SPACE} ↑/↓: change value`;
