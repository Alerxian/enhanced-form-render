import React from "react";
import AdvancedFormDemo, {
  type AdvancedFormData,
} from "./components/advanced-form/AdvancedFormDemo";
// import "antd/dist/reset.css"; // 引入 antd 样式

/**
 * 主应用组件
 * 演示复杂表单和高级表单功能
 */
const App: React.FC = () => {
  // 处理高级表单提交
  const handleAdvancedFormSubmit = async (
    data: AdvancedFormData
  ): Promise<void> => {
    console.log("高级表单提交数据:", data);
    // 这里可以添加实际的提交逻辑
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  return (
    <>
      {/* 高级表单演示 */}
      <AdvancedFormDemo onSubmit={handleAdvancedFormSubmit} />

      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
};

export default App;
