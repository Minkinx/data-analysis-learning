# IP 1. SQL 面试题库

> SQL 是数据分析岗面试的必考科目，覆盖从基础查询到大厂高频难题。本模块按难度分为 5 个级别，每个级别包含 5-10 道典型题目，配有题目描述、预期输出和完整 SQL 解答。

## 难度分级

| 级别 | 适用人群 | 核心考点 | 篇幅 |
|------|----------|----------|------|
| [入门 (Beginner)](01-beginner) | 实习生 / 校招 | `SELECT`、`WHERE`、`GROUP BY`、`ORDER BY`、基本 `JOIN` | 8 题 |
| [中级 (Intermediate)](02-intermediate) | 1-3 年经验 | 窗口函数、CTE、子查询、条件聚合 | 8 题 |
| [进阶 (Advanced)](03-advanced) | 3-5 年经验 | 复杂窗口函数、自连接、递归 CTE、性能优化 | 8 题 |
| [困难 (Hard)](04-hard) | 高级 / 专家 | 连续问题、最大在线、树形结构、行列转换 | 8 题 |
| [大厂真题 (Real Cases)](05-real-cases) | 所有级别 | 字节 / 阿里 / 腾讯 / 美团等真实面试题 | 8 题 |

## 常见考点速查

### 窗口函数（高频考点）

```sql
-- 排名：ROW_NUMBER, RANK, DENSE_RANK
-- 聚合：SUM, AVG, COUNT 配合 OVER(PARTITION BY ... ORDER BY ...)
-- 取值：LAG, LEAD, FIRST_VALUE, LAST_VALUE
```

### 常用技巧

```sql
-- 连续问题 -> 使用 ROW_NUMBER 构造组标识
-- 最大在线 -> 使用 SUM + 窗口排序
-- 树形结构 -> 递归 CTE
-- 行列转换 -> CASE WHEN + 聚合 / PIVOT
```

## 推荐练习资源

- [LeetCode Database](https://leetcode.com/problemset/database/) - 刷题首选
- [牛客网 SQL 题库](https://www.nowcoder.com/) - 国内大厂真题
- [HackerRank SQL](https://www.hackerrank.com/domains/sql) - 英文练习
- [SQLZoo](https://sqlzoo.net/) - 交互式学习

## SQL 面试注意事项

1. **写清楚格式**：缩进对齐、关键字大写（或统一风格）、注释清晰
2. **先思考再写**：不要急着下手，先理解表结构和需求
3. **考虑边界**：NULL 处理、重复数据、空表情况
4. **多表 JOIN 注意关联键**：确认是 INNER 还是 LEFT JOIN，关联条件是否正确
5. **窗口函数加分**：窗口函数往往是区分初级和高级的关键
6. **说清楚思路**：面试时边写边解释，让面试官理解你的思考过程
7. **预估复杂度**：大数据量下要考虑查询效率（索引、分区、避免全表扫描）
