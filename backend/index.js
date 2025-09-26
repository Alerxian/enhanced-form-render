import express from "express";
import cors from "cors";

const app = express();
const PORT = 3001;

// 中间件配置
app.use(cors());
app.use(express.json());

// 模拟数据
const mockData = {
  regions: [
    { id: "1", name: "华北地区", code: "HB" },
    { id: "2", name: "华东地区", code: "HD" },
    { id: "3", name: "华南地区", code: "HN" },
    { id: "4", name: "华中地区", code: "HZ" },
    { id: "5", name: "西南地区", code: "XN" },
    { id: "6", name: "西北地区", code: "XB" },
    { id: "7", name: "东北地区", code: "DB" },
  ],

  cities: [
    // 华北地区
    { id: "101", name: "北京", code: "BJ", regionId: "1" },
    { id: "102", name: "天津", code: "TJ", regionId: "1" },
    { id: "103", name: "石家庄", code: "SJZ", regionId: "1" },
    { id: "104", name: "太原", code: "TY", regionId: "1" },
    // 华东地区
    { id: "201", name: "上海", code: "SH", regionId: "2" },
    { id: "202", name: "南京", code: "NJ", regionId: "2" },
    { id: "203", name: "杭州", code: "HZ", regionId: "2" },
    { id: "204", name: "苏州", code: "SZ", regionId: "2" },
    // 华南地区
    { id: "301", name: "广州", code: "GZ", regionId: "3" },
    { id: "302", name: "深圳", code: "SZ", regionId: "3" },
    { id: "303", name: "福州", code: "FZ", regionId: "3" },
    { id: "304", name: "厦门", code: "XM", regionId: "3" },
  ],

  departments: [
    { id: "1", name: "技术部", code: "TECH", description: "负责产品技术研发" },
    {
      id: "2",
      name: "产品部",
      code: "PRODUCT",
      description: "负责产品设计与规划",
    },
    {
      id: "3",
      name: "市场部",
      code: "MARKET",
      description: "负责市场推广与销售",
    },
    { id: "4", name: "人事部", code: "HR", description: "负责人力资源管理" },
    { id: "5", name: "财务部", code: "FINANCE", description: "负责财务管理" },
    {
      id: "6",
      name: "运营部",
      code: "OPERATION",
      description: "负责日常运营管理",
    },
  ],

  teams: [
    // 技术部团队
    {
      id: "1",
      name: "前端团队",
      code: "FE",
      departmentId: "1",
      leaderId: "emp001",
    },
    {
      id: "2",
      name: "后端团队",
      code: "BE",
      departmentId: "1",
      leaderId: "emp002",
    },
    {
      id: "3",
      name: "QA团队",
      code: "QA",
      departmentId: "1",
      leaderId: "emp003",
    },
    {
      id: "4",
      name: "DevOps团队",
      code: "DEVOPS",
      departmentId: "1",
      leaderId: "emp004",
    },
    // 产品部团队
    {
      id: "5",
      name: "UI设计团队",
      code: "UI",
      departmentId: "2",
      leaderId: "emp005",
    },
    {
      id: "6",
      name: "产品经理团队",
      code: "PM",
      departmentId: "2",
      leaderId: "emp006",
    },
    // 市场部团队
    {
      id: "7",
      name: "销售团队",
      code: "SALES",
      departmentId: "3",
      leaderId: "emp007",
    },
    {
      id: "8",
      name: "市场推广团队",
      code: "MARKETING",
      departmentId: "3",
      leaderId: "emp008",
    },
  ],

  positions: [
    // 技术岗位
    {
      id: "1",
      name: "前端工程师",
      code: "FE_DEV",
      level: "P6",
      departmentId: "1",
      teamId: "1",
    },
    {
      id: "2",
      name: "高级前端工程师",
      code: "SR_FE_DEV",
      level: "P7",
      departmentId: "1",
      teamId: "1",
    },
    {
      id: "3",
      name: "前端技术专家",
      code: "FE_EXPERT",
      level: "P8",
      departmentId: "1",
      teamId: "1",
    },
    {
      id: "4",
      name: "后端工程师",
      code: "BE_DEV",
      level: "P6",
      departmentId: "1",
      teamId: "2",
    },
    {
      id: "5",
      name: "高级后端工程师",
      code: "SR_BE_DEV",
      level: "P7",
      departmentId: "1",
      teamId: "2",
    },
    {
      id: "6",
      name: "测试工程师",
      code: "QA_DEV",
      level: "P6",
      departmentId: "1",
      teamId: "3",
    },
    {
      id: "7",
      name: "DevOps工程师",
      code: "DEVOPS_DEV",
      level: "P6",
      departmentId: "1",
      teamId: "4",
    },
    // 产品岗位
    {
      id: "8",
      name: "UI设计师",
      code: "UI_DESIGNER",
      level: "P6",
      departmentId: "2",
      teamId: "5",
    },
    {
      id: "9",
      name: "产品经理",
      code: "PM",
      level: "P7",
      departmentId: "2",
      teamId: "6",
    },
    {
      id: "10",
      name: "高级产品经理",
      code: "SR_PM",
      level: "P8",
      departmentId: "2",
      teamId: "6",
    },
    // 市场岗位
    {
      id: "11",
      name: "销售专员",
      code: "SALES_REP",
      level: "P5",
      departmentId: "3",
      teamId: "7",
    },
    {
      id: "12",
      name: "市场专员",
      code: "MARKETING_REP",
      level: "P5",
      departmentId: "3",
      teamId: "8",
    },
  ],

  // Redis相关模拟数据
  serviceUnits: [
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
  ],

  resourceTemplates: [
    { id: "1", name: "基础模板", type: "basic", description: "适用于开发环境" },
    {
      id: "2",
      name: "标准模板",
      type: "standard",
      description: "适用于测试环境",
    },
    {
      id: "3",
      name: "高性能模板",
      type: "performance",
      description: "适用于生产环境",
    },
  ],

  zones: [
    { id: "zone-1", name: "可用区A", region: "华北", status: "available" },
    { id: "zone-2", name: "可用区B", region: "华北", status: "available" },
    { id: "zone-3", name: "可用区C", region: "华东", status: "maintenance" },
  ],

  redisSeries: [
    {
      id: "enterprise",
      name: "企业版",
      features: ["高可用", "数据持久化", "集群模式"],
    },
    { id: "community", name: "社区版", features: ["基础功能", "单机模式"] },
  ],

  cpuTypes: [
    { id: "x86", name: "x86架构", series: ["enterprise", "community"] },
    { id: "arm", name: "ARM架构", series: ["enterprise"] },
    { id: "hygon", name: "海光架构", series: ["enterprise"] },
  ],

  engineVersions: [
    { id: "5.0", name: "Redis 5.0", stable: true },
    { id: "6.0", name: "Redis 6.0", stable: true },
    { id: "7.0", name: "Redis 7.0", stable: false },
  ],

  architectures: [
    { id: "standard", name: "标准版", description: "单机实例" },
    { id: "cluster", name: "集群版", description: "分布式集群" },
    { id: "sentinel", name: "哨兵版", description: "主从高可用" },
  ],

  nodeTypes: [
    { id: "single", name: "单节点", architecture: "standard" },
    { id: "master-slave", name: "主从节点", architecture: "sentinel" },
    { id: "cluster-node", name: "集群节点", architecture: "cluster" },
  ],

  instances: [
    { id: "1c1g", name: "1C1G", cpu: 1, memory: 1, price: 0.5 },
    { id: "2c2g", name: "2C2G", cpu: 2, memory: 2, price: 1.0 },
    { id: "4c4g", name: "4C4G", cpu: 4, memory: 4, price: 2.0 },
    { id: "8c8g", name: "8C8G", cpu: 8, memory: 8, price: 4.0 },
  ],
};

// 通用响应格式化函数
const formatResponse = (data, message = "请求成功") => ({
  code: 200,
  message,
  data,
  timestamp: new Date().toISOString(),
});

// 错误响应格式化函数
const formatError = (message = "请求失败", code = 400) => ({
  code,
  message,
  data: null,
  timestamp: new Date().toISOString(),
});

// ==================== 地区相关接口 ====================

// 获取所有地区
app.get("/api/regions", (req, res) => {
  try {
    res.json(formatResponse(mockData.regions, "获取地区列表成功"));
  } catch (error) {
    res.status(500).json(formatError("获取地区列表失败", 500));
  }
});

// 根据ID获取地区详情
app.get("/api/regions/:id", (req, res) => {
  try {
    const { id } = req.params;
    const region = mockData.regions.find((r) => r.id === id);

    if (!region) {
      return res.status(404).json(formatError("地区不存在", 404));
    }

    res.json(formatResponse(region, "获取地区详情成功"));
  } catch (error) {
    res.status(500).json(formatError("获取地区详情失败", 500));
  }
});

// ==================== 城市相关接口 ====================

// 获取所有城市或根据地区ID过滤
app.get("/api/cities", (req, res) => {
  try {
    const { regionId } = req.query;
    let cities = mockData.cities;

    if (regionId) {
      cities = cities.filter((c) => c.regionId === regionId);
    }

    res.json(formatResponse(cities, "获取城市列表成功"));
  } catch (error) {
    res.status(500).json(formatError("获取城市列表失败", 500));
  }
});

// 根据ID获取城市详情
app.get("/api/cities/:id", (req, res) => {
  try {
    const { id } = req.params;
    const city = mockData.cities.find((c) => c.id === id);

    if (!city) {
      return res.status(404).json(formatError("城市不存在", 404));
    }

    // 关联地区信息
    const region = mockData.regions.find((r) => r.id === city.regionId);
    const cityWithRegion = {
      ...city,
      region: region || null,
    };

    res.json(formatResponse(cityWithRegion, "获取城市详情成功"));
  } catch (error) {
    res.status(500).json(formatError("获取城市详情失败", 500));
  }
});

// ==================== 部门相关接口 ====================

// 获取所有部门
app.get("/api/departments", (req, res) => {
  try {
    res.json(formatResponse(mockData.departments, "获取部门列表成功"));
  } catch (error) {
    res.status(500).json(formatError("获取部门列表失败", 500));
  }
});

// 根据ID获取部门详情
app.get("/api/departments/:id", (req, res) => {
  try {
    const { id } = req.params;
    const department = mockData.departments.find((d) => d.id === id);

    if (!department) {
      return res.status(404).json(formatError("部门不存在", 404));
    }

    // 关联团队信息
    const teams = mockData.teams.filter((t) => t.departmentId === id);
    const departmentWithTeams = {
      ...department,
      teams,
    };

    res.json(formatResponse(departmentWithTeams, "获取部门详情成功"));
  } catch (error) {
    res.status(500).json(formatError("获取部门详情失败", 500));
  }
});

// ==================== 团队相关接口 ====================

// 获取所有团队或根据部门ID过滤
app.get("/api/teams", (req, res) => {
  try {
    const { departmentId } = req.query;
    let teams = mockData.teams;

    if (departmentId) {
      teams = teams.filter((t) => t.departmentId === departmentId);
    }

    res.json(formatResponse(teams, "获取团队列表成功"));
  } catch (error) {
    res.status(500).json(formatError("获取团队列表失败", 500));
  }
});

// 根据ID获取团队详情
app.get("/api/teams/:id", (req, res) => {
  try {
    const { id } = req.params;
    const team = mockData.teams.find((t) => t.id === id);

    if (!team) {
      return res.status(404).json(formatError("团队不存在", 404));
    }

    // 关联部门信息
    const department = mockData.departments.find(
      (d) => d.id === team.departmentId
    );
    const teamWithDepartment = {
      ...team,
      department: department || null,
    };

    res.json(formatResponse(teamWithDepartment, "获取团队详情成功"));
  } catch (error) {
    res.status(500).json(formatError("获取团队详情失败", 500));
  }
});

// ==================== 职位相关接口 ====================

// 获取所有职位或根据部门ID、团队ID过滤
app.get("/api/positions", (req, res) => {
  try {
    const { departmentId, teamId } = req.query;
    let positions = mockData.positions;

    if (departmentId) {
      positions = positions.filter((p) => p.departmentId === departmentId);
    }

    if (teamId) {
      positions = positions.filter((p) => p.teamId === teamId);
    }

    res.json(formatResponse(positions, "获取职位列表成功"));
  } catch (error) {
    res.status(500).json(formatError("获取职位列表失败", 500));
  }
});

// 根据ID获取职位详情
app.get("/api/positions/:id", (req, res) => {
  try {
    const { id } = req.params;
    const position = mockData.positions.find((p) => p.id === id);

    if (!position) {
      return res.status(404).json(formatError("职位不存在", 404));
    }

    // 关联部门和团队信息
    const department = mockData.departments.find(
      (d) => d.id === position.departmentId
    );
    const team = mockData.teams.find((t) => t.id === position.teamId);

    const positionWithRelations = {
      ...position,
      department: department || null,
      team: team || null,
    };

    res.json(formatResponse(positionWithRelations, "获取职位详情成功"));
  } catch (error) {
    res.status(500).json(formatError("获取职位详情失败", 500));
  }
});

// ==================== Redis相关接口 ====================

// 获取服务单元列表
app.get("/api/redis/service-units", (req, res) => {
  try {
    const { systemCode, envType, status } = req.query;
    let serviceUnits = mockData.serviceUnits;

    // 根据系统代码过滤
    if (systemCode) {
      serviceUnits = serviceUnits.filter(
        (unit) => unit.systemCode === systemCode
      );
    }

    // 根据环境类型过滤
    if (envType) {
      serviceUnits = serviceUnits.filter((unit) => unit.envType === envType);
    }

    // 根据状态过滤
    if (status) {
      serviceUnits = serviceUnits.filter((unit) => unit.status === status);
    }

    // 模拟网络延迟
    setTimeout(() => {
      res.json(formatResponse(serviceUnits, "获取服务单元列表成功"));
    }, 300 + Math.random() * 200);
  } catch (error) {
    res.status(500).json(formatError("获取服务单元列表失败", 500));
  }
});

// 获取资源模板列表
app.get("/api/redis/resource-templates", (req, res) => {
  try {
    setTimeout(() => {
      res.json(formatResponse(mockData.resourceTemplates, "获取资源模板成功"));
    }, 200);
  } catch (error) {
    res.status(500).json(formatError("获取资源模板失败", 500));
  }
});

// 获取可用区列表
app.get("/api/redis/zones", (req, res) => {
  try {
    const { region } = req.query;
    let zones = mockData.zones;

    if (region) {
      zones = zones.filter((zone) => zone.region === region);
    }

    setTimeout(() => {
      res.json(formatResponse(zones, "获取可用区成功"));
    }, 150);
  } catch (error) {
    res.status(500).json(formatError("获取可用区失败", 500));
  }
});

// 获取Redis版本类型
app.get("/api/redis/series", (req, res) => {
  try {
    setTimeout(() => {
      res.json(formatResponse(mockData.redisSeries, "获取版本类型成功"));
    }, 100);
  } catch (error) {
    res.status(500).json(formatError("获取版本类型失败", 500));
  }
});

// 获取CPU架构类型
app.get("/api/redis/cpu-types", (req, res) => {
  try {
    const { series } = req.query;
    let cpuTypes = mockData.cpuTypes;

    if (series) {
      cpuTypes = cpuTypes.filter((cpu) => cpu.series.includes(series));
    }

    setTimeout(() => {
      res.json(formatResponse(cpuTypes, "获取CPU架构成功"));
    }, 100);
  } catch (error) {
    res.status(500).json(formatError("获取CPU架构失败", 500));
  }
});

// 获取引擎版本
app.get("/api/redis/engine-versions", (req, res) => {
  try {
    const { stable } = req.query;
    let versions = mockData.engineVersions;

    if (stable !== undefined) {
      const isStable = stable === "true";
      versions = versions.filter((v) => v.stable === isStable);
    }

    setTimeout(() => {
      res.json(formatResponse(versions, "获取引擎版本成功"));
    }, 100);
  } catch (error) {
    res.status(500).json(formatError("获取引擎版本失败", 500));
  }
});

// 获取架构类型
app.get("/api/redis/architectures", (req, res) => {
  try {
    setTimeout(() => {
      res.json(formatResponse(mockData.architectures, "获取架构类型成功"));
    }, 100);
  } catch (error) {
    res.status(500).json(formatError("获取架构类型失败", 500));
  }
});

// 获取节点类型
app.get("/api/redis/node-types", (req, res) => {
  try {
    const { architecture } = req.query;
    let nodeTypes = mockData.nodeTypes;

    if (architecture) {
      nodeTypes = nodeTypes.filter(
        (node) => node.architecture === architecture
      );
    }

    setTimeout(() => {
      res.json(formatResponse(nodeTypes, "获取节点类型成功"));
    }, 100);
  } catch (error) {
    res.status(500).json(formatError("获取节点类型失败", 500));
  }
});

// 获取实例规格
app.get("/api/redis/instances", (req, res) => {
  try {
    const { minCpu, maxCpu, minMemory, maxMemory } = req.query;
    let instances = mockData.instances;

    if (minCpu) {
      instances = instances.filter((inst) => inst.cpu >= parseInt(minCpu));
    }
    if (maxCpu) {
      instances = instances.filter((inst) => inst.cpu <= parseInt(maxCpu));
    }
    if (minMemory) {
      instances = instances.filter(
        (inst) => inst.memory >= parseInt(minMemory)
      );
    }
    if (maxMemory) {
      instances = instances.filter(
        (inst) => inst.memory <= parseInt(maxMemory)
      );
    }

    setTimeout(() => {
      res.json(formatResponse(instances, "获取实例规格成功"));
    }, 150);
  } catch (error) {
    res.status(500).json(formatError("获取实例规格失败", 500));
  }
});

// ==================== 级联查询接口 ====================

// 获取组织架构树形结构
app.get("/api/organization/tree", (req, res) => {
  try {
    const organizationTree = mockData.departments.map((dept) => ({
      ...dept,
      teams: mockData.teams
        .filter((team) => team.departmentId === dept.id)
        .map((team) => ({
          ...team,
          positions: mockData.positions.filter((pos) => pos.teamId === team.id),
        })),
    }));

    res.json(formatResponse(organizationTree, "获取组织架构成功"));
  } catch (error) {
    res.status(500).json(formatError("获取组织架构失败", 500));
  }
});

// 获取地区城市树形结构
app.get("/api/location/tree", (req, res) => {
  try {
    const locationTree = mockData.regions.map((region) => ({
      ...region,
      cities: mockData.cities.filter((city) => city.regionId === region.id),
    }));

    res.json(formatResponse(locationTree, "获取地区城市结构成功"));
  } catch (error) {
    res.status(500).json(formatError("获取地区城市结构失败", 500));
  }
});

// ==================== 健康检查接口 ====================

app.get("/api/health", (req, res) => {
  res.json(
    formatResponse(
      {
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
      "服务运行正常"
    )
  );
});

// 404 处理
app.use((req, res) => {
  res.status(404).json(formatError("接口不存在", 404));
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error("服务器错误:", err);
  res.status(500).json(formatError("服务器内部错误", 500));
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 服务器已启动在端口 ${PORT}`);
  console.log(`📖 接口文档:`);
  console.log(`   - 地区列表: GET http://localhost:${PORT}/api/regions`);
  console.log(`   - 城市列表: GET http://localhost:${PORT}/api/cities`);
  console.log(`   - 部门列表: GET http://localhost:${PORT}/api/departments`);
  console.log(`   - 团队列表: GET http://localhost:${PORT}/api/teams`);
  console.log(`   - 职位列表: GET http://localhost:${PORT}/api/positions`);
  console.log(
    `   - 组织架构: GET http://localhost:${PORT}/api/organization/tree`
  );
  console.log(`   - 地区城市: GET http://localhost:${PORT}/api/location/tree`);
  console.log(``);
  console.log(`📊 Redis相关接口:`);
  console.log(
    `   - 服务单元: GET http://localhost:${PORT}/api/redis/service-units`
  );
  console.log(
    `   - 资源模板: GET http://localhost:${PORT}/api/redis/resource-templates`
  );
  console.log(`   - 可用区: GET http://localhost:${PORT}/api/redis/zones`);
  console.log(`   - 版本类型: GET http://localhost:${PORT}/api/redis/series`);
  console.log(`   - CPU架构: GET http://localhost:${PORT}/api/redis/cpu-types`);
  console.log(
    `   - 引擎版本: GET http://localhost:${PORT}/api/redis/engine-versions`
  );
  console.log(
    `   - 架构类型: GET http://localhost:${PORT}/api/redis/architectures`
  );
  console.log(
    `   - 节点类型: GET http://localhost:${PORT}/api/redis/node-types`
  );
  console.log(
    `   - 实例规格: GET http://localhost:${PORT}/api/redis/instances`
  );
  console.log(``);
  console.log(`   - 健康检查: GET http://localhost:${PORT}/api/health`);
});
