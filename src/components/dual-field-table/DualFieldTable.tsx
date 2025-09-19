import React from "react";
import { Table } from "antd";
import CopyText from "../copy-text/CopyText";
import type { ColumnsType } from "antd/es/table";
import "./DualFieldTable.css";

/**
 * 表格数据项接口
 */
interface DataType {
  /** 唯一标识符 */
  key: string;
  /** 第一个字段（如邮箱） */
  field1: string;
  /** 第二个字段（如电话） */
  field2: string;
  /** 用户姓名 */
  name: string;
  /** 年龄 */
  age: number;
  /** 地址 */
  address: string;
}

/**
 * 组件 Props 接口
 */
interface DualFieldTableProps {
  /** 表格数据 */
  dataSource?: DataType[];
  /** 是否显示分页 */
  showPagination?: boolean;
  /** 表格大小 */
  size?: "small" | "middle" | "large";
  /** 表格标题 */
  title?: string;
}

const DualFieldTable: React.FC<DualFieldTableProps> = ({
  dataSource,
  showPagination = false,
  size = "middle",
  title = "双字段展示表格示例",
}) => {
  // 默认示例数据
  const defaultData: DataType[] = [
    {
      key: "1",
      field1: "user@example.com",
      field2: "18612345678",
      name: "张三",
      age: 32,
      address: "北京市朝阳区",
    },
    // {
    //   key: "2",
    //   field1: "admin@company.com",
    //   field2: "13987654321",
    //   name: "李四",
    //   age: 28,
    //   address: "上海市浦东新区",
    // },
    // {
    //   key: "3",
    //   field1: "test@domain.org",
    //   field2: "15566778899",
    //   name: "王五",
    //   age: 35,
    //   address: "广州市天河区",
    // },
  ];

  // 使用传入的数据或默认数据
  const data = dataSource || defaultData;

  const columns: ColumnsType<DataType> = [
    {
      title: "联系信息",
      dataIndex: "contact",
      key: "contact",
      width: 200,
      render: (_, record) => (
        <div className="dual-field-container">
          <div className="dual-field-row">
            <CopyText text={record.field1} showMessage={true} />
          </div>
          <div className="dual-field-row">
            <CopyText text={record.field2} />
          </div>
        </div>
      ),
    },
    {
      title: "姓名",
      dataIndex: "name",
      key: "name",
      width: 100,
    },
    {
      title: "年龄",
      dataIndex: "age",
      key: "age",
      width: 80,
    },
    {
      title: "地址",
      dataIndex: "address",
      key: "address",
    },
  ];

  return (
    <div className="dual-field-table">
      <h2>{title}</h2>
      <Table
        columns={columns}
        dataSource={data}
        pagination={showPagination ? {} : false}
        size={size}
      />
    </div>
  );
};

export default DualFieldTable;

// 导出类型定义
export type { DataType as DualFieldTableDataType, DualFieldTableProps };
