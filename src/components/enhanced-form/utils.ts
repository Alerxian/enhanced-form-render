import type { EnhancedFieldSchema, EnhancedSchema } from "../../types/schema";

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
