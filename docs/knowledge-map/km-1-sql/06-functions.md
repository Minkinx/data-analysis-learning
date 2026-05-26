# 数据处理函数

> SQL 中内置了大量字符串、日期、数值和类型转换函数。本节按类别整理最常用的函数及其使用注意点。

## 概述

不同数据库的函数名和语法存在差异。本节以 **PostgreSQL 为标准语法**，同时标注 MySQL 和其他方言的差异。实际使用时建议查阅对应数据库文档。

## 字符串函数（String Functions）

### 常用函数速查

```sql
-- 长度与截取
LENGTH('hello')                  -- 5（MySQL: CHAR_LENGTH）
LEFT('hello', 2)                 -- 'he'
RIGHT('hello', 2)                -- 'lo'
SUBSTRING('hello', 2, 3)        -- 'ell'（MySQL: SUBSTR）

-- 拼接
CONCAT('Hello', ' ', 'World')   -- 'Hello World'（MySQL 和 PG 都支持）
'Hello' || ' ' || 'World'       -- 'Hello World'（PG 和 SQLite 支持）

-- 查找与替换
POSITION('ll' IN 'hello')       -- 3（MySQL: LOCATE）
REPLACE('hello world', 'world', 'SQL')  -- 'hello SQL'

-- 大小写转换
UPPER('hello')                  -- 'HELLO'
LOWER('HELLO')                  -- 'hello'

-- 去空格
TRIM('  hello  ')               -- 'hello'（去除两端）
LTRIM('  hello')                -- 'hello'（去除左侧）
RTRIM('hello  ')                -- 'hello'（去除右侧）
```

### 常用模式匹配

```sql
-- LIKE 模糊匹配
SELECT * FROM users WHERE email LIKE '%@gmail.com';
SELECT * FROM users WHERE user_name LIKE 'Tom_';   -- _ 匹配单个字符

-- 正则匹配（PostgreSQL）
SELECT * FROM users WHERE email ~ '^[a-z]+@[a-z]+\.[a-z]{2,}$';
SELECT * FROM users WHERE email ~* '^[A-Z]+@';    -- ~* 不区分大小写
```

::: tip 性能注意
`LIKE '%pattern'`（前导通配符）无法使用常规索引，会导致全表扫描。考虑使用全文索引或反向列索引。
:::

## 日期与时间函数（Date/Time Functions）

### 获取与提取

```sql
-- 当前时间
CURRENT_DATE                    -- 2025-05-26
CURRENT_TIMESTAMP               -- 2025-05-26 12:30:00+08
NOW()                           -- 等价于 CURRENT_TIMESTAMP

-- 提取部分
EXTRACT(YEAR FROM created_at)   -- 年份
EXTRACT(MONTH FROM created_at)  -- 月份
EXTRACT(DAY FROM created_at)    -- 日
EXTRACT(DOW FROM created_at)    -- 星期几（0=周日, 6=周六，PG）
EXTRACT(QUARTER FROM created_at)-- 季度

-- 名称提取（PG）
TO_CHAR(created_at, 'YYYY-MM-DD')          -- 格式化日期
TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') -- 格式化时间
TO_CHAR(created_at, 'Day')                  -- 星期名称
TO_CHAR(created_at, 'Month')                -- 月份名称
```

### 日期计算

```sql
-- 日期加减（PG）
created_at + INTERVAL '1 DAY'      -- 加 1 天
created_at - INTERVAL '7 DAY'      -- 减 7 天
created_at + INTERVAL '1 MONTH'   -- 加 1 月
created_at + INTERVAL '1 YEAR'    -- 加 1 年

-- 日期差
DATE('2025-05-26') - DATE('2025-05-01')  -- 25（天数差，PG）
DATEDIFF('2025-05-26', '2025-05-01')      -- 25（MySQL）

-- 按月/日/周截断（PG）
DATE_TRUNC('month', created_at)    -- 当月第一天
DATE_TRUNC('year', created_at)     -- 当年第一天
DATE_TRUNC('week', created_at)     -- 当周周一
```

### 日期函数方言对照

| 操作 | PostgreSQL | MySQL |
|------|-----------|-------|
| 日期差 | `date1 - date2` | `DATEDIFF(date1, date2)` |
| 加天数 | `date + INTERVAL 'N DAY'` | `DATE_ADD(date, INTERVAL N DAY)` |
| 截断到月 | `DATE_TRUNC('month', date)` | `DATE_FORMAT(date, '%Y-%m-01')` |
| 提取月份 | `EXTRACT(MONTH FROM date)` | `MONTH(date)` |

## 数值函数（Numeric Functions）

```sql
-- 四舍五入与截断
ROUND(123.4567, 2)          -- 123.46
TRUNC(123.4567, 2)          -- 123.45 （PG, SQLite）
CEILING(123.1)              -- 124（MySQL: CEIL）
FLOOR(123.9)                -- 123

-- 绝对值与符号
ABS(-10)                    -- 10
SIGN(-5)                    -- -1

-- 幂与平方根
POWER(2, 10)                -- 1024
SQRT(100)                   -- 10

-- 取随机数
RANDOM()                    -- [0, 1) 随机浮点（PG）
RAND()                      -- [0, 1) 随机浮点（MySQL）

-- 取模
MOD(10, 3)                  -- 1（PG 和 MySQL 都支持）
10 % 3                      -- 1（MySQL 支持）
```

## 类型转换函数（Type Conversion）

### 显式转换

```sql
-- PostgreSQL
CAST('123' AS INTEGER)           -- 123
'123'::INTEGER                   -- 123（PG 简写语法）

-- MySQL
CAST('123' AS SIGNED)            -- 123
CONVERT('123', SIGNED)           -- 123

-- 常用转换
CAST(revenue AS DECIMAL(10, 2))  -- 浮点转定点数
CAST(created_at AS DATE)         -- 时间戳转日期
CAST(user_id AS VARCHAR)         -- 数字转字符串
```

### 隐式转换的陷阱

```sql
-- 隐式转换可能导致索引失效
SELECT * FROM orders
WHERE order_id = '123';          -- 如果 order_id 是数字类型，建议不加引号

-- 字符串拼接中的类型
SELECT 'Order #' || order_id FROM orders;  -- PG 可以
SELECT CONCAT('Order #', order_id) FROM orders;  -- MySQL 和 PG 都安全
```

### NULL 处理

```sql
-- 替换 NULL 为默认值
COALESCE(NULL, 0, 'default')           -- 返回第一个非 NULL 值: 0
COALESCE(amount, 0)                    -- 常用场景：金额 NULL 视为 0

-- NULLIF：如果两值相等返回 NULL，否则返回第一个值
NULLIF(0, 0)                           -- NULL
NULLIF(amount, 0)                      -- 防止除零错误

-- 安全除法（防止除零）
amount / NULLIF(total, 0)
```

## 条件表达式

```sql
-- CASE 表达式（SQL 标准）
SELECT order_id, amount,
  CASE
    WHEN amount < 100 THEN '小额'
    WHEN amount < 1000 THEN '中额'
    ELSE '大额'
  END AS amount_level
FROM orders;

-- CASE 简单形式
SELECT order_id, status,
  CASE status
    WHEN 'paid' THEN '已支付'
    WHEN 'pending' THEN '待支付'
    WHEN 'refunded' THEN '已退款'
    ELSE '未知'
  END AS status_cn
FROM orders;
```

## 各数据库内置函数速查

| 功能 | PostgreSQL | MySQL | BigQuery | Hive |
|------|-----------|-------|----------|------|
| 当前日期 | `CURRENT_DATE` | `CURRENT_DATE` | `CURRENT_DATE` | `CURRENT_DATE` |
| 日期截断 | `DATE_TRUNC` | `DATE_FORMAT` | `DATE_TRUNC` | `TRUNC` |
| 字符串拼接 | `\|\|` / `CONCAT` | `CONCAT` | `CONCAT` | `CONCAT` |
| 字符串聚合 | `STRING_AGG` | `GROUP_CONCAT` | `STRING_AGG` | `COLLECT_LIST` |
| 正则提取 | `REGEXP_MATCHES` | `REGEXP_SUBSTR` | `REGEXP_EXTRACT` | `REGEXP_EXTRACT` |
| 排名窗口 | 标准支持 | 8.0+ 支持 | 标准支持 | 标准支持 |

## 相关文章

- [基础查询与聚合](/knowledge-map/km-1-sql/01-basic-queries) — 函数在查询中的使用
- [实战场景](/knowledge-map/km-1-sql/08-scenarios) — 函数在真实场景中的组合应用
