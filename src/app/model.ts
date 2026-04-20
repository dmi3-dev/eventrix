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

import isEqual from 'lodash.isequal';
import { EvenAppBridge } from '@evenrealities/even_hub_sdk';

export type State = {
  isLogEnabled: boolean;
  isSkipIntro: boolean;
  isMenuOpen: boolean;
  isShowFps: boolean;
  dps: number;
  maxLength: number;
  maxCycles: number;
  speed: number;
  logData: string;
  bridge: EvenAppBridge | null;
};

const getInitState = (): State => ({
  isLogEnabled: true,
  isSkipIntro: false,
  isMenuOpen: false,
  isShowFps: true,
  dps: 5,
  maxLength: 2,
  maxCycles: 3,
  speed: 5,
  logData: '',
  bridge: null,
});

export default class Model {
  static state: State = getInitState();

  static setState = (
    value: Partial<State> | ((prev: State) => Partial<State>),
    onUpdated?: (newState: Partial<State>) => void,
  ) => {
    const newState = value instanceof Function ? value(Model.state) : value;
    // testing by keys of the newState, because it can be a partial state
    const hasChanges = Object.keys(newState).some(key => {
      return (
        // checking reference or value first
        newState[key as keyof State] !== Model.state[key as keyof State] ||
        // then deep checking content
        !isEqual(newState[key as keyof State], Model.state[key as keyof State])
      );
    });
    if (hasChanges) {
      Model.state = { ...Model.state, ...newState };
      onUpdated?.(newState);
    }
  };

  static reset() {
    Model.state = getInitState();
  }
}
