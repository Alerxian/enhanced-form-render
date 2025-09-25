import React, { useMemo, useCallback, useEffect, useState } from "react";
import FormRender, { useForm } from "form-render";
import type { FRProps, Schema, WatchProperties } from "form-render";
import { asyncDataManager } from "../../utils/AsyncDataManager";
import type {
  EnhancedSchema,
  EnhancedFieldSchema,
  SelectOption,
} from "../../types/schema";
import { genAsyncFields } from "./utils";

interface EnhancedFormRenderProps extends FRProps {
  schema: EnhancedSchema;
}

/**
 * 增强的表单渲染器
 * 支持通过统一schema配置异步数据获取
 * 重新设计以遵守React Hooks规则
 */
const EnhancedFormRender: React.FC<EnhancedFormRenderProps> = ({
  schema,
  form: externalForm,
  displayType = "row",
  labelWidth = 120,
  ...props
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

  // 收集所有需要异步数据的字段
  const [asyncFields, dependencyMap] = useMemo(() => {
    return genAsyncFields(schema);
  }, [schema]);

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
        const { dependencies, params } = config.asyncDataSource || {};
        if (!dependencies || dependencies.length === 0) {
          await fetchAsyncData(path, config, params || {});
        }
      }
    };

    initializeAsyncData();
  }, [asyncFields, fetchAsyncData]);

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
            disabled: asyncResult.loading || props.disabled,
          };
        }
        return schemaNode;
      }
    };
    return updateSchemaWithAsyncData(schema);
  }, [schema, asyncDataResults, props.disabled]);

  // 处理依赖字段变化的统一函数
  const handleDependencyChange = useCallback(
    (fieldName: string, value: unknown) => {
      const dependentFields = dependencyMap.get(fieldName);
      if (!dependentFields) return;

      console.log(`字段 ${fieldName} 变化:`, value);

      dependentFields.forEach(({ path: targetPath, config: targetConfig }) => {
        const { dependencies: deps, params } = targetConfig.asyncDataSource!;

        // 获取所有依赖字段的当前值
        let contextParams: Record<string, unknown> = {};
        let hasDependencyValue = false;

        deps!.forEach((dependency) => {
          const depValue = form.getValueByPath(dependency);
          if (depValue !== undefined && depValue !== null && depValue !== "") {
            hasDependencyValue = true;
          }
        });

        // 处理params参数
        if (params) {
          const paramsValues = Object.fromEntries(
            Object.entries(params).map(([key, path]) => [
              key,
              form.getValueByPath(path),
            ])
          );
          contextParams = { ...contextParams, ...paramsValues };
        }

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
      });
    },
    [dependencyMap, fetchAsyncData, form]
  );

  // 构建 watch 监听配置
  const watchConfig = useMemo(() => {
    const watch: WatchProperties = {};

    // 为所有有依赖的字段添加监听器
    dependencyMap.forEach((_, fieldName) => {
      watch[fieldName] = (value: unknown) => {
        handleDependencyChange(fieldName, value);
      };
    });

    JSON.stringify(
      {
        fn: () => {
          return 1;
        },
        a: 1,
      },
      (key, value) => {
        if (typeof value === "function") {
          value = value.toString();
        }
        return value;
      },
      2
    );
    // 合并外部传入的watch配置，外部配置优先级更高
    if (props.watch) {
      Object.entries(props.watch).forEach(([fieldName, handler]) => {
        const originalHandler = watch[fieldName];
        if (originalHandler) {
          // 如果内部已有监听器，则组合调用
          watch[fieldName] = (value: unknown) => {
            // 先调用内部逻辑
            if (typeof originalHandler === "function") {
              originalHandler(value);
            }
            // 再调用外部逻辑
            if (typeof handler === "function") {
              handler(value);
            } else if (typeof handler === "object" && handler.handler) {
              handler.handler(value);
            }
          };
        } else {
          // 如果内部没有监听器，直接使用外部监听器
          watch[fieldName] = handler;
        }
      });
    }

    return watch;
  }, [dependencyMap, handleDependencyChange, props.watch]);

  return (
    <FormRender
      {...props}
      schema={enhancedSchema}
      form={form}
      watch={watchConfig}
      displayType={displayType}
      labelWidth={labelWidth}
    />
  );
};

export default EnhancedFormRender;
export type { EnhancedFormRenderProps };
