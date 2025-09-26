import React, { useMemo, useCallback, useEffect, useState } from "react";
import FormRender, { useForm } from "form-render";
import type { FRProps, WatchProperties } from "form-render";
import { asyncDataManager } from "./AsyncDataManager";
import type {
  EnhancedSchema,
  EnhancedFieldSchema,
  SelectOption,
} from "../../types/schema";
import {
  genAsyncFields,
  processParams,
  selectDefaultValue,
  hasFieldValue,
  hasDependencyValues,
  updateSchemaWithAsyncData,
  checkAsyncReadyState,
  createInitialAsyncDataResults,
} from "./utils";

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

        // 处理数据加载完成后的默认值设置
        const { defaultValue } = config.asyncDataSource;
        if (defaultValue && data.length > 0) {
          const currentValue = form.getValueByPath(fieldPath);

          // 只有当前字段没有值时才设置默认值
          if (!hasFieldValue(currentValue)) {
            const selectedValue = selectDefaultValue(defaultValue, data);

            // 设置默认值
            if (selectedValue !== undefined) {
              form.setValues({
                [fieldPath]: selectedValue,
              });

              // 如果配置了触发依赖字段，则手动触发依赖更新
              if (defaultValue.triggerDependencies !== false) {
                // 延迟一小段时间再触发，确保表单值已经更新
                setTimeout(() => {
                  handleDependencyChange(fieldPath);
                }, 50);
              }
            }
          }
        }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form]
  );

  // 初始化异步数据
  useEffect(() => {
    const initializeAsyncData = async () => {
      // 初始化所有异步字段的空状态
      const initialResults = createInitialAsyncDataResults(asyncFields);
      setAsyncDataResults(initialResults);

      // 获取无依赖字段的数据
      for (const { path, config } of asyncFields) {
        const { dependencies, params } = config.asyncDataSource || {};
        if (!dependencies || dependencies.length === 0) {
          // 处理初始化时的params参数
          const processedParams = params ? processParams(params, form) : {};
          await fetchAsyncData(path, config, processedParams);
        }
      }
    };

    initializeAsyncData();
  }, [asyncFields, fetchAsyncData, form]);

  // 动态更新schema，注入异步数据
  const enhancedSchema = useMemo(() => {
    return updateSchemaWithAsyncData(schema, asyncDataResults, props.disabled);
  }, [schema, asyncDataResults, props.disabled]);

  // 处理依赖字段变化的统一函数
  const handleDependencyChange = useCallback(
    (fieldName: string) => {
      const dependentFields = dependencyMap.get(fieldName);
      if (!dependentFields) return;

      // console.log(`字段 ${fieldName} 变化:`, value);

      dependentFields.forEach(({ path: targetPath, config: targetConfig }) => {
        const {
          dependencies: deps,
          params,
          ready,
        } = targetConfig.asyncDataSource!;

        // 获取所有依赖字段的当前值
        let contextParams: Record<string, unknown> = {};
        const hasDependencyValue = hasDependencyValues(deps || [], form);

        // 处理params参数
        if (params) {
          contextParams = processParams(params, form);
        }

        const isReady = checkAsyncReadyState(
          typeof ready === "string" ? true : ready,
          form.getValues()
        );

        // 根据依赖字段的值决定是否获取数据
        if (hasDependencyValue && isReady) {
          // 将异步请求操作延迟执行，避免循环依赖
          setTimeout(() => {
            fetchAsyncData(targetPath, targetConfig, contextParams);
          }, 0);
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
      watch[fieldName] = () => {
        handleDependencyChange(fieldName);
      };
    });

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
