# 入门 SQL 面试题

> 面向实习生和校招同学，涵盖基本查询、过滤、分组、排序和表连接。

---

### 题目 1：查询所有员工的姓名和薪资

**背景**：有一张员工表 `employees`，包含字段 `emp_id`, `emp_name`, `salary`, `dept_id`。

**问题**：查询所有员工的姓名和薪资，按薪资降序排列。

**预期输出**：

| emp_name | salary |
|----------|--------|
| 张三 | 25000 |
| 李四 | 18000 |
| 王五 | 15000 |

**解答**：

```sql
SELECT emp_name, salary
FROM employees
ORDER BY salary DESC;
```

**考点**：基本的 `SELECT` 和 `ORDER BY`。

---

### 题目 2：统计各部门的员工数量

**背景**：员工表 `employees(dept_id)` + 部门表 `departments(dept_id, dept_name)`。

**问题**：统计每个部门的员工人数，包含部门名称，按人数降序排列。

**预期输出**：

| dept_name | emp_count |
|-----------|-----------|
| 技术部 | 15 |
| 产品部 | 10 |
| 运营部 | 8 |

**解答**：

```sql
SELECT d.dept_name, COUNT(e.emp_id) AS emp_count
FROM departments d
LEFT JOIN employees e ON d.dept_id = e.dept_id
GROUP BY d.dept_name
ORDER BY emp_count DESC;
```

**考点**：`JOIN` + `GROUP BY` + `COUNT`，注意 `LEFT JOIN` 保证部门无员工时显示 0。

---

### 题目 3：查找薪资高于平均值的员工

**背景**：员工表 `employees(emp_id, emp_name, salary)`。

**问题**：查询薪资高于公司平均薪资的员工姓名和薪资。

**预期输出**：

| emp_name | salary |
|----------|--------|
| 张三 | 25000 |
| 赵六 | 22000 |

**解答**：

```sql
SELECT emp_name, salary
FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees);
```

**考点**：子查询（标量子查询）。

---

### 题目 4：查询没有下过订单的客户

**背景**：客户表 `customers(cust_id, cust_name)`，订单表 `orders(order_id, cust_id)`。

**问题**：找出从未下单的客户。

**预期输出**：

| cust_name |
|-----------|
| 刘先生 |
| 陈女士 |

**解答**：

```sql
-- 方法一：LEFT JOIN
SELECT c.cust_name
FROM customers c
LEFT JOIN orders o ON c.cust_id = o.cust_id
WHERE o.order_id IS NULL;

-- 方法二：NOT EXISTS
SELECT c.cust_name
FROM customers c
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.cust_id = c.cust_id);

-- 方法三：NOT IN（注意处理 NULL）
SELECT c.cust_name
FROM customers c
WHERE c.cust_id NOT IN (SELECT cust_id FROM orders WHERE cust_id IS NOT NULL);
```

**考点**：`LEFT JOIN` + `IS NULL`、`NOT EXISTS`、`NOT IN` 的 NULL 陷阱。

---

### 题目 5：查询每个部门薪资最高的员工

**背景**：员工表 `employees(emp_id, emp_name, dept_id, salary)`。

**问题**：找出每个部门薪资最高的员工姓名和薪资。

**预期输出**：

| dept_id | emp_name | salary |
|---------|----------|--------|
| 1 | 张三 | 25000 |
| 2 | 李四 | 18000 |

**解答**：

```sql
SELECT e.dept_id, e.emp_name, e.salary
FROM employees e
WHERE e.salary = (
    SELECT MAX(salary) FROM employees
    WHERE dept_id = e.dept_id
);
```

**考点**：关联子查询。也可以用窗口函数解法（见中级篇）。

---

### 题目 6：统计每个月的订单数量

**背景**：订单表 `orders(order_id, order_date, amount)`。

**问题**：按月统计订单数量和总金额。

**预期输出**：

| month | order_count | total_amount |
|-------|-------------|--------------|
| 2024-01 | 120 | 150000.00 |
| 2024-02 | 95 | 120000.00 |

**解答**：

```sql
SELECT
    DATE_FORMAT(order_date, '%Y-%m') AS month,
    COUNT(order_id) AS order_count,
    SUM(amount) AS total_amount
FROM orders
GROUP BY DATE_FORMAT(order_date, '%Y-%m')
ORDER BY month;
```

**考点**：日期格式化 + `GROUP BY`，不同数据库的日期函数差异（`DATE_FORMAT` / `TO_CHAR` / `strftime`）。

---

### 题目 7：查找重复的邮箱地址

**背景**：用户表 `users(user_id, email)`。

**问题**：找出出现次数大于 1 的邮箱地址。

**预期输出**：

| email | count |
|-------|-------|
| test@example.com | 3 |
| admin@example.com | 2 |

**解答**：

```sql
SELECT email, COUNT(user_id) AS count
FROM users
GROUP BY email
HAVING COUNT(user_id) > 1;
```

**考点**：`HAVING` 对聚合结果过滤。

---

### 题目 8：分页查询第 N 页数据

**背景**：商品表 `products(product_id, product_name, price)`，每页显示 10 条。

**问题**：查询第 3 页的数据（按价格升序）。

**解答**：

```sql
SELECT product_id, product_name, price
FROM products
ORDER BY price ASC
LIMIT 10 OFFSET 20;
-- LIMIT 10, 20  -- MySQL 简写
```

**考点**：`LIMIT` + `OFFSET` 分页。
