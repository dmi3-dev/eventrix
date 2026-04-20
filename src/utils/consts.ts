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

export const REFRESH_DENOM = 15;
export const CONTROLLER_TEXT_ID = 1000;
export const MATRIX_TEXT_ID = 1234;
export const MIN_DPS = 0.1;
export const MAX_DPS = 42;
export const MIN_RAIN_LENGH = 2;
export const MAX_RAIN_LENGH = 20;

export const MONO_SPACE = '\u3000';
export const MONO_MATRIX_CHARS =
  'ㄌㄛㄜㄝㄞㄟㄠㄡㄢㄣㄤㄥㄦ个丫丬中丮丰丱串丳临〆丸' +
  '丹为々主丼丽乂乃久乇么义日火水木金土年月時分秒人大' +
  '小上下左右前後東西南北０１２３４５６７８９ＡＢＣＤ' +
  'ＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺａｂｃ' +
  'ｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ＄＆';
