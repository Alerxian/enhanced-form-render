// import axios from "axios";
import type { AxiosRequestConfig } from "axios";
import type {
  AsyncDataSource,
  SelectOption,
  CacheItem,
  AsyncDataState,
} from "../types/schema";
import apiClient from "../api/axios";

/**
 * 异步数据管理器
 * 负责统一处理表单字段的异步数据获取、缓存和状态管理
 */
export class AsyncDataManager {
  private state: AsyncDataState = {
    loading: {},
    cache: {},
    errors: {},
  };

  private listeners: Array<(state: AsyncDataState) => void> = [];

  /**
   * 订阅状态变化
   */
  subscribe(listener: (state: AsyncDataState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * 获取当前状态
   */
  getState(): AsyncDataState {
    return { ...this.state };
  }

  /**
   * 更新状态并通知监听者
   */
  private setState(updates: Partial<AsyncDataState>): void {
    this.state = { ...this.state, ...updates };
    this.listeners.forEach((listener) => listener(this.state));
  }

  /**
   * 生成缓存键
   */
  private getCacheKey(
    dataSource: AsyncDataSource,
    params?: Record<string, unknown>
  ): string {
    const key = `${dataSource.url}_${dataSource.method || "GET"}`;
    if (params && Object.keys(params).length > 0) {
      return `${key}_${JSON.stringify(params)}`;
    }
    return key;
  }

  /**
   * 检查缓存是否有效
   */
  private isCacheValid(cacheItem: CacheItem): boolean {
    const now = Date.now();
    return now - cacheItem.timestamp < cacheItem.cacheTime;
  }

  /**
   * 获取缓存数据
   */
  private getCachedData(cacheKey: string): SelectOption[] | null {
    const cacheItem = this.state.cache[cacheKey];
    if (cacheItem && this.isCacheValid(cacheItem)) {
      return cacheItem.data;
    }
    return null;
  }

  /**
   * 设置缓存数据
   */
  private setCachedData(
    cacheKey: string,
    data: SelectOption[],
    cacheTime: number
  ): void {
    const cacheItem: CacheItem = {
      data,
      timestamp: Date.now(),
      cacheTime,
    };

    this.setState({
      cache: {
        ...this.state.cache,
        [cacheKey]: cacheItem,
      },
    });
  }

  /**
   * 默认数据转换函数
   */
  private defaultTransform(data: unknown): SelectOption[] {
    if (Array.isArray(data)) {
      return data.map((item, index) => {
        if (typeof item === "object" && item !== null) {
          const obj = item as Record<string, unknown>;
          const value = obj.value ?? obj.id ?? index;
          const label = obj.label ?? obj.name ?? obj.title ?? String(value);

          return {
            value:
              typeof value === "string" || typeof value === "number"
                ? value
                : String(value),
            label: String(label),
            ...obj,
          };
        }
        return {
          value:
            typeof item === "string" || typeof item === "number"
              ? item
              : String(item),
          label: String(item),
        };
      });
    }

    if (typeof data === "object" && data !== null) {
      const obj = data as Record<string, unknown>;
      if (obj.data && Array.isArray(obj.data)) {
        return this.defaultTransform(obj.data);
      }
      if (obj.list && Array.isArray(obj.list)) {
        return this.defaultTransform(obj.list);
      }
      if (obj.items && Array.isArray(obj.items)) {
        return this.defaultTransform(obj.items);
      }
    }

    return [];
  }

  /**
   * 发起异步请求获取数据
   */
  async fetchData(
    fieldKey: string,
    dataSource: AsyncDataSource,
    contextParams?: Record<string, unknown>
  ): Promise<SelectOption[]> {
    const cacheKey = this.getCacheKey(dataSource, contextParams);

    // 检查缓存
    const cachedData = this.getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // 设置加载状态
    this.setState({
      loading: {
        ...this.state.loading,
        [fieldKey]: true,
      },
      errors: {
        ...this.state.errors,
        [fieldKey]: "",
      },
    });

    try {
      // 准备请求配置
      const config: AxiosRequestConfig = {
        url: dataSource.url,
        method: dataSource.method || "GET",
        headers: dataSource.headers || {},
      };

      // 合并参数
      const allParams = {
        ...dataSource.params,
        ...contextParams,
      };

      if (config.method === "GET") {
        config.params = allParams;
      } else {
        config.data = allParams;
      }
      // 发起请求
      const response = await apiClient(config);

      // 数据转换
      const transform =
        dataSource.transform || this.defaultTransform.bind(this);
      const transformedData = transform(response.data);

      // 缓存数据
      const cacheTime = dataSource.cacheTime || 5 * 60 * 1000; // 默认5分钟
      this.setCachedData(cacheKey, transformedData, cacheTime);

      return transformedData;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "数据获取失败";

      this.setState({
        errors: {
          ...this.state.errors,
          [fieldKey]: errorMessage,
        },
      });

      throw error;
    } finally {
      // 清除加载状态
      this.setState({
        loading: {
          ...this.state.loading,
          [fieldKey]: false,
        },
      });
    }
  }

  /**
   * 清除指定字段的缓存
   */
  clearCache(fieldKey?: string): void {
    if (fieldKey) {
      const newCache = { ...this.state.cache };
      Object.keys(newCache).forEach((key) => {
        if (key.startsWith(`${fieldKey}_`)) {
          delete newCache[key];
        }
      });
      this.setState({ cache: newCache });
    } else {
      this.setState({ cache: {} });
    }
  }

  /**
   * 检查字段是否正在加载
   */
  isLoading(fieldKey: string): boolean {
    return Boolean(this.state.loading[fieldKey]);
  }

  /**
   * 获取字段的错误信息
   */
  getError(fieldKey: string): string {
    return this.state.errors[fieldKey] || "";
  }
}

// 导出单例实例
export const asyncDataManager = new AsyncDataManager();
