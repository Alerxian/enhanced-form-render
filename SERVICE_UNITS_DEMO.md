# 服务单元数据模拟与填充功能

## 功能概述

成功实现了服务单元数据的模拟请求和动态填充功能，集成到 Redis 模板表单中。

## 实现特性

### 1. 🌐 API 数据模拟 (`/src/api/serviceUnits.ts`)

- **完整的服务单元数据结构**：包含 ID、名称、状态、容器配置、版本等信息
- **多种查询方式**：支持按系统代码、环境类型、状态等条件过滤
- **网络延迟模拟**：300-800ms 随机延迟，真实模拟网络请求
- **错误处理模拟**：可配置错误率，测试异常情况
- **分页支持**：支持分页查询，适配大数据量场景

### 2. 📝 增强的 Redis 表单 (`/src/components/redis/index.tsx`)

- **动态数据加载**：根据系统和环境自动加载对应的服务单元
- **实时状态监控**：显示加载状态、服务数量统计
- **状态可视化**：通过颜色编码区分不同服务状态
- **智能交互**：系统或环境变化时自动重新加载数据

### 3. 🎨 状态可视化展示

- **运行状态颜色编码**：
  - 🟢 `running`：绿色 - 服务正常运行
  - 🔵 `deploying`：蓝色 - 正在部署
  - 🔴 `error`：红色 - 服务异常（不可选择）
  - 🟡 `pending`：橙色 - 等待中
  - ⚫ `stopped`：灰色 - 已停止

## 数据结构

### 服务单元接口

```typescript
interface ServiceUnit {
  id: string; // 服务ID
  name: string; // 服务名称
  code: string; // 服务代码
  status: "running" | "stopped" | "error" | "pending" | "deploying";
  systemCode: string; // 所属系统
  systemName: string; // 系统名称
  envType: string; // 环境类型
  containerConfig: {
    // 容器配置
    image: string; // 镜像
    port: number; // 端口
    replicas: number; // 副本数
    cpu: string; // CPU配额
    memory: string; // 内存配额
  };
  version?: string; // 版本号
  lastUpdate?: string; // 最后更新时间
  description?: string; // 描述信息
}
```

## 模拟数据

系统已预置 8 个服务单元的完整数据：

1. **认证服务** (`AUTH_SVC`) - 🟢 running
2. **用户服务** (`USER_SVC`) - 🔵 deploying
3. **API 网关** (`API_GATEWAY`) - 🟢 running
4. **支付服务** (`PAY_SVC`) - 🔴 error
5. **通知服务** (`NOTIFY_SVC`) - 🟡 pending
6. **日志服务** (`LOG_SVC`) - 🟢 running
7. **缓存服务** (`CACHE_SVC`) - 🟢 running
8. **数据库服务** (`DB_SVC`) - 🟢 running

## API 函数

### 核心 API

- `fetchServiceUnits(query)` - 获取服务单元列表
- `fetchServiceUnitOptions(query)` - 获取表单选项格式数据
- `fetchServiceUnitById(id)` - 根据 ID 获取详情
- `fetchServiceUnitsByIds(ids)` - 批量获取详情
- `fetchServiceUnitsWithError(query, errorRate)` - 模拟错误情况

### 查询参数

```typescript
interface ServiceUnitQuery {
  systemCode?: string; // 系统代码过滤
  envType?: string; // 环境类型过滤
  status?: string; // 状态过滤
  page?: number; // 页码
  pageSize?: number; // 每页数量
}
```

## 使用方式

### 1. 启动应用

```bash
npm run dev
```

### 2. 测试功能

1. 打开浏览器访问 `http://localhost:5173`
2. 点击"表单联动演示"标签页
3. 观察服务单元数据自动加载过程
4. 查看右侧状态监控面板的实时展示
5. 尝试选择不同服务单元并提交表单

### 3. 控制台输出

打开浏览器开发者工具查看详细的数据加载和交互日志：

- 服务单元数据加载日志
- 表单提交数据详情
- 选中服务单元的完整信息

## 技术亮点

### 1. 🔄 异步数据管理

- 使用 React Hooks 进行状态管理
- 加载状态和错误处理机制
- 数据缓存和重新加载逻辑

### 2. 🎯 智能联动

- 监听系统和环境字段变化
- 自动触发数据重新加载
- 表单验证和提交处理

### 3. 📊 状态可视化

- 实时状态监控面板
- 颜色编码的状态指示
- 服务异常状态的禁用处理

### 4. 🛡️ 错误处理

- 网络错误捕获和显示
- 空数据状态的友好提示
- TypeScript 类型安全保障

## 扩展计划

1. **真实 API 集成**：替换模拟数据为真实后端 API
2. **WebSocket 实时更新**：服务状态变化时实时推送
3. **批量操作功能**：支持批量启停服务
4. **历史记录查看**：服务状态变更历史
5. **监控图表集成**：集成服务性能监控图表

这个实现为后续的真实环境部署提供了完整的原型和参考模板。
