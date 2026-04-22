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
import AppLogger from './app-logger.ts';
import { getInitState, type State, UNSAVEABLE_KEYS } from './state.ts';

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

  /** if custom state is provided it will save just that, otherwise will save all state */
  static saveState = async (state?: Partial<State>) => {
    if (!Model.state.bridge) {
      AppLogger.log('bridge is not initialized');
      return;
    }
    await Promise.all(
      Object.entries(state || Model.state)
        .filter(([key]) => !UNSAVEABLE_KEYS.includes(key as keyof State))
        .map(([key, value]) => {
          return Model.state.bridge!.setLocalStorage(
            key,
            JSON.stringify(value),
          );
        }),
    );
  };

  static loadState = async (state?: Partial<State>) => {
    if (!Model.state.bridge) {
      AppLogger.log('bridge is not initialized');
      return;
    }
    const entries = await Promise.all(
      Object.keys(state || Model.state)
        .filter(key => !UNSAVEABLE_KEYS.includes(key as keyof State))
        .map(async key => {
          const value = await Model.state.bridge!.getLocalStorage(key);
          return [key, value] as const;
        }),
    );

    const loadedState = Object.fromEntries(
      entries
        .filter(([, raw]) => raw !== null && raw !== undefined)
        .map(([key, raw]) => [key, JSON.parse(raw as string)]),
    ) as Partial<State>;

    Model.setState(loadedState);
  };
}
