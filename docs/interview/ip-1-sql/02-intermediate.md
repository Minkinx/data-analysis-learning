# 中级 SQL 面试题

> 面向 1-3 年经验的数据分析师，考察窗口函数、CTE (Common Table Expressions)、子查询和条件聚合等核心技能。

---

### 题目 1：查询每个部门薪资排名前 2 的员工

**背景**：员工表 `employees(emp_id, emp_name, dept_id, salary)`。

**问题**：在每个部门内按薪资降序排名，返回每个部门薪资前 2 的员工。

**预期输出**：

| dept_id | emp_name | salary | rnk |
|---------|----------|--------|-----|
| 1 | 张三 | 25000 | 1 |
| 1 | 赵六 | 22000 | 2 |
| 2 | 李四 | 18000 | 1 |
| 2 | 王五 | 15000 | 2 |

**解答**：

```sql
WITH ranked AS (
    SELECT
        dept_id,
        emp_name,
        salary,
        ROW_NUMBER() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rnk
    FROM employees
)
SELECT dept_id, emp_name, salary, rnk
FROM ranked
WHERE rnk <= 2;
```

**考点**：窗口函数 `ROW_NUMBER` + `PARTITION BY`。注意 `ROW_NUMBER` vs `RANK` vs `DENSE_RANK` 的区别。

---

### 题目 2：计算累计销售额（Running Total）

**背景**：订单表 `orders(order_id, order_date, amount)`。

**问题**：计算每日累计销售额（从年初到当前日期的累计）。

**预期输出**：

| order_date | daily_amount | running_total |
|------------|--------------|---------------|
| 2024-01-01 | 1000.00 | 1000.00 |
| 2024-01-02 | 1500.00 | 2500.00 |
| 2024-01-03 | 800.00 | 3300.00 |

**解答**：

```sql
SELECT
    order_date,
    SUM(amount) AS daily_amount,
    SUM(SUM(amount)) OVER (ORDER BY order_date) AS running_total
FROM orders
WHERE order_date >= '2024-01-01' AND order_date < '2025-01-01'
GROUP BY order_date
ORDER BY order_date;
```

**考点**：窗口聚合函数配合 `GROUP BY` 使用。

---

### 题目 3：查找连续 3 天有销售记录的日期

**背景**：销售表 `sales(sale_date, amount)`。

**问题**：找出所有连续 3 天及以上有销售记录的起始日期段。

**预期输出**：

| start_date | end_date | days_count |
|------------|----------|------------|
| 2024-01-01 | 2024-01-04 | 4 |
| 2024-01-10 | 2024-01-12 | 3 |

**解答**：

```sql
WITH date_diff AS (
    SELECT
        sale_date,
        DATE_SUB(sale_date, ROW_NUMBER() OVER (ORDER BY sale_date)) AS grp
    FROM sales
),
grouped AS (
    SELECT
        grp,
        MIN(sale_date) AS start_date,
        MAX(sale_date) AS end_date,
        COUNT(*) AS days_count
    FROM date_diff
    GROUP BY grp
)
SELECT start_date, end_date, days_count
FROM grouped
WHERE days_count >= 3
ORDER BY start_date;
```

**考点**：连续问题经典解法——用 `ROW_NUMBER` 构造组标识。

---

### 题目 4：用 SQL 计算中位数

**背景**：员工表 `employees(emp_id, salary)`。

**问题**：计算所有员工薪资的中位数。

**解答**：

```sql
WITH ordered AS (
    SELECT
        salary,
        ROW_NUMBER() OVER (ORDER BY salary) AS rn,
        COUNT(*) OVER () AS total_count
    FROM employees
)
SELECT AVG(salary) AS median_salary
FROM ordered
WHERE rn IN (
    FLOOR((total_count + 1) / 2.0),
    CEIL((total_count + 1) / 2.0)
);
```

**考点**：中位数计算，处理奇偶情况。或使用 `PERCENTILE_CONT`（部分数据库有内置函数）。

---

### 题目 5：查询各部门薪资中位数

**背景**：员工表 `employees(emp_id, dept_id, salary)`。

**问题**：计算每个部门的薪资中位数。

**解答**：

```sql
WITH ordered AS (
    SELECT
        dept_id,
        salary,
        ROW_NUMBER() OVER (PARTITION BY dept_id ORDER BY salary) AS rn,
        COUNT(*) OVER (PARTITION BY dept_id) AS cnt
    FROM employees
)
SELECT
    dept_id,
    AVG(salary) AS median_salary
FROM ordered
WHERE rn IN (FLOOR((cnt + 1) / 2.0), CEIL((cnt + 1) / 2.0))
GROUP BY dept_id;
```

**考点**：`PARTITION BY` 在 `COUNT(*) OVER` 中使用。

---

### 题目 6：找出每个商品分类的 Top 3 畅销商品

**背景**：商品表 `products(product_id, category_id, price)`，订单明细表 `order_items(order_id, product_id, quantity)`。

**问题**：找出每个分类下销量（按售出数量总和）排名前 3 的商品。

**解答**：

```sql
WITH product_sales AS (
    SELECT
        p.category_id,
        p.product_id,
        p.product_name,
        SUM(oi.quantity) AS total_qty,
        ROW_NUMBER() OVER (PARTITION BY p.category_id ORDER BY SUM(oi.quantity) DESC) AS rnk
    FROM products p
    JOIN order_items oi ON p.product_id = oi.product_id
    GROUP BY p.category_id, p.product_id, p.product_name
)
SELECT category_id, product_id, product_name, total_qty
FROM product_sales
WHERE rnk <= 3;
```

**考点**：多表 JOIN + 窗口函数，注意 `GROUP BY` 的字段必须与 `SELECT` 一致。

---

### 题目 7：同比环比计算

**背景**：销售表 `sales(month DATE, amount DECIMAL)`。

**问题**：计算每个月的销售额，以及环比（上月）和同比（去年同月）增长率。

**预期输出**：

| month | amount | mom_change | yoy_change |
|-------|--------|------------|------------|
| 2024-02 | 120000 | 20.00% | 15.00% |
| 2024-03 | 135000 | 12.50% | 18.50% |

**解答**：

```sql
WITH monthly AS (
    SELECT
        month,
        SUM(amount) AS amount
    FROM sales
    GROUP BY month
)
SELECT
    m.month,
    m.amount,
    ROUND((m.amount - LAG(m.amount) OVER (ORDER BY m.month)) / LAG(m.amount) OVER (ORDER BY m.month) * 100, 2) AS mom_change,
    ROUND((m.amount - LAG(m.amount, 12) OVER (ORDER BY m.month)) / LAG(m.amount, 12) OVER (ORDER BY m.month) * 100, 2) AS yoy_change
FROM monthly m
ORDER BY m.month;
```

**考点**：`LAG` 窗口函数取上一行数据用于计算增长率。

---

### 题目 8：用 CASE WHEN 做行转列

**背景**：学生成绩表 `scores(student_id, subject, score)`。

**问题**：将行数据转为列，每行显示一个学生的各科成绩。

**预期输出**：

| student_id | 语文 | 数学 | 英语 |
|------------|------|------|------|
| 1001 | 90 | 85 | 92 |
| 1002 | 88 | 95 | 78 |

**解答**：

```sql
SELECT
    student_id,
    MAX(CASE WHEN subject = '语文' THEN score END) AS 语文,
    MAX(CASE WHEN subject = '数学' THEN score END) AS 数学,
    MAX(CASE WHEN subject = '英语' THEN score END) AS 英语
FROM scores
GROUP BY student_id;
```

**考点**：条件聚合实现行列转换。注意用 `MAX`（或 `MIN`）聚合函数消除 `GROUP BY` 产生的多余行。
