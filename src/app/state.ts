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

import type { EvenAppBridge } from '@evenrealities/even_hub_sdk';
import type { Page } from '../utils/types.ts';
import { BUF_SIZE, IS_DEV, MONO_SPACE } from '../utils/consts.ts';
import type PageController from './page-controller.ts';

export type State = {
  isLogEnabled: boolean;
  isShowFps: boolean;
  isPlayIntro: boolean;
  dps: number;
  maxLength: number;
  maxCycles: number;
  speed: number;
  logData: string;
  bridge: EvenAppBridge | null;
  pages: Record<Page, PageController> | null;
  pageStack: Page[];
  fullScreenBuffer: string[];
};

export const SAVEABLE_KEYS: (keyof State)[] = [
  'isPlayIntro',
  'dps',
  'speed',
  'maxLength',
  'maxCycles',
];

export const getInitState = (): State => ({
  isLogEnabled: IS_DEV,
  isShowFps: IS_DEV,
  isPlayIntro: true,
  dps: 10,
  maxLength: 10,
  maxCycles: 3,
  speed: 10,
  logData: '',
  bridge: null,
  pages: null,
  pageStack: ['main'],
  fullScreenBuffer: new Array(BUF_SIZE).fill(MONO_SPACE),
});
