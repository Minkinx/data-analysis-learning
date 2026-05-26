# KM 1. SQL 完全指南

> 从基础语法到实战场景的 SQL 深度参考手册。本节包含 8 个子章节，覆盖数据分析师日常工作所需的全部 SQL 知识。

## 章节

### 基础篇

1. [基础查询与聚合](/knowledge-map/km-1-sql/01-basic-queries) — SELECT、WHERE、GROUP BY、HAVING、ORDER BY 以及聚合函数的完整语法和子句执行顺序
2. [JOIN 详解](/knowledge-map/km-1-sql/02-joins) — INNER/LEFT/RIGHT/FULL/CROSS JOIN、自关联、数据膨胀陷阱、ON vs WHERE 的区别
3. [子查询与 CTE](/knowledge-map/km-1-sql/03-subqueries-cte) — 标量子查询、EXISTS/IN、CTE 多段复用、递归 CTE（树形结构、日期序列生成）
4. [窗口函数](/knowledge-map/km-1-sql/04-window-functions) — ROW_NUMBER/RANK/DENSE_RANK、LAG/LEAD、聚合窗口、Frame 规范（ROWS/RANGE/GROUPS）
5. [集合操作](/knowledge-map/km-1-sql/05-set-operations) — UNION/UNION ALL、INTERSECT、EXCEPT/MINUS、跨方言模拟方案
6. [数据处理函数](/knowledge-map/km-1-sql/06-functions) — 字符串/日期/数值/类型转换函数、PostgreSQL 与 MySQL 方言对照、NULL 安全处理

### 进阶篇

7. [查询优化](/knowledge-map/km-1-sql/07-optimization) — EXPLAIN 执行计划解读、B-Tree 索引策略、复合索引最左前缀、分区表设计、7 种查询反模式
8. [实战场景](/knowledge-map/km-1-sql/08-scenarios) — 留存 SQL、漏斗转化 SQL、RFM 用户分层、连续登录检测、最大连续天数、同环比分析

> 💡 建议按编号顺序阅读。前 6 篇打好基础后，再阅读优化和实战场景会更容易理解。

## 参考

- [学习路径：SQL 核心精讲](/learning-paths/path-1-basics/01-sql-core) — 快速入门版本
