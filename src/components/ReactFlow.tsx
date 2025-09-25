import React, { useCallback } from "react";
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  BackgroundVariant,
  Handle,
  Position,
  type Connection,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// 服务单元数据接口
interface ServiceUnitData extends Record<string, unknown> {
  name: string;
  status: "running" | "stopped" | "error" | "pending" | "deploying";
  id: string;
  containerConfig: {
    image: string;
    port: number;
    replicas: number;
    cpu: string;
    memory: string;
  };
  version?: string;
  lastUpdate?: string;
}

// 启动节点数据接口
interface StartNodeData extends Record<string, unknown> {
  type: "start";
}

// 自定义节点类型定义
type CustomNodeData = ServiceUnitData | StartNodeData;
type CustomNode = Node<CustomNodeData>;

// 状态颜色映射
const statusColors = {
  running: { bg: "#4CAF50", border: "#388E3C", text: "white" },
  stopped: { bg: "#9E9E9E", border: "#616161", text: "white" },
  error: { bg: "#F44336", border: "#D32F2F", text: "white" },
  pending: { bg: "#FF9800", border: "#F57C00", text: "white" },
  deploying: { bg: "#2196F3", border: "#1976D2", text: "white" },
};

// 自定义启动节点组件
const StartNode: React.FC<{ data: StartNodeData }> = () => {
  return (
    <div
      style={{
        width: "80px",
        height: "80px",
        borderRadius: "50%",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "3px solid #5a67d8",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        position: "relative",
      }}
    >
      {/* 启动图标 (Play Button) */}
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: "20px solid white",
          borderTop: "12px solid transparent",
          borderBottom: "12px solid transparent",
          marginLeft: "4px",
        }}
      />

      {/* 输出连接点 - 隐藏样式 */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: "transparent",
          border: "none",
          width: "1px",
          height: "1px",
          opacity: 0,
        }}
      />
    </div>
  );
};

// 自定义服务单元节点组件
const ServiceUnitNode: React.FC<{ data: ServiceUnitData }> = ({ data }) => {
  const statusStyle = statusColors[data.status];

  return (
    <div
      style={{
        minWidth: "280px",
        background: "white",
        border: `2px solid ${statusStyle.border}`,
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* 输入连接点 - 隐藏样式 */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: "transparent",
          border: "none",
          width: "1px",
          height: "1px",
          opacity: 0,
        }}
      />

      {/* 服务状态头部 */}
      <div
        style={{
          background: statusStyle.bg,
          color: statusStyle.text,
          padding: "8px 12px",
          fontWeight: "bold",
          fontSize: "14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>{data.name}</span>
        <span
          style={{
            fontSize: "10px",
            background: "rgba(255,255,255,0.2)",
            padding: "2px 6px",
            borderRadius: "4px",
          }}
        >
          {data.status.toUpperCase()}
        </span>
      </div>

      {/* 服务详细信息 */}
      <div style={{ padding: "12px" }}>
        <div style={{ marginBottom: "8px" }}>
          <strong style={{ fontSize: "12px", color: "#666" }}>服务ID:</strong>
          <div
            style={{
              fontSize: "11px",
              fontFamily: "monospace",
              color: "#333",
              marginTop: "2px",
            }}
          >
            {data.id}
          </div>
        </div>

        <div style={{ marginBottom: "8px" }}>
          <strong style={{ fontSize: "12px", color: "#666" }}>容器配置:</strong>
          <div
            style={{ fontSize: "11px", marginTop: "4px", lineHeight: "1.4" }}
          >
            <div>
              <span style={{ color: "#666" }}>镜像:</span>{" "}
              {data.containerConfig.image}
            </div>
            <div>
              <span style={{ color: "#666" }}>端口:</span>{" "}
              {data.containerConfig.port}
            </div>
            <div>
              <span style={{ color: "#666" }}>资源:</span>{" "}
              {data.containerConfig.cpu} / {data.containerConfig.memory}
            </div>
            <div>
              <span style={{ color: "#666" }}>副本:</span>{" "}
              {data.containerConfig.replicas}
            </div>
          </div>
        </div>

        {data.version && (
          <div style={{ marginBottom: "4px" }}>
            <strong style={{ fontSize: "12px", color: "#666" }}>版本:</strong>
            <span
              style={{ fontSize: "11px", marginLeft: "4px", color: "#333" }}
            >
              {data.version}
            </span>
          </div>
        )}

        {data.lastUpdate && (
          <div>
            <strong style={{ fontSize: "12px", color: "#666" }}>
              更新时间:
            </strong>
            <span
              style={{ fontSize: "11px", marginLeft: "4px", color: "#333" }}
            >
              {data.lastUpdate}
            </span>
          </div>
        )}
      </div>

      {/* 输出连接点 - 隐藏样式 */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: "transparent",
          border: "none",
          width: "1px",
          height: "1px",
          opacity: 0,
        }}
      />
    </div>
  );
};

// 节点类型映射
const nodeTypes = {
  startNode: StartNode,
  serviceUnit: ServiceUnitNode,
};

// 服务单元流程的初始节点配置（优化布局，避免重叠）
const initialNodes: CustomNode[] = [
  {
    id: "start",
    type: "startNode",
    position: { x: 50, y: 250 }, // 调整起始位置
    data: { type: "start" },
  },
  {
    id: "auth-service",
    type: "serviceUnit",
    position: { x: 250, y: 50 }, // 增加间距，避免重叠
    data: {
      name: "认证服务",
      status: "running",
      id: "auth-svc-7f8d9e2a",
      containerConfig: {
        image: "auth-service:v2.1.3",
        port: 8080,
        replicas: 3,
        cpu: "500m",
        memory: "1Gi",
      },
      version: "v2.1.3",
      lastUpdate: "2024-01-15 14:30:25",
    },
  },
  {
    id: "user-service",
    type: "serviceUnit",
    position: { x: 250, y: 400 }, // 增加垂直间距
    data: {
      name: "用户服务",
      status: "deploying",
      id: "user-svc-5c6b8f1d",
      containerConfig: {
        image: "user-service:v1.8.2",
        port: 8081,
        replicas: 2,
        cpu: "300m",
        memory: "512Mi",
      },
      version: "v1.8.2",
      lastUpdate: "2024-01-15 14:25:10",
    },
  },
  {
    id: "api-gateway",
    type: "serviceUnit",
    position: { x: 650, y: 225 }, // 居中位置，作为汇聚点
    data: {
      name: "API网关",
      status: "running",
      id: "gateway-9a4e3b7c",
      containerConfig: {
        image: "nginx:1.21-alpine",
        port: 80,
        replicas: 2,
        cpu: "200m",
        memory: "256Mi",
      },
      version: "v3.0.1",
      lastUpdate: "2024-01-15 13:45:50",
    },
  },
  {
    id: "payment-service",
    type: "serviceUnit",
    position: { x: 1050, y: 50 }, // 增加水平间距
    data: {
      name: "支付服务",
      status: "error",
      id: "pay-svc-2d8f4a6e",
      containerConfig: {
        image: "payment-service:v1.5.7",
        port: 8082,
        replicas: 1,
        cpu: "400m",
        memory: "768Mi",
      },
      version: "v1.5.7",
      lastUpdate: "2024-01-15 14:10:30",
    },
  },
  {
    id: "notification-service",
    type: "serviceUnit",
    position: { x: 1050, y: 400 }, // 增加水平和垂直间距
    data: {
      name: "通知服务",
      status: "pending",
      id: "notify-svc-8e1c9b3f",
      containerConfig: {
        image: "notification-service:v1.2.4",
        port: 8083,
        replicas: 1,
        cpu: "150m",
        memory: "256Mi",
      },
      version: "v1.2.4",
      lastUpdate: "2024-01-15 14:00:15",
    },
  },
];

// 流程连接线配置（使用直角连接）
const initialEdges: Edge[] = [
  {
    id: "e1-2",
    source: "start",
    target: "auth-service",
    type: "smoothstep", // 使用平滑直角连接
    style: { stroke: "#667eea", strokeWidth: 2 },
    animated: true,
  },
  {
    id: "e1-3",
    source: "start",
    target: "user-service",
    type: "smoothstep",
    style: { stroke: "#667eea", strokeWidth: 2 },
    animated: true,
  },
  {
    id: "e2-4",
    source: "auth-service",
    target: "api-gateway",
    type: "smoothstep",
    style: { stroke: "#4CAF50", strokeWidth: 2 },
  },
  {
    id: "e3-4",
    source: "user-service",
    target: "api-gateway",
    type: "smoothstep",
    style: { stroke: "#2196F3", strokeWidth: 2 },
  },
  {
    id: "e4-5",
    source: "api-gateway",
    target: "payment-service",
    type: "smoothstep",
    style: { stroke: "#4CAF50", strokeWidth: 2 },
  },
  {
    id: "e4-6",
    source: "api-gateway",
    target: "notification-service",
    type: "smoothstep",
    style: { stroke: "#4CAF50", strokeWidth: 2 },
  },
];

// 主要的React Flow组件
const ServiceDeploymentFlow: React.FC = () => {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div
      style={{
        width: "100%",
        height: "600px",
        border: "1px solid #ddd",
        borderRadius: "8px",
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="top-right"
      >
        <MiniMap
          nodeColor={(node) => {
            if (node.type === "startNode") return "#667eea";
            if (node.data && "status" in node.data) {
              return (
                statusColors[node.data.status as keyof typeof statusColors]
                  ?.bg || "#666"
              );
            }
            return "#666";
          }}
          style={{
            backgroundColor: "#f8f9fa",
            border: "1px solid #ddd",
          }}
        />
        <Controls
          style={{
            background: "white",
            border: "1px solid #ddd",
            borderRadius: "4px",
          }}
        />
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#e0e0e0"
        />
      </ReactFlow>
    </div>
  );
};

// 包装组件，提供React Flow上下文
const ServiceDeploymentFlowProvider: React.FC = () => {
  return (
    <ReactFlowProvider>
      <div style={{ padding: "20px" }}>
        <h2
          style={{
            textAlign: "center",
            color: "#1976D2",
            marginBottom: "20px",
          }}
        >
          🚀 服务单元发布流程图 (定制版 React Flow)
        </h2>

        <ServiceDeploymentFlow />

        {/* 流程说明 */}
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            backgroundColor: "#f5f5f5",
            borderRadius: "8px",
          }}
        >
          <h3 style={{ color: "#1976D2", marginBottom: "15px" }}>
            📋 服务单元说明：
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "15px",
            }}
          >
            <div
              style={{
                padding: "10px",
                backgroundColor: "white",
                borderRadius: "5px",
                border: "1px solid #e1e1e1",
              }}
            >
              <h4 style={{ color: "#4CAF50", margin: "0 0 8px 0" }}>
                🟢 运行中 (Running)
              </h4>
              <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "13px" }}>
                <li>
                  <strong>认证服务</strong>：用户身份验证和授权
                </li>
                <li>
                  <strong>API网关</strong>：统一入口和路由管理
                </li>
              </ul>
            </div>

            <div
              style={{
                padding: "10px",
                backgroundColor: "white",
                borderRadius: "5px",
                border: "1px solid #e1e1e1",
              }}
            >
              <h4 style={{ color: "#2196F3", margin: "0 0 8px 0" }}>
                🔵 部署中 (Deploying)
              </h4>
              <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "13px" }}>
                <li>
                  <strong>用户服务</strong>：用户信息管理和操作
                </li>
              </ul>
            </div>

            <div
              style={{
                padding: "10px",
                backgroundColor: "white",
                borderRadius: "5px",
                border: "1px solid #e1e1e1",
              }}
            >
              <h4 style={{ color: "#F44336", margin: "0 0 8px 0" }}>
                🔴 异常 (Error)
              </h4>
              <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "13px" }}>
                <li>
                  <strong>支付服务</strong>：支付处理和订单管理
                </li>
              </ul>
            </div>

            <div
              style={{
                padding: "10px",
                backgroundColor: "white",
                borderRadius: "5px",
                border: "1px solid #e1e1e1",
              }}
            >
              <h4 style={{ color: "#FF9800", margin: "0 0 8px 0" }}>
                🟡 等待中 (Pending)
              </h4>
              <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "13px" }}>
                <li>
                  <strong>通知服务</strong>：消息推送和通知管理
                </li>
              </ul>
            </div>
          </div>

          <div
            style={{
              marginTop: "15px",
              padding: "10px",
              backgroundColor: "#e8f5e8",
              borderRadius: "5px",
              border: "1px solid #4CAF50",
            }}
          >
            <h4 style={{ color: "#2E7D32", margin: "0 0 8px 0" }}>
              💡 定制化特性
            </h4>
            <p style={{ margin: 0, fontSize: "13px", lineHeight: "1.5" }}>
              <strong>🎯 启动图标</strong>：自定义圆形启动按钮 |
              <strong>📊 详细信息</strong>：展示服务ID、容器配置、版本等 |
              <strong>🔗 智能连接</strong>：使用平滑直角连接线，避免重叠 |
              <strong>🎨 状态可视化</strong>：颜色编码区分服务状态
            </p>
          </div>
        </div>
      </div>
    </ReactFlowProvider>
  );
};

export default ServiceDeploymentFlowProvider;
export { ServiceDeploymentFlow, type ServiceUnitData, type CustomNode };
