/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Action<T = any> {
  type: any;
  payload?: T;
}

export interface Reducer<S = any, A extends Action = Action> {
  (state: S, action: A): S;
}

export interface Store<S = any, A extends Action = Action> {
  dispatch: (action: A | Function) => any;
  getState: () => S;
  subscribe: (listener: () => void) => () => void;
}

export type StoreCreator = <S, A extends Action = Action>(
  reducer: Reducer<S, A>,
  initialState: S
) => Store<S, A>;

export type Middleware<S = any> = (store: {
  getState: () => S;
  dispatch: (action: any) => any;
}) => (next: (action: any) => any) => (action: any) => any;

interface Enhancer {
  (createStore: StoreCreator): StoreCreator;
}

export const createStore = <S = any, A extends Action = Action>(
  reducer: Reducer<S, A>,
  initialState: S,
  enhancer?: Enhancer
): Store<S, A> => {
  if (enhancer) {
    return enhancer(createStore)(reducer, initialState);
  }

  let state = initialState;
  let listeners: (() => void)[] = [];

  function getState() {
    return state;
  }

  function dispatch(action: A | Function): any {
    if (typeof action === "function") {
      return action;
    }
    state = reducer(state, action as A);
    // 触发监听函数
    listeners.forEach((listener) => listener());
  }

  function subscribe(listener: () => void) {
    listeners.push(listener);
    return () => {
      // 返回取消监听的函数
      listeners = listeners.filter((l) => l !== listener);
    };
  }

  return {
    getState,
    dispatch,
    subscribe,
  };
};

export const compose = (...funcs: Function[]): Function => {
  if (funcs.length === 0) {
    return (arg: any) => arg;
  }
  if (funcs.length === 1) {
    return funcs[0];
  }
  return funcs.reduce(
    (a, b) =>
      (...args: any[]) =>
        a(b(...args))
  );
};

export const applyMiddleware = (...middlewares: Middleware[]): Enhancer => {
  return (createStore: StoreCreator) =>
    <S, A extends Action = Action>(reducer: Reducer<S, A>, initialState: S) => {
      const store = createStore(reducer, initialState);
      let dispatch = store.dispatch;

      const middlewareAPI = {
        getState: store.getState,
        dispatch: (action: any) => dispatch(action),
      };

      const chain = middlewares.map((middleware) => middleware(middlewareAPI));
      dispatch = compose(...chain)(store.dispatch);

      return {
        ...store,
        dispatch,
      };
    };
};

export const combineReducers = <T extends Record<string, any>>(reducers: {
  [K in keyof T]: Reducer<T[K]>;
}): Reducer<T> => {
  return (state: T, action: Action): T => {
    const nextState = {} as T;
    for (const key in reducers) {
      nextState[key] = reducers[key](state?.[key], action);
    }
    return nextState;
  };
};

// 日志中间件示例
export const loggerMiddleware: Middleware = (store) => (next) => (action) => {
  console.log("dispatching", action);
  const result = next(action);
  console.log("next state", store.getState());
  return result;
};

// 异步中间件示例 (类似 redux-thunk)
export const thunkMiddleware: Middleware = (store) => (next) => (action) => {
  if (typeof action === "function") {
    return action(store.dispatch, store.getState);
  }
  return next(action);
};

// 使用示例函数
export const createStoreWithMiddleware = <S, A extends Action = Action>(
  reducer: Reducer<S, A>,
  initialState: S,
  ...middlewares: Middleware[]
) => {
  const enhancer = applyMiddleware(...middlewares);
  return createStore(reducer, initialState, enhancer);
};

// test
interface CounterAction extends Action {
  type: "INCREMENT" | "DECREMENT";
}

type CounterState = {
  count: number;
};

const counterReducer: Reducer<CounterState, CounterAction> = (
  state: CounterState,
  action: CounterAction
) => {
  switch (action.type) {
    case "INCREMENT":
      return { ...state, count: state.count + 1 };
    case "DECREMENT":
      return { ...state, count: state.count - 1 };
    default:
      return state;
  }
};
const enhancerMiddleware = applyMiddleware(loggerMiddleware, thunkMiddleware);
export const store = createStore(
  counterReducer,
  { count: 0 },
  enhancerMiddleware
);

// store.subscribe(() => {
//   console.log("state changed:", store.getState());
// });
