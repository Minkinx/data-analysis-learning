# Python 数据分析

> 数据分析师日常使用 Python 的场景集中在数据提取、清洗、分析和自动化。深入参考请见 [KM 2. Python 数据分析](/knowledge-map/km-2-python)。

## Pandas 核心操作

### 数据读取

```python
import pandas as pd

# 从 CSV / Excel / SQL
df = pd.read_csv('data.csv')
df = pd.read_excel('data.xlsx')
df = pd.read_sql('SELECT * FROM table', connection)
```

### DataFrame 操作

```python
# 查看概览
df.head()
df.info()
df.describe()

# 选择列
df['column_name']
df[['col1', 'col2']]

# 过滤行
df[df['col'] > 100]
df[df['category'].isin(['A', 'B'])]

# groupby 聚合
df.groupby('category')['revenue'].agg(['sum', 'mean', 'count'])
```

## 数据清洗

```python
# 缺失值
df.isnull().sum()
df.dropna(subset=['important_col'])
df['col'].fillna(df['col'].median())

# 异常值（IQR 法）
Q1 = df['col'].quantile(0.25)
Q3 = df['col'].quantile(0.75)
IQR = Q3 - Q1
df = df[(df['col'] >= Q1 - 1.5 * IQR) & (df['col'] <= Q3 + 1.5 * IQR)]

# 类型转换
df['date'] = pd.to_datetime(df['date'])
df['amount'] = df['amount'].astype(float)
```

## 可视化

```python
import matplotlib.pyplot as plt
import seaborn as sns

# 分布图
sns.histplot(df['revenue'], bins=50)
plt.show()

# 箱线图（异常值检测）
sns.boxplot(x='category', y='revenue', data=df)
plt.show()

# 相关性热图
sns.heatmap(df.corr(), annot=True, cmap='coolwarm')
plt.show()
```

## 自动化脚本

```python
# 定时导出报表
def generate_daily_report():
    df = pd.read_sql(daily_sql, conn)
    df.to_excel(f'report_{date.today()}.xlsx', index=False)
    send_email(recipient, subject, body, attachment)

# 结合 cron / Airflow 调度
```

> 深入了解请参阅 [KM 2. Python 数据分析](/knowledge-map/km-2-python)。
