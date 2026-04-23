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
import type PageController from './page-controller.ts';

export type State = {
  isLogEnabled: boolean;
  isSkipIntro: boolean;
  isShowFps: boolean;
  dps: number;
  maxLength: number;
  maxCycles: number;
  speed: number;
  logData: string;
  bridge: EvenAppBridge | null;
  pages: Record<Page, PageController> | null;
  pageStack: Page[];
};

export const UNSAVEABLE_KEYS: (keyof State)[] = [
  'bridge',
  'logData',
  'pages',
  'pageStack',
];

export const getInitState = (): State => ({
  isLogEnabled: true,
  isSkipIntro: false,
  isShowFps: true,
  dps: 5,
  maxLength: 10,
  maxCycles: 3,
  speed: 5,
  logData: '',
  bridge: null,
  pages: null,
  pageStack: ['main'],
});
