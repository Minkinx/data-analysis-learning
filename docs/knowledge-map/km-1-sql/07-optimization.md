# 查询优化

> SQL 写得好不好，差的不只是可读性——一个坏查询能把数据库 CPU 打满，一个好查询在同等数据量下只需几毫秒。本节从执行计划出发，系统整理索引策略、分区设计和反模式识别。

## 概述

查询优化（Query Optimization）的目标是 **用最少的资源在最短时间内返回正确结果**。优化的前提是理解数据库执行计划，而不是凭感觉加索引。

## EXPLAIN 执行计划

### 基础用法

```sql
EXPLAIN SELECT * FROM orders WHERE status = 'paid';
EXPLAIN ANALYZE SELECT * FROM orders WHERE status = 'paid';
-- EXPLAIN ANALYZE 会真正执行查询并返回实际耗时
```

### 关键指标

| 指标 | 说明 | 好/坏信号 |
|------|------|-----------|
| `type` | 访问方式 | `const` > `ref` > `range` > `index` > `ALL`（全表扫描） |
| `rows` | 预计扫描行数 | 越小越好 |
| `Extra` | 额外信息 | `Using index` 好；`Using filesort` / `Using temporary` 需要注意 |
| `filtered` | 过滤后保留比例 | 越高越好 |

```sql
-- 全表扫描（坏）
-> Seq Scan on orders  (cost=0.00..1000.00 rows=50000 width=100)

-- 索引扫描（好）
-> Index Scan using idx_orders_status on orders  (cost=0.29..150.00 rows=8000 width=100)
```

## 索引策略（Index Strategy）

### B-Tree 索引

最常用的索引类型，适合等值和范围查询：

```sql
-- 单列索引
CREATE INDEX idx_orders_status ON orders(status);

-- 复合索引（列顺序重要！）
CREATE INDEX idx_orders_user_date ON orders(user_id, created_at);

-- 部分索引（PostgreSQL）
CREATE INDEX idx_orders_paid ON orders(created_at) WHERE status = 'paid';
```

### 复合索引的最左前缀原则

```sql
-- 假设有复合索引 (a, b, c)

-- 可以用到索引
WHERE a = 1
WHERE a = 1 AND b = 2
WHERE a = 1 AND b = 2 AND c = 3
WHERE a IN (1, 2) AND b = 2

-- 无法用到索引（跳过了最左列）
WHERE b = 2
WHERE c = 3
WHERE b = 2 AND c = 3
```

::: tip 复合索引列顺序建议
将 **选择性高（区分度大）** 的列放在最左侧。例如 `(user_id, status)` 通常优于 `(status, user_id)`，因为 user_id 区分度更高。
:::

### 索引类型对比

| 索引类型 | 适用场景 | 注意事项 |
|---------|---------|---------|
| B-Tree | 等值、范围、排序 | 默认索引，适用大多数场景 |
| Hash | 等值查询 | 不支持范围查询和排序 |
| GiST/GIN | 全文搜索、JSON、数组（PG） | 空间和文本搜索专用 |
| 覆盖索引 | 只查询索引包含的列 | `Using index` 避免回表 |
| 位图索引 | 低基数列（性别、状态） | 适合 OLAP 场景 |

## 分区表（Partitioning）

### 按范围分区

```sql
-- PostgreSQL 声明式分区
CREATE TABLE orders (
  order_id    BIGINT,
  order_date  DATE,
  amount      DECIMAL(10,2),
  user_id     BIGINT
) PARTITION BY RANGE (order_date);

CREATE TABLE orders_2025q1 PARTITION OF orders
  FOR VALUES FROM ('2025-01-01') TO ('2025-04-01');

CREATE TABLE orders_2025q2 PARTITION OF orders
  FOR VALUES FROM ('2025-04-01') TO ('2025-07-01');
```

### 分区修剪（Partition Pruning）

分区的主要优势是 **分区裁剪**——查询只扫描相关分区而不是全表：

```sql
-- 只扫描 2025 年 Q1 分区
SELECT COUNT(*) FROM orders WHERE order_date BETWEEN '2025-02-01' AND '2025-02-28';

-- 非过滤条件无法裁剪
SELECT COUNT(*) FROM orders;  -- 扫描全部分区
```

### 分区策略选择

| 分区键 | 策略 | 适用场景 |
|--------|------|---------|
| 日期/时间 | RANGE | 日志表、事件表（最常用） |
| 地区 | LIST | 按国家/省份分区的数据 |
| 用户 ID | HASH | 均匀分布数据，避免数据倾斜 |
| 无自然分区键 | HASH | 无时间属性的流水表 |

## 查询反模式（Anti-Patterns）

### 1. SELECT * 不指定列

```sql
-- 坏：传输不需要的列，也无法使用覆盖索引
SELECT * FROM users WHERE email = 'test@example.com';

-- 好：只取需要的列
SELECT user_id, user_name FROM users WHERE email = 'test@example.com';
```

### 2. WHERE 函数包裹索引列

```sql
-- 坏：函数包裹导致索引失效
SELECT * FROM orders WHERE DATE(created_at) = '2025-05-26';
SELECT * FROM orders WHERE UPPER(email) = 'TEST@EXAMPLE.COM';

-- 好：改写为范围查询
SELECT * FROM orders
WHERE created_at >= '2025-05-26' AND created_at < '2025-05-27';
```

### 3. 隐式类型转换

```sql
-- 坏：如果 order_id 是整数，字符串比较会隐式转换
SELECT * FROM orders WHERE order_id = '12345';

-- 好：使用正确类型
SELECT * FROM orders WHERE order_id = 12345;
```

### 4. 非等值 JOIN 条件

```sql
-- 坏：非等值 JOIN 无法使用 hash join 优化
SELECT * FROM orders o
JOIN users u ON o.user_id BETWEEN u.min_id AND u.max_id;

-- 好（如果可以）：用等值条件
SELECT * FROM orders o
JOIN users u ON o.user_id = u.user_id;
```

### 5. 大表深分页

```sql
-- 坏：OFFSET 越大越慢
SELECT * FROM orders ORDER BY created_at DESC LIMIT 20 OFFSET 100000;

-- 好：游标分页（Keyset Pagination）
SELECT * FROM orders
WHERE created_at < '2025-05-01'
ORDER BY created_at DESC
LIMIT 20;
```

### 6. 不必要的大表 JOIN

```sql
-- 坏：先 JOIN 再过滤
SELECT o.*, u.user_name
FROM orders o
LEFT JOIN users u ON o.user_id = u.user_id
WHERE o.created_at >= '2025-05-01';

-- 好：先过滤再 JOIN（可确保同一结果时）
SELECT o.*, u.user_name
FROM (SELECT * FROM orders WHERE created_at >= '2025-05-01') o
LEFT JOIN users u ON o.user_id = u.user_id;
```

### 7. OR 条件导致索引失效

```sql
-- 坏：OR 可能导致索引失效
SELECT * FROM orders WHERE status = 'paid' OR status = 'pending';

-- 好：用 IN 替代
SELECT * FROM orders WHERE status IN ('paid', 'pending');

-- 或者用 UNION ALL（如果两个分支都有独立索引）
SELECT * FROM orders WHERE status = 'paid'
UNION ALL
SELECT * FROM orders WHERE status = 'pending';
```

## 优化检查清单

| 检查项 | 问题 | 解决方案 |
|--------|------|---------|
| 慢查询 | 是否全表扫描 | 检查 WHERE 列索引 |
| 大表 JOIN | 是否缺少索引 | 在 JOIN 键上加索引 |
| 排序 | 是否使用文件排序 | 考虑复合索引 (WHERE 列, ORDER BY 列) |
| 分页 | 是否深度 OFFSET | 改为 Keyset Pagination |
| 数据量 | 表是否过大 | 考虑分区 |
| 重复计算 | 子查询是否重复执行 | 使用 CTE 避免重复 |
| 数据倾斜 | 某些 key 行数远多于其他 | 考虑分桶或 Salting 技术 |

## 相关文章

- [基础查询与聚合](/knowledge-map/km-1-sql/01-basic-queries) — 查询基础中的性能注意事项
- [JOIN 详解](/knowledge-map/km-1-sql/02-joins) — JOIN 性能优化
- [实战场景](/knowledge-map/km-1-sql/08-scenarios) — 优化后的实战 SQL
