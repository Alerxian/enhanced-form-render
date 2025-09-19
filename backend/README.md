# Redux Demo Backend API

这是一个简单的 Node.js Express 后端服务，为 redux-demo 项目提供 RESTful API 接口。

## 🚀 快速开始

### 安装依赖

```bash
cd backend
npm install
```

### 启动服务

```bash
# 开发模式（自动重启）
npm run dev

# 生产模式
npm start
```

服务将运行在 `http://localhost:3000`

## 📋 API 接口文档

### 响应格式

所有接口统一返回格式：

```json
{
  "code": 200,
  "message": "请求成功",
  "data": {},
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 🌍 地区相关接口

#### 获取所有地区

- **GET** `/regions`
- **描述**: 获取所有地区列表
- **响应示例**:

```json
{
  "code": 200,
  "message": "获取地区列表成功",
  "data": [
    {
      "id": "1",
      "name": "华北地区",
      "code": "HB"
    }
  ]
}
```

#### 获取地区详情

- **GET** `/regions/:id`
- **参数**: `id` - 地区 ID
- **描述**: 根据 ID 获取地区详细信息

### 🏙️ 城市相关接口

#### 获取城市列表

- **GET** `/cities`
- **查询参数**: `regionId` (可选) - 地区 ID，用于过滤特定地区的城市
- **描述**: 获取所有城市列表，支持按地区过滤
- **示例**: `/cities?regionId=1`

#### 获取城市详情

- **GET** `/cities/:id`
- **参数**: `id` - 城市 ID
- **描述**: 根据 ID 获取城市详细信息，包含关联的地区信息

### 🏢 部门相关接口

#### 获取所有部门

- **GET** `/departments`
- **描述**: 获取所有部门列表

#### 获取部门详情

- **GET** `/departments/:id`
- **参数**: `id` - 部门 ID
- **描述**: 根据 ID 获取部门详细信息，包含该部门下的所有团队

### 👥 团队相关接口

#### 获取团队列表

- **GET** `/teams`
- **查询参数**: `departmentId` (可选) - 部门 ID，用于过滤特定部门的团队
- **描述**: 获取所有团队列表，支持按部门过滤
- **示例**: `/teams?departmentId=1`

#### 获取团队详情

- **GET** `/teams/:id`
- **参数**: `id` - 团队 ID
- **描述**: 根据 ID 获取团队详细信息，包含关联的部门信息

### 💼 职位相关接口

#### 获取职位列表

- **GET** `/positions`
- **查询参数**:
  - `departmentId` (可选) - 部门 ID
  - `teamId` (可选) - 团队 ID
- **描述**: 获取所有职位列表，支持按部门或团队过滤
- **示例**:
  - `/positions?departmentId=1`
  - `/positions?teamId=1`
  - `/positions?departmentId=1&teamId=1`

#### 获取职位详情

- **GET** `/positions/:id`
- **参数**: `id` - 职位 ID
- **描述**: 根据 ID 获取职位详细信息，包含关联的部门和团队信息

### 🌳 级联查询接口

#### 获取组织架构树

- **GET** `/organization/tree`
- **描述**: 获取完整的组织架构树形结构（部门 -> 团队 -> 职位）
- **响应示例**:

```json
{
  "code": 200,
  "message": "获取组织架构成功",
  "data": [
    {
      "id": "1",
      "name": "技术部",
      "teams": [
        {
          "id": "1",
          "name": "前端团队",
          "positions": [
            {
              "id": "1",
              "name": "前端工程师"
            }
          ]
        }
      ]
    }
  ]
}
```

#### 获取地区城市树

- **GET** `/location/tree`
- **描述**: 获取地区城市树形结构（地区 -> 城市）

### 🔍 健康检查接口

#### 服务健康检查

- **GET** `/health`
- **描述**: 检查服务运行状态

## 📊 数据说明

### 模拟数据结构

#### 地区 (Regions)

- `id`: 地区 ID
- `name`: 地区名称
- `code`: 地区代码

#### 城市 (Cities)

- `id`: 城市 ID
- `name`: 城市名称
- `code`: 城市代码
- `regionId`: 所属地区 ID

#### 部门 (Departments)

- `id`: 部门 ID
- `name`: 部门名称
- `code`: 部门代码
- `description`: 部门描述

#### 团队 (Teams)

- `id`: 团队 ID
- `name`: 团队名称
- `code`: 团队代码
- `departmentId`: 所属部门 ID
- `leaderId`: 负责人 ID

#### 职位 (Positions)

- `id`: 职位 ID
- `name`: 职位名称
- `code`: 职位代码
- `level`: 职级 (P5, P6, P7, P8)
- `departmentId`: 所属部门 ID
- `teamId`: 所属团队 ID

## 🔧 技术栈

- **Node.js**: JavaScript 运行环境
- **Express.js**: Web 应用框架
- **CORS**: 跨域资源共享支持
- **ES Module**: 现代 JavaScript 模块系统

## 📝 使用示例

### 前端调用示例

```javascript
// 使用封装的 axios 实例
import { get } from "@/api/axios";

// 获取所有地区
const regions = await get("/regions");

// 获取特定地区的城市
const cities = await get("/cities?regionId=1");

// 获取组织架构
const orgTree = await get("/organization/tree");
```

### 级联选择示例

```javascript
// 1. 先获取所有地区
const regions = await get("/regions");

// 2. 用户选择地区后，获取该地区的城市
const cities = await get(`/cities?regionId=${selectedRegionId}`);

// 3. 类似地处理部门->团队->职位的级联
const departments = await get("/departments");
const teams = await get(`/teams?departmentId=${selectedDeptId}`);
const positions = await get(`/positions?teamId=${selectedTeamId}`);
```

## 🐛 错误处理

所有错误响应格式：

```json
{
  "code": 400,
  "message": "错误描述",
  "data": null,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

常见状态码：

- `200`: 成功
- `400`: 请求参数错误
- `404`: 资源不存在
- `500`: 服务器内部错误

## 🚀 部署说明

### 开发环境

- 确保 Node.js 版本 >= 16
- 端口 3000 需要可用
- 支持 ES Module

### 生产环境

可以使用 PM2 或 Docker 进行部署管理。
