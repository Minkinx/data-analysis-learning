# 指标管理（Metrics Management）

> 指标是数据驱动决策的原子单元。没有科学的指标管理，不同团队对同一指标的理解可能天差地别——"月活跃用户"的定义在不同部门可能相差 30%。指标管理解决的是"指标是什么、怎么算、谁负责、何时更新"的标准化问题。

## 指标字典（Metrics Dictionary）

指标字典是组织内所有指标的权威记录。每项指标至少应包含以下字段：

| 字段 | 说明 | 示例 |
|------|------|------|
| 指标名称 | 中文名 + 英文名 | 日活跃用户数 / DAU |
| 指标定义 | 精确的业务定义 | 当日启动 app 且完成至少 1 次有效浏览的去重用户数 |
| 口径说明 | 计算逻辑和数据源 | `COUNT(DISTINCT user_id)` FROM `fact_user_daily` WHERE `is_active=1` |
| 口径变更记录 | 历史口径变更日志 | 2025-06: 从"启动 app"改为"完成有效浏览" |
| 负责人/Owner | 指标管控的团队或个人 | @growth-team |
| 数据源 | 依赖的表或系统 | Kafka topic: user_activity → DWD → DWS |
| 更新频率 | 指标产出的节奏 | 天级 T+1 |
| SLA | 数据就绪承诺 | 每日 08:00 前产出 |
| 维度 | 支持的拆解维度 | 渠道、版本、地区、用户分层 |

```sql
-- 示例：维护指标定义表
CREATE TABLE dim_metrics_definition (
    metric_id          STRING  COMMENT '指标唯一 ID',
    metric_name_cn     STRING  COMMENT '指标中文名',
    metric_name_en     STRING  COMMENT '指标英文名',
    definition         STRING  COMMENT '业务定义',
    calculation_logic  STRING  COMMENT '计算口径 / SQL',
    owner_team         STRING  COMMENT '负责团队',
    source_tables      STRING  COMMENT '来源表',
    update_frequency   STRING  COMMENT '更新频率',
    sla                STRING  COMMENT 'SLA 时间',
    create_date        DATE    COMMENT '创建日期',
    deprecate_date     DATE    COMMENT '废弃日期',
    change_log         STRING  COMMENT '变更记录'
);
```

::: tip 指标字典工具
小型团队可用 Confluence / Notion 文档管理，中大型团队建议上专用指标管理平台（如 Count、Metriport、自研），支持自动血缘解析和影响面分析。
:::

## 命名规范与计算标准

### 命名原则

```
[业务域]_[实体]_[度量]_[聚合方式]

示例：
- order_gmv_sum        → 订单 GMV 总额
- user_active_dau      → 日活跃用户数
- pay_new_user_cnt     → 新增付费用户数
- video_play_rate      → 视频播放率（比率指标不带聚合后缀）
```

### 比率指标计算规范

比率指标最常见的坑是**分子与分母口径不一致**，应提前约定：

| 规范 | 说明 |
|------|------|
| 分子分母同源 | 分子分母使用同一数据源、同一去重逻辑 |
| 时间窗口一致 | 分子分母覆盖相同的时间范围 |
| 去重逻辑一致 | 分子按用户去重，分母也按用户去重；分子按订单去重，分母也按订单去重 |
| 异常值标注 | 分母过小时标注（如 `WHEN denominator < 100 THEN NULL`） |

```sql
-- 规范：转化率计算
-- 分子分母都按 user_id 去重，同时间窗口
SELECT
  date_key,
  COUNT(DISTINCT CASE WHEN event_name = 'payment_success' THEN user_id END) * 1.0
    / NULLIF(COUNT(DISTINCT CASE WHEN event_name = 'create_order' THEN user_id END), 0)
    AS payment_conversion_rate  -- 下单→支付转化率
FROM fact_events
WHERE date_key BETWEEN 20260401 AND 20260430
GROUP BY date_key;
```

## 数据血缘（Data Lineage）

从原始数据到仪表板的完整链路：

```
埋点/日志 → ODS → DWD → DWS/ADS → 指标平台 → Dashboard
  ↑           ↑      ↑       ↑            ↑            ↑
原始事件  清洗去重  主题宽表  汇总指标   指标字典    可视化
```

### 血缘的价值

1. **变更影响分析**：修改底层一张表时，自动评估影响的指标和报表
2. **问题回溯**：指标异常时快速定位是数据源问题还是口径问题
3. **规范化治理**：避免指标"各自建表、口径混乱"的困境

::: warning 数据血缘的落地挑战
很多团队的血缘是"画出来的"而非"自动解析的"。建议从 SQL 解析工具（如 dbt 的 `ref` 追踪、Apache Atlas、DataHub）开始，至少覆盖核心指标路径。人工维护的血缘文档半年后几乎都会过期。
:::

## 指标上线与下线流程

### 上线流程

```
需求评审 → 口径确认 → 技术实现 → 数据校验 → 字典登记 → 发布通知
```

**关键检查项：**

- [ ] 是否有完全等价（或高度相关）的已有指标？
- [ ] 数据源是否可用，数据质量能否保证？
- [ ] 是否已写入指标字典，owner 已指定？
- [ ] 两侧验证：SQL 结果 vs 业务预期，至少回溯 7 天数据
- [ ] 变更是否通知了相关消费者？

### 下线流程（Deprecation）

```
标记废弃 → 公告缓冲期 → 监控调用方 → 数据下线
```

**原则：**

| 阶段 | 操作 | 缓冲期 |
|------|------|--------|
| Phase 1 | 在字典中标记 `deprecated`，仪表板上加"即将废弃"标注 | — |
| Phase 2 | 停止数据更新，保留历史数据 | 推荐 ≥30 天 |
| Phase 3 | 确认无调用后删除历史数据和代码 | — |

```python
# 指标下线检查脚本（示意）
def check_metric_dependency(metric_id):
    """检查某指标是否仍有下游依赖"""
    dashboards = query_dashboards_by_metric(metric_id)
    reports = query_reports_by_metric(metric_id)
    sql_refs = query_sql_references(metric_id)
    return {
        "metric": metric_id,
        "dashboards": dashboards,
        "reports": reports,
        "sql_references": sql_refs,
        "has_dependency": bool(dashboards or reports or sql_refs)
    }
```

## 相关文章

- [指标框架与方法](/knowledge-map/km-7-metrics/01-frameworks) — AARRR、HEART、GSM、北极星等方法论基础
- [目标管理 OKR / KPI](/knowledge-map/km-7-metrics/03-okr-kpi) — 指标如何服务于目标体系
