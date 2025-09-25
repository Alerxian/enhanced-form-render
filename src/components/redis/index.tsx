import FormRender, {
  useForm,
  type Schema,
  type WatchProperties,
  type WidgetProps,
} from "form-render";
import { useEffect } from "react";
import { fetchServiceUnitOptions } from "../../api/serviceUnits";

// 表单数据接口
interface FormData {
  systemName: string;
  systemCode: string;
  envType: string;
  serviceUnitIds?: string[];
}

const FormTitle = (props: WidgetProps) => {
  // console.log(props);
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

  const schema: Schema = {
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
      },
      ...renderTitle("选择模板"),
      resourceTpl: {
        title: "资源模板",
        type: "string",
        widget: "select",
      },
      ...renderTitle("区域"),

      zoneId: {
        type: "string",
        widget: "select",
        title: "可用区",
        required: true,
      },
      ...renderTitle("规格"),
      series: {
        type: "string",
        widget: "radio",
        title: "版本类型",
        required: true,
      },
      cpuType: {
        type: "string",
        widget: "radio",
        title: "芯片架构",
        dependencies: ["series"],
        required: true,
      },
      engineVersion: {
        type: "string",
        widget: "radio",
        title: "引擎版本",
        required: true,
      },
      architecture: {
        type: "string",
        widget: "radio",
        title: "架构类型",
        required: true,
      },
      nodeType: {
        type: "string",
        widget: "radio",
        title: "节点类型",
        required: true,
      },
      instance: {
        type: "string",
        widget: "select",
        title: "实例规格",
        required: true,
      },
    },
  };

  useEffect(() => {
    const fetchService = async () => {
      // 组件加载时获取服务单元数据
      const data = await fetchServiceUnitOptions();
      const seriesOptions = [{ value: "1", label: "企业版" }];
      const cpuTypeOptions = [{ value: "1", label: "hygon" }];
      const engineVersionOptions = [{ value: "1", label: "5.7" }];
      const architectureOptions = [{ value: "1", label: "标准版" }];
      const nodeTypeOptions = [{ value: "1", label: "单节点" }];
      const instanceOptions = [
        { value: "1", label: "1C1G" },
        { value: "2", label: "2C2G" },
        { value: "4", label: "4C4G" },
      ];
      // console.log(data);
      form.setSchema({
        serviceUnitIds: {
          props: {
            options: data,
          },
        },
        zoneId: {
          props: {
            options: data,
          },
        },
        series: {
          props: {
            options: seriesOptions,
          },
        },
        cpuType: {
          props: {
            options: cpuTypeOptions,
          },
        },
        engineVersion: {
          props: {
            options: engineVersionOptions,
          },
        },
        architecture: {
          props: {
            options: architectureOptions,
          },
        },
        nodeType: {
          props: {
            options: nodeTypeOptions,
          },
        },
        instance: {
          props: {
            options: instanceOptions,
          },
        },
      });

      form.setValues({
        series: seriesOptions[0].value,
        serviceUnitIds: [data[0].value],
      });
    };

    fetchService();
  }, [form]);

  const watch: WatchProperties = {
    series: (value) => {
      console.log(value);
    },
  };

  return (
    <div style={{ display: "flex", gap: "20px" }}>
      {/* 表单区域 */}
      <div className="" style={{ width: "600px" }}>
        <FormRender
          form={form}
          schema={schema}
          displayType="row"
          column={1}
          labelWidth={200}
          maxWidth={800}
          // initialValues={{
          //   systemCode: "TP114",
          //   systemName: "测试系统",
          //   envType: "DEV",
          // }}
          onMount={() => {
            form.setValues({
              systemCode: "TP114",
              systemName: "测试系统",
              envType: "DEV",
            });
          }}
          onFinish={(values: FormData) => {
            console.log("表单提交数据:", values);
          }}
          footer
          widgets={{ FormTitle }}
          watch={watch}
        />
      </div>
    </div>
  );
};
