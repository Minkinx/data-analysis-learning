# 统计学与概率论

> 数据分析的理论基石。从描述统计到推断统计，从假设检验到贝叶斯思维，掌握这些工具让你能从数据中做出可信的结论。

## 描述统计（Descriptive Statistics）

### 集中趋势

| 指标 | 适用场景 | 注意 |
|------|---------|------|
| 均值（Mean） | 数据对称且无异常值 | 对异常值敏感 |
| 中位数（Median） | 偏态分布或有异常值 | 稳健但不参与代数运算 |
| 众数（Mode） | 分类变量或离散变量 | 可能存在多个众数 |

### 离散程度

- **方差（Variance）** — 偏离均值的平方均值。对异常值敏感。
- **标准差（Standard Deviation）** — 方差的平方根，与原数据同单位。
- **IQR（Interquartile Range）** — Q3 - Q1，箱线图的核心指标，稳健。
- **CV（Coefficient of Variation）** — `std / mean`，无量纲，用于比较不同量纲数据的离散程度。

### 分布形状

```python
import scipy.stats as stats

# 偏度 (Skewness) — 0 为对称，>0 右偏，<0 左偏
stats.skew(data)

# 峰度 (Kurtosis) — 正态分布峰度为 3（或 0 经 Fisher 校正）
stats.kurtosis(data, fisher=True)
```

## 概率论基础

### 核心概念

- **概率公理**：P(Ω) = 1，0 ≤ P(A) ≤ 1，互斥事件可加
- **条件概率**：P(A|B) = P(A ∩ B) / P(B)
- **独立性**：P(A ∩ B) = P(A) P(B)

### 贝叶斯定理

```
P(A|B) = P(B|A) * P(A) / P(B)
```

核心思想：用观测数据更新对假设的信念。

```python
# P(disease | positive) 计算示例
p_disease = 0.01                     # 先验概率 Prior
p_pos_given_disease = 0.99          # Likelihood
p_pos_given_healthy = 0.02          # 误报率
p_pos = p_disease * p_pos_given_disease + (1 - p_disease) * p_pos_given_healthy
p_disease_given_pos = p_pos_given_disease * p_disease / p_pos
print(f"P(disease|positive) = {p_disease_given_pos:.2%}")  # ≈ 33%
```

### 常见分布

| 分布 | 类型 | 参数 | 典型场景 |
|------|------|------|---------|
| 正态分布 | 连续 | μ, σ | 自然测量值、误差项 |
| 二项分布 | 离散 | n, p | 转化次数、成功/失败计数 |
| 泊松分布 | 离散 | λ | 单位时间事件数、访客到达数 |
| 指数分布 | 连续 | λ | 事件间隔时间 |
| 均匀分布 | 连续 | a, b | 无信息先验 |

## 抽样与估计

### 抽样方法

- **简单随机抽样** — 等概率抽取，基准方法
- **分层抽样（Stratified Sampling）** — 按子群体分层后均匀抽样，降低组间方差
- **整群抽样（Cluster Sampling）** — 按群体整群抽取，经济高效

### 点估计与区间估计

```python
import scipy.stats as st

# 均值的 95% 置信区间
ci = st.t.interval(0.95, df=len(data)-1,
                   loc=np.mean(data),
                   scale=st.sem(data))
```

### 中心极限定理（CLT）

无论总体分布是什么，当样本量 **n ≥ 30** 时，样本均值的分布近似正态分布：
- 均值 = 总体均值 μ
- 标准误 = σ / √n

::: tip CLT 的实际意义
CLT 是假设检验和置信区间的数学基础，它让我们无需假设总体分布就能对均值做推断。但要注意：n ≥ 30 是经验法则，对于高度偏态的分布可能需要更大的 n。
:::

## 假设检验（Hypothesis Testing）

### 检验流程

1. **设定假设**：H₀（零假设，无效应）vs H₁（备择假设，有效应）
2. **选择检验**：根据数据类型和研究设计选择统计量
3. **计算 p-value**：在 H₀ 为真的前提下，观察到当前结果或更极端结果的概率
4. **做出结论**：p < α 则拒绝 H₀（α 通常取 0.05）

### 常用检验速查

| 检验 | 用途 | 数据类型 | 前提 |
|------|------|---------|------|
| t 检验 | 两组均值比较 | 连续 | 正态性、方差齐性 |
| 配对 t 检验 | 前后对比 | 连续配对 | 差值正态 |
| 卡方检验 | 分类变量独立性 | 分类 | 期望频数 ≥ 5 |
| ANOVA | 多组均值比较 | 连续 | 正态、方差齐、独立 |
| Mann-Whitney U | 两组秩比较 | 连续/有序 | 无正态假设 |
| KS 检验 | 两组分布比较 | 连续 | 无参数假设 |

```python
from scipy.stats import ttest_ind, chi2_contingency, mannwhitneyu

# 独立样本 t 检验
t_stat, p_value = ttest_ind(group_a, group_b)

# 卡方检验
chi2, p, dof, expected = chi2_contingency(pd.crosstab(df["group"], df["outcome"]))

# Mann-Whitney U（t 检验的非参数替代）
u_stat, p_value = mannwhitneyu(group_a, group_b, alternative="two-sided")
```

### 两类错误

| | H₀ 真 | H₀ 假 |
|--|--------|--------|
| 不拒绝 H₀ | ✓ 正确 | Type II Error (β) |
| 拒绝 H₀ | Type I Error (α) | ✓ **Power = 1-β** |

## 相关与回归

```python
from scipy.stats import pearsonr, spearmanr

# Pearson 相关系数（线性相关）
r, p = pearsonr(x, y)

# Spearman 秩相关系数（单调相关，稳健）
rho, p = spearmanr(x, y)
```

| 指标 | 范围 | 含义 |
|------|------|------|
| r = 0 | — | 无线性关系（但可能有非线性关系） |
| \|r\| ≥ 0.7 | 强相关 | 注意混淆变量 |
| 0.3 ≤ \|r\| < 0.7 | 中等相关 | 通常有意义 |
| \|r\| < 0.3 | 弱相关 | 实际意义有限 |

## 贝叶斯统计

- **Prior** — 先验，数据收集前对假设的信念
- **Likelihood** — 似然，数据在给定假设下的概率
- **Posterior** — 后验，结合先验和数据后的更新信念
- **Naive Bayes** — 假设特征独立，常用于文本分类和垃圾过滤

```python
# Posterior ∝ Likelihood × Prior
posterior = likelihood * prior / evidence
```

## 统计陷阱

| 陷阱 | 说明 | 避免方法 |
|------|------|---------|
| **Simpson's Paradox** | 分组趋势与合并趋势相反 | 检查混杂变量，按层分析 |
| **Survivorship Bias** | 只看到"幸存者" | 明确样本选择过程 |
| **Data Snooping** | 同一数据做多次假设检验 | 样本分割、多重比较校正 |
| **p-hacking** | 选择性地报告显著结果 | 预先注册分析计划 |
| **Confirmation Bias** | 只找支持自己假设的证据 | 主动寻找反证 |

## 相关文章

- [Python 数据分析](/knowledge-map/km-2-python) — 统计计算的工程实现
- [实验与因果推断](/knowledge-map/km-9-experiments) — A/B 测试与因果推断
- [机器学习基础](/knowledge-map/km-11-ml) — 模型评估与特征工程
