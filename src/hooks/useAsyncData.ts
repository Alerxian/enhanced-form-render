import { useState, useEffect, useCallback, useRef } from "react";
import { asyncDataManager } from "../utils/AsyncDataManager";
import type {
  AsyncDataSource,
  SelectOption,
  AsyncDataState,
} from "../types/schema";

/**
 * 异步数据Hook的返回类型
 */
interface UseAsyncDataResult {
  data: SelectOption[];
  loading: boolean;
  error: string;
  reload: () => Promise<void>;
  clearCache: () => void;
}

/**
 * 使用异步数据的Hook
 * @param fieldKey 字段唯一标识
 * @param dataSource 异步数据源配置
 * @param contextParams 上下文参数（如表单中其他字段的值）
 * @param dependencies 依赖数组，当依赖变化时重新获取数据
 */
export function useAsyncData(
  fieldKey: string,
  dataSource?: AsyncDataSource,
  contextParams?: Record<string, unknown>,
  dependencies: unknown[] = []
): UseAsyncDataResult {
  const [data, setData] = useState<SelectOption[]>([]);
  const [globalState, setGlobalState] = useState<AsyncDataState>(
    asyncDataManager.getState()
  );
  const abortControllerRef = useRef<AbortController | null>(null);

  // 监听全局状态变化
  useEffect(() => {
    const unsubscribe = asyncDataManager.subscribe(setGlobalState);
    return unsubscribe;
  }, []);

  // 获取数据的函数
  const fetchData = useCallback(async (): Promise<void> => {
    if (!dataSource) {
      setData([]);
      return;
    }

    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 创建新的AbortController
    abortControllerRef.current = new AbortController();

    try {
      const result = await asyncDataManager.fetchData(
        fieldKey,
        dataSource,
        contextParams
      );
      setData(result);
    } catch (error) {
      // 如果是取消的请求，不做处理
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }
      console.error(`获取字段 ${fieldKey} 的数据失败:`, error);
      setData([]);
    }
  }, [fieldKey, dataSource, contextParams]);

  // 依赖变化时重新获取数据
  useEffect(() => {
    fetchData();

    // 清理函数
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData, ...dependencies]);

  // 清除缓存的函数
  const clearCache = useCallback(() => {
    asyncDataManager.clearCache(fieldKey);
  }, [fieldKey]);

  // 重新加载数据的函数
  const reload = useCallback(async (): Promise<void> => {
    clearCache();
    await fetchData();
  }, [clearCache, fetchData]);

  return {
    data,
    loading: globalState.loading[fieldKey] || false,
    error: globalState.errors[fieldKey] || "",
    reload,
    clearCache,
  };
}

/**
 * 使用多个异步数据字段的Hook
 * @param fields 字段配置数组
 * @param formData 表单数据（用于字段间依赖）
 */
interface AsyncField {
  key: string;
  dataSource?: AsyncDataSource;
  dependencies?: string[];
}

export function useMultipleAsyncData(
  fields: AsyncField[],
  formData: Record<string, unknown> = {}
): Record<string, UseAsyncDataResult> {
  const [results, setResults] = useState<Record<string, UseAsyncDataResult>>(
    {}
  );

  useEffect(() => {
    const newResults: Record<string, UseAsyncDataResult> = {};

    fields.forEach((field) => {
      const contextParams =
        field.dependencies?.reduce((params, dep) => {
          params[dep] = formData[dep];
          return params;
        }, {} as Record<string, unknown>) || {};

      const dependencyValues =
        field.dependencies?.map((dep) => formData[dep]) || [];

      // eslint-disable-next-line react-hooks/rules-of-hooks
      newResults[field.key] = useAsyncData(
        field.key,
        field.dataSource,
        contextParams,
        dependencyValues
      );
    });

    setResults(newResults);
  }, [fields, formData]);

  return results;
}

/**
 * 获取异步数据管理器的全局状态Hook
 */
export function useAsyncDataState(): AsyncDataState {
  const [state, setState] = useState<AsyncDataState>(
    asyncDataManager.getState()
  );

  useEffect(() => {
    const unsubscribe = asyncDataManager.subscribe(setState);
    return unsubscribe;
  }, []);

  return state;
}
