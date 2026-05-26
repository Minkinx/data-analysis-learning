# 数据产品与工具链

> 数据分析师的全栈工具地图。从分析工具到效率工程，从产品思维到 AI 辅助，构建高效的日常工作流。

## 数据分析工具全景

### 分类概览

| 类别 | 代表工具 | 适用场景 |
|------|---------|---------|
| IDE / 编辑器 | VS Code, PyCharm, Cursor | 开发与复杂分析脚本 |
| 笔记本环境 | Jupyter Notebook, JupyterLab, Deepnote | 交互式探索与可视化 |
| SQL 客户端 | DataGrip, DBeaver, TablePlus | 数据库直连查询 |
| BI 平台 | Metabase, Superset, Tableau, Power BI | 报表与自助分析 |
| 数据目录 | DataHub, Amundsen, Atlan | 数据资产发现与血缘 |
| 工作流编排 | Airflow, Dagster, Prefect | 调度与任务编排 |
| 数据同步 | Airbyte, Fivetran, Stitch | 数据源集成 |

::: tip 工具选择原则
分析工具没有"最好的"，只有"最适合团队的"。核心选型标准：团队技术栈、数据规模、协作模式、维护成本。
:::

## 数据产品经理视角

### 需求文档

```yaml
# 数据需求文档（Data Requirements Doc）示例
project: 用户留存分析
requestor: 增长团队
priority: P1
purpose: 衡量新用户激活策略效果
metrics:
  - name: D1/D7/D30 留存率
    definition: 注册后第 N 天回访用户 / 当日注册用户
    dimension: ["注册渠道", "用户画像"]
  - name: 核心行为完成率
    definition: 首周完成核心事件的用户占比
data_needed:
  - table: dws_user_retention_daily
  - table: dwd_user_event
  - table: dim_user_profile
output: dashboard (留存看板)
```

### 需求优先级矩阵

| 维度 | 描述 | 评估方式 |
|------|------|---------|
| 影响面 | 覆盖多少决策者或用户 | 访谈 + 数据使用频率分析 |
| 紧急度 | 是否有明确决策时间窗口 | 业务发布时间表 |
| 实现成本 | 开发、数据、维护投入 | 工程师工作量估算 |
| 数据可用性 | 数据是否已接入、质量如何 | 数据目录查询 |

### 数据产品指标

- **采用率** — 核心指标看板的日活跃用户数 / 目标用户数
- **覆盖率** — 被指标覆盖的决策场景比例
- **SLA 达成率** — 数据按时产出的天数比例
- **用户满意度** — 分析师或业务方的 NPS 调研

## AI 辅助分析

### LLM 在分析中的应用

| 场景 | 工具/方法 | 效果 |
|------|----------|------|
| NL2SQL | Text-to-SQL（ChatGPT, Copilot） | 降低 SQL 编写门槛 |
| 代码生成 | Copilot, Cursor, Claude Code | 加速分析脚本编写 |
| 报告生成 | AI 根据分析结果自动撰写摘要 | 提升沟通效率 |
| 探索性分析 | 对话式数据探索 | 快速验证假设 |
| 异常检测 | AI 辅助识别模式偏离 | 补充规则监控 |

### NL2SQL 最佳实践

- **提供清晰的表结构**：表名、字段名、字段类型、示例值
- **定义业务度量**：指标名称及计算口径
- **约束输出格式**：指定返回字段、排序、聚合级别
- **审核生成结果**：始终人工审核 AI 生成的 SQL 逻辑

```markdown
-- 给你的 LLM 的提示模板
数据库：PostgreSQL
表：dwd_order (order_id, user_id, amount, status, created_at)
需求：按月份统计付费订单的总金额和订单数
约束：status = 'paid', 结果按月份升序
```

### AI 辅助的局限

1. **幻觉** — 可能生成不存在的字段或错误逻辑
2. **数据隐私** — 不要将敏感数据直接发送给外部 AI 服务
3. **一致性** — AI 生成的代码风格和命名可能不一致
4. **上下文理解** — 缺乏对该业务领域的深层理解

## 效率工具

### Git 基础

```bash
# 数据分析师日常 Git 场景
git status                          # 查看变更
git diff                            # 查看具体修改
git add analysis.ipynb              # 暂存文件
git commit -m "feat: add user churn analysis"  # 提交
git push                            # 推送到远端
git pull --rebase                   # 拉取最新并重放本地提交
```

### 命令行效率

```bash
# 数据处理小工具
cat file.csv | head -n 5                   # 预览前 5 行
wc -l file.csv                              # 统计行数
cut -d',' -f1,3 file.csv                    # 提取列
grep "error" log.txt | wc -l                # 关键词计数
awk -F',' '{sum+=$3} END {print sum}' data  # 列求和
```

### 开发环境配置

| 配置项 | 推荐 | 说明 |
|-------|------|------|
| Python 版本管理 | pyenv / uv | 项目和 Python 版本解耦 |
| 包管理 | uv / poetry | 依赖锁定与可复现环境 |
| 笔记本版本控制 | jupytext / nbdev | 将 ipynb 转为 .py 来 diff |
| 终端 | iTerm2 + Oh My Zsh | 主题与插件增强 |
| dotfiles 管理 | chezmoi / 自建 git repo | 配置同步与备份 |

### 协作工具

- **Confluence / Notion** — 分析文档与知识库
- **Slack / 飞书** — 数据异常报警与沟通
- **Metabase / Superset** — 自助查询与报表共享
- **dbt Docs** — 自动生成的数仓文档

## 相关文章

- [Python 数据分析](/knowledge-map/km-2-python) — 分析脚本与自动化
- [数据工程基础](/knowledge-map/km-8-data-engineering) — 数据管线与调度
- [数据治理与质量](/knowledge-map/km-10-governance) — 元数据管理与安全
