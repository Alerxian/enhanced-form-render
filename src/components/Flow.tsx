import React, { useMemo } from "react";

// 流程节点类型定义
interface FlowNode {
  id: string;
  type: "start" | "process" | "decision" | "parallel" | "merge" | "end";
  label: string;
  next?: string | string[]; // 下一个节点ID，可以是单个或多个（并行）
  conditions?: { [key: string]: string }; // 决策节点的条件分支
}

// 计算后的节点位置信息
interface PositionedNode extends FlowNode {
  x: number;
  y: number;
  level: number; // 层级
  column: number; // 在该层级中的列位置
}

// 连接线信息
interface Connection {
  from: string;
  to: string;
  label?: string; // 连接线上的标签（如决策条件）
  points: { x: number; y: number }[]; // 连接线的路径点
}

// 布局配置
const LAYOUT_CONFIG = {
  nodeWidth: 120,
  nodeHeight: 50,
  levelGap: 120, // 层级间距（增加间距）
  columnGap: 160, // 同层级节点间距（增加间距）
  margin: 60, // 增加边距
};

// 自动布局算法
class FlowLayoutEngine {
  private nodes: FlowNode[];
  private positionedNodes: Map<string, PositionedNode> = new Map();
  private connections: Connection[] = [];
  private levels: Map<number, string[]> = new Map();
  private nodeMap: Map<string, FlowNode> = new Map();

  constructor(nodes: FlowNode[]) {
    this.nodes = nodes;
    this.nodeMap = new Map(nodes.map((node) => [node.id, node]));
    this.calculateLayout();
  }

  private calculateLayout() {
    // 1. 计算节点层级
    this.calculateLevels();

    // 2. 优化层级分布（处理合并节点）
    this.optimizeLevels();

    // 3. 计算节点位置
    this.calculatePositions();

    // 4. 生成连接线
    this.generateConnections();
  }

  private calculateLevels() {
    const levels = new Map<string, number>();

    // 找到起始节点
    const startNode = this.nodes.find((node) => node.type === "start");
    if (!startNode) return;

    // 使用BFS算法替代DFS，避免递归问题
    const queue: { nodeId: string; level: number }[] = [
      { nodeId: startNode.id, level: 0 },
    ];

    // 限制最大迭代次数，防止无限循环
    let iterations = 0;
    const maxIterations = this.nodes.length * 10; // 安全上限

    while (queue.length > 0 && iterations < maxIterations) {
      iterations++;
      const { nodeId, level } = queue.shift()!;

      // 如果已经访问过且层级不更深，跳过
      const currentLevel = levels.get(nodeId);
      if (currentLevel !== undefined && currentLevel >= level) {
        continue;
      }

      // 更新节点层级
      levels.set(nodeId, level);

      const node = this.nodeMap.get(nodeId);
      if (!node?.next) continue;

      const nextNodes = Array.isArray(node.next) ? node.next : [node.next];
      nextNodes.forEach((nextId) => {
        // 检查节点是否存在
        if (this.nodeMap.has(nextId)) {
          queue.push({ nodeId: nextId, level: level + 1 });
        }
      });
    }

    // 检查是否超出迭代次数限制
    if (iterations >= maxIterations) {
      console.warn("流程图布局计算超出迭代限制，可能存在循环依赖");
    }

    // 根据计算出的层级组织节点
    levels.forEach((level, nodeId) => {
      if (!this.levels.has(level)) {
        this.levels.set(level, []);
      }
      this.levels.get(level)!.push(nodeId);
    });
  }

  private optimizeLevels() {
    // 处理合并节点，确保它们在正确的层级
    const mergeNodes = this.nodes.filter((node) => node.type === "merge");

    mergeNodes.forEach((mergeNode) => {
      // 找到所有指向此合并节点的节点
      const sourceNodes = this.nodes.filter((node) => {
        if (!node.next) return false;
        const nextNodes = Array.isArray(node.next) ? node.next : [node.next];
        return nextNodes.includes(mergeNode.id);
      });

      if (sourceNodes.length > 0) {
        // 合并节点应该在所有源节点的最大层级之后
        const maxSourceLevel = Math.max(
          ...sourceNodes.map((node) => {
            const entry = Array.from(this.levels.entries()).find(
              ([, nodeIds]) => nodeIds.includes(node.id)
            );
            return entry ? entry[0] : 0;
          })
        );

        // 移除合并节点当前层级
        this.levels.forEach((nodeIds, level) => {
          const index = nodeIds.indexOf(mergeNode.id);
          if (index !== -1) {
            nodeIds.splice(index, 1);
            if (nodeIds.length === 0) {
              this.levels.delete(level);
            }
          }
        });

        // 将合并节点放到正确的层级
        const newLevel = maxSourceLevel + 1;
        if (!this.levels.has(newLevel)) {
          this.levels.set(newLevel, []);
        }
        this.levels.get(newLevel)!.push(mergeNode.id);
      }
    });
  }

  private calculatePositions() {
    // 重新排序层级
    const sortedLevels = Array.from(this.levels.keys()).sort((a, b) => a - b);

    sortedLevels.forEach((level, levelIndex) => {
      const nodeIds = this.levels.get(level) || [];
      const nodeCount = nodeIds.length;

      nodeIds.forEach((nodeId, index) => {
        const node = this.nodeMap.get(nodeId)!;

        // 计算X坐标 - 居中分布
        let x: number;
        if (nodeCount === 1) {
          x = 0;
        } else {
          const totalWidth = (nodeCount - 1) * LAYOUT_CONFIG.columnGap;
          x = -totalWidth / 2 + index * LAYOUT_CONFIG.columnGap;
        }

        // 计算Y坐标
        const y = levelIndex * LAYOUT_CONFIG.levelGap;

        this.positionedNodes.set(nodeId, {
          ...node,
          x,
          y,
          level: levelIndex,
          column: index,
        });
      });
    });
  }

  private generateConnections() {
    this.positionedNodes.forEach((fromNode) => {
      if (!fromNode.next) return;

      const nextNodes = Array.isArray(fromNode.next)
        ? fromNode.next
        : [fromNode.next];

      nextNodes.forEach((nextId, index) => {
        const toNode = this.positionedNodes.get(nextId);
        if (!toNode) return;

        // 计算连接线路径
        const points = this.calculateConnectionPath(
          fromNode,
          toNode,
          index,
          nextNodes.length
        );

        // 决策节点的条件标签
        let label: string | undefined;
        if (fromNode.type === "decision" && fromNode.conditions) {
          const conditionKeys = Object.keys(fromNode.conditions);
          label = fromNode.conditions[conditionKeys[index]];
        }

        this.connections.push({
          from: fromNode.id,
          to: nextId,
          label,
          points,
        });
      });
    });
  }

  private calculateConnectionPath(
    fromNode: PositionedNode,
    toNode: PositionedNode,
    branchIndex: number,
    totalBranches: number
  ): { x: number; y: number }[] {
    // 计算节点的连接点
    const fromPoint = {
      x: fromNode.x,
      y: fromNode.y + LAYOUT_CONFIG.nodeHeight / 2,
    };

    const toPoint = {
      x: toNode.x,
      y: toNode.y - LAYOUT_CONFIG.nodeHeight / 2,
    };

    // 直线连接（适用于垂直排列的节点）
    if (totalBranches === 1 && Math.abs(fromPoint.x - toPoint.x) < 20) {
      return [fromPoint, toPoint];
    }

    // 分支连接（适用于并行节点）
    if (totalBranches > 1) {
      const midY = fromPoint.y + (toPoint.y - fromPoint.y) / 2;

      return [
        fromPoint,
        { x: fromPoint.x, y: midY },
        { x: toPoint.x, y: midY },
        toPoint,
      ];
    }

    // 默认直线连接
    return [fromPoint, toPoint];
  }

  public getPositionedNodes(): PositionedNode[] {
    return Array.from(this.positionedNodes.values());
  }

  public getConnections(): Connection[] {
    return this.connections;
  }

  public getBounds() {
    const nodes = this.getPositionedNodes();
    if (nodes.length === 0) {
      return {
        width: 400,
        height: 300,
        offsetX: LAYOUT_CONFIG.margin,
        offsetY: LAYOUT_CONFIG.margin,
      };
    }

    const minX = Math.min(
      ...nodes.map((n) => n.x - LAYOUT_CONFIG.nodeWidth / 2)
    );
    const maxX = Math.max(
      ...nodes.map((n) => n.x + LAYOUT_CONFIG.nodeWidth / 2)
    );
    const minY = Math.min(
      ...nodes.map((n) => n.y - LAYOUT_CONFIG.nodeHeight / 2)
    );
    const maxY = Math.max(
      ...nodes.map((n) => n.y + LAYOUT_CONFIG.nodeHeight / 2)
    );

    const width = maxX - minX + LAYOUT_CONFIG.margin * 2;
    const height = maxY - minY + LAYOUT_CONFIG.margin * 2;
    const offsetX = -minX + LAYOUT_CONFIG.margin;
    const offsetY = -minY + LAYOUT_CONFIG.margin;

    return {
      width: Math.max(width, 300),
      height: Math.max(height, 200),
      offsetX,
      offsetY,
    };
  }
}

// 流程图组件属性
interface FlowchartProps {
  nodes: FlowNode[];
  title?: string;
  className?: string;
}

// 节点样式配置
const getNodeStyle = (type: FlowNode["type"]) => {
  const styles = {
    start: { fill: "#4CAF50", stroke: "#388E3C" },
    process: { fill: "#2196F3", stroke: "#1976D2" },
    decision: { fill: "#FF9800", stroke: "#F57C00" },
    parallel: { fill: "#9C27B0", stroke: "#7B1FA2" },
    merge: { fill: "#607D8B", stroke: "#455A64" },
    end: { fill: "#F44336", stroke: "#D32F2F" },
  };
  return styles[type] || styles.process;
};

// 节点样式接口
interface NodeStyle {
  fill: string;
  stroke: string;
}

// 渲染节点形状
const renderNodeShape = (node: PositionedNode, style: NodeStyle) => {
  const { x, y, type } = node;
  const width = LAYOUT_CONFIG.nodeWidth;
  const height = LAYOUT_CONFIG.nodeHeight;

  switch (type) {
    case "start":
    case "end":
      return (
        <ellipse
          cx={x}
          cy={y}
          rx={width / 2}
          ry={height / 2}
          fill={style.fill}
          stroke={style.stroke}
          strokeWidth={2}
        />
      );

    case "decision": {
      const points = [
        [x, y - height / 2],
        [x + width / 2, y],
        [x, y + height / 2],
        [x - width / 2, y],
      ]
        .map((p) => p.join(","))
        .join(" ");

      return (
        <polygon
          points={points}
          fill={style.fill}
          stroke={style.stroke}
          strokeWidth={2}
        />
      );
    }

    case "parallel":
      return (
        <g>
          <rect
            x={x - width / 2}
            y={y - height / 2}
            width={width}
            height={height}
            fill={style.fill}
            stroke={style.stroke}
            strokeWidth={2}
            rx={5}
          />
          <line
            x1={x - width / 3}
            y1={y - height / 4}
            x2={x + width / 3}
            y2={y - height / 4}
            stroke="white"
            strokeWidth={2}
          />
          <line
            x1={x - width / 3}
            y1={y + height / 4}
            x2={x + width / 3}
            y2={y + height / 4}
            stroke="white"
            strokeWidth={2}
          />
        </g>
      );

    default:
      return (
        <rect
          x={x - width / 2}
          y={y - height / 2}
          width={width}
          height={height}
          fill={style.fill}
          stroke={style.stroke}
          strokeWidth={2}
          rx={5}
        />
      );
  }
};

// 渲染连接线
const renderConnection = (connection: Connection, index: number) => {
  const { points, label } = connection;

  if (points.length < 2) return null;

  // 生成SVG路径
  const pathData =
    `M ${points[0].x} ${points[0].y} ` +
    points
      .slice(1)
      .map((p) => `L ${p.x} ${p.y}`)
      .join(" ");

  const lastPoint = points[points.length - 1];
  const secondLastPoint = points[points.length - 2] || points[0];

  // 计算箭头方向
  const angle = Math.atan2(
    lastPoint.y - secondLastPoint.y,
    lastPoint.x - secondLastPoint.x
  );

  const arrowSize = 8;
  const arrowPoints = [
    lastPoint,
    {
      x: lastPoint.x - arrowSize * Math.cos(angle - Math.PI / 6),
      y: lastPoint.y - arrowSize * Math.sin(angle - Math.PI / 6),
    },
    {
      x: lastPoint.x - arrowSize * Math.cos(angle + Math.PI / 6),
      y: lastPoint.y - arrowSize * Math.sin(angle + Math.PI / 6),
    },
  ];

  // 计算标签位置（路径中点）
  const labelPosition = {
    x: points.length > 2 ? points[1].x : (points[0].x + lastPoint.x) / 2,
    y:
      points.length > 2
        ? points[1].y - 15
        : (points[0].y + lastPoint.y) / 2 - 15,
  };

  return (
    <g key={`${connection.from}-${connection.to}-${index}`}>
      {/* 连接线路径 */}
      <path
        d={pathData}
        stroke="#666"
        strokeWidth={2}
        fill="none"
        opacity={0.8}
      />

      {/* 箭头 */}
      <polygon
        points={arrowPoints.map((p) => `${p.x},${p.y}`).join(" ")}
        fill="#666"
        opacity={0.8}
      />

      {/* 条件标签 */}
      {label && (
        <g>
          <rect
            x={labelPosition.x - label.length * 3}
            y={labelPosition.y - 8}
            width={label.length * 6}
            height={16}
            fill="white"
            stroke="#ddd"
            strokeWidth={1}
            rx={3}
            opacity={0.9}
          />
          <text
            x={labelPosition.x}
            y={labelPosition.y + 2}
            textAnchor="middle"
            fontSize="11"
            fill="#666"
            fontWeight="500"
          >
            {label}
          </text>
        </g>
      )}
    </g>
  );
};

// 主流程图组件
const Flowchart: React.FC<FlowchartProps> = ({ nodes, title, className }) => {
  const layout = useMemo(() => new FlowLayoutEngine(nodes), [nodes]);
  const positionedNodes = useMemo(() => layout.getPositionedNodes(), [layout]);
  const connections = useMemo(() => layout.getConnections(), [layout]);
  const bounds = useMemo(() => layout.getBounds(), [layout]);

  return (
    <div className={className}>
      {title && (
        <h3 style={{ textAlign: "center", marginBottom: "20px" }}>{title}</h3>
      )}
      <svg
        width={bounds.width}
        height={bounds.height}
        style={{ border: "1px solid #ddd", backgroundColor: "#fafafa" }}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
          </marker>
        </defs>

        <g transform={`translate(${bounds.offsetX}, ${bounds.offsetY})`}>
          {/* 渲染连接线 */}
          {connections.map((connection, index) =>
            renderConnection(connection, index)
          )}

          {/* 渲染节点 */}
          {positionedNodes.map((node) => {
            const style = getNodeStyle(node.type);
            return (
              <g key={node.id}>
                {renderNodeShape(node, style)}
                <text
                  x={node.x}
                  y={node.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="12"
                  fill="white"
                  fontWeight="bold"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};

// 示例数据
const exampleFlowData: FlowNode[] = [
  {
    id: "start",
    type: "start",
    label: "开始",
    next: "input",
  },
  {
    id: "input",
    type: "process",
    label: "输入数据",
    next: "validate",
  },
  {
    id: "validate",
    type: "decision",
    label: "数据验证",
    next: ["process1", "process2"],
    conditions: {
      process1: "验证通过",
      process2: "验证失败",
    },
  },
  {
    id: "process1",
    type: "parallel",
    label: "并行处理A",
    next: ["task1", "task2"],
  },
  {
    id: "task1",
    type: "process",
    label: "任务1",
    next: "merge",
  },
  {
    id: "task2",
    type: "process",
    label: "任务2",
    next: "merge",
  },
  {
    id: "process2",
    type: "process",
    label: "错误处理",
    next: "end",
  },
  {
    id: "merge",
    type: "merge",
    label: "合并结果",
    next: "output",
  },
  {
    id: "output",
    type: "process",
    label: "输出结果",
    next: "end",
  },
  {
    id: "end",
    type: "end",
    label: "结束",
  },
];

// 示例组件
const FlowDemo: React.FC = () => {
  // 复杂的软件发布流程示例（修复布局问题）
  const softwareReleaseFlow: FlowNode[] = [
    {
      id: "start",
      type: "start",
      label: "开始发布",
      next: "code-review",
    },
    {
      id: "code-review",
      type: "process",
      label: "代码审查",
      next: "build-decision",
    },
    {
      id: "build-decision",
      type: "decision",
      label: "审查通过？",
      next: ["build-test", "fix-code"],
      conditions: {
        "build-test": "通过",
        "fix-code": "不通过",
      },
    },
    {
      id: "fix-code",
      type: "process",
      label: "修复代码",
      next: "code-review",
    },
    {
      id: "build-test",
      type: "parallel",
      label: "并行构建测试",
      next: ["unit-test", "integration-test"],
    },
    {
      id: "unit-test",
      type: "process",
      label: "单元测试",
      next: "test-merge",
    },
    {
      id: "integration-test",
      type: "process",
      label: "集成测试",
      next: "test-merge",
    },
    {
      id: "test-merge",
      type: "merge",
      label: "测试结果汇总",
      next: "deploy-decision",
    },
    {
      id: "deploy-decision",
      type: "decision",
      label: "测试通过？",
      next: ["production-deploy", "rollback"],
      conditions: {
        "production-deploy": "通过",
        rollback: "失败",
      },
    },
    {
      id: "rollback",
      type: "process",
      label: "回滚版本",
      next: "end-fail",
    },
    {
      id: "production-deploy",
      type: "process",
      label: "生产环境部署",
      next: "end-success",
    },
    {
      id: "end-success",
      type: "end",
      label: "发布成功",
    },
    {
      id: "end-fail",
      type: "end",
      label: "发布失败",
    },
  ];

  // 简单的电商订单处理流程
  const orderProcessFlow: FlowNode[] = [
    {
      id: "start",
      type: "start",
      label: "订单创建",
      next: "payment",
    },
    {
      id: "payment",
      type: "decision",
      label: "支付验证",
      next: ["inventory-check", "payment-fail"],
      conditions: {
        "inventory-check": "支付成功",
        "payment-fail": "支付失败",
      },
    },
    {
      id: "payment-fail",
      type: "process",
      label: "支付失败处理",
      next: "end-cancel",
    },
    {
      id: "inventory-check",
      type: "decision",
      label: "库存检查",
      next: ["process-order", "out-of-stock"],
      conditions: {
        "process-order": "库存充足",
        "out-of-stock": "库存不足",
      },
    },
    {
      id: "out-of-stock",
      type: "process",
      label: "缺货处理",
      next: "end-cancel",
    },
    {
      id: "process-order",
      type: "parallel",
      label: "订单处理",
      next: ["prepare-item", "send-notification"],
    },
    {
      id: "prepare-item",
      type: "process",
      label: "商品准备",
      next: "shipping",
    },
    {
      id: "send-notification",
      type: "process",
      label: "发送通知",
      next: "shipping-merge",
    },
    {
      id: "shipping",
      type: "process",
      label: "发货",
      next: "shipping-merge",
    },
    {
      id: "shipping-merge",
      type: "merge",
      label: "发货完成",
      next: "end-success",
    },
    {
      id: "end-success",
      type: "end",
      label: "订单完成",
    },
    {
      id: "end-cancel",
      type: "end",
      label: "订单取消",
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <Flowchart
        nodes={exampleFlowData}
        title="数据处理流程图（支持串行和并行）"
        className="flow-demo"
      />

      <div style={{ marginTop: "40px" }}>
        <Flowchart
          nodes={softwareReleaseFlow}
          title="软件发布流程图（复杂分支与并行）"
          className="flow-demo"
        />
      </div>

      <div style={{ marginTop: "40px" }}>
        <Flowchart
          nodes={orderProcessFlow}
          title="电商订单处理流程图（决策分支）"
          className="flow-demo"
        />
      </div>

      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          backgroundColor: "#f5f5f5",
          borderRadius: "8px",
        }}
      >
        <h4>🔥 流程图特性说明：</h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "15px",
            marginTop: "10px",
          }}
        >
          <div
            style={{
              padding: "10px",
              backgroundColor: "white",
              borderRadius: "5px",
              border: "1px solid #e1e1e1",
            }}
          >
            <h5 style={{ color: "#4CAF50", margin: "0 0 8px 0" }}>
              🎯 节点类型
            </h5>
            <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "13px" }}>
              <li>
                <strong>开始/结束</strong>：椭圆形节点
              </li>
              <li>
                <strong>处理过程</strong>：矩形节点
              </li>
              <li>
                <strong>决策判断</strong>：菱形节点
              </li>
              <li>
                <strong>并行处理</strong>：带线条标记
              </li>
              <li>
                <strong>汇合节点</strong>：灰色矩形
              </li>
            </ul>
          </div>

          <div
            style={{
              padding: "10px",
              backgroundColor: "white",
              borderRadius: "5px",
              border: "1px solid #e1e1e1",
            }}
          >
            <h5 style={{ color: "#2196F3", margin: "0 0 8px 0" }}>
              ⚡ 并行特性
            </h5>
            <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "13px" }}>
              <li>
                <strong>并行分支</strong>：同时执行多个任务
              </li>
              <li>
                <strong>自动布局</strong>：智能计算节点位置
              </li>
              <li>
                <strong>连接路径</strong>：优化的连接线绘制
              </li>
              <li>
                <strong>汇合机制</strong>：并行任务结果汇总
              </li>
            </ul>
          </div>

          <div
            style={{
              padding: "10px",
              backgroundColor: "white",
              borderRadius: "5px",
              border: "1px solid #e1e1e1",
            }}
          >
            <h5 style={{ color: "#FF9800", margin: "0 0 8px 0" }}>
              🎨 视觉设计
            </h5>
            <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "13px" }}>
              <li>
                <strong>颜色编码</strong>：不同类型不同颜色
              </li>
              <li>
                <strong>SVG渲染</strong>：高清缩放无损失
              </li>
              <li>
                <strong>条件标签</strong>：决策分支显示条件
              </li>
              <li>
                <strong>箭头指向</strong>：清晰的流向指示
              </li>
            </ul>
          </div>
        </div>

        <div
          style={{
            marginTop: "15px",
            padding: "10px",
            backgroundColor: "#e3f2fd",
            borderRadius: "5px",
            border: "1px solid #2196F3",
          }}
        >
          <h5 style={{ color: "#1976D2", margin: "0 0 8px 0" }}>💡 使用场景</h5>
          <p style={{ margin: 0, fontSize: "13px", lineHeight: "1.5" }}>
            <strong>业务流程图</strong>、<strong>系统架构图</strong>、
            <strong>数据处理流程</strong>、<strong>审批工作流</strong>、
            <strong>CI/CD流水线</strong>、<strong>测试流程</strong>、
            <strong>订单处理</strong>、<strong>用户注册流程</strong>等
          </p>
        </div>
      </div>
    </div>
  );
};

export default FlowDemo;
export { Flowchart, type FlowNode };
