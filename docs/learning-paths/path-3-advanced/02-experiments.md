# 实验与因果推断

> 理解因果关系的分析方法。深入参考请见 [KM 9. 实验与因果推断](/knowledge-map/km-9-experiments)。

## A/B Testing 进阶

- **MDE (Minimum Detectable Effect)**：样本量计算的核心参数
- **SRM 检测**：用卡方检验验证分流是否均匀
- **Multiple Testing Correction**：Bonferroni / Benjamini-Hochberg

## 准实验方法

当随机化不可行时：
- **DID（双重差分）**：比较实验组 vs 对照组在策略前后的变化差异
- **RDD（断点回归）**：利用阈值的天然断点（如 60 分及格）
- **Synthetic Control**：构建合成对照组

> 深入了解请参阅 [KM 9. 实验与因果推断](/knowledge-map/km-9-experiments)。
