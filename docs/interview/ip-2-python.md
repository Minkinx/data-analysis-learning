# IP 2. Python 面试题

> Python 是数据分析面试中的另一大技术考核重点，通常聚焦于 Pandas 数据操作、数据处理逻辑和基础算法能力。本章包含 8 道高频面试题，覆盖实际工作中最常见的场景。

## 核心准备建议

- **Pandas 熟练度**：`groupby`、`merge`、`apply`、窗口函数、数据清洗是必考
- **数据结构基础**：列表、字典、集合的高效用法
- **算法基础**：TopK、去重、排序、分组聚合
- **代码风格**：写清晰、可读的代码，善用函数封装

---

### 题目 1：Pandas 实现分组 TopN

**问题**：给定一个 DataFrame `df`，包含字段 `dept`（部门）、`name`（姓名）、`salary`（薪资）。请用 Pandas 找出每个部门薪资最高的 2 名员工。

**示例数据**：

```python
import pandas as pd

df = pd.DataFrame({
    'dept': ['技术', '技术', '技术', '产品', '产品', '产品'],
    'name': ['张三', '李四', '王五', '赵六', '钱七', '孙八'],
    'salary': [25000, 18000, 22000, 20000, 16000, 19000]
})
```

**解答**：

```python
# 方法一：使用 groupby + nlargest
result = df.groupby('dept').apply(
    lambda x: x.nlargest(2, 'salary')
).reset_index(drop=True)

# 方法二：使用 rank 窗口函数
df['rank'] = df.groupby('dept')['salary'].rank(method='dense', ascending=False)
result = df[df['rank'] <= 2].drop('rank', axis=1)

# 方法三：使用 sort_values + groupby + head
result = df.sort_values('salary', ascending=False).groupby('dept').head(2).sort_index()
```

**考点**：`groupby` 后的聚合操作，`nlargest` vs `rank` vs `head`。注意 `rank` 的 `method` 参数（`dense` / `min` / `max`）。

---

### 题目 2：Pandas 计算用户留存

**问题**：给定 DataFrame `logins` 包含 `user_id` 和 `login_date`，计算 2024 年 1 月新用户的次日留存率和 7 日留存率。

**解答**：

```python
import pandas as pd

# 假设 logins DataFrame 已存在
logins['login_date'] = pd.to_datetime(logins['login_date'])

# 找到每个用户的首次登录日期
first_login = logins.groupby('user_id')['login_date'].min().reset_index()
first_login.columns = ['user_id', 'first_date']

# 筛选 1 月新用户
jan_users = first_login[
    (first_login['first_date'] >= '2024-01-01') &
    (first_login['first_date'] < '2024-02-01')
]

# 合并登录记录
user_logins = jan_users.merge(logins, on='user_id', how='left')

# 计算时间差（天）
user_logins['days_diff'] = (user_logins['login_date'] - user_logins['first_date']).dt.days

# 计算留存
retention = user_logins.groupby('first_date').agg(
    new_users=('user_id', 'nunique'),
    day1_users=('days_diff', lambda x: ((x == 1).sum())),
    day7_users=('days_diff', lambda x: ((x == 7).sum()))
).reset_index()

retention['day1_rate'] = retention['day1_users'] / retention['new_users'] * 100
retention['day7_rate'] = retention['day7_users'] / retention['new_users'] * 100
```

**考点**：日期计算、`merge` 合并、条件聚合、留存分析逻辑。

---

### 题目 3：Pandas 实现行转列与列转行

**问题**：给定以下格式的 DataFrame，请实现：
1. 从长格式转为宽格式（行转列）
2. 从宽格式转为长格式（列转行）

**示例数据**：

```python
# 长格式
df_long = pd.DataFrame({
    'student': ['A', 'A', 'B', 'B', 'C'],
    'subject': ['数学', '语文', '数学', '语文', '数学'],
    'score': [90, 85, 88, 92, 95]
})

# 宽格式
df_wide = pd.DataFrame({
    'student': ['A', 'B', 'C'],
    '数学': [90, 88, 95],
    '语文': [85, 92, None]
})
```

**解答**：

```python
# 1. 长转宽（行转列）：使用 pivot 或 pivot_table
wide = df_long.pivot(
    index='student', columns='subject', values='score'
).reset_index()

# 如果有重复索引，使用 pivot_table
wide = df_long.pivot_table(
    index='student', columns='subject', values='score', aggfunc='mean'
).reset_index()

# 2. 宽转长（列转行）：使用 melt
long = df_wide.melt(
    id_vars=['student'],
    var_name='subject',
    value_name='score'
).dropna(subset=['score'])
```

**考点**：`pivot` vs `pivot_table`（处理重复值）、`melt` 的参数、`dropna` 清理。

---

### 题目 4：Pandas 滑动窗口计算

**问题**：给定每日销售额 DataFrame `df`，包含 `date` 和 `amount` 字段。计算 7 日移动平均销售额，以及当日销售额相对 7 日均值的偏离程度。

**解答**：

```python
import pandas as pd

# 确保日期排序
df = df.sort_values('date').reset_index(drop=True)

# 计算 7 日移动平均（中心窗口）
df['ma_7'] = df['amount'].rolling(window=7, min_periods=1).mean()

# 计算偏离程度
df['deviation'] = (df['amount'] - df['ma_7']) / df['ma_7'] * 100

# 使用 expanding 计算累计平均
df['cumulative_avg'] = df['amount'].expanding().mean()

# 使用 shift 计算环比
df['prev_day'] = df['amount'].shift(1)
df['mom_pct'] = (df['amount'] - df['prev_day']) / df['prev_day'] * 100
```

**考点**：`rolling` 窗口函数、`expanding` 累计、`shift` 偏移、`min_periods` 处理窗口初期的 NaN。

---

### 题目 5：Pandas 数据清洗综合题

**问题**：给定一个"脏"数据集，包含以下问题，请用 Pandas 清洗：
- 缺失值（NaN）
- 重复行
- 异常值（超过均值 3 个标准差）
- 格式不一致（如日期有多种格式）

**解答**：

```python
import pandas as pd
import numpy as np

def clean_dataset(df):
    """数据清洗函数"""
    df_clean = df.copy()

    # 1. 处理缺失值
    # 数值列用中位数填充
    numeric_cols = df_clean.select_dtypes(include=[np.number]).columns
    for col in numeric_cols:
        df_clean[col] = df_clean[col].fillna(df_clean[col].median())

    # 类别列用众数填充
    cat_cols = df_clean.select_dtypes(include=['object']).columns
    for col in cat_cols:
        df_clean[col] = df_clean[col].fillna(df_clean[col].mode()[0] if not df_clean[col].mode().empty else 'UNKNOWN')

    # 2. 删除重复行
    df_clean = df_clean.drop_duplicates()

    # 3. 处理异常值（Z-Score 方法）
    for col in numeric_cols:
        z_scores = np.abs((df_clean[col] - df_clean[col].mean()) / df_clean[col].std())
        df_clean.loc[z_scores > 3, col] = df_clean[col].median()

    # 4. 统一日期格式
    date_cols = [col for col in df_clean.columns if 'date' in col.lower() or 'time' in col.lower()]
    for col in date_cols:
        df_clean[col] = pd.to_datetime(df_clean[col], errors='coerce')

    return df_clean

# 使用示例
# df_cleaned = clean_dataset(df_raw)
```

**考点**：数据清洗的全流程、`select_dtypes` 自动识别列类型、`np.abs` + z-score 异常检测、`pd.to_datetime` 的 `errors='coerce'`。

---

### 题目 6：TopK 问题（不使用内置排序）

**问题**：实现一个函数，从一个长度为 N 的无序列表中找到最大的 K 个数。要求时间复杂度 O(N log K)，空间复杂度 O(K)。

**解答**：

```python
import heapq

def top_k_largest(nums, k):
    """使用最小堆找 TopK"""
    if k <= 0 or not nums:
        return []

    # 维护一个大小为 K 的最小堆
    heap = nums[:k]
    heapq.heapify(heap)

    for num in nums[k:]:
        if num > heap[0]:
            heapq.heapreplace(heap, num)

    # 返回降序排列的 TopK
    return sorted(heap, reverse=True)

def top_k_frequent(words, k):
    """找出现频率最高的 K 个单词"""
    from collections import Counter
    counter = Counter(words)
    # 使用 nlargest
    return [word for word, _ in counter.most_common(k)]

# 测试
nums = [3, 2, 1, 5, 6, 4]
print(top_k_largest(nums, 2))  # [6, 5]
```

**考点**：堆（`heapq`）的使用、`Counter` 的 `most_common`、时间/空间复杂度分析。面试时可扩展讨论 QuickSelect 算法的优劣。

---

### 题目 7：两个 DataFrame 的模糊匹配

**问题**：给定用户表 `users` 包含 `user_id` 和 `name`，以及活动报名表 `signups` 包含 `user_name`（可能不精确匹配）。请实现模糊匹配，将报名记录关联到用户。

**解答**：

```python
import pandas as pd
from difflib import SequenceMatcher

def fuzzy_merge(users, signups, threshold=0.8):
    """基于字符串相似度的模糊匹配"""
    results = []

    for _, signup in signups.iterrows():
        best_match = None
        best_score = 0

        for _, user in users.iterrows():
            score = SequenceMatcher(
                None,
                signup['user_name'].lower(),
                user['name'].lower()
            ).ratio()

            if score > best_score:
                best_score = score
                best_match = user['user_id']

        results.append({
            'signup_id': signup['signup_id'],
            'user_name': signup['user_name'],
            'matched_user_id': best_match if best_score >= threshold else None,
            'match_score': round(best_score, 4)
        })

    return pd.DataFrame(results)

# 更高效的方法（数据量大时）
# 可以使用 fuzzywuzzy 库（pip install fuzzywuzzy）
# from fuzzywuzzy import fuzz, process
```

**考点**：模糊匹配思路、`SequenceMatcher` 使用、阈值设定、性能考量。

---

### 题目 8：多层 JSON 数据展平

**问题**：从 API 获取的嵌套 JSON 数据如下，请展平为 Pandas DataFrame。

**示例数据**：

```python
data = {
    'orders': [
        {
            'order_id': 1001,
            'customer': {'name': '张三', 'tier': 'VIP'},
            'items': [
                {'product': 'A', 'price': 100, 'qty': 2},
                {'product': 'B', 'price': 50, 'qty': 1}
            ],
            'payment': {'method': 'wxpay', 'status': 'paid'}
        },
        {
            'order_id': 1002,
            'customer': {'name': '李四', 'tier': '普通'},
            'items': [
                {'product': 'C', 'price': 200, 'qty': 1}
            ],
            'payment': {'method': 'alipay', 'status': 'pending'}
        }
    ]
}
```

**解答**：

```python
def flatten_orders(data):
    """将嵌套 JSON 展平"""
    records = []

    for order in data['orders']:
        base = {
            'order_id': order['order_id'],
            'customer_name': order['customer']['name'],
            'customer_tier': order['customer']['tier'],
            'payment_method': order['payment']['method'],
            'payment_status': order['payment']['status'],
        }

        # 展开 items 数组（一行变多行）
        for item in order['items']:
            record = base.copy()
            record.update({
                'product': item['product'],
                'price': item['price'],
                'qty': item['qty'],
                'line_total': item['price'] * item['qty']
            })
            records.append(record)

    return pd.DataFrame(records)

# 使用 json_normalize（Pandas 内置方法）
from pandas import json_normalize

# 先展开外层
df_base = json_normalize(data['orders'],
    sep='_',
    meta=['order_id', ['customer', 'name'], ['customer', 'tier'],
          ['payment', 'method'], ['payment', 'status']]
)

# 再展开 items
df_items = json_normalize(data['orders'],
    record_path='items',
    meta=['order_id']
)

# 合并
df_result = df_items.merge(df_base[['order_id', 'customer_name', 'customer_tier']], on='order_id')
```

**考点**：JSON 展平技术、`json_normalize` 使用、嵌套列表展开（explode）、`record_path` 和 `meta` 参数。实际工作中非常高频。
