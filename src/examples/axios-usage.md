# Axios 使用示例

## 配置说明

### 1. 基础配置

- **baseURL**: `/api` - 使用相对路径，配合 vite 代理
- **timeout**: 10 秒
- **headers**: 默认 `Content-Type: application/json`

### 2. Vite 代理配置

- 开发环境下，所有 `/api` 开头的请求会被代理到 `http://localhost:3000`
- 代理会自动移除 `/api` 前缀

## 使用方法

### 1. 基础使用

```typescript
import apiClient, { get, post, put, del } from "@/api/axios";

// 方式1：直接使用 axios 实例
const response = await apiClient.get("/users");

// 方式2：使用封装的方法
const users = await get<User[]>("/users");
```

### 2. 类型安全的 API 调用

```typescript
import { userApi, type User, type ApiResponse } from "@/api/axios";

// 获取用户列表
const usersResponse = await userApi.getUsers();
console.log(usersResponse.data); // User[]

// 获取单个用户
const userResponse = await userApi.getUserById("123");
console.log(userResponse.data); // User

// 创建用户
const newUser = await userApi.createUser({
  name: "张三",
  email: "zhangsan@example.com",
});

// 更新用户
const updatedUser = await userApi.updateUser("123", {
  name: "李四",
});

// 删除用户
const deleteResult = await userApi.deleteUser("123");
```

### 3. 自定义 API 调用

```typescript
import { get, post } from "@/api/axios";

// 获取文章列表
interface Article {
  id: string;
  title: string;
  content: string;
  authorId: string;
}

const articles = await get<ApiResponse<Article[]>>("/articles");

// 创建文章
const newArticle = await post<ApiResponse<Article>>("/articles", {
  title: "新文章",
  content: "文章内容",
  authorId: "user123",
});
```

### 4. 错误处理

```typescript
import { userApi } from "@/api/axios";

try {
  const users = await userApi.getUsers();
  // 处理成功响应
} catch (error) {
  // 错误已在拦截器中统一处理
  // 这里可以处理特定的业务逻辑
  console.error("获取用户列表失败:", error);
}
```

## 拦截器功能

### 请求拦截器

- 自动添加 Authorization 头（如果 localStorage 中有 token）
- 请求日志记录

### 响应拦截器

- 自动提取响应数据（返回 response.data）
- 统一错误处理：
  - 401: 自动清除 token
  - 403: 禁止访问提示
  - 404: 资源不存在提示
  - 500: 服务器错误提示
  - 网络错误处理

## 开发环境启动

1. 确保后端服务运行在 `localhost:3000`
2. 启动前端开发服务器：
   ```bash
   pnpm dev
   ```
3. 前端请求 `/api/xxx` 会自动代理到 `http://localhost:3000/xxx`

## 类型定义扩展

如需添加新的 API 类型，在 `src/api/axios.ts` 中扩展：

```typescript
// 添加新的数据类型
export interface Article {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
}

// 添加新的API方法
export const articleApi = {
  getArticles: () => get<ApiResponse<Article[]>>("/articles"),
  getArticleById: (id: string) => get<ApiResponse<Article>>(`/articles/${id}`),
  createArticle: (data: Omit<Article, "id" | "createdAt">) =>
    post<ApiResponse<Article>>("/articles", data),
  updateArticle: (id: string, data: Partial<Article>) =>
    put<ApiResponse<Article>>(`/articles/${id}`, data),
  deleteArticle: (id: string) => del<ApiResponse<boolean>>(`/articles/${id}`),
};
```
