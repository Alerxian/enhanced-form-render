# 异步数据自动设置默认值并触发依赖字段的完整解决方案

## 问题分析

原有的 asyncDataSource 实现方式无法在接口请求完成后自动设置默认值，并且触发依赖字段的 watch 函数执行。

## 解决方案

### 1. 扩展 AsyncDataSource 类型定义

在 `src/types/schema.ts` 中扩展了 AsyncDataSource 接口，增加了 defaultValue 配置：

```typescript
export interface AsyncDataSource {
  // ... 原有属性

  // 数据加载完成后的默认值设置配置
  defaultValue?: {
    // 静态默认值
    value?: string | number;
    // 动态默认值选择器 - 根据加载的数据选择默认值
    selector?: {
      // 按值匹配
      byValue?: string | number;
      // 按标签匹配
      byLabel?: string;
      // 按索引选择（0为第一个）
      byIndex?: number;
      // 自定义选择函数
      custom?: (options: SelectOption[]) => string | number | undefined;
    };
    // 是否触发依赖字段的数据加载
    triggerDependencies?: boolean;
  };
}
```

### 2. 增强表单组件实现

在 `src/components/enhanced-form/index.tsx` 中的 fetchAsyncData 函数中增加了默认值处理逻辑：

```typescript
// 处理数据加载完成后的默认值设置
const { defaultValue } = config.asyncDataSource;
if (defaultValue && data.length > 0) {
  const currentValue = form.getValueByPath(fieldPath);

  // 只有当前字段没有值时才设置默认值
  if (
    currentValue === undefined ||
    currentValue === null ||
    currentValue === ""
  ) {
    let selectedValue: string | number | undefined;

    // 静态默认值
    if (defaultValue.value !== undefined) {
      selectedValue = defaultValue.value;
    }
    // 动态选择器
    else if (defaultValue.selector) {
      const selector = defaultValue.selector;

      if (selector.byValue !== undefined) {
        const option = data.find((item) => item.value === selector.byValue);
        selectedValue = option?.value;
      }

      // 如果byValue没有找到，再尝试其他选择器
      if (selectedValue === undefined) {
        if (selector.byLabel !== undefined) {
          const option = data.find((item) => item.label === selector.byLabel);
          selectedValue = option?.value;
        } else if (selector.byIndex !== undefined) {
          const option = data[selector.byIndex];
          selectedValue = option?.value;
        } else if (selector.custom) {
          selectedValue = selector.custom(data);
        }
      }
    }

    // 设置默认值
    if (selectedValue !== undefined) {
      form.setValues({
        [fieldPath]: selectedValue,
      });

      // 如果配置了触发依赖字段，则手动触发依赖更新
      if (defaultValue.triggerDependencies !== false) {
        setTimeout(() => {
          handleDependencyChange(fieldPath, selectedValue);
        }, 50);
      }
    }
  }
}
```

### 3. Redis 组件配置

在 `src/components/redis/index.tsx` 中的 series 字段配置了 defaultValue：

```typescript
series: {
  type: "string",
  widget: "radio",
  title: "版本类型",
  required: true,
  asyncDataSource: {
    url: "/api/redis/series",
    method: "GET",
    transform: (data: { id: string; name: string }[]) => {
      return data.map((item) => ({
        label: item.name,
        value: item.id,
      }));
    },
    cacheTime: 600000,
    // 数据加载完成后自动设置默认值
    defaultValue: {
      selector: {
        byValue: "enterprise", // 优先选择enterprise
        byIndex: 0, // 如果没有enterprise则选择第一个
      },
      triggerDependencies: true, // 设置值后触发依赖字段更新
    },
  },
},
```

## 实现原理

1. **数据加载监听**: 当 asyncDataSource 的数据加载完成后，检查是否配置了 defaultValue
2. **智能默认值选择**: 支持多种默认值选择策略，包括静态值、按值匹配、按标签匹配、按索引选择和自定义函数
3. **避免覆盖用户值**: 只有当前字段没有值时才设置默认值，不会覆盖用户已输入的值
4. **自动触发依赖**: 设置默认值后，如果配置了 triggerDependencies，会自动触发依赖字段的数据加载
5. **异步处理**: 使用 setTimeout 确保表单值更新后再触发依赖字段更新，避免时序问题

## 优势

1. **声明式配置**: 通过 schema 配置即可实现复杂的默认值逻辑，无需编写额外代码
2. **类型安全**: 完整的 TypeScript 类型定义，提供良好的开发体验
3. **灵活性**: 支持多种默认值选择策略，可应对各种业务场景
4. **自动化**: 自动处理依赖字段的级联更新，无需手动管理
5. **性能优化**: 只在必要时触发依赖更新，避免不必要的 API 请求

## 测试场景

1. **基本场景**: series 字段数据加载完成后，自动设置为"enterprise"（如果存在）
2. **级联触发**: series 字段设置默认值后，自动触发 cpuType 字段的数据加载
3. **容错处理**: 如果"enterprise"不存在，则选择第一个选项
4. **用户输入保护**: 如果用户已经手动选择了 series 值，不会被默认值覆盖

## 使用方法

1. 在 AsyncDataSource 配置中添加 defaultValue 配置
2. 根据需要选择合适的默认值选择策略
3. 设置 triggerDependencies 为 true 以自动触发依赖字段更新
4. 增强表单组件会自动处理默认值设置和依赖触发逻辑

这个解决方案完全解决了原有 asyncDataSource 无法设置默认值和触发依赖字段的问题，提供了一个完整、灵活、类型安全的解决方案。
