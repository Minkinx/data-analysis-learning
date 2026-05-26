# 数据治理与质量

> 数据治理是数据驱动决策的保障体系。涵盖数据质量、元数据管理、安全合规与组织机制，确保数据可信、可用、可控。

## 数据质量（Data Quality）

### 六个维度

| 维度 | 定义 | 衡量方式 | 常见问题 |
|------|------|---------|---------|
| 完整性（Completeness） | 数据是否缺失 | NULL 比例，必填字段填充率 | 字段为空、记录缺失 |
| 准确性（Accuracy） | 数据是否反映真实值 | 抽样核对，交叉验证 | 取值越界，记录错误 |
| 一致性（Consistency） | 数据是否跨系统统一 | 对比同名指标的数值 | 口径不统一，单位不一致 |
| 时效性（Timeliness） | 数据是否及时可用 | 产出时间 vs SLA | 延迟到达，过期未更新 |
| 唯一性（Uniqueness） | 是否有重复记录 | 主键重复率，实体去重 | 重复用户、重复订单 |
| 有效性（Validity） | 数据是否符合格式规则 | 正则校验，枚举值检查 | 邮箱格式错误，状态值非法 |

```sql
-- 完整性检查
SELECT COUNT(*) AS total_rows,
       COUNT(order_id) AS non_null_id,
       COUNT(amount) AS non_null_amount,
       SUM(CASE WHEN amount IS NULL THEN 1 ELSE 0 END) * 1.0 / COUNT(*) AS null_rate
FROM orders;

-- 唯一性检查
SELECT order_id, COUNT(*) AS dup_count
FROM orders
GROUP BY order_id
HAVING COUNT(*) > 1;

-- 时效性检查
SELECT CURRENT_DATE - MAX(date) AS max_lag_days
FROM dws_daily_report;
```

### 质量监控

```yaml
# 数据质量规则示例（可用于 dbt test 或自定义框架）
rules:
  - name: order_amount_not_null
    table: dwd_order
    check: amount IS NOT NULL
    severity: error
  - name: order_amount_range
    table: dwd_order
    check: amount > 0 AND amount < 1000000
    severity: warn
  - name: daily_row_count_stable
    table: dws_order_daily
    check: row_count BETWEEN avg_row_count_7d * 0.9 AND avg_row_count_7d * 1.1
    severity: error
  - name: unique_order_id
    table: dwd_order
    check: no duplicate order_id
    severity: error
```

## 元数据管理（Metadata Management）

### 元数据分类

| 类别 | 内容 | 用途 |
|------|------|------|
| 技术元数据 | 表结构、字段类型、分区、血缘 | 数据开发与运维 |
| 业务元数据 | 指标定义、业务口径、维度归属 | 分析师取数与理解数据 |
| 操作元数据 | 调度记录、更新频率、数据量 | 运维与 SLA 管理 |

### 数据目录（Data Catalog）

数据目录帮助团队发现和理解数据：
- **表搜索**：按业务域、关键词快速定位数据表
- **字段描述**：每个字段的业务含义和取值范围
- **血缘关系（Lineage）**：从源表到报表的完整链路
- **热度标注**：哪些表最常用，哪些已废弃

### 血缘分析

```
Source DB → ODS → DWD → DWS → ADS → Dashboard
   ↑          ↑     ↑      ↑     ↑        ↑
binlog     清洗   明细   汇总   应用     报表
```

血缘的价值：定位报错根因、评估变更影响、合规审计。

## 数据安全

| 手段 | 说明 | 适用场景 |
|------|------|---------|
| 脱敏（Masking） | 替换敏感字段为掩码 | 非生产环境、分析查询 |
| 加密（Encryption） | 存储/传输加密 | 敏感数据（PII, 金融） |
| 分级分类 | 按敏感度划分层级 | 权限管控 |
| 角色权限（RBAC） | 按角色控制访问 | 表级/行级权限管控 |

```sql
-- 动态脱敏示例（PostgreSQL）
CREATE MASKING POLICY email_mask
AS (val TEXT) RETURNS TEXT ->
  CASE WHEN current_role() IN ('analyst') THEN val
       ELSE CONCAT(SPLIT_PART(val, '@', 1), '***@***.com')
  END;
```

## 合规管理

### GDPR / 数据保护

- **个人数据定义**：任何可识别自然人的数据
- **数据处理原则**：合法、透明、目的限制、数据最小化
- **用户权利**：访问权、删除权（被遗忘）、数据可携带权
- **数据留存策略**：设定保留期限，到期自动清理

### 审计日志

```yaml
# 审计日志应当记录的字段
audit_log:
  - user_id: 操作人
  - action: SELECT / EXPORT / DELETE
  - table_name: 操作的数仓表
  - query_text: 执行的 SQL（如适用）
  - timestamp: 精确到毫秒
  - ip_address: 来源 IP
  - rows_affected: 影响行数
```

## 治理组织

### 数据 owner 体系

| 角色 | 职责 | 通常由谁担任 |
|------|------|-------------|
| 数据 Owner | 区域数据的最终责任人 | 业务线负责人 |
| 数据 Steward | 日常数据质量维护 | 数据分析师 / 数仓 |
| 数据 Custodian | 技术实现与运维 | 数据工程师 / DBA |

### 质量指标与 SLA

- **覆盖率**：核心表质量规则覆盖度（目标 ≥ 90%）
- **通过率**：数据质量规则通过率（目标 ≥ 95%）
- **SLA 达标率**：数据产出时间达标率（目标 ≥ 99%）
- **问题单关闭时效**：数据问题从发现到解决的平均时长

### 事件响应流程

```
发现问题 → 等级判定(P0~P3) → 响应处理 → 修复验证 → 复盘改进

P0：影响核心业务决策，需 30 分钟内响应
P1：影响部分业务判断，需 2 小时内响应
P2：影响辅助分析流程，需 8 小时内响应
P3：非关键问题，本周内响应
```

## 相关文章

- [数据工程基础](/knowledge-map/km-8-data-engineering) — 数据管道的质量控制
- [数据产品与工具链](/knowledge-map/km-12-tools) — 数据目录与协作工具
- [数据建模](/knowledge-map/km-4-data-modeling/) — 数仓建模的规范保障
