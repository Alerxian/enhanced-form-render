import React, { useState } from "react";
import { Tabs, type TabsProps } from "antd";
import AdvancedFormDemo, {
  type FormData as AdvancedFormData,
} from "./components/advanced-form/AdvancedFormDemo";
import EnhancedFormDemo from "./components/enhanced-form-demo/EnhancedFormDemo";
import APIDemo from "./components/api-demo";
// import "antd/dist/reset.css"; // 引入 antd 样式

/**
 * 主应用组件
 * 演示复杂表单和高级表单功能
 */
const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("advanced");

  // 处理高级表单提交
  const handleAdvancedFormSubmit = async (
    data: AdvancedFormData
  ): Promise<void> => {
    console.log("高级表单提交数据:", data);
    // 这里可以添加实际的提交逻辑
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  // 处理增强表单提交
  const handleEnhancedFormSubmit = async (
    data: Record<string, unknown>
  ): Promise<void> => {
    console.log("增强表单提交数据:", data);
    // 这里可以添加实际的提交逻辑
    await new Promise((resolve) => setTimeout(resolve, 2000));
  };

  // 标签页配置
  const tabItems: TabsProps["items"] = [
    {
      key: "advanced",
      label: "高级表单演示",
      children: <AdvancedFormDemo onSubmit={handleAdvancedFormSubmit} />,
    },
    {
      key: "enhanced",
      label: "增强表单演示",
      children: <EnhancedFormDemo onSubmit={handleEnhancedFormSubmit} />,
    },
    {
      key: "api",
      label: "API接口演示",
      children: <APIDemo />,
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
        <div
          style={{
            padding: "24px 24px 0",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <h1
            style={{
              margin: 0,
              color: "#1890ff",
              fontSize: "28px",
              fontWeight: 600,
            }}
          >
            🚀 Redux Demo - 全栈演示平台
          </h1>
          <p
            style={{
              margin: "8px 0 24px",
              color: "#666",
              fontSize: "16px",
            }}
          >
            展示Redux状态管理、Schema异步数据配置、高级表单联动和后端API集成
          </p>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="large"
          style={{ padding: "0 24px" }}
        />
      </div>

      <div
        style={{
          marginTop: "24px",
          textAlign: "center",
          color: "#666",
        }}
      >
        <p className="read-the-docs">
          点击标签页切换不同的演示，体验Redux状态管理、异步数据加载、字段联动和API集成功能
        </p>
      </div>
    </div>
  );
};

export default App;
