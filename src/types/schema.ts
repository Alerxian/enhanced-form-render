/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SchemaBase } from "form-render";

// 统一的异步数据源配置类型定义
export interface AsyncDataSource {
  // 接口URL
  url: string;
  // HTTP方法
  method?: "GET" | "POST" | "PUT" | "DELETE";
  // 请求参数
  params?: Record<string, string | number | boolean>;
  // 请求头
  headers?: Record<string, string>;
  // 数据转换函数
  transform?: (data: any) => SelectOption[];
  // 缓存时间（毫秒）
  cacheTime?: number;
  // 依赖字段，当这些字段变化时重新请求
  dependencies?: string[];
  /** 是否可以开始请求 */
  ready?: boolean;
}

// 选项数据类型
export interface SelectOption {
  value: string | number;
  label: string;
  [key: string]: unknown;
}

// 扩展的表单字段配置
export interface EnhancedFieldSchema extends SchemaBase {
  // 异步数据源配置
  asyncDataSource?: AsyncDataSource;
  properties?: Record<string, EnhancedFieldSchema>;
  /** 提交按钮配置 */
  api?: {
    method: "POST";
    url: string;
    transform?: (data: any) => any;
  };
  globalAsyncOptions?: {
    cacheTime?: number;
  };
}

// 扩展的Schema配置
export interface EnhancedSchema extends SchemaBase {
  properties: Record<string, EnhancedFieldSchema>;
}

// 异步数据缓存项
export interface CacheItem {
  data: SelectOption[];
  timestamp: number;
  cacheTime: number;
}

// 异步数据管理器状态
export interface AsyncDataState {
  // 加载状态
  loading: Record<string, boolean>;
  // 数据缓存
  cache: Record<string, CacheItem>;
  // 错误信息
  errors: Record<string, string>;
}
