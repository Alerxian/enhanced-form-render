import { get } from "../api/axios.js";

// API 测试函数
const testAPI = async () => {
  console.log("🧪 开始测试后端API接口...");

  try {
    // 测试健康检查
    console.log("\n1. 测试健康检查接口:");
    const health = await get("/health");
    console.log("✅ 健康检查:", health.message);

    // 测试地区列表
    console.log("\n2. 测试地区列表接口:");
    const regions = await get("/regions");
    console.log("✅ 地区数量:", regions.data.length);
    console.log(
      "📍 前3个地区:",
      regions.data.slice(0, 3).map((r) => r.name)
    );

    // 测试城市列表（华北地区）
    console.log("\n3. 测试城市列表接口（华北地区）:");
    const cities = await get("/cities?regionId=1");
    console.log("✅ 华北地区城市数量:", cities.data.length);
    console.log(
      "🏙️ 华北地区城市:",
      cities.data.map((c) => c.name)
    );

    // 测试部门列表
    console.log("\n4. 测试部门列表接口:");
    const departments = await get("/departments");
    console.log("✅ 部门数量:", departments.data.length);
    console.log(
      "🏢 所有部门:",
      departments.data.map((d) => d.name)
    );

    // 测试技术部团队
    console.log("\n5. 测试团队列表接口（技术部）:");
    const teams = await get("/teams?departmentId=1");
    console.log("✅ 技术部团队数量:", teams.data.length);
    console.log(
      "👥 技术部团队:",
      teams.data.map((t) => t.name)
    );

    // 测试前端团队职位
    console.log("\n6. 测试职位列表接口（前端团队）:");
    const positions = await get("/positions?teamId=1");
    console.log("✅ 前端团队职位数量:", positions.data.length);
    console.log(
      "💼 前端团队职位:",
      positions.data.map((p) => p.name)
    );

    // 测试组织架构树
    console.log("\n7. 测试组织架构树接口:");
    const orgTree = await get("/organization/tree");
    console.log("✅ 组织架构层级:", orgTree.data.length);
    const techDept = orgTree.data.find((d) => d.name === "技术部");
    if (techDept) {
      console.log("🌳 技术部结构:", {
        部门: techDept.name,
        团队数: techDept.teams.length,
        团队名称: techDept.teams.map((t) => t.name),
        总职位数: techDept.teams.reduce(
          (sum, t) => sum + t.positions.length,
          0
        ),
      });
    }

    // 测试地区城市树
    console.log("\n8. 测试地区城市树接口:");
    const locationTree = await get("/location/tree");
    console.log("✅ 地区数量:", locationTree.data.length);
    const northChina = locationTree.data.find((r) => r.name === "华北地区");
    if (northChina) {
      console.log("🗺️ 华北地区结构:", {
        地区: northChina.name,
        城市数: northChina.cities.length,
        城市列表: northChina.cities.map((c) => c.name),
      });
    }

    console.log("\n🎉 所有API测试完成！后端服务运行正常。");
  } catch (error) {
    console.error("❌ API测试失败:", error.message);
    if (error.response) {
      console.error("📄 错误详情:", error.response.data);
    }
  }
};

// 运行测试
testAPI();
