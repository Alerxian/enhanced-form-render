# Redis 表单组件 AsyncDataSource 配置说明

## 功能概述

成功将 Redis 表单组件从直接 API 调用转换为使用统一的 asyncDataSource 配置模式，遵循项目的异步数据 schema 标准。

## 技术实现

### 1. 🔄 配置转换对比

#### 之前的实现方式

```typescript
// 直接调用API获取数据
const data = await fetchServiceUnitOptions();
form.setSchema({
  serviceUnitIds: {
    props: {
      options: data,
    },
  },
});
```

#### 现在的 asyncDataSource 配置

```typescript
serviceUnitIds: {
  type: "string",
  widget: "select",
  title: "服务单元",
  asyncDataSource: {
    url: "/api/redis/service-units",
    method: "GET",
    dependencies: ["systemCode", "envType"],
    params: {
      systemCode: "systemCode",
      envType: "envType",
    },
    transform: (response) => {
      return response.data.map(item => ({
        label: `${item.name} (${item.code})`,
        value: item.id,
      }));
    },
    cacheTime: 300000, // 5分钟缓存
  },
},
```

### 2. 📡 Backend API 接口

新增的 Redis 相关 API 接口：

- **服务单元**: `GET /api/redis/service-units`
- **资源模板**: `GET /api/redis/resource-templates`
- **可用区**: `GET /api/redis/zones`
- **版本类型**: `GET /api/redis/series`
- **CPU 架构**: `GET /api/redis/cpu-types`
- **引擎版本**: `GET /api/redis/engine-versions`
- **架构类型**: `GET /api/redis/architectures`
- **节点类型**: `GET /api/redis/node-types`
- **实例规格**: `GET /api/redis/instances`

### 3. 🔗 级联依赖配置

实现了复杂的级联依赖关系：

```typescript
// CPU架构依赖版本类型
cpuType: {
  dependencies: ["series"],
  asyncDataSource: {
    dependencies: ["series"],
    params: {
      series: "series",
    },
  },
},

// 节点类型依赖架构类型
nodeType: {
  dependencies: ["architecture"],
  asyncDataSource: {
    dependencies: ["architecture"],
    params: {
      architecture: "architecture",
    },
  },
},
```

## 字段配置详解

### 服务单元字段 (serviceUnitIds)

- **依赖字段**: systemCode, envType
- **多选支持**: `mode: "multiple"`
- **数据转换**: 名称+代码组合显示
- **缓存时间**: 5 分钟

### 资源模板字段 (resourceTpl)

- **无依赖**: 组件加载时立即获取
- **长缓存**: 10 分钟缓存

### CPU 架构字段 (cpuType)

- **依赖字段**: series (版本类型)
- **级联更新**: 版本类型变化时自动更新选项
- **参数传递**: 将 series 值作为查询参数

### 节点类型字段 (nodeType)

- **依赖字段**: architecture (架构类型)
- **联动逻辑**: 架构类型变化时重新加载

## 技术优势

### 1. 🏗️ 架构统一

- 遵循项目统一的 schema 配置标准
- 使用增强表单组件(`EnhancedFormRender`)
- 完全声明式配置，无需手动 API 调用

### 2. ⚡ 性能优化

- 智能缓存机制，减少重复请求
- 依赖字段变化时精确更新
- 异步加载状态管理

### 3. 🔄 依赖管理

- 自动处理字段级联关系
- 支持多重依赖配置
- 参数自动映射传递

### 4. 🛡️ 错误处理

- 统一的错误处理机制
- 加载状态可视化
- 网络异常恢复

## 使用方式

### 1. 启动 Backend 服务

```bash
cd backend
npm start
```

### 2. 启动前端应用

```bash
npm run dev
```

### 3. 测试功能

1. 访问"表单联动演示"标签页
2. 观察服务单元字段的异步加载
3. 测试版本类型 →CPU 架构的级联关系
4. 测试架构类型 → 节点类型的级联关系

## 配置模式总结

| 字段名         | 依赖字段            | API 端点                      | 缓存时间 | 特殊配置 |
| -------------- | ------------------- | ----------------------------- | -------- | -------- |
| serviceUnitIds | systemCode, envType | /api/redis/service-units      | 5 分钟   | 多选     |
| resourceTpl    | 无                  | /api/redis/resource-templates | 10 分钟  | -        |
| zoneId         | 无                  | /api/redis/zones              | 5 分钟   | 必填     |
| series         | 无                  | /api/redis/series             | 10 分钟  | 单选     |
| cpuType        | series              | /api/redis/cpu-types          | 5 分钟   | 级联     |
| engineVersion  | 无                  | /api/redis/engine-versions    | 10 分钟  | 稳定版   |
| architecture   | 无                  | /api/redis/architectures      | 10 分钟  | -        |
| nodeType       | architecture        | /api/redis/node-types         | 5 分钟   | 级联     |
| instance       | 无                  | /api/redis/instances          | 5 分钟   | -        |

这个实现为项目提供了标准化的异步数据配置模式，为后续类似功能开发提供了可复用的架构基础。
