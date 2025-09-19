import React, { useState, useEffect } from "react";
import { Select, Card, Row, Col, Space, Typography, Divider } from "antd";
import { get } from "../../api/axios";
import type { ApiResponse } from "../../api/axios";

const { Title, Text } = Typography;
const { Option } = Select;

// 类型定义
interface Region {
  id: string;
  name: string;
  code: string;
}

interface City {
  id: string;
  name: string;
  code: string;
  regionId: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
}

interface Team {
  id: string;
  name: string;
  code: string;
  departmentId: string;
  leaderId: string;
}

interface Position {
  id: string;
  name: string;
  code: string;
  level: string;
  departmentId: string;
  teamId: string;
}

const APIDemo: React.FC = () => {
  // 状态管理
  const [regions, setRegions] = useState<Region[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);

  // 选择状态
  const [selectedRegion, setSelectedRegion] = useState<string | undefined>();
  const [selectedDepartment, setSelectedDepartment] = useState<
    string | undefined
  >();
  const [selectedTeam, setSelectedTeam] = useState<string | undefined>();

  const [loading, setLoading] = useState(false);

  // 初始化加载数据
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const [regionsRes, departmentsRes] = await Promise.all([
          get<ApiResponse<Region[]>>("/regions"),
          get<ApiResponse<Department[]>>("/departments"),
        ]);
        setRegions(regionsRes.data);
        setDepartments(departmentsRes.data);
      } catch (error) {
        console.error("初始化数据失败:", error);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  // 地区变化时加载城市
  useEffect(() => {
    if (selectedRegion) {
      const loadCities = async () => {
        try {
          const response = await get<ApiResponse<City[]>>(
            `/cities?regionId=${selectedRegion}`
          );
          setCities(response.data);
        } catch (error) {
          console.error("加载城市失败:", error);
        }
      };
      loadCities();
    } else {
      setCities([]);
    }
  }, [selectedRegion]);

  // 部门变化时加载团队
  useEffect(() => {
    if (selectedDepartment) {
      const loadTeams = async () => {
        try {
          const response = await get<ApiResponse<Team[]>>(
            `/teams?departmentId=${selectedDepartment}`
          );
          setTeams(response.data);
        } catch (error) {
          console.error("加载团队失败:", error);
        }
      };
      loadTeams();
      setSelectedTeam(undefined);
      setPositions([]);
    } else {
      setTeams([]);
      setPositions([]);
    }
  }, [selectedDepartment]);

  // 团队变化时加载职位
  useEffect(() => {
    if (selectedTeam) {
      const loadPositions = async () => {
        try {
          const response = await get<ApiResponse<Position[]>>(
            `/positions?teamId=${selectedTeam}`
          );
          setPositions(response.data);
        } catch (error) {
          console.error("加载职位失败:", error);
        }
      };
      loadPositions();
    } else {
      setPositions([]);
    }
  }, [selectedTeam]);

  return (
    <div style={{ padding: "24px" }}>
      <Title level={2}>🌐 后端API接口演示</Title>
      <Text type="secondary">
        这个演示展示了前端如何与后端API进行交互，包括地区城市级联、组织架构级联等功能。
      </Text>

      <Divider />

      <Row gutter={[24, 24]}>
        {/* 级联选择演示 */}
        <Col span={12}>
          <Card title="🗺️ 地区城市级联选择" loading={loading}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <div>
                <Text strong>选择地区：</Text>
                <Select
                  style={{ width: "100%", marginTop: 8 }}
                  placeholder="请选择地区"
                  value={selectedRegion}
                  onChange={setSelectedRegion}
                  allowClear
                >
                  {regions.map((region) => (
                    <Option key={region.id} value={region.id}>
                      {region.name} ({region.code})
                    </Option>
                  ))}
                </Select>
              </div>

              <div>
                <Text strong>选择城市：</Text>
                <Select
                  style={{ width: "100%", marginTop: 8 }}
                  placeholder={selectedRegion ? "请选择城市" : "请先选择地区"}
                  disabled={!selectedRegion}
                  allowClear
                >
                  {cities.map((city) => (
                    <Option key={city.id} value={city.id}>
                      {city.name} ({city.code})
                    </Option>
                  ))}
                </Select>
              </div>

              <div style={{ marginTop: 16 }}>
                <Text type="secondary">
                  当前选择:{" "}
                  {selectedRegion
                    ? `${
                        regions.find((r) => r.id === selectedRegion)?.name || ""
                      } - ${cities.length}个城市`
                    : "未选择地区"}
                </Text>
              </div>
            </Space>
          </Card>
        </Col>

        {/* 组织架构级联演示 */}
        <Col span={12}>
          <Card title="🏢 组织架构级联选择" loading={loading}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <div>
                <Text strong>选择部门：</Text>
                <Select
                  style={{ width: "100%", marginTop: 8 }}
                  placeholder="请选择部门"
                  value={selectedDepartment}
                  onChange={setSelectedDepartment}
                  allowClear
                >
                  {departments.map((dept) => (
                    <Option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </Option>
                  ))}
                </Select>
              </div>

              <div>
                <Text strong>选择团队：</Text>
                <Select
                  style={{ width: "100%", marginTop: 8 }}
                  placeholder={
                    selectedDepartment ? "请选择团队" : "请先选择部门"
                  }
                  value={selectedTeam}
                  onChange={setSelectedTeam}
                  disabled={!selectedDepartment}
                  allowClear
                >
                  {teams.map((team) => (
                    <Option key={team.id} value={team.id}>
                      {team.name} ({team.code})
                    </Option>
                  ))}
                </Select>
              </div>

              <div>
                <Text strong>可选职位：</Text>
                <div
                  style={{ marginTop: 8, maxHeight: 120, overflowY: "auto" }}
                >
                  {positions.length > 0 ? (
                    positions.map((pos) => (
                      <div key={pos.id} style={{ padding: "4px 0" }}>
                        <Text>
                          {pos.name} ({pos.level})
                        </Text>
                      </div>
                    ))
                  ) : (
                    <Text type="secondary">
                      {selectedTeam ? "该团队暂无职位" : "请先选择团队"}
                    </Text>
                  )}
                </div>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* 数据统计 */}
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <Title level={3} style={{ margin: 0, color: "#1890ff" }}>
                {regions.length}
              </Title>
              <Text type="secondary">个地区</Text>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <Title level={3} style={{ margin: 0, color: "#52c41a" }}>
                {cities.length}
              </Title>
              <Text type="secondary">个城市</Text>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <Title level={3} style={{ margin: 0, color: "#fa8c16" }}>
                {departments.length}
              </Title>
              <Text type="secondary">个部门</Text>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <Title level={3} style={{ margin: 0, color: "#eb2f96" }}>
                {positions.length}
              </Title>
              <Text type="secondary">个职位</Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default APIDemo;
