/**
 * 服务单元数据API模拟
 * 模拟从后端获取服务单元数据
 */

// 服务单元基础信息接口
export interface ServiceUnit {
  id: string;
  name: string;
  code: string;
  status: "running" | "stopped" | "error" | "pending" | "deploying";
  systemCode: string;
  systemName: string;
  envType: string;
  containerConfig: {
    image: string;
    port: number;
    replicas: number;
    cpu: string;
    memory: string;
  };
  version?: string;
  lastUpdate?: string;
  description?: string;
}

// 模拟服务单元数据
const mockServiceUnits: ServiceUnit[] = [
  {
    id: "auth-svc-7f8d9e2a",
    name: "认证服务",
    code: "AUTH_SVC",
    status: "running",
    systemCode: "TP114",
    systemName: "测试系统",
    envType: "DEV",
    containerConfig: {
      image: "auth-service:v2.1.3",
      port: 8080,
      replicas: 3,
      cpu: "500m",
      memory: "1Gi",
    },
    version: "v2.1.3",
    lastUpdate: "2024-01-15 14:30:25",
    description: "用户身份验证和授权服务",
  },
  {
    id: "user-svc-5c6b8f1d",
    name: "用户服务",
    code: "USER_SVC",
    status: "deploying",
    systemCode: "TP114",
    systemName: "测试系统",
    envType: "DEV",
    containerConfig: {
      image: "user-service:v1.8.2",
      port: 8081,
      replicas: 2,
      cpu: "300m",
      memory: "512Mi",
    },
    version: "v1.8.2",
    lastUpdate: "2024-01-15 14:25:10",
    description: "用户信息管理和操作服务",
  },
  {
    id: "gateway-9a4e3b7c",
    name: "API网关",
    code: "API_GATEWAY",
    status: "running",
    systemCode: "TP114",
    systemName: "测试系统",
    envType: "DEV",
    containerConfig: {
      image: "nginx:1.21-alpine",
      port: 80,
      replicas: 2,
      cpu: "200m",
      memory: "256Mi",
    },
    version: "v3.0.1",
    lastUpdate: "2024-01-15 13:45:50",
    description: "统一入口和路由管理",
  },
  {
    id: "pay-svc-2d8f4a6e",
    name: "支付服务",
    code: "PAY_SVC",
    status: "error",
    systemCode: "TP114",
    systemName: "测试系统",
    envType: "DEV",
    containerConfig: {
      image: "payment-service:v1.5.7",
      port: 8082,
      replicas: 1,
      cpu: "400m",
      memory: "768Mi",
    },
    version: "v1.5.7",
    lastUpdate: "2024-01-15 14:10:30",
    description: "支付处理和订单管理服务",
  },
  {
    id: "notify-svc-8e1c9b3f",
    name: "通知服务",
    code: "NOTIFY_SVC",
    status: "pending",
    systemCode: "TP114",
    systemName: "测试系统",
    envType: "DEV",
    containerConfig: {
      image: "notification-service:v1.2.4",
      port: 8083,
      replicas: 1,
      cpu: "150m",
      memory: "256Mi",
    },
    version: "v1.2.4",
    lastUpdate: "2024-01-15 14:00:15",
    description: "消息推送和通知管理服务",
  },
  {
    id: "log-svc-4a7b2c8d",
    name: "日志服务",
    code: "LOG_SVC",
    status: "running",
    systemCode: "TP114",
    systemName: "测试系统",
    envType: "DEV",
    containerConfig: {
      image: "elasticsearch:7.15.0",
      port: 9200,
      replicas: 1,
      cpu: "1000m",
      memory: "2Gi",
    },
    version: "v7.15.0",
    lastUpdate: "2024-01-15 12:15:30",
    description: "日志收集和分析服务",
  },
  {
    id: "cache-svc-9b5e1f3a",
    name: "缓存服务",
    code: "CACHE_SVC",
    status: "running",
    systemCode: "TP114",
    systemName: "测试系统",
    envType: "DEV",
    containerConfig: {
      image: "redis:6.2-alpine",
      port: 6379,
      replicas: 1,
      cpu: "250m",
      memory: "512Mi",
    },
    version: "v6.2",
    lastUpdate: "2024-01-15 11:20:45",
    description: "Redis缓存服务",
  },
  {
    id: "db-svc-3c8d6e2f",
    name: "数据库服务",
    code: "DB_SVC",
    status: "running",
    systemCode: "TP114",
    systemName: "测试系统",
    envType: "DEV",
    containerConfig: {
      image: "mysql:8.0",
      port: 3306,
      replicas: 1,
      cpu: "800m",
      memory: "2Gi",
    },
    version: "v8.0",
    lastUpdate: "2024-01-15 10:30:00",
    description: "MySQL数据库服务",
  },
];

// 查询参数接口
export interface ServiceUnitQuery {
  systemCode?: string;
  envType?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

// API响应接口
export interface ServiceUnitResponse {
  data: ServiceUnit[];
  total: number;
  page: number;
  pageSize: number;
}

// 选项数据格式（用于表单）
export interface ServiceUnitOption {
  label: string;
  value: string;
  disabled?: boolean;
  status?: string;
  description?: string;
}

/**
 * 模拟获取服务单元列表
 * @param query 查询参数
 * @returns Promise<ServiceUnitResponse>
 */
export const fetchServiceUnits = async (
  query: ServiceUnitQuery = {}
): Promise<ServiceUnitResponse> => {
  // 模拟网络延迟
  await new Promise((resolve) =>
    setTimeout(resolve, 300 + Math.random() * 500)
  );

  let filteredData = [...mockServiceUnits];

  // 根据系统代码过滤
  if (query.systemCode) {
    filteredData = filteredData.filter(
      (unit) => unit.systemCode === query.systemCode
    );
  }

  // 根据环境类型过滤
  if (query.envType) {
    filteredData = filteredData.filter(
      (unit) => unit.envType === query.envType
    );
  }

  // 根据状态过滤
  if (query.status) {
    filteredData = filteredData.filter((unit) => unit.status === query.status);
  }

  // 分页处理
  const page = query.page || 1;
  const pageSize = query.pageSize || 10;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  return {
    data: paginatedData,
    total: filteredData.length,
    page,
    pageSize,
  };
};

/**
 * 获取服务单元选项（用于表单下拉选择）
 * @param query 查询参数
 * @returns Promise<ServiceUnitOption[]>
 */
export const fetchServiceUnitOptions = async (
  query: ServiceUnitQuery = {}
): Promise<ServiceUnitOption[]> => {
  const response = await fetchServiceUnits(query);

  return response.data.map((unit) => ({
    label: `${unit.name} (${unit.code})`,
    value: unit.id,
    disabled: unit.status === "error",
    status: unit.status,
    description: unit.description,
  }));
};

/**
 * 根据ID获取服务单元详情
 * @param id 服务单元ID
 * @returns Promise<ServiceUnit | null>
 */
export const fetchServiceUnitById = async (
  id: string
): Promise<ServiceUnit | null> => {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 200));

  const unit = mockServiceUnits.find((unit) => unit.id === id);
  return unit || null;
};

/**
 * 批量获取服务单元详情
 * @param ids 服务单元ID数组
 * @returns Promise<ServiceUnit[]>
 */
export const fetchServiceUnitsByIds = async (
  ids: string[]
): Promise<ServiceUnit[]> => {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 300));

  return mockServiceUnits.filter((unit) => ids.includes(unit.id));
};

// 错误处理
export class ServiceUnitError extends Error {
  public code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = "ServiceUnitError";
    this.code = code;
  }
}

/**
 * 模拟API错误的情况
 * @param errorRate 错误率 (0-1)
 */
export const fetchServiceUnitsWithError = async (
  query: ServiceUnitQuery = {},
  errorRate: number = 0.1
): Promise<ServiceUnitResponse> => {
  // 模拟网络延迟
  await new Promise((resolve) =>
    setTimeout(resolve, 300 + Math.random() * 500)
  );

  // 模拟错误
  if (Math.random() < errorRate) {
    throw new ServiceUnitError("服务单元数据获取失败", "FETCH_ERROR");
  }

  return fetchServiceUnits(query);
};
