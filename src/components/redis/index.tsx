import { useForm } from "form-render";
import { useEffect } from "react";
import { type EnhancedSchema } from "../../types/schema";
import EnhancedFormRender from "../enhanced-form";
import type { WidgetProps } from "form-render";

// 表单数据接口
interface FormData {
  systemName: string;
  systemCode: string;
  envType: string;
  serviceUnitIds?: string[];
  resourceTpl?: string;
  zoneId?: string;
  series?: string;
  cpuType?: string;
  engineVersion?: string;
  architecture?: string;
  nodeType?: string;
  instance?: string;
}

const FormTitle = (props: WidgetProps) => {
  return (
    <h3 style={{ width: "190px", textAlign: "right", margin: 0 }}>
      {props.title}
    </h3>
  );
};

const renderTitle = (title: string) => ({
  [title]: {
    type: "string",
    widget: "FormTitle",
    props: {
      title,
    },
  },
});

export const RedisTpl = () => {
  const form = useForm();

  const schema: EnhancedSchema = {
    type: "object",
    properties: {
      systemName: {
        type: "string",
        title: "系统",
        widget: "input",
        required: true,
        disabled: true,
      },
      systemCode: {
        type: "string",
        title: "系统code",
        hidden: true,
      },
      envType: {
        type: "string",
        title: "环境类型",
        required: true,
        disabled: true,
      },
      serviceUnitIds: {
        type: "string",
        widget: "select",
        title: "服务单元",
        props: {
          mode: "multiple",
          maxTagCount: 1,
        },
        asyncDataSource: {
          url: "/api/redis/service-units",
          method: "GET",
          // dependencies: ["systemCode", "envType"],
          params: {
            systemCode: "{systemCode}",
            envType: "{envType}",
          },
          transform: (
            data: { id: string; name: string; code: string; status: string }[]
          ) => {
            return data.map((item) => ({
              label: `${item.name} (${item.code})`,
              value: item.id,
            }));
          },
          cacheTime: 300000, // 5分钟缓存
        },
      },
      ...renderTitle("选择模板"),
      resourceTpl: {
        title: "资源模板",
        type: "string",
        widget: "select",
        asyncDataSource: {
          url: "/api/redis/resource-templates",
          method: "GET",
          transform: (data: { id: string; name: string }[]) => {
            return data.map((item) => ({
              label: item.name,
              value: item.id,
            }));
          },
          cacheTime: 600000, // 10分钟缓存
        },
      },
      ...renderTitle("区域"),
      zoneId: {
        type: "string",
        widget: "select",
        title: "可用区",
        required: true,
        asyncDataSource: {
          url: "/api/redis/zones",
          method: "GET",
          transform: (data: { id: string; name: string }[]) => {
            return data.map((item) => ({
              label: item.name,
              value: item.id,
            }));
          },
          cacheTime: 300000,
          defaultValue: {
            selector: {
              byIndex: 0, // 如果没有enterprise则选择第一个
            },
          },
        },
      },
      ...renderTitle("规格"),
      series: {
        type: "string",
        widget: "radio",
        title: "版本类型",
        required: true,
        asyncDataSource: {
          url: "/api/redis/series",
          method: "GET",
          transform: (data: { id: string; name: string }[]) => {
            return data.map((item) => ({
              label: item.name,
              value: item.id,
            }));
          },
          cacheTime: 600000,
          // 数据加载完成后自动设置默认值
          defaultValue: {
            selector: {
              byValue: "enterprise", // 优先选择enterprise
              byIndex: 0, // 如果没有enterprise则选择第一个
            },
            triggerDependencies: true, // 设置值后触发依赖字段更新
          },
        },
      },
      cpuType: {
        type: "string",
        widget: "radio",
        title: "芯片架构",
        dependencies: ["series"],
        required: true,
        asyncDataSource: {
          url: "/api/redis/cpu-types",
          method: "GET",
          dependencies: ["series"],
          params: {
            series: "{series}",
          },
          transform: (data: { id: string; name: string }[]) => {
            return data.map((item) => ({
              label: item.name,
              value: item.id,
            }));
          },
          cacheTime: 300000,
          defaultValue: {
            selector: {
              byIndex: 0, // 如果没有enterprise则选择第一个
            },
          },
        },
      },
      engineVersion: {
        type: "string",
        widget: "radio",
        title: "引擎版本",
        required: true,
        asyncDataSource: {
          url: "/api/redis/engine-versions",
          method: "GET",
          params: {
            stable: "true",
          },
          transform: (data: { id: string; name: string }[]) => {
            return data.map((item) => ({
              label: item.name,
              value: item.id,
            }));
          },
          cacheTime: 600000,
          defaultValue: {
            selector: {
              byIndex: 0, // 如果没有enterprise则选择第一个
            },
          },
        },
      },
      architecture: {
        type: "string",
        widget: "radio",
        title: "架构类型",
        required: true,
        asyncDataSource: {
          url: "/api/redis/architectures",
          method: "GET",
          transform: (data: { id: string; name: string }[]) => {
            return data.map((item) => ({
              label: item.name,
              value: item.id,
            }));
          },
          cacheTime: 600000,
          defaultValue: {
            selector: {
              byIndex: 0, // 如果没有enterprise则选择第一个
            },
          },
        },
      },
      nodeType: {
        type: "string",
        widget: "radio",
        title: "节点类型",
        required: true,
        dependencies: ["architecture"],
        asyncDataSource: {
          url: "/api/redis/node-types",
          method: "GET",
          dependencies: ["architecture"],
          params: {
            architecture: "{architecture}",
          },
          transform: (data: { id: string; name: string }[]) => {
            return data.map((item) => ({
              label: item.name,
              value: item.id,
            }));
          },
          cacheTime: 300000,
          defaultValue: {
            selector: {
              byIndex: 0, // 如果没有enterprise则选择第一个
            },
          },
        },
      },
      instance: {
        type: "string",
        widget: "select",
        title: "实例规格",
        required: true,
        asyncDataSource: {
          url: "/api/redis/instances",
          method: "GET",
          params: {
            series: "{series}",
            cpuType: "{cpuType}",
            architecture: "{architecture}",
            engineVersion: "{engineVersion}",
            nodeType: "{nodeType}",
            id: 11,
          },
          transform: (data: { id: string; name: string }[]) => {
            console.log(data, "data");
            return data.map((item) => ({
              label: item.name,
              value: item.id,
            }));
          },
          cacheTime: 300000,
          dependencies: [
            "series",
            "cpuType",
            "architecture",
            "engineVersion",
            "nodeType",
          ],
          ready(formData) {
            return (
              !!formData.series &&
              !!formData.cpuType &&
              !!formData.architecture &&
              !!formData.engineVersion &&
              !!formData.nodeType
            );
          },
        },
      },
    },
  };

  useEffect(() => {
    // 初始化表单数据
    form.setValues({
      systemCode: "TP114",
      systemName: "测试系统",
      envType: "DEV",
    });
  }, [form]);

  return (
    <div style={{ display: "flex", gap: "20px" }}>
      {/* 表单区域 */}
      <div className="" style={{ width: "600px" }}>
        <EnhancedFormRender
          form={form}
          schema={schema}
          displayType="row"
          column={1}
          labelWidth={200}
          maxWidth={800}
          onFinish={(values: FormData) => {
            console.log("表单提交数据:", values);
          }}
          footer
          widgets={{ FormTitle }}
        />
      </div>
    </div>
  );
};
