import React, { useState, useEffect } from "react";
import FormRender, { useForm, type Schema } from "form-render";
import { Button, Card, Space, Modal, message } from "antd";
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
  asyncDemo?: {
    department?: string;
    employee?: string;
    notification?: "email" | "sms" | "phone";
  };
  select?: {
    select?: string;
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

  // 异步选项状态
  const [selectOptions, setSelectOptions] = useState<{
    enum: string[];
    enumNames: string[];
  }>({ enum: [], enumNames: [] });
  const [departmentOptions, setDepartmentOptions] = useState<{
    enum: string[];
    enumNames: string[];
  }>({ enum: [], enumNames: [] });
  const [employeeOptions, setEmployeeOptions] = useState<{
    enum: string[];
    enumNames: string[];
  }>({ enum: [], enumNames: [] });

  // 加载状态
  const [optionsLoading, setOptionsLoading] = useState<boolean>(true);
  const [departmentLoading, setDepartmentLoading] = useState<boolean>(true);
  const [employeeLoading, setEmployeeLoading] = useState<boolean>(false);

  const form = useForm();

  // 模拟异步接口获取选项数据
  const fetchSelectOptions = async (): Promise<{
    enum: string[];
    enumNames: string[];
  }> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      enum: ["option1", "option2", "option3", "option4"],
      enumNames: ["动态选项1", "动态选项2", "动态选项3", "动态选项4"],
    };
  };

  // 模拟获取部门数据
  const fetchDepartmentData = async (): Promise<{
    enum: string[];
    enumNames: string[];
  }> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return {
      enum: ["tech", "sales", "hr", "finance"],
      enumNames: ["技术部", "销售部", "人事部", "财务部"],
    };
  };

  // 模拟获取员工数据（依赖部门）
  const fetchEmployeeData = async (
    department: string
  ): Promise<{
    enum: string[];
    enumNames: string[];
  }> => {
    await new Promise((resolve) => setTimeout(resolve, 600));

    const employeesByDept: Record<
      string,
      Array<{ id: string; name: string; position: string }>
    > = {
      tech: [
        { id: "tech001", name: "张三", position: "前端工程师" },
        { id: "tech002", name: "李四", position: "后端工程师" },
        { id: "tech003", name: "王五", position: "架构师" },
      ],
      sales: [
        { id: "sales001", name: "赵六", position: "销售经理" },
        { id: "sales002", name: "钱七", position: "销售代表" },
      ],
      hr: [
        { id: "hr001", name: "孙八", position: "HR经理" },
        { id: "hr002", name: "周九", position: "HR专员" },
      ],
      finance: [{ id: "fin001", name: "吴十", position: "财务经理" }],
    };

    const employees = employeesByDept[department] || [];
    return {
      enum: employees.map((emp) => emp.id),
      enumNames: employees.map((emp) => `${emp.name} - ${emp.position}`),
    };
  };

  // 组件挂载时获取数据
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setOptionsLoading(true);
        setDepartmentLoading(true);

        const [selectOpts, deptOpts] = await Promise.all([
          fetchSelectOptions(),
          fetchDepartmentData(),
        ]);

        setSelectOptions(selectOpts);
        setDepartmentOptions(deptOpts);
      } catch (error) {
        console.error("获取初始数据失败:", error);
        message.error("获取数据失败");
      } finally {
        setOptionsLoading(false);
        setDepartmentLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // 处理表单值变化
  const handleValuesChange = async (_: unknown, allValues: FormData) => {
    setFormData(allValues);

    // 监听部门变化，重新获取员工数据
    const currentDept = allValues.asyncDemo?.department;
    const previousDept = formData.asyncDemo?.department;

    if (currentDept && currentDept !== previousDept) {
      try {
        setEmployeeLoading(true);
        setEmployeeOptions({ enum: [], enumNames: [] });

        const empOpts = await fetchEmployeeData(currentDept);
        setEmployeeOptions(empOpts);
      } catch (error) {
        console.error("获取员工数据失败:", error);
        message.error("获取员工数据失败");
      } finally {
        setEmployeeLoading(false);
      }
    } else if (!currentDept) {
      setEmployeeOptions({ enum: [], enumNames: [] });
    }
  };

  // 动态表单Schema - 展示统一的异步数据配置方案
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
      asyncDemo: {
        title: "案例3：统一Schema异步数据演示",
        type: "object",
        description: "展示如何通过统一配置实现异步数据获取和字段联动",
        properties: {
          department: {
            title: "部门",
            type: "string",
            widget: "select",
            placeholder: departmentLoading ? "正在加载部门..." : "请选择部门",
            disabled: departmentLoading,
            required: true,
            enum: departmentOptions.enum,
            enumNames: departmentOptions.enumNames,
          },
          employee: {
            title: "员工",
            type: "string",
            widget: "select",
            placeholder: employeeLoading
              ? "正在加载员工..."
              : formData.asyncDemo?.department
              ? "请选择员工"
              : "请先选择部门",
            disabled: !formData.asyncDemo?.department || employeeLoading,
            hidden: "{{!formData.asyncDemo.department}}",
            enum: employeeOptions.enum,
            enumNames: employeeOptions.enumNames,
          },
          notification: {
            title: "通知方式",
            type: "string",
            widget: "radio",
            enum: ["email", "sms", "phone"],
            enumNames: ["邮件", "短信", "电话"],
            default: "email",
            hidden: "{{!formData.asyncDemo.employee}}",
          },
        },
      },
      select: {
        title: "案例4：简单异步选项",
        type: "object",
        description: "通过异步接口获取选项数据",
        properties: {
          select: {
            title: "异步选项",
            type: "string",
            widget: "select",
            enum: selectOptions.enum,
            enumNames: selectOptions.enumNames,
            default: selectOptions.enum[0] || "",
            placeholder: optionsLoading ? "正在加载选项..." : "请选择",
            disabled: optionsLoading,
          },
        },
      },
      case3: {
        title: "案例5：列表项联动",
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
    const values = form.getValues();
    setFormData(values);
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
