# 增强表单组件工具函数重构

## 重构目标

将增强表单组件中可复用的逻辑抽取到 utils.ts 中，提高代码的可维护性和复用性。

## 抽取的函数

### 1. `processParams` - 参数处理函数

```typescript
export const processParams = (
  params: Record<string, unknown>,
  form: FormInstance
): Record<string, unknown>
```

**功能**: 处理 asyncDataSource 的 params 参数，支持`{{}}`语法动态获取表单字段值
**使用场景**:

- 初始化异步数据时处理 params
- 依赖字段变化时处理 params

### 2. `selectDefaultValue` - 默认值选择函数

```typescript
export const selectDefaultValue = (
  defaultValue: NonNullable<AsyncDataSource['defaultValue']>,
  data: SelectOption[]
): string | number | undefined
```

**功能**: 根据 defaultValue 配置从数据中选择合适的默认值
**支持策略**:

- 静态默认值
- 按值匹配 (byValue)
- 按标签匹配 (byLabel)
- 按索引选择 (byIndex)
- 自定义选择函数 (custom)

### 3. `hasFieldValue` - 字段值检查函数

```typescript
export const hasFieldValue = (value: unknown): boolean
```

**功能**: 检查字段是否有有效值（非 undefined、null、空字符串）

### 4. `hasDependencyValues` - 依赖字段检查函数

```typescript
export const hasDependencyValues = (
  dependencies: string[],
  form: FormInstance
): boolean
```

**功能**: 检查依赖字段列表中是否有任何字段包含有效值

### 5. `updateSchemaWithAsyncData` - Schema 更新函数

```typescript
export const updateSchemaWithAsyncData = (
  schemaNode: Schema,
  asyncDataResults: Record<string, { data: SelectOption[]; loading: boolean; error: string }>,
  disabled?: boolean,
  path = ""
): Schema
```

**功能**: 递归更新 schema，将异步数据注入到对应字段的 props.options 中

### 6. `checkAsyncReadyState` - 异步就绪状态检查函数

```typescript
export const checkAsyncReadyState = (
  ready: boolean | ((values: Record<string, unknown>) => boolean) | undefined,
  formValues: Record<string, unknown>
): boolean
```

**功能**: 检查异步请求是否准备好执行

### 7. `createInitialAsyncDataResults` - 初始状态创建函数

```typescript
export const createInitialAsyncDataResults = (
  asyncFields: Array<{ path: string; config: EnhancedFieldSchema }>
): Record<string, { data: SelectOption[]; loading: boolean; error: string }>
```

**功能**: 为所有异步字段创建初始的空状态

## 重构后的优势

### 1. **代码组织更清晰**

- 业务逻辑从组件中分离
- 每个函数职责单一，易于理解和维护
- utils 文件专门管理可复用的工具函数

### 2. **可测试性提升**

- 纯函数易于单元测试
- 减少了组件层面的复杂逻辑
- 每个工具函数都可以独立测试

### 3. **复用性增强**

- 工具函数可以在其他组件中复用
- 相同的逻辑不需要重复编写
- 便于功能扩展和修改

### 4. **类型安全**

- 完整的 TypeScript 类型定义
- 减少运行时错误的可能性
- 提供良好的开发体验

### 5. **性能优化**

- 减少了组件内部的复杂计算
- 合理的函数拆分有利于代码优化
- 减少不必要的重新渲染

## 使用示例

### 原有代码（组件内部）

```typescript
// 复杂的默认值选择逻辑
if (defaultValue.value !== undefined) {
  selectedValue = defaultValue.value;
} else if (defaultValue.selector) {
  // 大量的选择逻辑...
}
```

### 重构后代码

```typescript
// 简洁的函数调用
const selectedValue = selectDefaultValue(defaultValue, data);
```

## 向后兼容性

- 保持了原有的 API 接口不变
- 组件的使用方式完全相同
- 只是内部实现进行了重构

## 测试建议

1. **单元测试**: 为每个工具函数编写完整的单元测试
2. **集成测试**: 测试组件整体功能是否正常
3. **边界条件**: 测试空数据、错误输入等边界情况

这次重构大大提高了代码的可维护性和可复用性，为后续功能扩展奠定了良好的基础。
