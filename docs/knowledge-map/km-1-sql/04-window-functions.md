# 窗口函数

> 窗口函数（Window Functions）是 SQL 进阶的核心内容，也是数据分析面试中最高频的考点。它在不改变行数的情况下进行跨行计算，功能远超普通聚合。

## 概述

窗口函数在 **不折叠行** 的前提下，对查询结果的每一行计算一个窗口范围内的值。基本语法格式为：

```sql
<窗口函数>() OVER (
  [PARTITION BY 列, ...]    -- 分区（可选，相当于 GROUP BY 但不折叠）
  [ORDER BY 列, ...]        -- 排序（可选，定义窗口内顺序）
  [ROWS/RANGE BETWEEN ...]  -- 窗口帧（可选，指定计算范围）
)
```

## 排名窗口函数（Ranking Functions）

### ROW_NUMBER / RANK / DENSE_RANK

三个函数的区别在于处理并列值的方式：

```sql
SELECT product_id, category, revenue,
       ROW_NUMBER() OVER (PARTITION BY category ORDER BY revenue DESC) AS rn,
       RANK()       OVER (PARTITION BY category ORDER BY revenue DESC) AS rk,
       DENSE_RANK() OVER (PARTITION BY category ORDER BY revenue DESC) AS dr
FROM product_sales;
```

| 函数 | 并列处理 | 下一个排名 | 示例（值 100, 90, 90, 80） |
|------|---------|-----------|---------------------------|
| ROW_NUMBER | 相同值随机分配不同排名 | 连续 | 1, 2, 3, 4 |
| RANK | 相同值共享排名 | 跳过 | 1, 2, 2, 4 |
| DENSE_RANK | 相同值共享排名 | 连续 | 1, 2, 2, 3 |

### NTILE

将分区内的行均匀分配到 N 个桶中，用于等频分箱：

```sql
-- 将用户按消费金额分成 4 组
SELECT user_id, total_spent,
       NTILE(4) OVER (ORDER BY total_spent DESC) AS quartile,
       NTILE(10) OVER (ORDER BY total_spent DESC) AS decile
FROM user_stats;
```

## 偏移窗口函数（Offset Functions）

### LAG 与 LEAD

访问当前行之前或之后的行的值：

```sql
SELECT date, revenue,
       LAG(revenue, 1)  OVER (ORDER BY date) AS prev_day,
       LAG(revenue, 7)  OVER (ORDER BY date) AS prev_week,
       LEAD(revenue, 1) OVER (ORDER BY date) AS next_day
FROM daily_revenue;
```

典型应用——环比计算：

```sql
SELECT date, revenue,
       LAG(revenue, 1) OVER (ORDER BY date) AS prev_day,
       ROUND(
         (revenue - LAG(revenue, 1) OVER (ORDER BY date))
         / NULLIF(LAG(revenue, 1) OVER (ORDER BY date), 0) * 100,
         2
       ) AS day_over_day_pct
FROM daily_revenue;
```

### FIRST_VALUE 与 LAST_VALUE

```sql
-- 每个用户首次和末次购买金额
SELECT user_id, order_date, amount,
       FIRST_VALUE(amount) OVER (
         PARTITION BY user_id ORDER BY order_date
       ) AS first_purchase,
       FIRST_VALUE(amount) OVER (
         PARTITION BY user_id ORDER BY order_date DESC
       ) AS last_purchase
FROM orders;
```

## 聚合窗口函数（Aggregate Window Functions）

将普通聚合函数与 OVER 结合，在不折叠行的同时显示聚合结果：

```sql
SELECT date, revenue,
       SUM(revenue)           OVER (ORDER BY date)          AS running_total,    -- 累计求和
       SUM(revenue)           OVER ()                      AS total_revenue,    -- 全局总和（每行相同）
       AVG(revenue)           OVER (ORDER BY date ROWS 6 PRECEDING) AS ma_7d,   -- 7 日滑动平均
       MAX(revenue)           OVER (ORDER BY date ROWS 30 PRECEDING) AS max_30d -- 30 日最高
FROM daily_revenue;
```

## 窗口帧（Frame Specification）

窗口帧定义了在分区和排序的基础上，计算范围的具体行数。不指定帧时默认行为因函数而异：

- 有 `ORDER BY` 的聚合窗口：默认从分区第一行到当前行
- 无 `ORDER BY` 的聚合窗口：默认整个分区
- 排名/偏移函数：不能指定帧

### ROWS vs RANGE vs GROUPS

```sql
-- ROWS：按行数计算（精确）
SUM(revenue) OVER (
  ORDER BY date
  ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
) AS ma_7d_rows;

-- RANGE：按值计算（相同值的行视为一组，通常用于日期）
SUM(revenue) OVER (
  ORDER BY date
  RANGE BETWEEN INTERVAL '30' DAY PRECEDING AND CURRENT ROW
) AS trailing_30d;

-- GROUPS：按分组计算
SUM(revenue) OVER (
  ORDER BY date
  GROUPS BETWEEN 1 PRECEDING AND 1 FOLLOWING
) AS group_avg;
```

### 帧边界选项

| 边界 | 含义 |
|------|------|
| `UNBOUNDED PRECEDING` | 分区第一行 |
| `N PRECEDING` | 前 N 行 |
| `CURRENT ROW` | 当前行 |
| `N FOLLOWING` | 后 N 行 |
| `UNBOUNDED FOLLOWING` | 分区最后一行 |

## 窗口函数的典型应用

### Top-N per Group（分组 Top N）

```sql
WITH ranked AS (
  SELECT category, product_id, revenue,
         ROW_NUMBER() OVER (PARTITION BY category ORDER BY revenue DESC) AS rn
  FROM product_sales
)
SELECT *
FROM ranked
WHERE rn <= 3;  -- 每组取前 3
```

### 同比与环比

```sql
SELECT date, revenue,
       -- 环比：与上一周期比
       LAG(revenue, 1) OVER (ORDER BY date) AS prev_period,
       revenue - LAG(revenue, 1) OVER (ORDER BY date) AS change,
       -- 同比：与上年同周期比
       LAG(revenue, 365) OVER (ORDER BY date) AS prev_year,
       revenue / NULLIF(LAG(revenue, 365) OVER (ORDER BY date), 0) - 1 AS yoy_growth
FROM daily_revenue;
```

### 累计百分比（Running Percentage）

```sql
SELECT product_id, revenue,
       SUM(revenue) OVER (ORDER BY revenue DESC) / SUM(revenue) OVER () AS cumulative_pct
FROM product_sales
ORDER BY revenue DESC;
```

## 窗口函数 vs 子查询

| 场景 | 窗口函数 | 子查询 |
|------|---------|--------|
| 分组内排名 | 一行代码 | 需要自关联或相关子查询 |
| 同组前一行的值 | LAG 一行 | 需要自关联，条件繁琐 |
| 累计值 | SUM OVER | 需要自关联 JOIN，大表性能差 |
| 不改变行数的计算 | 自然支持 | 需要额外 JOIN |

## 常见陷阱

```sql
-- 1. 聚合窗口函数的默认帧
-- 以下两个看似等价，实际不同
SUM(revenue) OVER (ORDER BY date)               -- 默认 RANGE UNBOUNDED PRECEDING AND CURRENT ROW
SUM(revenue) OVER (ORDER BY date ROWS UNBOUNDED PRECEDING)  -- 注意：RANGE（默认）和 ROWS 在有平局值时结果可能不同

-- 2. PARTITION BY 与 ORDER BY 的顺序
-- PARTITION BY 必须在 ORDER BY 之前
ROW_NUMBER() OVER (ORDER BY date PARTITION BY category)  -- 语法错误

-- 3. 窗口函数不能出现在 WHERE 中
-- 需要先 CTE 或子查询
SELECT * FROM (
  SELECT *, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) AS rn
  FROM orders
) t
WHERE rn = 1;
```

## 相关文章

- [基础查询与聚合](/knowledge-map/km-1-sql/01-basic-queries) — 窗口函数的基础
- [子查询与 CTE](/knowledge-map/km-1-sql/03-subqueries-cte) — 窗口函数经常和 CTE 配合使用
- [实战场景](/knowledge-map/km-1-sql/08-scenarios) — 留存、RFM 等场景中的窗口函数应用
