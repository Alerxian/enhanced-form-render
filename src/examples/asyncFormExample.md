# 统一 Schema 异步数据配置示例

本示例展示了如何通过统一的 schema 配置来实现异步数据获取和表单字段联动功能。

## 功能特点

### 1. 统一的异步数据源配置

- 通过 `AsyncDataSource` 接口定义统一的数据源配置
- 支持缓存机制，提高性能
- 支持数据转换函数，适配不同 API 格式
- 支持字段依赖，实现级联加载

### 2. 类型安全的 Schema 定义

- 扩展了标准 form-render Schema
- 增加了 `asyncDataSource` 配置项
- 支持静态选项作为降级方案
- 完整的 TypeScript 类型支持

### 3. 智能的数据管理

- 自动处理加载状态
- 统一的错误处理机制
- 缓存管理和清理
- 依赖变化时自动重新加载

## 核心架构

```typescript
// 异步数据源配置
interface AsyncDataSource {
  url: string; // 接口URL
  method?: "GET" | "POST"; // HTTP方法
  params?: Record<string, any>; // 请求参数
  transform?: (data: any) => SelectOption[]; // 数据转换
  cacheTime?: number; // 缓存时间
  dependencies?: string[]; // 依赖字段
}

// 增强的字段Schema
interface EnhancedFieldSchema {
  // 标准属性
  title: string;
  type: string;
  widget?: string;

  // 异步数据配置
  asyncDataSource?: AsyncDataSource;

  // 静态选项（降级方案）
  enum?: any[];
  enumNames?: string[];

  // 联动配置
  linkage?: {
    trigger?: string;
    actions?: Action[];
  };
}
```

## 使用示例

### 1. 简单异步选项

```typescript
const simpleAsyncField = {
  title: "部门",
  type: "string",
  widget: "select",
  asyncDataSource: {
    url: "/api/departments",
    method: "GET",
    cacheTime: 30 * 60 * 1000, // 30分钟缓存
    transform: (data) => {
      return data.map((dept) => ({
        value: dept.id,
        label: dept.name,
      }));
    },
  },
};
```

### 2. 级联联动选项

```typescript
const cascadeField = {
  title: "员工",
  type: "string",
  widget: "select",
  asyncDataSource: {
    url: "/api/employees",
    method: "GET",
    params: {
      departmentId: "{{formData.department}}",
    },
    dependencies: ["department"], // 依赖部门字段
    cacheTime: 10 * 60 * 1000,
    transform: (data) => {
      return data.map((emp) => ({
        value: emp.id,
        label: `${emp.name} - ${emp.position}`,
      }));
    },
  },
  disabled: "{{!formData.department}}", // 未选择部门时禁用
  hidden: "{{!formData.department}}", // 未选择部门时隐藏
};
```

### 3. 复杂异步配置

```typescript
const complexAsyncSchema = {
  type: "object",
  globalDataSources: {
    // 全局数据源定义
    provinces: {
      url: "/api/regions/provinces",
      cacheTime: 60 * 60 * 1000, // 1小时缓存
    },
  },
  properties: {
    province: {
      title: "省份",
      asyncDataSource: {
        url: "/api/regions/provinces",
        cacheTime: 30 * 60 * 1000,
        transform: (data) =>
          data.data?.map((item) => ({
            value: item.id,
            label: item.name,
          })),
      },
    },
    city: {
      title: "城市",
      asyncDataSource: {
        url: "/api/regions/cities",
        params: { provinceId: "{{formData.province}}" },
        dependencies: ["province"],
        transform: (data) =>
          data.data?.map((item) => ({
            value: item.id,
            label: item.name,
          })),
      },
      linkage: {
        trigger: "province",
        actions: [{ type: "clear" }, { type: "reload" }],
      },
    },
  },
};
```

## 实际应用场景

### 1. 地区级联选择

省份 → 城市 → 区县的三级联动选择，每级都通过异步接口获取数据。

### 2. 分类商品选择

产品分类 → 产品列表的二级联动，根据分类动态加载商品列表。

### 3. 组织架构选择

部门 → 员工的选择，根据部门动态加载该部门下的员工列表。

### 4. 权限配置

角色 → 权限的配置，根据角色动态加载可分配的权限列表。

## 优势总结

1. **配置统一**: 所有异步数据通过统一的 schema 配置，降低学习成本
2. **类型安全**: 完整的 TypeScript 类型定义，编译期检查错误
3. **性能优化**: 内置缓存机制，避免重复请求
4. **错误处理**: 统一的错误处理和降级机制
5. **开发效率**: 声明式配置，减少样板代码
6. **可维护性**: 配置和逻辑分离，便于维护和扩展

这套方案为复杂表单的异步数据处理提供了完整的解决方案，既保证了开发效率，又确保了代码质量和用户体验。
