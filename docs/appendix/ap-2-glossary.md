# 📖 术语表

> BI / 数据分析领域常用中英文术语解释，按字母序排列。每个条目包含中文名称、英文全称与简要说明。

---

## A

| 术语 | 全称 | 说明 |
|------|------|------|
| **AARRR 模型** | Acquisition - Activation - Retention - Revenue - Referral | 海盗指标，用户生命周期分析的经典框架。分别对应：用户获取、激活、留存、收入、自传播 |
| **AB 测试 (A/B Testing)** | — | 随机分流实验，将用户分为实验组和对照组，比较不同版本的差异以验证假设 |
| **ACP** | Average Collection Period | 平均回款周期，反映企业应收账款回收效率的指标 |
| **Ad-hoc 分析** | — | 临时性、一次性的数据分析请求，通常由业务方紧急提出 |
| **API** | Application Programming Interface | 应用程序编程接口，数据工具之间通信的标准化方式 |
| **ARIMA** | Autoregressive Integrated Moving Average | 自回归积分滑动平均模型，用于时间序列预测的经典统计方法 |
| **ARPDAU** | Average Revenue Per Daily Active User | 每活跃用户日均收入 = 日总收入 / DAU |
| **ARPPU** | Average Revenue Per Paying User | 每付费用户平均收入 = 总收入 / 付费用户数 |
| **ARPU** | Average Revenue Per User | 每用户平均收入 = 总收入 / 用户总数（含非付费用户） |
| **AUC** | Area Under the ROC Curve | ROC 曲线下面积，衡量二分类模型区分能力的综合指标，AUC=1 为完美，AUC=0.5 为随机 |

## B

| 术语 | 全称 | 说明 |
|------|------|------|
| **BI** | Business Intelligence | 商业智能，通过数据分析和可视化工具辅助业务决策的体系 |
| **BIA** | Business Impact Analysis | 业务影响分析，评估数据问题对业务造成的影响程度 |
| **Bootstrap** | — | 自助法，通过对样本有放回地重复抽样来估计统计量分布的非参数方法 |
| **BQ** | BigQuery | Google Cloud 的 Serverless 数据仓库服务，支持标准 SQL |

## C

| 术语 | 全称 | 说明 |
|------|------|------|
| **CAC** | Customer Acquisition Cost | 客户获取成本 = 总营销费用 / 新增客户数 |
| **CAGR** | Compound Annual Growth Rate | 复合年增长率 = (终值/初值)^(1/n) - 1 |
| **Cardinality** | — | 基数，指某列中不重复值的数量。高基数列（如用户ID）的聚合和索引策略不同于低基数列（如性别） |
| **CDP** | Customer Data Platform | 客户数据平台，整合多渠道客户数据构建统一用户画像的系统 |
| **Churn Rate** | — | 流失率，一段时间内停止使用产品的用户比例。月流失率 = 当月流失用户数 / 月初用户数 |
| **CLV / LTV** | Customer Lifetime Value | 用户生命周期价值，一个用户从开始到结束使用产品期间贡献的总收入 |
| **Cohort 分析** | — | 同期群分析，将用户按首次行为时间分组，跟踪各组后续表现，消除时间偏移效应 |
| **CPI / CPA** | Cost Per Install / Cost Per Acquisition | 每安装成本 / 每获取成本，移动应用推广中常用的计费方式 |
| **CSV** | Comma-Separated Values | 逗号分隔值，最通用的数据交换格式之一，简单但缺乏数据类型信息 |
| **CTE** | Common Table Expression | 公用表表达式，SQL 中使用 WITH 子句定义的临时命名结果集，提高复杂查询的可读性 |
| **CTR** | Click-Through Rate | 点击率 = 点击次数 / 展示次数。衡量广告或推荐效果的基础指标 |

## D

| 术语 | 全称 | 说明 |
|------|------|------|
| **Dashboard** | — | 仪表盘，将关键指标可视化集中展示的页面，服务于监控和决策场景 |
| **DAU / MAU / WAU** | Daily / Monthly / Weekly Active Users | 日/月/周活跃用户数，衡量用户规模的三个核心指标 |
| **DID** | Difference-in-Differences | 双重差分法，利用自然实验通过比较处理组与对照组的前后变化来估计因果效应 |
| **Dirty Data** | — | 脏数据，包含错误、缺失、不一致等质量问题的数据 |
| **DM** | Data Mart | 数据集市，面向特定业务主题的轻量级数据仓库子集 |
| **DML / DDL / DQL** | Data Manipulation / Definition / Query Language | SQL 子语言分类：DML 操作数据 (INSERT/UPDATE/DELETE), DDL 定义结构 (CREATE/ALTER), DQL 查询 (SELECT) |
| **DQC** | Data Quality Center / Check | 数据质量中心 / 数据质量检查，保障数据准确性和完整性的流程体系 |
| **DWH** | Data Warehouse | 数据仓库，面向分析的集中化数据存储系统，支持历史数据整合和复杂查询 |

## E

| 术语 | 全称 | 说明 |
|------|------|------|
| **ELT / ETL** | Extract, Load, Transform / Extract, Transform, Load | 数据集成流程：ELT 先加载再转换（现代数仓），ETL 先转换再加载（传统数仓） |
| **ETL 测试** | — | 验证 ETL 流程数据完整性的过程，包括行数对比、字段级校验、异常值检查等 |
| **Event 埋点** | — | 在应用中嵌入采集代码，追踪用户行为事件（如点击、浏览、购买），是用户行为数据的主要来源 |

## F

| 术语 | 全称 | 说明 |
|------|------|------|
| **Fact Table** | — | 事实表，存储业务事件或交易的度量数据，通常包含外键和数值型指标，行数快速增长 |
| **Funnel 分析** | — | 漏斗分析，追踪用户在多个步骤间的转化率，定位流失关键环节 |
| **FPR / TPR** | False Positive Rate / True Positive Rate | 假正率 (=FP/(FP+TN)) 与真正率 (=TP/(TP+FN))，ROC 曲线的横纵坐标 |

## G

| 术语 | 全称 | 说明 |
|------|------|------|
| **GA / GA4** | Google Analytics / Google Analytics 4 | 网站/应用分析工具，GA4 是新一代以事件为核心的分析平台 |
| **GMV** | Gross Merchandise Volume | 商品交易总额，电商平台统计的成交总金额（含未支付、退货等） |
| **GCP** | Google Cloud Platform | Google 云平台，提供 BigQuery、Dataflow、Pub/Sub 等数据服务 |
| **Granularity** | — | 粒度，数据表中每行所代表的最小单位。如"日粒度"一行代表一天，"用户粒度"一行代表一个用户 |

## H

| 术语 | 全称 | 说明 |
|------|------|------|
| **HLL** | HyperLogLog | 近似去重计数算法，以少量精度损失换取极低内存占用，广泛用于 UV 估算 |
| **HDFS** | Hadoop Distributed File System | Hadoop 分布式文件系统，大数据存储的基础组件 |
| **Hive** | — | 基于 Hadoop 的数据仓库工具，将 SQL 转化为 MapReduce 任务执行 |

## I

| 术语 | 全称 | 说明 |
|------|------|------|
| **IQR** | Interquartile Range | 四分位距 (Q3 - Q1)，用于箱线图的异常值检测 |
| **ISO 时间** | — | ISO 8601 日期时间格式，如 `2026-05-26T14:30:00+08:00`，数据交换中的标准时间格式 |
| **ITR** | Inventory Turnover Ratio | 库存周转率 = 销售成本 / 平均库存，衡量库存管理效率 |

## K

| 术语 | 全称 | 说明 |
|------|------|------|
| **KPI** | Key Performance Indicator | 关键绩效指标，衡量业务目标达成情况的量化指标，遵循 SMART 原则 |
| **KRI** | Key Risk Indicator | 关键风险指标，用于监控业务风险的先行预警指标 |

## L

| 术语 | 全称 | 说明 |
|------|------|------|
| **LAG / LEAD** | — | SQL 窗口函数，LAG 获取前 N 行值，LEAD 获取后 N 行值，常用于同环比计算 |
| **LTV / CLV** | Lifetime Value | 用户生命周期价值（见 C 组 CLV 条目） |

## M

| 术语 | 全称 | 说明 |
|------|------|------|
| **MAU** | Monthly Active Users | 月活跃用户数，通常指自然月内至少有一次有效行为的独立用户数 |
| **MDE** | Minimum Detectable Effect | 最小可检测效应，AB 实验中给定样本量和显著性水平下能可靠检测到的最小效果大小 |
| **Metrics** | — | 度量指标，对业务活动的量化描述。好的指标应具备可衡量、可行动、相关性等特征 |
| **MPP** | Massively Parallel Processing | 大规模并行处理架构，现代分析型数据库（如 ClickHouse、Greenplum）的典型架构 |
| **MRR / ARR** | Monthly / Annual Recurring Revenue | 月/年经常性收入，SaaS 行业核心指标，衡量订阅收入的稳定性和增长 |
| **MSE / MAE / RMSE** | Mean Squared / Absolute / Root Mean Squared Error | 回归模型预测误差的三种度量：MSE 放大离群值影响，MAE 对离群值更鲁棒，RMSE 与原始单位一致 |

## N

| 术语 | 全称 | 说明 |
|------|------|------|
| **NPS** | Net Promoter Score | 净推荐值，衡量用户忠诚度的指标 = 推荐者% - 贬损者%，范围 [-100, 100] |
| **NRR** | Net Revenue Retention | 净收入留存率 = (期初收入 + 扩增收入 - 流失收入) / 期初收入，SaaS 健康度核心指标，NRR > 100% 说明扩增超过流失 |
| **NULL** | — | 表示缺失值或未知值。SQL 中 NULL 不与任何值相等（包括自身），判断用 IS NULL 而非 = NULL |
| **NumPy** | — | Python 数值计算基础库，提供 N 维数组对象和线性代数函数，Pandas 的底层依赖 |

## O

| 术语 | 全称 | 说明 |
|------|------|------|
| **ODS** | Operational Data Store | 操作数据存储，近源层的贴源数据区，几乎不做业务逻辑转换 |
| **OKR** | Objectives and Key Results | 目标与关键成果法，设定定量目标和可衡量的关键结果以对齐团队方向 |
| **OLAP / OLTP** | Online Analytical / Transaction Processing | OLAP 分析型（星型/雪花模型，批量查询），OLTP 事务型（3NF，高并发单行操作） |
| **Outlier** | — | 异常值/离群点，显著偏离数据分布正常范围的观测值，需结合业务判断是否剔除 |

## P

| 术语 | 全称 | 说明 |
|------|------|------|
| **p-value** | — | p 值，在原假设为真的条件下观察到当前结果或更极端结果的概率。p < 0.05 通常认为统计显著 |
| **Parquet** | — | 列式存储格式，压缩率高、查询性能好，是大数据生态中首选的分析文件格式 |
| **PCA** | Principal Component Analysis | 主成分分析，通过正交变换将多个相关变量压缩为少数不相关的主成分，用于降维和可视化 |
| **PSM** | Propensity Score Matching | 倾向得分匹配，通过估计处理概率来匹配处理组和对照组的观察性研究因果推断方法 |
| **Power BI** | — | Microsoft 的商业智能工具，支持自助式数据分析和仪表盘共享 |
| **Presto / Trino** | — | 分布式 SQL 查询引擎，支持对异构数据源（Hive、MySQL、Kafka 等）进行联邦查询 |

## Q

| 术语 | 全称 | 说明 |
|------|------|------|
| **Quantile** | — | 分位数，将数据排序后等分为若干份的切分点。常用的有四分位数 (Q1/Q2/Q3)、十分位数、百分位数 |
| **Query Optimization** | — | 查询优化，通过调整 SQL 写法、索引策略和执行计划分析来提升查询性能 |

## R

| 术语 | 全称 | 说明 |
|------|------|------|
| **R²** | R-Squared / Coefficient of Determination | 决定系数，衡量回归模型拟合优度，范围 [0,1]，表示自变量解释因变量变异的比例 |
| **RDD** | Regression Discontinuity Design | 断点回归设计，利用某个门槛值附近的连续性假设进行因果推断的方法 |
| **RFM** | Recency - Frequency - Monetary | 基于最近消费时间、消费频率和消费金额三个维度的用户价值分层模型 |
| **ROI** | Return on Investment | 投资回报率 = (收益 - 成本) / 成本 × 100%，衡量投入产出效率 |
| **Row-Level Security (RLS)** | — | 行级安全，数据权限控制策略，确保用户只能看到其有权限的数据行 |
| **RR** | Retention Rate | 留存率，用户在首次行为后特定时间点仍在活跃的比例，通常有次日/7日/30日留存 |

## S

| 术语 | 全称 | 说明 |
|------|------|------|
| **SCD** | Slowly Changing Dimension | 缓慢变化维度，维度表中属性随时间变化的处理策略。Type 1 覆盖、Type 2 新增行、Type 3 新增列 |
| **Schema** | — | 数据模式 / 结构，描述数据库表、列、数据类型和关系的逻辑组织方式 |
| **Segment 分析** | — | 用户分群分析，根据行为或属性将用户划分为不同的细分群体以进行针对性分析 |
| **SEM / SEO** | Search Engine Marketing / Optimization | 搜索引擎营销/优化，前者为付费广告，后者为自然排名优化 |
| **SLA / SLO** | Service Level Agreement / Objective | 服务等级协议/目标，数据管道承诺的可用性和时效性指标 |
| **Slow Query Log** | — | 慢查询日志，记录执行时间超过阈值的 SQL 语句，是性能优化的重要切入点 |
| **Snowflake Schema** | — | 雪花模型，星型模型的扩展，将维度表进一步规范化拆分，减少数据冗余但增加查询复杂度 |
| **Spark** | — | 大数据统一分析引擎，支持批处理、流计算、SQL、ML 等多种工作负载 |
| **SQL** | Structured Query Language | 结构化查询语言，与关系型数据库交互的标准语言，数据分析师的核心技能 |
| **SRM** | Sample Ratio Mismatch | 样本比例不匹配，AB 实验中分流比例偏离设定的问题，通常表明实验系统或数据存在偏差 |
| **Star Schema** | — | 星型模型，事实表居中、周边连接多个维度表，是数据仓库建模中最常用的结构 |
| **Statistical Power** | — | 统计功效 = 1 - β (β 为第二类错误概率)，在效应存在时正确拒绝原假设的概率。通常要求 ≥ 0.8 |

## T

| 术语 | 全称 | 说明 |
|------|------|------|
| **Tableau** | — | 业界领先的可视化分析工具，以拖拽式操作和丰富的图表类型著称 |
| **Time-to-Conversion** | — | 转化时长，用户从首次接触到完成目标行为（如下单）所经过的时间 |
| **TMM** | Total Money Management | 资金管理总额，互联网金融平台常见指标 |
| **Tracking 规范** | — | 数据埋点规范，定义事件命名、属性字段、采集时机等标准，保证数据采集的一致性和可用性 |

## U

| 术语 | 全称 | 说明 |
|------|------|------|
| **UDAF** | User-Defined Aggregate Function | 用户自定义聚合函数，当内置聚合函数无法满足需求时编写的自定义逻辑 |
| **UDF** | User-Defined Function | 用户自定义函数，扩展 SQL 能力的机制，支持自定义数据处理逻辑 |
| **UV / PV** | Unique Visitors / Page Views | 独立访客数 / 页面浏览量，网站分析中最基础的两个流量指标 |
| **Uplift 模型** | — | 增量模型 / 增益模型，预测某个动作为用户带来的增量效果，用于精准营销的 Treatment 选择 |

## V

| 术语 | 全称 | 说明 |
|------|------|------|
| **Variance Inflation Factor (VIF)** | — | 方差膨胀因子，衡量多重共线性的严重程度，VIF > 10 表示存在严重的共线性 |
| **VLOOKUP** | — | Excel/VLookup (垂直查找函数)，用于在表格中按键值匹配查找数据，Pandas 中对应 `merge` 操作 |

## W

| 术语 | 全称 | 说明 |
|------|------|------|
| **Windowing Function** | — | 窗口函数 / 开窗函数，在保持行数不变的前提下对数据集的行分组计算，广泛用于排名、累计、同环比等场景 |
| **WIP** | Work In Progress | 进行中的工作/在制品，项目管理中正在处理但尚未完成的任务或数据管道 |

## Z

| 术语 | 全称 | 说明 |
|------|------|------|
| **Z-score** | — | 标准分数 = (x - μ) / σ，表示数据点偏离均值多少个标准差，常用于异常值检测和标准化 |
| **Z 检验** | Z-test | 大样本 (n ≥ 30) 下均值或比例差异的显著性检验方法 |

---

## 按分类索引

| 类别 | 相关术语 |
|------|----------|
| **用户指标** | AARRR, ARPU, ARPPU, CAC, Churn Rate, CLV/LTV, Cohort, DAU/MAU/WAU, NPS, NRR, Retention, RFM, Segment |
| **财务指标** | ARPU, ARPPU, CAC, CAGR, CLV, GMV, MRR/ARR, ROI |
| **统计方法** | A/B Testing, ANOVA, Bootstrap, DID, p-value, PCA, PSM, RDD, Z 检验 |
| **实验相关** | A/B Testing, MDE, SRM, Statistical Power, Uplift |
| **数据工程** | DWH, ETL/ELT, Fact Table, Hive, ODS, Parquet, SCD, Schema, Snowflake, Spark, Star Schema |
| **数据质量** | Dirty Data, DQC, SLA/SLO, SRM |
| **工具** | BI, BigQuery, Excel (VLOOKUP), GA4, Power BI, Presto, Spark, Tableau |
| **SQL 概念** | Cardinality, CTE, DML/DDL/DQL, LAG/LEAD, NULL, Query Optimization, UDF/UDAF, Windowing Function |
