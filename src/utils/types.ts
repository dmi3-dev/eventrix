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
  ImageContainerProperty,
  ListContainerProperty,
  TextContainerProperty,
} from '@evenrealities/even_hub_sdk';

export type Stage = 'wakeup' | 'hasYou' | 'rain';
export type NumericOptionType = 'dps' | 'speed' | 'maxLength' | 'maxCycles';

export type Intro = {
  wakeup: string;
  hasYou: string;
  step: number;
  substep: number;
  wakeupOffset: number;
  hasOffset: number;
};

export type Drop = {
  head: number;
  tail: number;
  cycles: number;
  step: number;
  substep: number;
  delay: number;
};

export type Container = {
  createHiddenController: boolean;
  containerTotalNum: number;
  listObject: ListContainerProperty[];
  textObject: TextContainerProperty[];
  imageObject: ImageContainerProperty[];
};

export type Page = 'main' | 'settings';
