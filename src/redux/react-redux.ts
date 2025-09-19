import { useSyncExternalStore } from "react";
import type { Store } from "./redux";

/**
 * React Hook，用于连接 Redux Store
 * 使用 React 18 的 useSyncExternalStore 实现
 * @param store Redux Store 实例
 * @returns Store 的当前状态
 */
export const useReduxStore = <S>(store: Store<S>): S => {
  return useSyncExternalStore<S>(
    store.subscribe,
    () => store.getState(),
    () => store.getState()
  );
};

// 导出类型定义供其他模块使用
export type { Store } from "./redux";
