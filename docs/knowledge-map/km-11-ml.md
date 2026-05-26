# 机器学习基础

> 面向数据分析师的机器学习入门。重点不在于推导公式，而在于理解核心概念、适用场景、模型评价以及与分析的结合方式。

## 核心概念

### 机器学习分类

| 类型 | 定义 | 典型任务 |
|------|------|---------|
| 监督学习（Supervised） | 给定输入-输出对学习映射 | 回归、分类、排序 |
| 无监督学习（Unsupervised） | 无标签，发现数据结构 | 聚类、降维、异常检测 |
| 半监督学习 | 少量标签 + 大量无标签 | 标签成本高的场景 |
| 强化学习（Reinforcement） | 智能体通过交互学习策略 | 推荐、游戏、对话 |

### 过拟合与欠拟合

| 问题 | 表现 | 原因 | 解决 |
|------|------|------|------|
| 过拟合 | 训练集好，测试集差 | 模型过于灵活或数据噪声 | 正则化、剪枝、更多数据 |
| 欠拟合 | 训练集和测试集都差 | 模型容量不足 | 增加特征、提升模型复杂度 |

### 偏差-方差权衡（Bias-Variance Tradeoff）

- **高偏差（Bias）** — 模型过于简单，拟合不足
- **高方差（Variance）** — 模型过于复杂，对训练数据抖动敏感
- **目标**：在偏差和方差之间找到平衡，使总误差最小

## 特征工程

### 特征编码

| 方法 | 适用 | 说明 |
|------|------|------|
| One-Hot Encoding | 无序分类变量 | 增加维度，注意稀疏性 |
| Label Encoding | 有序分类变量 | 保留顺序信息 |
| Target Encoding | 高基数分类变量 | 用目标均值替换，需交叉验证防过拟合 |

### 标准化与归一化

```python
from sklearn.preprocessing import StandardScaler, MinMaxScaler

scaler = StandardScaler()          # Z-score：均值为 0，标准差为 1
X_scaled = scaler.fit_transform(X)

scaler = MinMaxScaler()            # 缩放到 [0, 1]
X_norm = scaler.fit_transform(X)
```

### 特征选择与降维

```python
from sklearn.feature_selection import SelectKBest, f_regression
from sklearn.linear_model import Lasso
from sklearn.decomposition import PCA

# 过滤法
selector = SelectKBest(score_func=f_regression, k=10)
X_selected = selector.fit_transform(X, y)

# 嵌入法（L1 自动选择）
lasso = Lasso(alpha=0.01); lasso.fit(X, y)
selected = X.columns[lasso.coef_ != 0]

# PCA 降维
pca = PCA(n_components=2)
X_pca = pca.fit_transform(X_scaled)
```

## 模型速查

### 回归

| 模型 | 特点 | 何时使用 |
|------|------|---------|
| 线性回归 | 可解释性强，假设线性关系 | 基线模型 |
| Ridge (L2) | 收缩系数，保留所有特征 | 特征多，共线性强 |
| Lasso (L1) | 自动特征选择，系数可为零 | 高维稀疏特征 |

### 分类

| 模型 | 优点 | 缺点 |
|------|------|------|
| Logistic Regression | 可解释，概率输出 | 欠灵活 |
| Decision Tree | 直观可解释，非线性 | 易过拟合 |
| Random Forest | 鲁棒，无需过多调参 | 模型大，可解释性弱 |
| XGBoost / LightGBM | 精度高，竞赛首选 | 调参较多 |

```python
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier

# Random Forest
rf = RandomForestClassifier(n_estimators=100, max_depth=5)
rf.fit(X_train, y_train)
rf.feature_importances_              # 特征重要性

# XGBoost
xgb = XGBClassifier(n_estimators=100, learning_rate=0.1)
xgb.fit(X_train, y_train, eval_set=[(X_val, y_val)], early_stopping_rounds=10)
```

### 聚类

| 模型 | 原理 | 关键参数 | 适用场景 |
|------|------|---------|---------|
| K-Means | 基于中心点的迭代分配 | k（簇数量） | 球形簇，大数据量 |
| DBSCAN | 基于密度 | eps, min_samples | 任意形状簇，异常检测 |
| Hierarchical | 层次聚类树 | 链接方法 | 小数据量，需层次结构 |

```python
from sklearn.cluster import KMeans, DBSCAN

kmeans = KMeans(n_clusters=5, random_state=42)
df["cluster"] = kmeans.fit_predict(X)

dbscan = DBSCAN(eps=0.5, min_samples=5)
df["cluster"] = dbscan.fit_predict(X)   # label = -1 表示异常点
```

### 推荐系统

| 方法 | 原理 | 冷启动 | 适用场景 |
|------|------|--------|---------|
| 协同过滤 | 用户-物品交互矩阵 | 严重 | 有大量交互数据 |
| 基于内容 | 物品特征相似度 | 可处理 | 有物品特征描述 |
| 混合方法 | 两者结合 | 折中 | 工业实践主流 |

## 分析师视角

### 模型可解释性

```python
import shap

explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_test)
shap.summary_plot(shap_values, X_test)                     # 全局
shap.force_plot(explainer.expected_value,
                shap_values[0], X_test.iloc[0])             # 局部
```

| 方法 | 粒度 | 适用模型 |
|------|------|---------|
| 特征重要性 | 全局 | 树模型 |
| SHAP | 全局 + 局部 | 任意模型 |
| LIME | 局部 | 任意模型 |
| Partial Dependence Plot | 全局 | 任意模型 |

### 模型效果评价

```python
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, roc_auc_score, mean_squared_error, r2_score
)

# 分类
print(f"Acc={accuracy_score(y_true, y_pred):.3f}, "
      f"Prec={precision_score(y_true, y_pred):.3f}, "
      f"Rec={recall_score(y_true, y_pred):.3f}, "
      f"F1={f1_score(y_true, y_pred):.3f}, "
      f"AUC={roc_auc_score(y_true, y_prob):.3f}")

# 回归
print(f"MSE={mean_squared_error(y_true, y_pred):.3f}, "
      f"R²={r2_score(y_true, y_pred):.3f}")
```

### 模型监控

部署后需持续监控以下维度：

- **数据漂移（Data Drift）** — 输入特征分布 vs 训练分布
- **标签漂移（Label Drift）** — 目标变量分布是否变化
- **效果衰减** — AUC/准确率是否随时间下降

```python
# Population Stability Index
def psi(expected, actual, bins=10):
    e = np.histogram(expected, bins=bins, range=(0,1))[0] / len(expected)
    a = np.histogram(actual, bins=bins, range=(0,1))[0] / len(actual)
    return np.sum((a - e) * np.log(a / e))   # <0.1 稳定；0.1-0.25 需关注
```

## 相关文章

- [统计学与概率论](/knowledge-map/km-3-statistics) — 模型推断的统计基础
- [实验与因果推断](/knowledge-map/km-9-experiments) — 因果推断与效果评价
- [Python 数据分析](/knowledge-map/km-2-python) — 特征工程的工程实现
