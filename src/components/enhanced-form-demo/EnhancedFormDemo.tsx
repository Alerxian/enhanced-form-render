import React, { useState } from "react";
import { Button, Card, Space, Modal, message } from "antd";
import { useForm } from "form-render";
import EnhancedFormRender from "../enhanced-form";
import type { EnhancedSchema } from "../../types/schema";
import "./EnhancedFormDemo.css";

interface EnhancedFormDemoProps {
  onSubmit?: (data: Record<string, unknown>) => Promise<void>;
  initialData?: Record<string, unknown>;
}

const EnhancedFormDemo: React.FC<EnhancedFormDemoProps> = ({
  onSubmit,
  initialData = {},
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  const [formData, setFormData] =
    useState<Record<string, unknown>>(initialData);
  const form = useForm();

  // 增强表单Schema配置 - 完整的异步数据演示
  const enhancedSchema: EnhancedSchema = {
    type: "object",
    title: "增强表单演示",
    description: "展示统一Schema异步数据配置的完整功能",

    properties: {
      basicInfo: {
        title: "基础信息",
        type: "object",
        description: "用户基本信息配置",
        properties: {
          name: {
            title: "姓名",
            type: "string",
            placeholder: "请输入姓名",
            required: true,
            default: "",
          },

          region: {
            title: "所在地区",
            type: "string",
            widget: "select",
            placeholder: "请选择地区",
            required: true,
            asyncDataSource: {
              url: "/regions",
              method: "GET",
              cacheTime: 30 * 60 * 1000,
              // transform: (_data) => {
              //   console.log(_data, "data");
              //   return [];
              //   // const regions = [
              //   //   { id: "beijing", name: "北京市" },
              //   //   { id: "shanghai", name: "上海市" },
              //   //   { id: "guangzhou", name: "广州市" },
              //   //   { id: "shenzhen", name: "深圳市" },
              //   // ];
              //   // return regions.map((region) => ({
              //   //   value: region.id,
              //   //   label: region.name,
              //   // }));
              // },
            },
            // 静态选项作为降级方案
            enum: ["beijing", "shanghai"],
            enumNames: ["北京市", "上海市"],
          },

          city: {
            title: "具体城市",
            type: "string",
            widget: "select",
            placeholder: "请先选择地区",
            disabled: "{{!formData.basicInfo.region}}",
            hidden: "{{!formData.basicInfo.region}}",
            asyncDataSource: {
              url: "/cities",
              method: "GET",
              params: {
                regionId: "basicInfo.region",
              },
              dependencies: ["basicInfo.region"],
              cacheTime: 10 * 60 * 1000,
            },
          },

          phone: {
            title: "联系电话",
            type: "string",
            placeholder: "请输入手机号",
            default: "",
            hidden: "{{!formData.basicInfo.city}}",
          },
        },
      },

      workInfo: {
        title: "工作信息",
        type: "object",
        description: "职场相关信息配置",
        properties: {
          department: {
            title: "所属部门",
            type: "string",
            widget: "select",
            placeholder: "请选择部门",
            required: true,
            asyncDataSource: {
              url: "/departments",
              method: "GET",
              cacheTime: 15 * 60 * 1000,
            },
            enum: ["tech", "product"],
            enumNames: ["技术部", "产品部"],
          },

          team: {
            title: "团队",
            type: "string",
            widget: "select",
            placeholder: "请先选择部门",
            disabled: "{{!formData.workInfo.department}}",
            hidden: "{{!formData.workInfo.department}}",
            asyncDataSource: {
              url: "/teams",
              method: "GET",
              params: {
                departmentId: "workInfo.department",
              },
              dependencies: ["workInfo.department"],
              cacheTime: 5 * 60 * 1000,
            },
          },

          role: {
            title: "职位",
            type: "string",
            widget: "select",
            placeholder: "请先选择团队",
            disabled:
              "{{!formData.workInfo.team && !formData.workInfo.department}}",
            hidden:
              "{{!formData.workInfo.team && !formData.workInfo.department}}",
            asyncDataSource: {
              url: "/positions",
              method: "GET",
              params: {
                teamId: "workInfo.team",
                departmentId: "workInfo.department",
              },
              dependencies: ["workInfo.department", "workInfo.team"],
              cacheTime: 2 * 60 * 1000,
            },
          },

          startDate: {
            title: "入职日期",
            type: "string",
            widget: "datePicker",
            placeholder: "选择入职日期",
            hidden: "{{!formData.workInfo.role}}",
          },
        },
      },
    },
  };

  // 处理表单值变化
  const handleValuesChange = (values: Record<string, unknown>): void => {
    setFormData(values);
    console.log("表单数据变化:", values);
  };

  // 提交表单
  const handleSubmit = async (): Promise<void> => {
    try {
      const valid = await form.validateFields();
      if (!valid) {
        message.error("表单验证失败，请检查输入");
        return;
      }

      setLoading(true);
      const values = form.getValues();

      if (onSubmit) {
        await onSubmit(values);
        message.success("提交成功！");
      } else {
        // 模拟提交延迟
        await new Promise((resolve) => setTimeout(resolve, 2000));
        message.success("增强表单提交成功！");
      }

      console.log("增强表单提交数据:", values);
    } catch (error) {
      console.error("提交失败:", error);
      message.error("提交失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (): void => {
    setPreviewVisible(true);
    const values = form.getValues();
    setFormData(values);
  };

  const handleReset = (): void => {
    form.resetFields();
    setFormData({});
    message.info("表单已重置");
  };

  return (
    <div className="enhanced-form-demo">
      <Card
        title="增强表单演示 - 统一Schema异步数据配置"
        extra={
          <Space>
            <Button onClick={handlePreview}>预览数据</Button>
            <Button onClick={handleReset}>重置表单</Button>
            <Button type="primary" loading={loading} onClick={handleSubmit}>
              提交表单
            </Button>
          </Space>
        }
        style={{ marginBottom: 24 }}
      >
        <div
          style={{
            marginBottom: 16,
            padding: 16,
            background: "#f5f5f5",
            borderRadius: 6,
          }}
        >
          <h4 style={{ margin: 0, marginBottom: 8, color: "#1890ff" }}>
            🚀 功能特点：
          </h4>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>✅ 统一Schema配置异步数据源</li>
            <li>✅ 多级联动：地区→城市，部门→团队→职位</li>
            <li>✅ 智能缓存和错误处理</li>
            <li>✅ 动态显示隐藏和权限配置</li>
            <li>✅ 完整的TypeScript类型支持</li>
            <li>🔧 解决了React Hooks规则冲突问题</li>
          </ul>
        </div>

        <EnhancedFormRender
          schema={enhancedSchema}
          // formData={formData}
          onValuesChange={handleValuesChange}
          form={form}
          displayType="row"
          labelWidth={120}
        />
      </Card>

      <Modal
        title="增强表单数据预览"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            关闭
          </Button>,
        ]}
        width={900}
      >
        <div style={{ maxHeight: 600, overflow: "auto" }}>
          <pre style={{ background: "#f5f5f5", padding: 16, borderRadius: 6 }}>
            {JSON.stringify(formData, null, 2)}
          </pre>
        </div>
      </Modal>
    </div>
  );
};

export default EnhancedFormDemo;
export type { EnhancedFormDemoProps };
