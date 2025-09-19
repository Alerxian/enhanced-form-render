import React from "react";
import { Typography, message } from "antd";
import "./CopyText.css";

const { Text } = Typography;

// 组件 Props 接口
interface CopyTextProps {
  /** 要复制的文本内容 */
  text: string;
  /** 自定义 CSS 类名 */
  className?: string;
  /** 是否显示复制成功消息 */
  showMessage?: boolean;
  /** 自定义提示文本 */
  tooltips?: [string, string];
  /** 复制成功的回调函数 */
  onCopy?: (text: string) => void;
}

const CopyText: React.FC<CopyTextProps> = ({
  text,
  className = "",
  showMessage = false,
  tooltips = ["点击复制", "已复制"],
  onCopy,
}) => {
  const handleCopy = (): void => {
    if (showMessage) {
      message.success(`已复制: ${text}`);
    }
    if (onCopy) {
      onCopy(text);
    }
  };

  return (
    <div className={`copy-text-container ${className}`}>
      <Text
        copyable={{
          tooltips,
          onCopy: handleCopy,
        }}
        className="copy-text"
      >
        {text}
      </Text>
    </div>
  );
};

export default CopyText;
