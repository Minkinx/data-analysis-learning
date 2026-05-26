# Power BI 实战

> Power BI 是微软生态中的核心 BI 工具，以**DAX 语言**和**与 Office 365 深度集成**为突出优势。本节聚焦 DAX 核心函数、Power Query 数据处理和 Power BI 服务架构。

## DAX 核心函数

DAX（Data Analysis Expressions）是 Power BI 和 Excel Power Pivot 的公式语言。理解 **筛选上下文（Filter Context）** 与 **行上下文（Row Context）** 的区别是掌握 DAX 的关键。

### 上下文基础

```text
行上下文（Row Context）：迭代计算时"当前行"的上下文
  - 产生于：CALCULATE 的迭代器、AddColumn、Summarize
  - 类比：Excel 公式逐行计算

筛选上下文（Filter Context）：当前生效的筛选条件
  - 产生于：报表切片器、行/列标签、FILTER 函数
  - 类比：SQL WHERE 子句正在生效

核心规则：
  - 行上下文不会自动传递到其他表
  - 筛选上下文可以跨越关系传递（单向/双向交叉筛选）
```

### 核心函数详解

#### CALCULATE — DAX 的灵魂

```dax
-- CALCULATE 修改筛选上下文，是最重要的 DAX 函数
CALCULATE(
    <表达式>,           -- 要计算的聚合表达式
    <筛选条件1>,        -- 修改筛选上下文的条件
    <筛选条件2>,
    ...
)

-- 示例：2025 年华东区销售额
CALCULATE(
    SUM(Sales[Amount]),
    Sales[Year] = 2025,
    Sales[Region] = "华东"
)

-- 示例：去年同期的销售额（时间智能）
CALCULATE(
    SUM(Sales[Amount]),
    SAMEPERIODLASTYEAR('Calendar'[Date])
)
```

#### FILTER — 逐行筛选

```dax
-- FILTER 返回一个表，逐行检查条件
FILTER(
    <表>,
    <条件>
)

-- 示例：销售额大于 10000 的订单的客户数
CALCULATE(
    DISTINCTCOUNT(Sales[CustomerID]),
    FILTER(Sales, Sales[Amount] > 10000)
)
```

::: warning
FILTER 是行上下文迭代器，在大表上使用时性能开销大。能用 CALCULATE 的简单筛选条件时，尽量用简单条件替代 FILTER。
:::

#### ALL / ALLEXCEPT / ALLSELECTED

```dax
-- ALL：清除所有筛选
ALL('Calendar'[Year])       -- 清除年份筛选
ALL(Sales)                  -- 清除 Sales 表上的所有筛选

-- ALLEXCEPT：只保留指定维度的筛选
ALLEXCEPT('Calendar', 'Calendar'[Year])  -- 只保留年份筛选

-- ALLSELECTED：保留外部筛选（如切片器选择）
ALLSELECTED('Calendar'[Year])

-- 示例：占总体的百分比
DIVIDE(
    SUM(Sales[Amount]),
    CALCULATE(SUM(Sales[Amount]), ALL(Products))
)
```

#### SUMX / AVERAGEX — 行上下文迭代器

```dax
-- X 结尾的函数是迭代器（Iterator），逐行计算后聚合
SUMX(
    <表>,
    <逐行表达式>
)

-- 示例：计算每个订单的利润（单价 - 成本）× 数量
SUMX(
    Sales,
    (Sales[UnitPrice] - Sales[UnitCost]) * Sales[Quantity]
)

-- 等价于（但更高效的单表）：
SUMX(
    Sales,
    Sales[Amount] - Sales[Cost]
)
```

#### 其他常用函数

```dax
-- 时间智能
TOTALYTD(SUM(Sales[Amount]), 'Calendar'[Date])
PREVIOUSMONTH(SUM(Sales[Amount]))
DATEADD('Calendar'[Date], -1, YEAR)

-- 关系函数
RELATED(Products[Category])        -- 多端找一端
RELATEDTABLE(Sales)                 -- 一端找多端

-- 逻辑与条件
IF(Sales[Amount] > 1000, "High", "Low")
SWITCH(Sales[Category], "A", 1.5, "B", 1.2, 1.0)
COALESCE(Sales[Discount], 0)        -- NULL 替换

-- 统计函数
DISTINCTCOUNT(Sales[CustomerID])
RANKX(ALL(Products), SUMX(Sales, Sales[Amount]))
TOPN(10, Products, SUMX(Sales, Sales[Amount]))
```

### 常用度量值模式

```dax
-- 累计（Running Total）
Cumulative Sales :=
CALCULATE(
    SUM(Sales[Amount]),
    FILTER(
        ALL('Calendar'),
        'Calendar'[Date] <= MAX('Calendar'[Date])
    )
)

-- 同比增长（YoY Growth %）
Sales YoY % :=
VAR CurrentYear = SUM(Sales[Amount])
VAR LastYear = CALCULATE(
    SUM(Sales[Amount]),
    SAMEPERIODLASTYEAR('Calendar'[Date])
)
RETURN
    DIVIDE(CurrentYear - LastYear, LastYear, 0)

-- 移动平均（Moving Average 7 Days）
Sales MA7 :=
CALCULATE(
    AVERAGEX(
        FILTER(
            ALL('Calendar'),
            'Calendar'[Date] > MAX('Calendar'[Date]) - 7
            && 'Calendar'[Date] <= MAX('Calendar'[Date])
        ),
        [Total Sales]
    )
)
```

## Power Query（M 语言）

Power Query 是 Power BI 的**数据获取与转换**引擎，使用 M 语言。所有数据加载前的清洗工作都在这里完成。

### M 语言基础语法

```powerquery
let
    // 数据源
    源 = Excel.Workbook(File.Contents("C:\data.xlsx"), null, true),
    
    // 选择表
    表1 = 源{[Name="Sheet1"]}[Data],
    
    // 提升标题行
    提升标题 = Table.PromoteHeaders(表1, [PromoteAllScalars=true]),
    
    // 筛选列
    选择列 = Table.SelectColumns(提升标题, {"订单ID", "金额", "日期"}),
    
    // 筛选行
    筛选行 = Table.SelectRows(选择列, each [金额] > 0),
    
    // 添加计算列
    添加月份 = Table.AddColumn(筛选行, "月份", each Date.Month([日期])),
    
    // 分组聚合
    分组 = Table.Group(添加月份, {"月份"}, {
        {"总金额", each List.Sum([金额]), type number}
    }),
    
    // 排序
    排序 = Table.Sort(分组, {{"月份", Order.Ascending}})
in
    排序
```

### 常用 M 函数

| 函数 | 作用 |
|------|------|
| `Table.SelectRows` | 按条件筛选行 |
| `Table.SelectColumns` | 选择/删除列 |
| `Table.AddColumn` | 添加自定义列 |
| `Table.Group` | 分组聚合 |
| `Table.Combine` | 纵向合并表 |
| `Table.NestedJoin` | 连接两张表 |
| `Text.Split` | 字符串分割 |
| `Date.Year` / `Date.Month` | 日期提取 |
| `List.Sum` / `List.Average` | 列表聚合 |

### Power Query 最佳实践

- **拆分步骤**：每个转换操作作为一步，便于调试和复用
- **减少加载数据量**：在 Power Query 中尽早筛选不需要的行和列
- **使用参数**：用参数管理动态数据源路径和筛选条件
- **避免整表刷新**：对大型数据源使用增量刷新（通过查询折叠实现）

::: tip Query Folding（查询折叠）
Power Query 会尽可能将 M 语言的转换步骤翻译为 SQL 下推到数据库执行，这个过程称为 Query Folding。查询折叠可以大幅提升性能。可以通过右键步骤 → "查看本机查询"来确认是否已折叠。
:::

## 行级安全性（Row-Level Security）

RLS 允许不同用户查看不同的数据，适用于多租户或多区域的数据分享场景。

```dax
// 角色定义示例：区域销售经理只能看自己区域的数据
// 创建角色 "区域经理"，添加筛选条件：
[Region] = USERPRINCIPALNAME()
// 或者用 RLS 函数：
[Region] = LOOKUPVALUE(UserRegion[Region], UserRegion[Email], USERPRINCIPALNAME())
```

**部署流程**：
1. 在 Power BI Desktop 中：建模 → 管理角色 → 创建角色 + DAX 筛选器
2. 发布到 Power BI Service
3. 在数据集设置中：安全性 → 将用户分配到角色
4. 使用 `USERPRINCIPALNAME()` 或 `USERNAME()` 进行动态 RLS

## 模型视图 vs 报表视图

### 模型视图（Model View）

模型视图是 Power BI 最强大的部分，定义了表之间的关系和度量值的位置：

- **关系设置**：一对多、一对一、多对多，以及筛选器方向（单向/双向）
- **度量值管理**：所有 DAX 度量值集中管理（最佳实践：在单独的"度量值表"中组织）
- **角色扮演维度**：同一张维度表多次关联（如订单日期和发货日期）

### 模型设计原则

```text
✓ 星型模型（Star Schema）—— 推荐
  事实表在中心，维度表以辐射状连接
  Power BI 的 VertiPaq 引擎对星型模型查询性能最佳

✗ 单张大宽表（Flat Table）—— 不推荐
  虽然建表简单，但会导致：
    - VertiPaq 压缩效率低
    - DAX 计算复杂度增加
    - 行级安全性难以实现

✓ 对单向筛选（Single Direction Filter）—— 默认
  默认使用单向筛选，性能最佳

✗ 双向交叉筛选（Bi-Directional）—— 谨慎使用
  除非必要，避免双向筛选（可能导致查询歧义和性能下降）
```

### 报表视图（Report View）

报表视图用于可视化布局：

- **书签（Bookmarks）**：保存页面状态，实现导航和条件展示
- **钻取功能（Drill-Through）**：从概览页面钻取到详情页面
- **工具提示页（Tooltip Pages）**：自定义悬停提示内容
- **自定义视觉对象（Custom Visuals）**：AppSource 或外部导入

## 网关（Gateway）

Power BI Gateway 是连接 Power BI Service 与本地数据源的桥梁：

| 网关类型 | 适用场景 | 部署要点 |
|---------|---------|---------|
| **个人模式（Personal）** | 个人单机使用 | 只能本机使用，不支持共享 |
| **标准模式（Standard / On-premises）** | 团队/企业共享 | 支持集群部署、负载均衡、高可用 |

**部署注意事项**：
- 网关需要安装在**能同时访问数据源和互联网**的机器上
- 定期更新网关软件（微软每月更新）
- 监控网关日志（默认路径：`C:\Program Files\On-premises data gateway\Logs`）
- 使用服务账号运行网关，避免个人密码过期导致连接中断

## 相关文章

- [Tableau 实战](/knowledge-map/km-6-bi-visualization/05-tableau) — Tableau 与 Power BI 的功能对比
- [开源方案](/knowledge-map/km-6-bi-visualization/07-open-source) — Metabase 和 Superset 的开源替代方案
