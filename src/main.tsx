import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// import './index.css'
import App from "./App.tsx";

// 获取根元素，并进行空值检查
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('找不到 id 为 "root" 的元素，请检查 HTML 文件');
}

// 创建 React 应用根节点并渲染
const root = createRoot(rootElement);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
