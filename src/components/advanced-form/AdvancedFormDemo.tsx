import React, { useState } from "react";
import FormRender, { useForm, type Schema } from "form-render";
import { Button, Card, Space, Modal } from "antd";
import "./AdvancedFormDemo.css";

// 表单数据类型定义
interface FormData {
  case1?: {
    showMore?: boolean;
    x1?: string;
    x2?: string;
  };
  case2?: {
    bi?: "rmb" | "dollar";
    inputName?: string;
  };
  case3?: {
    ruleList?: Array<{
      attr?: "goal" | "league";
      relation?: ">" | "<" | "=";
      goal?: string;
      league?: "a" | "b" | "c";
    }>;
  };
}

interface AdvancedFormDemoProps {
  onSubmit?: (data: FormData) => Promise<void>;
  initialData?: FormData;
}

const AdvancedFormDemo: React.FC<AdvancedFormDemoProps> = ({
  onSubmit,
  initialData = {},
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>(initialData);
  const form = useForm();

  // 动态表单Schema - 实现真正的联动功能
  const schema: Schema = {
    type: "object",
    properties: {
      case1: {
        title: "案例1：整体隐藏",
        type: "object",
        description: "通过开关控制字段的显示/隐藏",
        properties: {
          showMore: {
            title: "显示更多",
            type: "boolean",
            default: false,
          },
          x1: {
            title: "输入框1",
            type: "string",
            placeholder: "请输入内容1",
            hidden: "{{!formData.case1.showMore}}",
          },
          x2: {
            title: "输入框2",
            type: "string",
            placeholder: "请输入内容2",
            hidden: "{{!formData.case1.showMore}}",
          },
        },
      },
      case2: {
        title: "案例2：选项联动",
        type: "object",
        description: "根据币种选择动态改变输入框的提示和装饰",
        properties: {
          bi: {
            title: "汇款币种",
            type: "string",
            widget: "radio",
            enum: ["rmb", "dollar"],
            enumNames: ["人民币", "美元"],
            default: "rmb",
          },
          inputName: {
            title: "金额",
            type: "string",
            placeholder: "请输入金额",
            tooltip:
              "{{formData.case2.bi === 'dollar' ? '一次汇款不超过150美元' : '一次汇款不超过1000元'}}",
            props: {
              addonBefore: "{{formData.case2.bi === 'dollar' ? '$' : '￥'}}",
              addonAfter: "{{formData.case2.bi === 'dollar' ? '美元' : '元'}}",
            },
          },
        },
      },
      case3: {
        title: "案例3：列表项联动",
        type: "object",
        description: "根据筛选标准动态显示不同的输入组件",
        properties: {
          ruleList: {
            title: "球员筛选规则",
            type: "array",
            items: {
              type: "object",
              properties: {
                attr: {
                  title: "筛选标准",
                  type: "string",
                  widget: "select",
                  enum: ["goal", "league"],
                  enumNames: ["入球数", "所在联盟"],
                  width: "40%",
                  required: true,
                },
                relation: {
                  title: "关系",
                  type: "string",
                  enum: [">", "<", "="],
                  widget: "select",
                  hidden: "{{rootValue.attr === 'league'}}",
                  width: "20%",
                },
                goal: {
                  title: "入球数",
                  type: "string",
                  placeholder: "请输入数字",
                  rules: [
                    {
                      pattern: "^[0-9]+$",
                      message: "请输入正确的数字",
                    },
                  ],
                  hidden: "{{rootValue.attr === 'league'}}",
                  width: "40%",
                },
                league: {
                  title: "联盟名称",
                  type: "string",
                  enum: ["a", "b", "c"],
                  enumNames: ["西甲", "英超", "中超"],
                  widget: "select",
                  hidden: "{{rootValue.attr !== 'league'}}",
                  width: "40%",
                },
              },
            },
            min: 1,
            max: 10,
          },
        },
      },
    },
  };

  // 简化的表单值变化处理
  const handleValuesChange = (
    changedValues: unknown,
    allValues: FormData
  ): void => {
    setFormData(allValues);
  };

  // 提交表单
  const handleSubmit = async (): Promise<void> => {
    try {
      const valid = await form.validateFields();
      if (!valid) return;

      setLoading(true);

      if (onSubmit) {
        await onSubmit(formData);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      console.log("表单数据:", form.getValues());
    } catch (error) {
      console.error("提交失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (): void => {
    setPreviewVisible(true);
  };

  return (
    <div className="advanced-form-demo">
      <Card
        title="动态表单联动演示"
        extra={
          <Space>
            <Button onClick={handlePreview}>预览数据</Button>
            <Button onClick={() => form.resetFields()}>重置</Button>
            <Button type="primary" loading={loading} onClick={handleSubmit}>
              提交表单
            </Button>
          </Space>
        }
      >
        <FormRender
          schema={schema}
          form={form}
          onValuesChange={handleValuesChange}
          displayType="row"
          labelWidth={120}
        />
      </Card>

      <Modal
        title="表单数据预览"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        <pre style={{ maxHeight: 500, overflow: "auto" }}>
          {JSON.stringify(formData, null, 2)}
        </pre>
      </Modal>
    </div>
  );
};

export default AdvancedFormDemo;
export type { FormData, AdvancedFormDemoProps };
