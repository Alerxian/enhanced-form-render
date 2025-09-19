import React, { useMemo, useCallback, useEffect, useState } from "react";
import FormRender, { useForm } from "form-render";
import type { Schema } from "form-render";
import { asyncDataManager } from "../../utils/AsyncDataManager";
import type {
  EnhancedSchema,
  EnhancedFieldSchema,
  SelectOption,
} from "../../types/schema";

interface EnhancedFormRenderProps {
  schema: EnhancedSchema;
  // formData?: Record<string, unknown>;
  onValuesChange?: (values: Record<string, unknown>) => void;
  onFinish?: (values: Record<string, unknown>) => void;
  form?: ReturnType<typeof useForm>;
  displayType?: "row" | "column";
  labelWidth?: number;
  disabled?: boolean;
  readOnly?: boolean;
}

/**
 * 增强的表单渲染器
 * 支持通过统一schema配置异步数据获取
 * 重新设计以遵守React Hooks规则
 */
const EnhancedFormRender: React.FC<EnhancedFormRenderProps> = ({
  schema,
  // formData = {},
  onValuesChange,
  onFinish,
  form: externalForm,
  displayType = "row",
  labelWidth = 120,
  disabled = false,
  readOnly = false,
}) => {
  const internalForm = useForm();
  const form = externalForm || internalForm;

  // 异步数据状态管理
  const [asyncDataResults, setAsyncDataResults] = useState<
    Record<
      string,
      {
        data: SelectOption[];
        loading: boolean;
        error: string;
      }
    >
  >({});
  const [isInitialized, setIsInitialized] = useState(false);

  // 递归处理schema，为有异步数据源的字段添加数据
  const processSchema = useCallback(
    (schemaNode: EnhancedSchema | EnhancedFieldSchema, _path = ""): Schema => {
      if ("properties" in schemaNode) {
        // 处理对象类型的schema
        const processedProperties: Record<string, Schema> = {};

        Object.entries(schemaNode.properties).forEach(([key, value]) => {
          const currentPath = _path ? `${_path}.${key}` : key;
          processedProperties[key] = processSchema(value, currentPath);
        });

        return {
          type: schemaNode.type,
          title: schemaNode.title,
          description: schemaNode.description,
          properties: processedProperties,
        };
      } else {
        // 处理字段类型的schema
        const fieldSchema = schemaNode as EnhancedFieldSchema;
        const processedField: Schema = {
          title: fieldSchema.title,
          type: fieldSchema.type,
          widget: fieldSchema.widget,
          placeholder: fieldSchema.placeholder,
          default: fieldSchema.default,
          required: fieldSchema.required,
          hidden: fieldSchema.hidden,
          disabled: fieldSchema.disabled,
        };

        // 如果有静态选项，直接使用
        if (fieldSchema.enum && fieldSchema.enumNames) {
          processedField.enum = fieldSchema.enum;
          processedField.enumNames = fieldSchema.enumNames;
        }

        return processedField;
      }
    },
    []
  );

  // 收集所有需要异步数据的字段
  const asyncFields = useMemo(() => {
    const fields: Array<{
      path: string;
      config: EnhancedFieldSchema;
    }> = [];

    const collectAsyncFields = (
      schemaNode: EnhancedSchema | EnhancedFieldSchema,
      path = ""
    ): void => {
      if ("properties" in schemaNode) {
        Object.entries(schemaNode.properties).forEach(([key, value]) => {
          const currentPath = path ? `${path}.${key}` : key;
          collectAsyncFields(value, currentPath);
        });
      } else {
        const fieldSchema = schemaNode as EnhancedFieldSchema;
        if (fieldSchema.asyncDataSource) {
          fields.push({
            path,
            config: fieldSchema,
          });
        }
      }
    };

    collectAsyncFields(schema);
    return fields;
  }, [schema]);
  console.log(asyncFields, "asyncFields");

  // 异步数据获取函数
  const fetchAsyncData = useCallback(
    async (
      fieldPath: string,
      config: EnhancedFieldSchema,
      contextParams: Record<string, unknown>
    ) => {
      if (!config.asyncDataSource) return;

      try {
        // 设置加载状态
        setAsyncDataResults((prev) => ({
          ...prev,
          [fieldPath]: {
            data: prev[fieldPath]?.data || [],
            loading: true,
            error: "",
          },
        }));

        const data = await asyncDataManager.fetchData(
          fieldPath,
          config.asyncDataSource,
          contextParams
        );

        setAsyncDataResults((prev) => ({
          ...prev,
          [fieldPath]: {
            data,
            loading: false,
            error: "",
          },
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "获取数据失败";
        setAsyncDataResults((prev) => ({
          ...prev,
          [fieldPath]: {
            data: prev[fieldPath]?.data || [],
            loading: false,
            error: errorMessage,
          },
        }));
      }
    },
    []
  );

  // 初始化异步数据
  useEffect(() => {
    const initializeAsyncData = async () => {
      // 初始化所有异步字段的空状态
      const initialResults: Record<
        string,
        {
          data: SelectOption[];
          loading: boolean;
          error: string;
        }
      > = {};

      asyncFields.forEach(({ path }) => {
        initialResults[path] = {
          data: [],
          loading: false,
          error: "",
        };
      });

      setAsyncDataResults(initialResults);

      // 获取无依赖字段的数据
      for (const { path, config } of asyncFields) {
        if (
          config.asyncDataSource &&
          (!config.asyncDataSource.dependencies ||
            config.asyncDataSource.dependencies.length === 0)
        ) {
          await fetchAsyncData(path, config, {});
        }
      }

      setIsInitialized(true);
    };

    initializeAsyncData();
  }, [asyncFields, fetchAsyncData]);

  // 监听表单数据变化，更新依赖字段（仅用于初始化时的检查）
  useEffect(() => {
    if (!isInitialized) return;

    const formData = form.getValues();
    console.log(formData, "formData - initial check");

    asyncFields.forEach(({ path, config }) => {
      if (config.asyncDataSource?.dependencies) {
        // 获取依赖字段的值
        const contextParams: Record<string, unknown> = {};
        let hasDependencyValue = false;

        config.asyncDataSource.dependencies.forEach((dep) => {
          const value = formData[dep];
          contextParams[dep] = value;
          if (value !== undefined && value !== null && value !== "") {
            hasDependencyValue = true;
          }
        });

        // 只有当依赖字段有值时才获取数据
        if (hasDependencyValue) {
          fetchAsyncData(path, config, contextParams);
        }
      }
    });
  }, [asyncFields, fetchAsyncData, isInitialized, form]);

  // 动态更新schema，注入异步数据
  const enhancedSchema = useMemo(() => {
    const updateSchemaWithAsyncData = (
      schemaNode: Schema,
      path = ""
    ): Schema => {
      if (schemaNode.properties) {
        const updatedProperties: Record<string, Schema> = {};

        Object.entries(schemaNode.properties).forEach(([key, value]) => {
          const currentPath = path ? `${path}.${key}` : key;
          updatedProperties[key] = updateSchemaWithAsyncData(
            value,
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
            enum: asyncResult.data.map((item) => item.value),
            enumNames: asyncResult.data.map((item) => item.label),
            placeholder: asyncResult.loading
              ? "正在加载选项..."
              : asyncResult.error || schemaNode.placeholder,
            disabled: asyncResult.loading || disabled,
          };
        }
        return schemaNode;
      }
    };

    const baseSchema = processSchema(schema);
    return updateSchemaWithAsyncData(baseSchema);
  }, [schema, asyncDataResults, disabled, processSchema]);

  // 构建 watch 监听配置
  const watchConfig = useMemo(() => {
    const watch: Record<string, (...args: unknown[]) => void> = {
      // 全局监听，等同于 onValuesChange
      "#": (allValues: unknown, changedValues: unknown) => {
        console.log("表单全局变化:", { allValues, changedValues });
        onValuesChange?.(allValues as Record<string, unknown>);
      },
    };

    // 为每个有依赖的异步字段添加监听
    asyncFields.forEach(({ config }) => {
      if (config.asyncDataSource?.dependencies) {
        config.asyncDataSource.dependencies.forEach((dep) => {
          // 避免重复添加监听
          if (!watch[dep]) {
            watch[dep] = (value: unknown) => {
              console.log(`字段 ${dep} 变化:`, value);

              // 检查所有依赖该字段的异步字段
              asyncFields.forEach(
                ({ path: targetPath, config: targetConfig }) => {
                  if (
                    targetConfig.asyncDataSource?.dependencies?.includes(dep)
                  ) {
                    // 获取所有依赖字段的当前值
                    const formData = form.getValues();
                    const contextParams: Record<string, unknown> = {};
                    let hasDependencyValue = false;

                    targetConfig.asyncDataSource.dependencies.forEach(
                      (dependency) => {
                        const depValue = formData[dependency];
                        contextParams[dependency] = depValue;
                        if (
                          depValue !== undefined &&
                          depValue !== null &&
                          depValue !== ""
                        ) {
                          hasDependencyValue = true;
                        }
                      }
                    );

                    // 根据依赖字段的值决定是否获取数据
                    if (hasDependencyValue) {
                      fetchAsyncData(targetPath, targetConfig, contextParams);
                    } else {
                      // 清空数据和字段值
                      setAsyncDataResults((prev) => ({
                        ...prev,
                        [targetPath]: {
                          data: [],
                          loading: false,
                          error: "",
                        },
                      }));
                      // 清空目标字段的值
                      form.setValues({ [targetPath]: undefined });
                    }
                  }
                }
              );
            };
          }
        });
      }
    });

    return watch;
  }, [asyncFields, fetchAsyncData, form, onValuesChange]);

  // 处理表单提交
  const handleFinish = useCallback(
    (values: Record<string, unknown>) => {
      onFinish?.(values);
    },
    [onFinish]
  );

  return (
    <FormRender
      schema={enhancedSchema}
      form={form}
      watch={watchConfig}
      onFinish={handleFinish}
      displayType={displayType}
      labelWidth={labelWidth}
      disabled={disabled}
      readOnly={readOnly}
    />
  );
};

export default EnhancedFormRender;
export type { EnhancedFormRenderProps };
