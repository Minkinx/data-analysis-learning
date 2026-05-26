# 数据工程基础

> 数据工程是数据分析的底层基础设施。理解 ETL 流程、数仓分层、数据管道和实时架构，能帮助分析师更高效地获取和使用数据。

## ETL vs ELT

| 环节 | ETL | ELT |
|------|-----|-----|
| 转换时机 | 加载前（中间层处理） | 加载后（目标库处理） |
| 适用场景 | 数据质量要求高、异构数据源 | 海量数据、灵活探索 |
| 典型工具 | Informatica, DataStage | dbt, Spark, BigQuery |
| 优点 | 加载后即可用，无需目标库运算 | 无需中间存储，弹性扩缩 |

现代数据栈以 **ELT** 为主流，利用云数仓的弹性和计算能力在查询时进行转换。

## 数据仓库

### OLTP vs OLAP

| 维度 | OLTP（交易系统） | OLAP（分析系统） |
|------|----------------|----------------|
| 目的 | 日常事务处理 | 分析与决策支持 |
| 读写模式 | 高频写入，少量读取 | 批量写入，大量读取 |
| 数据模型 | 范式化（3NF） | 维度建模（Star Schema） |
| 典型 | MySQL, PostgreSQL | Snowflake, ClickHouse, BigQuery |

### 数仓架构演进

```
传统数仓 → 云原生数仓 → Data Lakehouse
  Teradata      Snowflake        Databricks
  Greenplum     BigQuery         Iceberg/Delta
```

### 分层设计

| 层级 | 名称 | 作用 |
|------|------|------|
| ODS | 操作数据层 | 源系统原始数据，几乎不变 |
| DWD | 明细数据层 | 清洗、去重、标准化，保留最细粒度 |
| DWS | 汇总数据层 | 按主题轻汇总（日/周/月） |
| ADS | 应用数据层 | 面向具体业务需求的宽表/指标表 |

```sql
-- DWD: 清洗与标准化
INSERT INTO dwd_order
SELECT order_id,
       user_id,
       CAST(amount AS DECIMAL(12,2)),
       COALESCE(status, 'unknown') AS status,
       TO_DATE(created_at)         AS date
FROM ods_order
WHERE amount IS NOT NULL;

-- DWS: 日汇总
INSERT INTO dws_order_daily
SELECT date,
       COUNT(*)              AS order_cnt,
       SUM(amount)           AS gmv,
       COUNT(DISTINCT user_id) AS buyer_cnt
FROM dwd_order
GROUP BY date;

-- ADS: 业务宽表
CREATE TABLE ads_user_daily AS
SELECT a.date, a.user_id, u.user_name,
       COALESCE(a.gmv, 0)         AS gmv,
       COALESCE(a.order_cnt, 0)   AS order_cnt
FROM dim_user u
LEFT JOIN dws_user_daily a ON u.user_id = a.user_id;
```

::: tip 分析师视角
日常查询应优先从 DWS 或 ADS 层取数，而非直接查询 ODS。这不仅更快，而且得到的是更可靠、口径统一的指标。
:::

## 数据管道（Data Pipeline）

### 调度与依赖管理

```yaml
# 伪代码：典型的每日 ETL 依赖 DAG
dag:
  schedule: "0 7 * * *"            # 每天 7:00 运行
  tasks:
    - name: ingest_raw
      command: airbyte sync orders
    - name: clean_data
      command: dbt run --select dwd_order
      depends_on: [ingest_raw]
    - name: aggregate
      command: dbt run --select dws_order_daily
      depends_on: [clean_data]
    - name: quality_check
      command: dbt test --select tag:critical
      depends_on: [aggregate]
```

### 数据质量检查

- **完整性**：行数波动 < ±10%（与历史均值对比）
- **准确性**：核心指标（GMV、DAU）与参照系统交叉验证
- **时效性**：数据产出时间在 SLA 窗口内
- **一致性**：跨表关联键无悬空

### 重试与告警

```
# 失败处理策略
第一次失败 → 等待 5 分钟后自动重试
第二次失败 → 等待 30 分钟后再次重试
第三次失败 → 发送告警到企业微信 / Slack
```

## 实时 vs 离线

| 维度 | 离线（Batch） | 实时（Streaming） |
|------|-------------|-----------------|
| 延迟 | T+1 / 小时级 | 秒级 / 分钟级 |
| 计算引擎 | Spark, Hive, Presto | Flink, Kafka Streams |
| 常见场景 | 报表、财务、AB 实验 | 监控、推荐、风控 |
| 存储 | HDFS, S3 + 数仓 | Kafka, Redis, ClickHouse |

### Lambda 架构

```
实时层 (Speed Layer) ——> Serving Layer ——> 查询
                               ↑
批量层 (Batch Layer) ———>       |
```

### Kappa 架构

```
流处理层 (Streaming Job) ——> Serving Layer ——> 查询
```

Kappa 架构简化了 Lambda，所有数据通过同一流处理管道，适用可重放数据的场景。

## 常用工具

| 类别 | 工具 | 说明 |
|------|------|------|
| 编排调度 | Airflow, Dagster | DAG 任务编排与依赖管理 |
| 数据转换 | dbt | SQL-based，代码化数仓建模 |
| 数据同步 | Airbyte, Fivetran | 源到目标的数据复制 |
| 批量处理 | Spark, Trino | 大规模数据处理与查询 |
| 实时处理 | Flink, Kafka | 流式数据接入与处理 |
| 数据湖 | Apache Iceberg, Delta Lake | 开放表格式，ACID 事务 |

## 相关文章

- [SQL 完全指南](/knowledge-map/km-1-sql/) — 数仓操作的核心语言
- [数据建模](/knowledge-map/km-4-data-modeling/) — 维度建模方法
- [数据治理与质量](/knowledge-map/km-10-governance) — 数据质量管理与安全
