# 🛠️ 工具速查手册

> SQL 函数、Pandas 操作、统计公式、命令行与 Git 常用命令快速参考。建议收藏以备日常查阅。

---

## 一、SQL 函数速查

以下语法以 PostgreSQL 为主，与 MySQL / BigQuery / Hive 的差异会标注。

### 1.1 字符串函数 (String Functions)

| 函数 | 说明 | 示例 | 结果 |
|------|------|------|------|
| `CONCAT(a, b)` | 拼接字符串 | `CONCAT('AB', 'C')` | `'ABC'` |
| `LENGTH(s)` | 字符数/字节数 (PG: 字符) | `LENGTH('你好')` | `2` |
| `UPPER(s)` / `LOWER(s)` | 大小写转换 | `UPPER('sql')` | `'SQL'` |
| `TRIM(s)` | 去除首尾空格 | `TRIM('  a  ')` | `'a'` |
| `SUBSTRING(s FROM p FOR n)` | 截取子串 | `SUBSTRING('abcde' FROM 2 FOR 3)` | `'bcd'` |
| `LEFT(s, n)` / `RIGHT(s, n)` | 左/右截取 | `LEFT('abcde', 2)` | `'ab'` |
| `REPLACE(s, f, t)` | 替换 | `REPLACE('abc', 'b', 'x')` | `'axc'` |
| `POSITION(p IN s)` | 定位首次出现 | `POSITION('b' IN 'abc')` | `2` |
| `SPLIT_PART(s, d, n)` | 按分隔符取第 n 段 | `SPLIT_PART('a-b-c', '-', 2)` | `'b'` |
| `REGEXP_REPLACE(s, p, r)` | 正则替换 (PG) | `REGEXP_REPLACE('a1b2', '\d', '')` | `'ab'` |
| `FORMAT(fmt, ...)` | 格式化字符串 (PG) | `FORMAT('Hello %s', 'World')` | `'Hello World'` |

**MySQL 差异：** `LENGTH()` 返回字节数，字符数用 `CHAR_LENGTH()`。`SUBSTRING_INDEX()` 替代 `SPLIT_PART()`。

### 1.2 日期函数 (Date/Time Functions)

| 函数 | 说明 | 示例 (PG) |
|------|------|-----------|
| `CURRENT_DATE` | 当前日期 | `2026-05-26` |
| `NOW()` | 当前时间戳 | `2026-05-26 14:30:00+08` |
| `DATE_TRUNC('month', d)` | 按粒度截断 | `DATE_TRUNC('year', '2026-05-26')` → `2026-01-01` |
| `EXTRACT(field FROM d)` | 提取年月日等 | `EXTRACT(YEAR FROM '2026-05-26')` → `2026` |
| `AGE(d1, d2)` | 日期差 (PG) | `AGE('2026-05-26', '2026-01-01')` → `4 mons 25 days` |
| `d1 - d2` | 日期差天数 | `'2026-05-26'::date - '2026-05-01'::date` → `25` |
| `DATE_ADD(d, INTERVAL n DAY)` | 日期加减 (MySQL) | `DATE_ADD('2026-05-26', INTERVAL 1 MONTH)` |
| `INTERVAL '1 day'` | 时间间隔 (PG) | `'2026-05-26'::date + INTERVAL '7 days'` |
| `TO_CHAR(d, fmt)` | 格式化输出 (PG) | `TO_CHAR(NOW(), 'YYYY-MM-DD')` |
| `LAST_DAY(d)` | 月末日 (MySQL) | `LAST_DAY('2026-05-26')` → `2026-05-31` |

**常用格式化模式：** `YYYY-MM-DD` (ISO 日期), `YYYY-MM-DD HH24:MI:SS` (完整时间戳), `YYYY-MM` (年月), `MM-DD` (月日), `Day` (星期几英文)。

### 1.3 数值函数 (Numeric Functions)

| 函数 | 说明 | 示例 |
|------|------|------|
| `ABS(x)` | 绝对值 | `ABS(-5)` → `5` |
| `ROUND(x, n)` | 四舍五入 | `ROUND(3.14159, 2)` → `3.14` |
| `CEIL(x)` / `FLOOR(x)` | 向上/向下取整 | `CEIL(3.1)` → `4`, `FLOOR(3.9)` → `3` |
| `POWER(x, y)` / `SQRT(x)` | 幂 / 平方根 | `POWER(2, 10)` → `1024` |
| `MOD(x, y)` | 取余 | `MOD(10, 3)` → `1` |
| `RANDOM()` | 0-1 随机数 (PG) | `RANDOM()` → `0.3745...` |
| `LEAST(a, b, ...)` / `GREATEST(a, b, ...)` | 最小值 / 最大值 | `LEAST(3, 7, 1)` → `1` |
| `LN(x)` / `LOG(x)` | 自然对数 / 对数 | `LN(2.718)` ≈ `1` |

### 1.4 聚合函数 (Aggregate Functions)

| 函数 | 说明 | 注意事项 |
|------|------|----------|
| `COUNT(*)` | 行数计数 | `COUNT(1)` 等价 |
| `COUNT(DISTINCT col)` | 去重计数 | 大表性能差，可用近似算法替代 |
| `SUM(col)` | 求和 | NULL 跳过 |
| `AVG(col)` | 平均值 | NULL 不参与计算 |
| `MAX(col)` / `MIN(col)` | 最大值 / 最小值 | 日期和字符串也可用 |
| `STDDEV_POP(col)` / `STDDEV_SAMP(col)` | 总体/样本标准差 | PG / MySQL 支持 |
| `VAR_POP(col)` / `VAR_SAMP(col)` | 总体/样本方差 | PG / MySQL 支持 |
| `PERCENTILE_CONT(p) WITHIN GROUP(ORDER BY col)` | 连续百分位数 (PG) | 返回插值 |
| `PERCENTILE_DISC(p) WITHIN GROUP(ORDER BY col)` | 离散百分位数 (PG) | 返回实际值 |
| `APPROX_COUNT_DISTINCT(col)` | 近似去重 (BigQuery) | HyperLogLog 算法 |

### 1.5 窗口函数 (Window Functions)

**语法模板：**

```sql
<函数>() OVER (
  [PARTITION BY col1, col2, ...]
  [ORDER BY col1 [ASC|DESC], ...]
  [ROWS | RANGE | GROUPS BETWEEN ... AND ...]
)
```

**常用窗口函数：**

| 函数 | 说明 | 典型场景 |
|------|------|----------|
| `ROW_NUMBER()` | 唯一递增序号 (1,2,3...) | 去重、Top-N |
| `RANK()` | 并列跳过 (1,1,3...) | 排名 |
| `DENSE_RANK()` | 并列不跳过 (1,1,2...) | 紧凑排名 |
| `NTILE(n)` | 均分桶 (1~n) | 四分位、十分位 |
| `LAG(col, n, default)` | 上移 n 行 | 同环比 |
| `LEAD(col, n, default)` | 下移 n 行 | 下期值对比 |
| `FIRST_VALUE(col)` | 分区首行 | 累计首单 |
| `LAST_VALUE(col)` | 分区末行 | 配合 Frame 使用 |
| `SUM(col) OVER (...)` | 累计求和 | 累计销售额 |
| `AVG(col) OVER (...)` | 移动平均 | 平滑曲线 |

**Frame 子句说明：**

- `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW` — 从分区开始到当前行（累加）
- `ROWS BETWEEN 6 PRECEDING AND CURRENT ROW` — 最近 7 行（移动平均）
- `RANGE BETWEEN INTERVAL '7' DAY PRECEDING AND CURRENT ROW` — 近 7 天窗口
- `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING` — 全分区

**⚠️ 常见陷阱：** `ORDER BY` 缺省时窗口为全分区；有 `ORDER BY` 时默认为 `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`（非全分区）。

---

## 二、Pandas 常用操作速查

### 2.1 读写数据 (I/O)

```python
import pandas as pd

# CSV
df = pd.read_csv('file.csv', encoding='utf-8')
df.to_csv('out.csv', index=False)

# Excel
df = pd.read_excel('file.xlsx', sheet_name='Sheet1')
df.to_excel('out.xlsx', sheet_name='Sheet1', index=False)

# SQL
from sqlalchemy import create_engine
engine = create_engine('postgresql://user:pass@host/db')
df = pd.read_sql('SELECT * FROM table', engine)
df.to_sql('table', engine, if_exists='replace', index=False)

# JSON
df = pd.read_json('file.json')
df.to_json('out.json', orient='records', force_ascii=False)

# Parquet (高效列存)
df = pd.read_parquet('file.parquet')
df.to_parquet('out.parquet', index=False)
```

### 2.2 数据查看与选择

| 操作 | 代码 | 说明 |
|------|------|------|
| 查看前 n 行 | `df.head(n)` | 默认 5 行 |
| 基本信息 | `df.info()` | 列名、非空数、数据类型 |
| 描述统计 | `df.describe()` | 数值列统计摘要 |
| 列数据类型 | `df.dtypes` | 每列类型 |
| 选单列 | `df['col']` | 返回 Series |
| 选多列 | `df[['col1', 'col2']]` | 返回 DataFrame |
| 按位置选行 | `df.iloc[0:5, :]` | 前 5 行 |
| 按标签选行 | `df.loc[df['col'] > 0, :]` | 条件筛选 |
| 按条件筛选 | `df[(df['a'] > 0) & (df['b'] < 10)]` | 与条件 |
| `query()` 筛选 | `df.query('a > 0 and b < 10')` | 字符串表达式筛选 |

### 2.3 数据清洗

```python
# 检查缺失值
df.isna().sum()

# 填充缺失值
df['col'].fillna(0, inplace=True)                     # 固定值填充
df['col'].fillna(df['col'].median(), inplace=True)     # 中位数填充
df['col'].ffill(inplace=True)                          # 向前填充
df['col'].bfill(inplace=True)                          # 向后填充

# 删除缺失行/列
df.dropna(subset=['col1', 'col2'], how='any')
df.dropna(axis=1, thresh=len(df) * 0.5)  # 删除缺失超 50% 的列

# 重复值处理
df.duplicated(subset=['col1', 'col2'], keep='first')
df.drop_duplicates(subset=['col1'], keep='last')

# 类型转换
df['col'] = df['col'].astype('float64')
df['date'] = pd.to_datetime(df['date'], format='%Y-%m-%d')

# 异常值处理
df = df[df['value'].between(df['value'].quantile(0.01), df['value'].quantile(0.99))]
```

### 2.4 分组聚合 (GroupBy)

| 操作 | 代码 |
|------|------|
| 单列分组、单聚合 | `df.groupby('col1')['value'].sum()` |
| 多列分组、多聚合 | `df.groupby(['col1', 'col2']).agg({'value': 'sum', 'count': 'mean'})` |
| 多种聚合同时 | `df.groupby('col1')['value'].agg(['sum', 'mean', 'std', 'count'])` |
| 命名聚合 (新列名) | `df.groupby('col1').agg(avg_val=('value', 'mean'), sum_val=('value', 'sum'))` |
| transform | `df['pct'] = df['value'] / df.groupby('col1')['value'].transform('sum')` |

### 2.5 数据合并 (Merge / Join / Concat)

```python
# 类似 SQL JOIN
pd.merge(df1, df2, on='key', how='inner')           # INNER JOIN
pd.merge(df1, df2, on='key', how='left')             # LEFT JOIN
pd.merge(df1, df2, left_on='k1', right_on='k2')      # 不同键名

# 纵向拼接
pd.concat([df1, df2], axis=0, ignore_index=True)

# 横向拼接
pd.concat([df1, df2], axis=1)
```

### 2.6 数据透视与变形

```python
# 透视表
pd.pivot_table(df, values='sales', index='region',
               columns='category', aggfunc='sum', margins=True)

# 行列转换 (melt — 宽表转长表)
pd.melt(df, id_vars=['region'], value_vars=['Q1', 'Q2', 'Q3', 'Q4'],
        var_name='quarter', value_name='sales')

# 交叉表
pd.crosstab(df['region'], df['category'], normalize='index')
```

### 2.7 时间序列

```python
# 设置时间索引
df.set_index('date', inplace=True)
df.index = pd.to_datetime(df.index)

# 重采样 (Resample)
df.resample('D').sum()       # 按天聚合
df.resample('W-MON').mean()  # 按周 (周一为起始)
df.resample('ME').sum()      # 按月 (月末)

# 滚动窗口
df['rolling_7d'] = df['sales'].rolling(window=7).mean()
df['expanding_sum'] = df['sales'].expanding().sum()

# 时间差
(df['end_date'] - df['start_date']).dt.days
```

### 2.8 常用链式操作

```python
(df
 .query('amount > 0')
 .groupby('category')
 .agg(total=('amount', 'sum'), count=('id', 'nunique'))
 .sort_values('total', ascending=False)
 .reset_index()
 .assign(rank=lambda x: x['total'].rank(ascending=False))
)
```

---

## 三、统计学公式速查

### 3.1 描述统计

| 统计量 | 公式 / 说明 |
|--------|-------------|
| **均值 (Mean)** | $\bar{x} = \frac{1}{n}\sum_{i=1}^{n} x_i$ |
| **中位数 (Median)** | 排序后处在中间位置的数 |
| **众数 (Mode)** | 出现频率最高的数 |
| **方差 (Variance)** | $\sigma^2 = \frac{1}{n}\sum(x_i - \bar{x})^2$ (总体) |
| **标准差 (Std Dev)** | $\sigma = \sqrt{\sigma^2}$ |
| **变异系数 (CV)** | $\frac{\sigma}{\bar{x}} \times 100\%$，无量纲比较离散程度 |
| **偏度 (Skewness)** | $\frac{1}{n}\sum(\frac{x_i - \bar{x}}{\sigma})^3$，>0 右偏 |
| **峰度 (Kurtosis)** | $\frac{1}{n}\sum(\frac{x_i - \bar{x}}{\sigma})^4 - 3$，>0 尖峰 |
| **四分位距 (IQR)** | $Q3 - Q1$，异常值检测常用 |
| **协方差 (Covariance)** | $Cov(X,Y) = \frac{1}{n}\sum(x_i-\bar{x})(y_i-\bar{y})$ |
| **相关系数 (Pearson r)** | $r = \frac{Cov(X,Y)}{\sigma_X \sigma_Y}$，-1 ~ 1 |

### 3.2 常见分布

| 分布 | 参数 | 均值 | 方差 | 适用场景 |
|------|------|------|------|----------|
| **正态分布 $N(\mu, \sigma^2)$** | $\mu$ 位置, $\sigma$ 尺度 | $\mu$ | $\sigma^2$ | 自然界大部分连续变量 |
| **标准正态分布 $N(0,1)$** | — | 0 | 1 | Z 检验、标准化 |
| **二项分布 $B(n,p)$** | $n$ 试验次数, $p$ 成功概率 | $np$ | $np(1-p)$ | 转化率、A/B Test 计数 |
| **泊松分布 $Pois(\lambda)$** | $\lambda$ 平均发生率 | $\lambda$ | $\lambda$ | 单位时间事件数 |
| **均匀分布 $U(a,b)$** | $a$ 下限, $b$ 上限 | $\frac{a+b}{2}$ | $\frac{(b-a)^2}{12}$ | 随机数生成 |
| **指数分布 $Exp(\lambda)$** | $\lambda$ 率参数 | $\frac{1}{\lambda}$ | $\frac{1}{\lambda^2}$ | 时间间隔、生存分析 |
| **t 分布 $t(k)$** | $k$ 自由度 | 0 ($k>1$) | $\frac{k}{k-2}$ ($k>2$) | 小样本均值检验 |
| **卡方分布 $\chi^2(k)$** | $k$ 自由度 | $k$ | $2k$ | 分类变量独立性检验 |
| **F 分布 $F(d1,d2)$** | $d1,d2$ 自由度 | $\frac{d2}{d2-2}$ | — | 方差分析 (ANOVA) |

### 3.3 推断统计与检验

| 检验方法 | 适用场景 | 检验统计量 | 前提条件 |
|----------|----------|-----------|----------|
| **Z 检验** | 大样本均值比较 ($n \geq 30$) | $Z = \frac{\bar{x}-\mu_0}{\sigma/\sqrt{n}}$ | 总体方差已知 |
| **单样本 t 检验** | 样本均值 vs 总体均值 | $t = \frac{\bar{x}-\mu_0}{s/\sqrt{n}}$ | 数据近似正态 |
| **双样本 t 检验** | 两组均值比较 | $t = \frac{\bar{x}_1-\bar{x}_2}{\sqrt{s_p^2(\frac{1}{n_1}+\frac{1}{n_2})}}$ | 独立、正态、方差齐 |
| **配对 t 检验** | 前后对比 / 配对设计 | $t = \frac{\bar{d}}{s_d/\sqrt{n}}$ | 差值正态 |
| **卡方检验** | 分类变量独立性 | $\chi^2=\sum\frac{(O-E)^2}{E}$ | 期望频数 ≥ 5 |
| **Fisher 精确检验** | $2\times 2$ 小样本 | — | 小样本 ($n<20$) |
| **ANOVA (F 检验)** | 三组及以上均值比较 | $F = \frac{MS_{between}}{MS_{within}}$ | 正态、独立、方差齐 |
| **Mann-Whitney U** | 非参数两样本比较 | U 统计量 | 不满足正态性 |
| **Kruskal-Wallis H** | 非参数多样本比较 | H 统计量 | ANOVA 的非参数替代 |

### 3.4 效应量与置信区间

| 指标 | 公式 / 说明 | 解释 |
|------|-------------|------|
| **Cohen's d** | $\frac{\bar{x}_1 - \bar{x}_2}{s_{pooled}}$ | 0.2 小 / 0.5 中 / 0.8 大效应 |
| **95% 置信区间 (均值)** | $\bar{x} \pm t_{\alpha/2, n-1} \times \frac{s}{\sqrt{n}}$ | 重复抽样 95% 包含总体均值 |
| **置信区间 (比例)** | $\hat{p} \pm z_{\alpha/2} \sqrt{\frac{\hat{p}(1-\hat{p})}{n}}$ | 转化率等比例指标 |

### 3.5 贝叶斯基础

- **先验概率 (Prior)** $P(A)$：实验前的信念
- **似然 (Likelihood)** $P(B|A)$：数据在假设下的概率
- **后验概率 (Posterior)** $P(A|B) = \frac{P(B|A)P(A)}{P(B)}$：更新后的信念
- **贝叶斯因子 (Bayes Factor)** $BF = \frac{P(Data|H_1)}{P(Data|H_0)}$：假设比较

---

## 四、命令行与 Git 常用命令

### 4.1 命令行基础 (Linux / macOS)

| 命令 | 说明 | 常用参数 |
|------|------|----------|
| `ls` | 列出文件 | `-la` 列表含隐藏, `-lh` 人类可读大小 |
| `cd dir` | 切换目录 | `cd ..` 上级, `cd ~` 家目录 |
| `pwd` | 当前路径 | — |
| `mkdir dir` | 创建目录 | `-p` 递归创建 |
| `cp src dst` | 复制 | `-r` 递归复制目录 |
| `mv src dst` | 移动或重命名 | — |
| `rm file` | 删除 | `-rf` 递归强制（谨慎！） |
| `cat file` | 查看文件内容 | — |
| `less file` | 分页查看 | 按 `q` 退出 |
| `head -n 20 file` | 查看前 20 行 | `-n` 行数 |
| `tail -n 20 file` | 查看后 20 行 | `-f` 实时跟踪 |
| `grep pattern file` | 搜索文本 | `-i` 忽略大小写, `-r` 递归, `-E` 扩展正则 |
| `wc file` | 行/词/字符计数 | `-l` 仅行数 |
| `sort file` | 排序 | `-n` 数值排序, `-k` 指定列 |
| `uniq` | 去重相邻重复行 | 常与 `sort` 配合: `sort file \| uniq -c` |
| `cut -d',' -f1 file` | 按分隔符截取列 | `-d` 分隔符, `-f` 字段 |
| `awk '{print $1}'` | 文本处理 | `-F` 指定分隔符 |
| `sed 's/a/b/g' file` | 流式替换 | `-i` 直接修改文件 |
| `find . -name "*.csv"` | 查找文件 | `-type f` 仅文件, `-mtime -7` 7天内修改 |
| `xargs` | 参数传递 | `find . -name "*.tmp" \| xargs rm` |
| `tar czf out.tar.gz dir/` | 压缩 | `-xzf` 解压 |
| `du -sh *` | 查看目录大小 | `-h` 人类可读 |
| `df -h` | 磁盘使用情况 | — |
| `ps aux \| grep python` | 查看进程 | — |
| `chmod +x file` | 添加执行权限 | `755` 常用权限 |
| `watch -n 5 cmd` | 每 5 秒执行一次 | macOS: `brew install watch` |

### 4.2 Git 常用命令

| 命令 | 说明 | 常用场景 |
|------|------|----------|
| `git init` | 初始化仓库 | 新项目开始 |
| `git clone url` | 克隆远程仓库 | 拉取项目代码 |
| `git status` | 查看工作区状态 | 随时检查 |
| `git add file` | 添加文件到暂存区 | `git add .` 添加全部 |
| `git commit -m "msg"` | 提交 | `-a` 跳过 add 直接提交已跟踪文件 |
| `git log` | 查看提交历史 | `--oneline --graph` 简洁视图 |
| `git diff` | 查看工作区修改 | `--staged` 查看暂存区差异 |
| `git branch` | 分支管理 | `-a` 全部分支, `-d` 删除分支, `-m` 重命名 |
| `git checkout branch` | 切换分支 | `-b` 创建并切换 |
| `git switch branch` | 切换分支 (新语法) | `-c` 创建并切换 |
| `git merge branch` | 合并分支 | `--no-ff` 保留分支历史 |
| `git rebase branch` | 变基 | `-i HEAD~3` 交互式重写最近 3 个提交 |
| `git pull` | 拉取 + 合并 | `--rebase` 以 rebase 方式拉取 |
| `git push` | 推送 | `-u origin branch` 首次推送建立关联 |
| `git stash` | 暂存当前改动 | `pop` 恢复, `list` 查看列表 |
| `git remote -v` | 查看远程仓库 | `add / rm` 增删远程仓库 |
| `git reset HEAD~1` | 撤销当前提交 | `--soft` 保留工作区, `--hard` 丢弃 |
| `git revert commit` | 安全撤销（推荐） | 创建一个反提交 |
| `git cherry-pick commit` | 选取特定提交 | 将某个提交应用到当前分支 |
| `git tag v1.0` | 打标签 | `-a` 注解标签 |
| `git blame file` | 查看每行最后修改者 | 排查历史变更 |
| `git reflog` | 操作历史（救援用） | 找回误删的提交 |

### 4.3 管道与重定向 (Pipeline & Redirection)

```bash
# 标准输出重定向
command > file     # 覆盖写入
command >> file    # 追加写入

# 管道
command1 | command2 | command3

# 经典组合：统计日志中某个状态码出现次数
cat access.log | grep ' 500 ' | awk '{print $1}' | sort | uniq -c | sort -rn

# 查找最大的 5 个 CSV 文件
find . -name "*.csv" -exec ls -lh {} \; | sort -k5 -rh | head -5

# 统计代码行数
find . -name "*.py" | xargs wc -l | tail -1
```
