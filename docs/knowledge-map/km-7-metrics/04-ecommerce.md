# 电商行业指标体系（E-commerce Metrics）

> 电商是数据驱动最早、指标体系最成熟的行业之一。从流量获取到履约售后，每个环节都有成熟的管理指标。核心逻辑围绕 GMV 拆解展开，同时关注用户复购与购物车行为。

## GMV 分解

GMV（Gross Merchandise Volume）是电商平台的北极星指标，典型拆解公式：

```
GMV = 访客数 × 转化率 × 客单价

更精细的版本：
GMV = (新访客数 + 老访客数) × 下单率 × 平均订单金额
```

```sql
-- GMV 日级别拆解
SELECT
  date_key,
  COUNT(DISTINCT user_id)                                         AS visitors,
  COUNT(DISTINCT order_id)                                        AS orders,
  COUNT(DISTINCT order_id) * 1.0 / NULLIF(COUNT(DISTINCT user_id), 0) AS cvr,
  SUM(order_amount)                                               AS gmv,
  SUM(order_amount) / NULLIF(COUNT(DISTINCT order_id), 0)         AS aov,
  COUNT(DISTINCT user_id) *                                       -- 流量
    (COUNT(DISTINCT order_id) * 1.0 / NULLIF(COUNT(DISTINCT user_id), 0)) *  -- 转化率
    (SUM(order_amount) / NULLIF(COUNT(DISTINCT order_id), 0))     -- 客单价
    AS gmv_check  -- 应等于 gmv
FROM fact_order
WHERE date_key BETWEEN 20260401 AND 20260430
GROUP BY date_key;
```

### GMV 分渠道拆解

```
总 GMV
├── 搜索渠道 GMV = 搜索访客 × 搜索转化率 × AOV
├── 推荐渠道 GMV = 推荐访客 × 推荐转化率 × AOV
├── 活动渠道 GMV = 活动访客 × 活动转化率 × AOV
└── 直接访问 GMV = 直接访客 × 自然转化率 × AOV
```

::: warning GMV 的水分
GMV 计入未支付订单（下单未付款）、取消订单、退款订单。"真实 GMV" 应剔除这些部分，关注**实付 GMV（Paid GMV）**或**确认收货 GMV（Confirmed GMV）**。
:::

## 转化率体系

电商转化率需从三个层次分析：

### 页面级转化率

| 指标 | 计算 | 参考范围 |
|------|------|---------|
| 首页点击率 | 首页点击人数 / 首页浏览人数 | 15-30% |
| 搜索→结果页点击率 | 搜索结果点击人数 / 搜索人数 | 25-40% |
| 详情页→加购率 | 加购人数 / 详情页浏览人数 | 10-20% |
| 加购→结算率 | 进入结算页人数 / 加购人数 | 50-70% |
| 结算页→支付率 | 支付成功人数 / 结算页人数 | 75-90% |

### 步骤级转化率（整体漏斗）

```
首页 → 搜索/推荐/分类
  │  40-60%
搜索/推荐 → 商品详情页
  │  25-40%
商品详情页 → 加入购物车
  │  10-20%
加入购物车 → 结算
  │  50-70%
结算 → 支付成功
  │  75-90%
支付成功 → 订单完成
  │  95%+
```

### 整体转化率

```
整体转化率 = 下单用户数 / 访客数
```

::: tip 分渠道看转化
不同渠道的转化率差异很大——搜索渠道通常最高（10-20%），社交/内容渠道最低（1-3%）。只看整体转化率会掩盖优化机会，应分渠道对比。
:::

## 复购率与留存体系

电商的核心竞争力在于 LTV，而 LTV 的核心驱动因素是复购。

| 指标 | 定义 | 计算方法 |
|------|------|---------|
| 首单复购率 | 首次购买后在 N 天内再次购买的比例 | 首购用户中 N 天内复购人数 / 首购总人数 |
| N 月复购率 | 连续 N 个月均有购买的用户比例 | 月购买用户中下月也购买的用户占比 |
| 回购频次 | 用户年均购买次数 | 年总订单数 / 年购买用户数 |
| 用户生命周期 | 从首次购买到末次购买的时间跨度 | 末次购买日期 - 首次购买日期 |

```sql
-- 复购率计算（3 个月内复购）
WITH first_purchase AS (
  SELECT user_id, MIN(order_date) AS first_order_date
  FROM fact_order GROUP BY user_id
)
SELECT
  COUNT(DISTINCT fp.user_id)                                        AS total_first_purchasers,
  COUNT(DISTINCT CASE WHEN f.order_date > fp.first_order_date
    AND f.order_date <= DATE_ADD(fp.first_order_date, 90)
    THEN fp.user_id END)                                            AS repurchased,
  COUNT(DISTINCT CASE WHEN f.order_date > fp.first_order_date
    AND f.order_date <= DATE_ADD(fp.first_order_date, 90)
    THEN fp.user_id END) * 1.0 / NULLIF(COUNT(DISTINCT fp.user_id), 0) AS repurchase_rate
FROM first_purchase fp
LEFT JOIN fact_order f ON fp.user_id = f.user_id
WHERE fp.first_order_date BETWEEN 20260101 AND 20260331;
```

## 购物车分析

购物车是电商转化中的关键节点，也是最容易流失的环节。

| 指标 | 定义 | 含义 |
|------|------|------|
| 加购率 | 加购用户数 / 访客数 | 商品吸引力与详情页说服力 |
| 购物车放弃率 | 加购后未支付订单数 / 加购总次数 | 结算流程问题 / 价格惊吓 |
| 购物车回收率 | 放弃后 N 天内完成支付的比例 | 回收策略（如优惠券推送）效果 |
| 件均加购数 | 每次加购的商品件数 | 批量购买意愿 |
| 凑单率 | 支付金额刚好达到优惠门槛的比例 | 满减/包邮策略合理性 |

```sql
-- 购物车放弃商品分析
SELECT
  sku_id,
  COUNT(*) AS abandon_times,
  SUM(sku_price) AS abandoned_amount,
  -- 被放弃前的页面（最后停留位置）
  COLLECT_LIST(last_page)[0] AS last_page_before_abandon
FROM (
  SELECT
    a.sku_id, a.sku_price, a.cart_add_time,
    MAX(CASE WHEN a.event_name = 'add_cart' THEN a.page_url END) AS last_page,
    ROW_NUMBER() OVER (PARTITION BY a.cart_session_id ORDER BY a.event_time DESC) AS rn
  FROM fact_cart_event a
  LEFT JOIN fact_order b ON a.cart_session_id = b.cart_session_id
  WHERE b.order_id IS NULL  -- 未生成订单的购物车会话
    AND a.date_key BETWEEN 20260401 AND 20260430
) t WHERE rn = 1
GROUP BY sku_id
ORDER BY abandon_times DESC
LIMIT 20;
```

::: info 购物车回收策略
常见的回收手段：放弃后 1 小时推送"购物车商品即将售罄"提醒、24 小时后发送小额优惠券、支持购物车商品分享到社交平台以获得拼单折扣。
:::

## 库存与供应链指标

电商后端效率直接决定履约成本和用户满意度。

| 指标 | 定义 | 健康阈值 |
|------|------|---------|
| 库存周转天数 | 平均库存金额 / 日均销售成本 | 服饰 30-60 天，快消 15-30 天 |
| 缺货率 | 缺货 SKU 数 / 总 SKU 数 | < 5% |
| 履约时效 | 下单到签收的平均时长 | 次日达/隔日达依品类定 |
| 妥投率 | 成功签收订单 / 总发货订单 | > 98% |
| 退换货率 | 退货订单数 / 总完成订单 | < 10%（服饰可能 15-20%） |
| 单位物流成本 | 总物流费用 / 总订单数 | 取决于客单价与配送距离 |

## 相关文章

- [金融行业指标体系](/knowledge-map/km-7-metrics/05-finance) — 金融产品的资产与风控指标
- [内容行业指标体系](/knowledge-map/km-7-metrics/06-content) — 内容平台的 DAU 与消费深度
- [SaaS 行业指标体系](/knowledge-map/km-7-metrics/07-saas) — 订阅收入与客户健康度
