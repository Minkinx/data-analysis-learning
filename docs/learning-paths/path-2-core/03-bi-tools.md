# BI 工具实战

> 了解主流 BI 工具的核心能力和选型思路。深入参考请见 [KM 6. BI 工具与可视化](/knowledge-map/km-6-bi-visualization/)。

## Tableau

核心能力：拖拽式交互、LOD 表达式、参数控制

```text
-- LOD 示例（每个客户的首单金额）
{FIXED [Customer ID]: MIN([Order Amount])}
```

## Power BI

核心能力：DAX 语言、Power Query (M)、行级安全

```dax
// DAX 计算累计值
Running Total =
CALCULATE(
    SUM(Sales[Amount]),
    FILTER(ALL('Date'), 'Date'[Date] <= MAX('Date'[Date]))
)
```

## 开源方案（Metabase / Superset）

- **Metabase**：上手快，适合团队自助分析
- **Superset**：功能强大，适合数据团队深度使用

## 工具选型参考

| 场景 | 推荐 |
|------|------|
| 公司有 Tableau 授权 | Tableau |
| 微软生态 | Power BI |
| 小团队、低成本 | Metabase |
| 需要深度定制 | Superset + 自建 |

> 深入了解请参阅 [KM 6. BI 工具与可视化](/knowledge-map/km-6-bi-visualization/)。
