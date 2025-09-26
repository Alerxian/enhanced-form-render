# AsyncDataSource Params 动态字段值获取语法

## 功能说明

在 AsyncDataSource 的 params 配置中，现在支持使用`{{}}`语法来动态获取表单字段值，其他值保持不变。

## 语法格式

```typescript
params: {
  // 动态获取表单字段值
  fieldName: "{{fieldPath}}",

  // 静态值保持不变
  staticParam: "staticValue",

  // 数字、布尔值等其他类型保持不变
  numericParam: 123,
  booleanParam: true,
}
```

## 使用示例

### 1. 基本用法

```typescript
asyncDataSource: {
  url: "/api/data",
  method: "GET",
  params: {
    // 从表单的series字段获取值
    series: "{{series}}",

    // 从嵌套字段获取值
    userId: "{{user.id}}",

    // 静态参数
    category: "redis",

    // 其他类型参数
    limit: 10,
    active: true,
  }
}
```

### 2. Redis 组件中的实际应用

```typescript
// 服务单元字段 - 依赖systemCode和envType
serviceUnitIds: {
  asyncDataSource: {
    url: "/api/redis/service-units",
    dependencies: ["systemCode", "envType"],
    params: {
      systemCode: "{{systemCode}}", // 动态获取
      envType: "{{envType}}",       // 动态获取
    },
  }
},

// CPU类型字段 - 依赖series
cpuType: {
  asyncDataSource: {
    url: "/api/redis/cpu-types",
    dependencies: ["series"],
    params: {
      series: "{{series}}", // 动态获取
      // 静态参数可以混合使用
      stable: "true",
    },
  }
},

// 节点类型字段 - 依赖architecture
nodeType: {
  asyncDataSource: {
    url: "/api/redis/node-types",
    dependencies: ["architecture"],
    params: {
      architecture: "{{architecture}}", // 动态获取
    },
  }
}
```

## 实现原理

1. **模式识别**: 系统会检查 params 中的每个值是否为字符串且包含`{{}}`
2. **字段路径提取**: 使用正则表达式`/\\{\\{(.+?)\\}\\}/`提取`{{}}`中的字段路径
3. **动态获取值**: 调用`form.getValueByPath(fieldPath)`获取对应字段的当前值
4. **保持其他值**: 非`{{}}`格式的值保持原样不变

## 优势

1. **灵活性**: 可以混合使用动态字段值和静态值
2. **类型安全**: 支持字符串、数字、布尔值等各种类型的参数
3. **嵌套字段**: 支持获取嵌套对象字段值，如`{{user.profile.name}}`
4. **向后兼容**: 不会影响现有的静态参数配置

## 注意事项

1. **字段路径**: `{{}}`中的字段路径必须是有效的表单字段路径
2. **空白处理**: 字段路径会自动 trim 去除前后空白
3. **错误处理**: 如果字段路径无效，会返回 undefined
4. **性能**: 只在 params 包含`{{}}`时才进行动态解析，不影响静态参数的性能

## 对比

### 旧语法（已弃用）

```typescript
params: {
  series: "series", // 直接使用字段名
}
```

### 新语法（推荐）

```typescript
params: {
  series: "{{series}}", // 使用{{}}语法明确标识动态字段
  category: "redis",    // 静态值保持不变
}
```

新语法更加明确和灵活，支持静态值和动态值的混合使用。
