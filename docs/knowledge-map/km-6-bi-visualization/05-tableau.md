# Tableau 实战

> Tableau 是当前市场占有率最高的 BI 工具之一，以其**拖拽式交互**和**强大的可视化能力**著称。本节覆盖从数据连接到高级 LOD 表达式的核心实战技能。

## 数据连接（Data Connection）

### 连接类型

| 连接方式 | 适用场景 | 性能特点 |
|---------|---------|---------|
| **Live（实时连接）** | 数据实时更新、小数据量 | 查询实时发送到源数据库 |
| **Extract（数据提取）** | 大数据量、需要加速 | 提取到 Tableau 自己的列式存储（.hyper），支持增量刷新 |
| **Published Data Source** | 团队共享数据源 | 发布到 Tableau Server，统一数据口径 |

### 数据源连接要点

- **双轴（Dual Axis）** vs **混合连接（Data Blending）**：双轴在同一数据源级别操作，混和连接在不同粒度间连接（类似 LEFT JOIN）
- **数据解释器（Data Interpreter）**：自动识别和清理 Excel/PDF 中的杂项表头
- **Union（纵向合并）与 Join（横向连接）**：Union 用于多张结构相同的表，Join 用于关联表

::: tip 连接策略
对于 **亿级以上的数据**，优先考虑 Extract + 增量刷新，而不是 Live 连接。Tableau Server 上可以设置提取刷新调度（建议在业务低峰期执行）。
:::

## 计算字段（Calculated Fields）

### 常用函数分类

```text
-- 逻辑函数
IF [Sales] > 1000 THEN "High" ELSE "Low" END
CASE [Region] WHEN "East" THEN "E" ELSE "O" END
IIF([Profit] > 0, "Profitable", "Loss")

-- 聚合函数
SUM([Sales])
AVG([Discount])
COUNTD([Customer ID])
MEDIAN([Price])

-- 表计算函数 -- 见下一节
-- LOD 表达式 -- 见下下节

-- 日期函数
DATETRUNC('month', [Order Date])
DATEDIFF('day', [Order Date], [Ship Date])
DATEADD('year', 1, [Order Date])

-- 字符串函数
LEFT([Customer Name], 3)
CONTAINS([Product Name], "iPhone")
REPLACE([Category], "Tech", "Technology")
```

### 字段类型

Tableau 中的字段分为三类：

1. **Dimensions（维度）** — 离散的、分类的（蓝色药丸）
2. **Measures（度量）** — 连续的、数值的（绿色药丸）
3. **Parameters（参数）** — 用户可控制的值（详见参数节）

## 表计算（Table Calculations）

表计算是对**查询结果**的二次计算，不是对底层数据的计算。这是 Tableau 最强大但也最容易让新手困惑的特性。

### 核心概念：分区（Partitioning）与寻址（Addressing）

```text
分区（Partition）-- 计算"对谁分组"，类似于 SQL 的 PARTITION BY
寻址（Addressing）-- 计算"往哪个方向"，决定排序方向

例：RUNNING_SUM(SUM([Sales]))
  分区 = 空（整个表）
  寻址 = 按日期升序
  结果 = 累计销售额
```

### 常用表计算

| 函数 | 作用 | 示例 |
|------|------|------|
| `RUNNING_SUM` | 累计求和 | 累计营收 |
| `WINDOW_SUM` | 窗口求和 | 过去 7 天移动和 |
| `TOTAL` | 分区总和 | 每个区域占总体的占比 |
| `PREVIOUS_VALUE` | 上一个值 | 环比计算 |
| `RANK` | 排名 | 销售排名 |
| `PERCENTILE` | 百分位 | 第 90 分位数 |
| `INDEX` | 位置索引 | 辅助排序 |
| `FIRST()` / `LAST()` | 到第一个/最后一个的距离 | 辅助计算 |

```text
快速表计算（Quick Table Calculation）：右键度量 → 快速表计算
可以快速实现：运行总和、差异、百分比差异、总计百分比、排名、百分位、移动平均
```

## LOD 表达式（Level of Detail Expressions）

LOD 表达式允许你**在不同于视图粒度的层级上进行计算**，是 Tableau 最强大的高级功能。

### 三种 LOD 类型

```text
FIXED:   在指定维度级别计算，不受视图筛选影响
INCLUDE: 在视图维度基础上增加维度进行计算
EXCLUDE: 从视图维度中移除指定维度进行计算
```

### 实战案例

```text
-- 客户首单日期（FIXED）
{FIXED [Customer ID] : MIN([Order Date])}

-- 每个客户的总消费（FIXED）
{FIXED [Customer ID] : SUM([Sales])}

-- 每个产品类别中的销售排名（INCLUDE）
{INCLUDE [Category] : RANK(SUM([Sales]))}

-- 从视图维度中排除日期，获取总销售额（EXCLUDE）
{EXCLUDE [Order Date] : SUM([Sales])}

-- 客户级平均消费（FIXED + AVG 嵌套）
AVG({FIXED [Customer ID] : SUM([Sales])})
```

::: warning LOD 性能注意
LOD 表达式在数据源级别执行，复杂嵌套 LOD 会影响查询性能。建议在 Extract 模式下测试后再发布到 Server。
:::

## 参数（Parameters）

参数让用户可以通过控件（下拉框、滑块）动态改变计算或筛选条件。

### 常用场景

- 动态 Top N：`RANK(SUM([Sales])) <= [Top N Parameter]`
- 动态参考线：显示用户输入的目标值
- 动态切换度量：用一个参数控制展示销售额/利润/数量
- 日期范围选择

```text
参数创建示例：
  名称: [Top N]
  数据类型: Integer
  允许值: Range (1 to 50, step 1)
  显示格式: # 名

应用方式：
  创建计算字段 [Top N Filter]:
    RANK(SUM([Sales])) <= [Top N]
  将此字段拖到筛选器，选择 True
```

## 集与动作（Sets & Actions）

### 集（Sets）

集合是数据的一个子集，基于条件或手动选择创建：

- **条件集**：`Top 10 Customers by Sales` → `TOP_N(SUM([Sales]), 10)`
- **组合集**：两个集合的并集/交集/差集

### 动作（Actions）

Tableau 支持三种动作类型：

| 动作类型 | 触发方式 | 作用 |
|---------|---------|------|
| **筛选动作（Filter Action）** | 悬停/选择/双击 | 点击一个图表，筛选其他视图 |
| **高亮动作（Highlight Action）** | 悬停 | 悬停时高亮同类数据 |
| **URL 动作（URL Action）** | 点击 | 跳转到外部链接 |
| **参数动作（Parameter Action）** | 点击 | 用点击值更新参数 |

**实践建议**：在 Dashboard 层面配置交叉筛选时，使用"选择"而非"悬停"作为触发条件，避免误触干扰。

## Dashboard 交互性

- **浮动容器（Floating Containers）**：实现覆盖、弹窗效果
- **工具提示（Tooltip）**：在 Tooltip 中嵌入视图（图表中的图表）
- **导航按钮（Navigation Button）**：实现多页面跳转
- **突出显示表（Highlight Table）**：在明细表上实现热力图效果
- **自定义形状（Custom Shapes）**：用图标替代默认圆形

## 性能优化要点

| 问题 | 诊断方法 | 解决方案 |
|------|---------|---------|
| 查询慢 | 帮助 → 设置和性能 → 启动性能记录 | 使用 Extract、减少 LOD 嵌套、优化数据源索引 |
| Dashboard 加载慢 | 性能记录中查看各个视图的加载时间 | 减少 Dashboard 中的工作表数量、使用显示/隐藏容器 |
| 渲染慢 | 检查标记卡中的元素数量 | 减少数据点（聚合采样）、关闭不必要的标记叠加 |
| 交互卡顿 | 检查动作和计算复杂度 | 简化跨 Dashboard 筛选、减少实时计算 |

```text
性能检查清单：
  ☐ 使用 Extract 而非 Live 连接（大数据量）
  ☐ 减少 Dashboard 上的工作表数量（≤ 6 个）
  ☐ 避免在 Dashboard 中使用 LOD 表达式的交叉计算
  ☐ 数据聚合在数据库层完成（不要在 Tableau 中做 ETL）
  ☐ 关闭不必要的数据源筛选器
  ☐ 使用"保留隐藏工作表"功能减少冗余计算
```

## 相关文章

- [Power BI 实战](/knowledge-map/km-6-bi-visualization/06-powerbi) — 对比 Tableau 与 Power BI 的功能差异
- [开源方案](/knowledge-map/km-6-bi-visualization/07-open-source) — Metabase 和 Superset 的开源替代方案
