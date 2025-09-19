import React, { useMemo, useCallback } from "react";
import FormRender, { useForm } from "form-render";
import type { Schema } from "form-render";
import { useAsyncData } from "../../hooks/useAsyncData";
import type { EnhancedSchema, EnhancedFieldSchema } from "../../types/schema";

interface EnhancedFormRenderProps {
  schema: EnhancedSchema;
  formData?: Record<string, unknown>;
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
 * 通过预分配固定数量的 useAsyncData Hook 来解决 Hooks 规则问题
 */
const EnhancedFormRender: React.FC<EnhancedFormRenderProps> = ({
  schema,
  formData = {},
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

  // 收集所有需要异步数据的字段配置
  const asyncFieldConfigs = useMemo(() => {
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

  // 预分配固定数量的 useAsyncData Hook 调用
  // 这样确保在组件顶层始终调用相同数量的 Hooks
  const field1 = asyncFieldConfigs[0];
  const field2 = asyncFieldConfigs[1];
  const field3 = asyncFieldConfigs[2];
  const field4 = asyncFieldConfigs[3];
  const field5 = asyncFieldConfigs[4];

  // 为每个可能的异步字段准备参数
  const getAsyncParams = (fieldConfig?: {
    path: string;
    config: EnhancedFieldSchema;
  }) => {
    if (!fieldConfig) {
      return {
        fieldKey: "unused",
        dataSource: undefined,
        contextParams: {},
        dependencies: [],
      };
    }

    const contextParams: Record<string, unknown> = {};
    if (fieldConfig.config.asyncDataSource?.dependencies) {
      fieldConfig.config.asyncDataSource.dependencies.forEach((dep) => {
        contextParams[dep] = formData[dep];
      });
    }

    const dependencyValues =
      fieldConfig.config.asyncDataSource?.dependencies?.map(
        (dep) => formData[dep]
      ) || [];

    return {
      fieldKey: fieldConfig.path,
      dataSource: fieldConfig.config.asyncDataSource,
      contextParams,
      dependencies: dependencyValues,
    };
  };

  // 固定调用 5 个 useAsyncData Hook
  const params1 = getAsyncParams(field1);
  const params2 = getAsyncParams(field2);
  const params3 = getAsyncParams(field3);
  const params4 = getAsyncParams(field4);
  const params5 = getAsyncParams(field5);

  const hook1 = useAsyncData(
    params1.fieldKey,
    params1.dataSource,
    params1.contextParams,
    params1.dependencies
  );
  const hook2 = useAsyncData(
    params2.fieldKey,
    params2.dataSource,
    params2.contextParams,
    params2.dependencies
  );
  const hook3 = useAsyncData(
    params3.fieldKey,
    params3.dataSource,
    params3.contextParams,
    params3.dependencies
  );
  const hook4 = useAsyncData(
    params4.fieldKey,
    params4.dataSource,
    params4.contextParams,
    params4.dependencies
  );
  const hook5 = useAsyncData(
    params5.fieldKey,
    params5.dataSource,
    params5.contextParams,
    params5.dependencies
  );

  // 将 Hook 结果映射到字段路径
  const asyncDataResults = useMemo(() => {
    const results: Record<string, typeof hook1> = {};

    if (field1) results[field1.path] = hook1;
    if (field2) results[field2.path] = hook2;
    if (field3) results[field3.path] = hook3;
    if (field4) results[field4.path] = hook4;
    if (field5) results[field5.path] = hook5;

    return results;
  }, [
    field1,
    field2,
    field3,
    field4,
    field5,
    hook1,
    hook2,
    hook3,
    hook4,
    hook5,
  ]);

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
        if (asyncResult && asyncResult.data.length > 0) {
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

  // 处理表单值变化
  const handleValuesChange = useCallback(
    (values: Record<string, unknown>) => {
      onValuesChange?.(values);
    },
    [onValuesChange]
  );

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
      onValuesChange={handleValuesChange}
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
