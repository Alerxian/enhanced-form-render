import React from "react";
import { Tabs, type TabsProps } from "antd";
import FlowDemo from "./components/Flow";
import ServiceDeploymentFlowProvider from "./components/ReactFlow";
// import "antd/dist/reset.css"; // 引入 antd 样式
// import EnhancedFormDemo from "./components/enhanced-form-demo/EnhancedFormDemo";
import { RedisTpl } from "./components/redis";

/**
 * 主应用组件
 * 演示流程图功能
 */
const App: React.FC = () => {
  // 标签页配置
  const tabItems: TabsProps["items"] = [
    {
      key: "enhanced-form",
      label: "表单联动演示",
      // children: <EnhancedFormDemo />,
      children: <RedisTpl />,
    },
    {
      key: "flow",
      label: "流程图演示",
      children: <FlowDemo />,
    },
    {
      key: "reactflow",
      label: "React Flow 流程图",
      children: <ServiceDeploymentFlowProvider />,
    },
  ];

  return (
    <div style={{ padding: "24px", minHeight: "100vh", background: "#f5f5f5" }}>
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          background: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <Tabs items={tabItems} size="large" style={{ padding: "0 24px" }} />
      </div>

      <div
        style={{
          marginTop: "24px",
          textAlign: "center",
          color: "#666",
        }}
      >
        <p className="read-the-docs">
          点击标签页切换不同的流程图实现方案，体验自定义SVG流程图和React
          Flow的专业图形功能
        </p>
      </div>
    </div>
  );
};

export default App;
