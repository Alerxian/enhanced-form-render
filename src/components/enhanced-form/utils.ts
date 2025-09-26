import type {
  EnhancedFieldSchema,
  EnhancedSchema,
  SelectOption,
  AsyncDataSource,
} from "../../types/schema";
import type { Schema } from "form-render";
import type { FormInstance } from "form-render";

export const genAsyncFields = (schema: EnhancedSchema) => {
  const fields: Array<{
    path: string;
    config: EnhancedFieldSchema;
  }> = [];
  const map = new Map<
    string,
    Array<{ path: string; config: EnhancedFieldSchema }>
  >();

  const collectAsyncFields = (
    schemaNode: EnhancedSchema | EnhancedFieldSchema,
    path = ""
  ): void => {
    if ("properties" in schemaNode) {
      Object.entries(schemaNode.properties || {}).forEach(([key, value]) => {
        const currentPath = path ? `${path}.${key}` : key;
        collectAsyncFields(value, currentPath);
      });
    } else {
      const fieldSchema = schemaNode as EnhancedFieldSchema;
      if (fieldSchema.asyncDataSource) {
        // 收集异步加载字段
        fields.push({
          path,
          config: fieldSchema,
        });
        // 收集字段的依赖字段 构建依赖关系映射，优化监听逻辑
        fieldSchema.asyncDataSource.dependencies?.forEach((dep) => {
          if (!map.has(dep)) {
            map.set(dep, []);
          }
          map.get(dep)!.push({ path, config: fieldSchema });
        });
      }
    }
  };

  collectAsyncFields(schema);
  return [fields, map] as const;
};

/**
 * 处理params参数，支持{{}}语法动态获取表单字段值
 * @param params 原始参数对象
 * @param form 表单实例
 * @returns 处理后的参数对象
 */
export const processParams = (
  params: Record<string, unknown>,
  form: FormInstance
): Record<string, unknown> => {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      // 如果值是字符串且包含{{}}
      if (
        typeof value === "string" &&
        value.includes("{") &&
        value.includes("}")
      ) {
        // 使用正则表达式匹配{{}}中的内容
        const fieldPath = value.match(/^\{(.+?)\}$/)?.[1]?.trim();
        if (fieldPath) {
          return [key, form.getValueByPath(fieldPath)];
        }
      }
      // 其他情况保持原值
      return [key, value];
    })
  );
};

/**
 * 选择默认值的逻辑
 * @param defaultValue 默认值配置
 * @param data 选项数据
 * @returns 选中的值
 */
export const selectDefaultValue = (
  defaultValue: NonNullable<AsyncDataSource["defaultValue"]>,
  data: SelectOption[]
): string | number | undefined => {
  // 静态默认值
  if (defaultValue.value !== undefined) {
    return defaultValue.value;
  }

  // 动态选择器
  if (defaultValue.selector) {
    const selector = defaultValue.selector;

    if (selector.byValue !== undefined) {
      const option = data.find((item) => item.value === selector.byValue);
      if (option) return option.value;
    }

    // 如果byValue没有找到，再尝试其他选择器
    if (selector.byLabel !== undefined) {
      const option = data.find((item) => item.label === selector.byLabel);
      if (option) return option.value;
    }

    if (selector.byIndex !== undefined) {
      const option = data[selector.byIndex];
      if (option) return option.value;
    }

    if (selector.custom) {
      return selector.custom(data);
    }
  }

  return undefined;
};

/**
 * 检查字段是否有值
 * @param value 字段值
 * @returns 是否有值
 */
export const hasFieldValue = (value: unknown): boolean => {
  return value !== undefined && value !== null && value !== "";
};

/**
 * 检查依赖字段是否都有值
 * @param dependencies 依赖字段列表
 * @param form 表单实例
 * @returns 是否都有值
 */
export const hasDependencyValues = (
  dependencies: string[],
  form: FormInstance
): boolean => {
  return dependencies.some((dependency) => {
    const depValue = form.getValueByPath(dependency);
    return hasFieldValue(depValue);
  });
};

/**
 * 更新schema，注入异步数据
 * @param schemaNode schema节点
 * @param asyncDataResults 异步数据结果
 * @param disabled 是否禁用
 * @param path 当前路径
 * @returns 更新后的schema
 */
export const updateSchemaWithAsyncData = (
  schemaNode: Schema,
  asyncDataResults: Record<
    string,
    { data: SelectOption[]; loading: boolean; error: string }
  >,
  disabled?: boolean,
  path = ""
): Schema => {
  if (schemaNode.properties) {
    const updatedProperties: Record<string, Schema> = {};

    Object.entries(schemaNode.properties).forEach(([key, value]) => {
      const currentPath = path ? `${path}.${key}` : key;
      updatedProperties[key] = updateSchemaWithAsyncData(
        value,
        asyncDataResults,
        disabled,
        currentPath
      );
    });

    return {
      ...schemaNode,
      properties: updatedProperties,
    };
  } else {
    const asyncResult = asyncDataResults[path];
    if (asyncResult) {
      return {
        ...schemaNode,
        props: {
          ...schemaNode.props,
          options: asyncResult.data,
        },
        disabled: asyncResult.loading || disabled,
      };
    }
    return schemaNode;
  }
};

/**
 * 检查是否准备好执行异步请求
 * @param ready 准备状态配置
 * @param formValues 表单值
 * @returns 是否准备好
 */
export const checkAsyncReadyState = (
  ready: boolean | ((values: Record<string, unknown>) => boolean) | undefined,
  formValues: Record<string, unknown>
): boolean => {
  if (typeof ready === "boolean") {
    return ready;
  } else if (typeof ready === "function") {
    return ready(formValues);
  }
  return true;
};

/**
 * 创建异步数据状态的初始值
 * @param asyncFields 异步字段列表
 * @returns 初始状态
 */
export const createInitialAsyncDataResults = (
  asyncFields: Array<{ path: string; config: EnhancedFieldSchema }>
): Record<
  string,
  { data: SelectOption[]; loading: boolean; error: string }
> => {
  const initialResults: Record<
    string,
    { data: SelectOption[]; loading: boolean; error: string }
  > = {};

  asyncFields.forEach(({ path }) => {
    initialResults[path] = {
      data: [],
      loading: false,
      error: "",
    };
  });

  return initialResults;
};
