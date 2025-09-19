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
  transform?: (data: unknown) => SelectOption[];
  // 缓存时间（毫秒）
  cacheTime?: number;
  // 依赖字段，当这些字段变化时重新请求
  dependencies?: string[];
}

// 选项数据类型
export interface SelectOption {
  value: string | number;
  label: string;
  [key: string]: unknown;
}

// 扩展的表单字段配置
export interface EnhancedFieldSchema {
  // 基础字段属性
  title: string;
  type: string;
  widget?: string;
  placeholder?: string;
  default?: string | number | boolean;
  required?: boolean;
  hidden?: string | boolean;
  disabled?: string | boolean;

  // 异步数据源配置
  asyncDataSource?: AsyncDataSource;

  // 静态选项（作为异步数据的降级方案）
  enum?: (string | number)[];
  enumNames?: string[];

  // 数据映射配置
  dataMapping?: {
    // 值字段映射
    valueField?: string;
    // 显示文本字段映射
    labelField?: string;
    // 额外数据字段
    extraFields?: Record<string, string>;
  };

  // 联动配置
  linkage?: {
    // 触发条件
    trigger?: string;
    // 触发后的动作
    actions?: Array<{
      type: "reload" | "clear" | "show" | "hide" | "enable" | "disable";
      target?: string;
      condition?: string;
    }>;
  };
}

// 扩展的Schema配置
export interface EnhancedSchema {
  type: string;
  title?: string;
  description?: string;
  properties: Record<string, EnhancedFieldSchema | EnhancedSchema>;

  // 全局异步数据源配置
  globalDataSources?: Record<string, AsyncDataSource>;

  // 表单级别的联动配置
  formLinkage?: Array<{
    trigger: string;
    condition: string;
    actions: Array<{
      type: "reload" | "clear" | "show" | "hide" | "enable" | "disable";
      target: string;
    }>;
  }>;
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
