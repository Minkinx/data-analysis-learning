# Python 数据分析

> 数据分析全流程的 Python 生态核心工具与实战模式。涵盖 Pandas、NumPy、可视化、自动化与性能优化。适合作为日常工作的速查手册。

## Pandas 核心

### DataFrame 与 Series

Pandas 的两大核心数据结构：`Series`（1D，带标签数组）和 `DataFrame`（2D，表格数据）。

```python
import pandas as pd
import numpy as np

df = pd.DataFrame({
    "user_id": [1, 2, 3, 4],
    "name": ["Alice", "Bob", "Charlie", "Diana"],
    "amount": [100.0, 250.0, 150.0, None],
    "date": pd.date_range("2025-01-01", periods=4, freq="D"),
})

df.head(10)       # 前 N 行
df.info()          # 列类型 + 非空计数
df.describe()      # 数值列描述统计
df.shape           # (行, 列)
```

### 索引与切片

```python
# 列选择
df["name"]                     # 返回 Series
df[["name", "amount"]]         # 返回 DataFrame

# 行选择（loc=标签，包含终点；iloc=位置，不包含终点）
df.loc[0:2]                    # 按标签
df.iloc[0:2]                   # 按位置
df.loc[df["amount"] > 100]     # 布尔索引
df.query("amount > 100")       # 字符串查询
```

### 链式操作（Method Chaining）

```python
result = (df
    .query("amount > 0")
    .assign(amount_log=np.log)
    .groupby("category")
    .agg({"amount": ["mean", "count"]})
    .reset_index())

## 数据清洗

```python
# 缺失值
df.isna().sum()                          # 每列缺失数
df.fillna({"amount": df["amount"].median()})   # 填充
df["amount"] = df["amount"].interpolate()      # 线性插值

# 异常值（IQR 法）
Q1, Q3 = df["amount"].quantile([0.25, 0.75])
iqr = Q3 - Q1
df = df[~((df["amount"] < Q1 - 1.5 * iqr) | (df["amount"] > Q3 + 1.5 * iqr))]

# 去重 & 类型修正
df.drop_duplicates(subset=["user_id"], keep="last")
df["date"] = pd.to_datetime(df["date"])
df["amount"] = pd.to_numeric(df["amount"], errors="coerce")
```

## 数据变换

### GroupBy 三剑客

```python
# agg — 多聚合
df.groupby("category").agg({"amount": ["sum", "mean", "count"]})

# transform — 保留行数的聚合（列值 / 组均值 = 组内占比）
df["amount_pct"] = df["amount"] / df.groupby("category")["amount"].transform("sum")

# filter — 按组条件过滤
df.groupby("category").filter(lambda g: g["amount"].sum() > 1000)
```

### 透视、逆透视与分箱

```python
# pivot_table
pd.pivot_table(df, index="date", columns="category", values="amount",
               aggfunc="sum", fill_value=0)

# melt — 长表
pd.melt(df, id_vars=["date"], value_vars=["category", "amount"])

# 分箱
df["amount_bin"] = pd.cut(df["amount"], bins=[0, 50, 100, 500],
                          labels=["small", "medium", "large"])
df["amount_q"] = pd.qcut(df["amount"], q=4, labels=["Q1", "Q2", "Q3", "Q4"])

# One-hot 编码
pd.get_dummies(df, columns=["category"], prefix="cat")
```

## 多表操作

```python
# Merge — 类 SQL JOIN
pd.merge(orders, users, on="user_id", how="left")
pd.merge(orders, users, left_on="user_id", right_on="id", how="inner")

# Concat — 行/列拼接
pd.concat([df1, df2], axis=0, ignore_index=True)
```

::: warning 多表操作性能
当数据量 > 1GB 时，优先在 SQL 中完成 JOIN 而不是拉取到 Pandas 中合并。Pandas 的 merge 是内存操作，大表 JOIN 极易 OOM。
:::

## 时间序列

```python
dates = pd.date_range("2025-01-01", "2025-12-31", freq="D")

df.set_index("date").resample("ME")["amount"].sum()   # 月汇总
df["ma7"] = df["amount"].rolling(window=7).mean()      # 滑动平均
df["ewm"] = df["amount"].ewm(span=7).mean()            # 指数加权
df["pct"] = df["amount"].pct_change()                  # 环比
```

## NumPy 速查

```python
# 创建 & 常用数组
np.arange(0, 10, 2), np.zeros((3, 4)), np.ones((2, 3))
np.random.randn(1000)                                    # 标准正态

# 广播（Broadcasting）：不同 shape 自动对齐
arr = np.array([[1], [2], [3]]) + np.array([10, 20, 30])  # (3,1)*(1,3)=(3,3)

# 向量化替代循环
np.where(df["amount"] > 100, "high", "low")
np.clip(df["amount"], 0, 1000)
```

## 可视化速览

| 库 | 适用场景 | 特点 |
|---|---------|------|
| Matplotlib | 底层定制 | 完全控制，代码稍长 |
| Seaborn | 统计图表 | 高颜值默认样式 |
| Plotly | 交互式 / Web | 鼠标悬停缩放 |

```python
# Matplotlib
fig, ax = plt.subplots(figsize=(10, 5))
ax.plot(df["date"], df["amount"])

# Seaborn
sns.boxplot(data=df, x="category", y="amount")
sns.heatmap(df.corr(numeric_only=True), annot=True)

# Plotly 交互
import plotly.express as px
px.line(df, x="date", y="amount", color="category")
```

## 自动化脚本

```python
import sqlalchemy as sa
engine = sa.create_engine("postgresql://user:pass@host:5432/db")
df = pd.read_sql("SELECT * FROM orders WHERE date >= %(dt)s",
                 con=engine, params={"dt": "2025-01-01"})
df.to_excel("report.xlsx", index=False)
df.to_csv("export.csv", index=False)
```

## 性能建议

| 场景 | 推荐做法 | 避免 |
|------|---------|------|
| 条件计算 | `np.where`, `df.loc` 向量化 | `df.apply(lambda...)` |
| 大量字符串 | 转为 `category` 类型 | 默认 `object` |
| 超大文件 | `pd.read_csv(chunksize=10000)` 分块 | 一次性读入 |

```python
# 分块处理
chunks = pd.read_csv("huge.csv", chunksize=50000)
result = [chunk.groupby("cat")["amount"].sum() for chunk in chunks if chunk["amount"].sum() > 0]
final = pd.concat(result).groupby(level=0).sum()
```

## 相关文章

- [SQL 完全指南](/knowledge-map/km-1-sql/) — 数据处理的基础语言
- [统计学与概率论](/knowledge-map/km-3-statistics) — 数据分析的理论基础
- [数据工程基础](/knowledge-map/km-8-data-engineering) — 数据管道与自动化
