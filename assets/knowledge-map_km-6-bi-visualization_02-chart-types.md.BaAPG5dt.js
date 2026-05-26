import{_ as s,H as n,f as t,i as p}from"./chunks/framework.nyB-Xt5O.js";const g=JSON.parse('{"title":"图表类型详解","description":"","frontmatter":{},"headers":[],"relativePath":"knowledge-map/km-6-bi-visualization/02-chart-types.md","filePath":"knowledge-map/km-6-bi-visualization/02-chart-types.md","lastUpdated":1779798726000}'),e={name:"knowledge-map/km-6-bi-visualization/02-chart-types.md"};function l(i,a,o,r,c,d){return n(),t("div",null,[...a[0]||(a[0]=[p(`<h1 id="图表类型详解" tabindex="-1">图表类型详解 <a class="header-anchor" href="#图表类型详解" aria-label="Permalink to &quot;图表类型详解&quot;">​</a></h1><blockquote><p>每种图表类型都有其天然适合的<strong>数据关系</strong>和<strong>分析目标</strong>。选用错误图表不仅会降低信息传递效率，更可能导致读者得出错误结论。本节逐一讲解常用图表的适用场景和常见陷阱。</p></blockquote><h2 id="柱状图-bar-chart" tabindex="-1">柱状图（Bar Chart） <a class="header-anchor" href="#柱状图-bar-chart" aria-label="Permalink to &quot;柱状图（Bar Chart）&quot;">​</a></h2><p><strong>适用场景</strong>：类别间数值比较、排名、时间序列（离散时间点）。</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>✅ 正确用法</span></span>
<span class="line"><span>- 横向条形图（类别名较长时）</span></span>
<span class="line"><span>- 按数值排序（排名场景）</span></span>
<span class="line"><span>- 柱状图 + 参考线（对比目标）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>❌ 常见错误</span></span>
<span class="line"><span>- 起始轴不从 0 开始 → 放大差异，误导读者</span></span>
<span class="line"><span>- 柱状图堆叠超过 3 层 → 中间层的对比变得困难</span></span>
<span class="line"><span>- 使用 3D 效果 → 遮挡视角，引入透视变形</span></span></code></pre></div><div class="warning custom-block"><p class="custom-block-title">轴必须从 0 开始</p><p>柱状图编码在<strong>长度</strong>上，如果 y 轴不从 0 开始，柱子的长度比例会被扭曲。这是可视化中<strong>最常被滥用</strong>的误导手法。折线图和散点图可以从非零起点开始，但柱状图不行。</p></div><h2 id="折线图-line-chart" tabindex="-1">折线图（Line Chart） <a class="header-anchor" href="#折线图-line-chart" aria-label="Permalink to &quot;折线图（Line Chart）&quot;">​</a></h2><p><strong>适用场景</strong>：连续时间序列趋势、多个序列对比、预测与实际对比。</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>✅ 正确用法</span></span>
<span class="line"><span>- 时间在 x 轴，按时间顺序排列</span></span>
<span class="line"><span>- 多条线时使用不同颜色+线型</span></span>
<span class="line"><span>- 添加置信区间/阴影带</span></span>
<span class="line"><span></span></span>
<span class="line"><span>❌ 常见错误</span></span>
<span class="line"><span>- 连接不连续的数据点（不要让折线&quot;跨空&quot;）</span></span>
<span class="line"><span>- 超过 5 条线（变成&quot;意面图&quot; Spaghetti Chart）</span></span>
<span class="line"><span>- 过分平滑数据（引入误解，掩盖真实波动）</span></span></code></pre></div><p><strong>小样本建议</strong>：数据点少于 10 个时，在每个数据点标注具体数值；多于 50 个点时，可以考虑减少标注，突出总体趋势即可。</p><h2 id="散点图-scatter-plot" tabindex="-1">散点图（Scatter Plot） <a class="header-anchor" href="#散点图-scatter-plot" aria-label="Permalink to &quot;散点图（Scatter Plot）&quot;">​</a></h2><p><strong>适用场景</strong>：两个连续变量的关系、相关性分析、异常值检测、聚类展示。</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>✅ 正确用法</span></span>
<span class="line"><span>- 添加趋势线 + 置信区间</span></span>
<span class="line"><span>- 用颜色编码第三维度</span></span>
<span class="line"><span>- 对大样本数据做透明度处理（Alpha Blending）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>❌ 常见错误</span></span>
<span class="line"><span>- 数据点过多且无透明度 → 完全重叠，看不出密度</span></span>
<span class="line"><span>- 过度解读相关性 → 相关性 ≠ 因果性</span></span>
<span class="line"><span>- 忘记标注坐标轴单位</span></span></code></pre></div><h2 id="直方图-histogram" tabindex="-1">直方图（Histogram） <a class="header-anchor" href="#直方图-histogram" aria-label="Permalink to &quot;直方图（Histogram）&quot;">​</a></h2><p><strong>适用场景</strong>：观察单变量数值分布、检查正态性、发现数据偏态或双峰。</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>✅ 正确用法</span></span>
<span class="line"><span>- 根据数据量和范围选择合适的 bin 数量</span></span>
<span class="line"><span>- 叠加正态分布曲线辅助判断</span></span>
<span class="line"><span></span></span>
<span class="line"><span>❌ 常见错误</span></span>
<span class="line"><span>- bin 宽度过小 → 噪声过多，看不到整体形态</span></span>
<span class="line"><span>- bin 宽度过大 → 丢失分布细节</span></span>
<span class="line"><span>- 用柱状图的间隙 → 直方图的柱之间不应有间隙</span></span></code></pre></div><p><strong>Bin 数量经验公式</strong>：对于 n 个数据点，推荐 bin 数 ≈ <code>2 * n^(1/3)</code>（Sturges 规则）或 <code>3.5 * σ * n^(-1/3)</code>（Scott 规则）。</p><h2 id="箱线图-box-plot" tabindex="-1">箱线图（Box Plot） <a class="header-anchor" href="#箱线图-box-plot" aria-label="Permalink to &quot;箱线图（Box Plot）&quot;">​</a></h2><p><strong>适用场景</strong>：多组数据分布对比、异常值检测、识别偏态。</p><p>箱线图的五个统计量：最小值（不含异常值）、Q1（第一四分位数）、中位数、Q3（第三四分位数）、最大值（不含异常值）。</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>✅ 正确用法</span></span>
<span class="line"><span>- 多组箱线图并列展示，适合对比</span></span>
<span class="line"><span>- 结合散点图展示实际数据点（Beeswarm 叠加）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>❌ 常见错误</span></span>
<span class="line"><span>- 样本量太小时使用（&lt; 10 个点，箱线图不稳定）</span></span>
<span class="line"><span>- 只展示箱线图而不展示样本量 n</span></span>
<span class="line"><span>- 误解须（Whisker）含义：须 ≠ 最大最小值（受 IQR 约束）</span></span></code></pre></div><p><strong>须的计算</strong>：通常 <code>min(Q1 - 1.5*IQR, 实际最小值)</code> 到 <code>max(Q3 + 1.5*IQR, 实际最大值)</code>，超出此范围的点标记为异常值。</p><h2 id="热力图-heatmap" tabindex="-1">热力图（Heatmap） <a class="header-anchor" href="#热力图-heatmap" aria-label="Permalink to &quot;热力图（Heatmap）&quot;">​</a></h2><p><strong>适用场景</strong>：二维矩阵数值展示、相关性矩阵、时间序列的日历视图（Calendar Heatmap）、地理热力。</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>✅ 正确用法</span></span>
<span class="line"><span>- 使用顺序色或发散色，颜色深浅对应数值</span></span>
<span class="line"><span>- 对行/列进行聚类（Clustered Heatmap）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>❌ 常见错误</span></span>
<span class="line"><span>- 颜色跨度不连续 → 误导读者对数值差异的判断</span></span>
<span class="line"><span>- 行列过多且不聚类 → 无法发现模式</span></span></code></pre></div><h2 id="树图-treemap" tabindex="-1">树图（Treemap） <a class="header-anchor" href="#树图-treemap" aria-label="Permalink to &quot;树图（Treemap）&quot;">​</a></h2><p><strong>适用场景</strong>：展示层级占比、有限空间内的多级类别展示、文件/资源占用分析。</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>✅ 正确用法</span></span>
<span class="line"><span>- 面积代表数值大小，颜色代表类别或二级指标</span></span>
<span class="line"><span>- 配合悬停显示详细数值</span></span>
<span class="line"><span></span></span>
<span class="line"><span>❌ 常见错误</span></span>
<span class="line"><span>- 层级超过 3 层 → 视觉上难以分辨</span></span>
<span class="line"><span>- 数据项超过 30 个 → 小方块难以看清</span></span>
<span class="line"><span>- 不使用饼图的替代 → Treemap 是很多饼图的替代方案，但并非万能</span></span></code></pre></div><h2 id="瀑布图-waterfall-chart" tabindex="-1">瀑布图（Waterfall Chart） <a class="header-anchor" href="#瀑布图-waterfall-chart" aria-label="Permalink to &quot;瀑布图（Waterfall Chart）&quot;">​</a></h2><p><strong>适用场景</strong>：构成因素的增减分解（利润拆解、现金流量变化）、从初始值到最终值的变化路径。</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>✅ 正确用法</span></span>
<span class="line"><span>- 起始和结束用全高柱，中间用浮动柱</span></span>
<span class="line"><span>- 增加/减少用不同颜色区分</span></span>
<span class="line"><span></span></span>
<span class="line"><span>❌ 常见错误</span></span>
<span class="line"><span>- 堆积项过多 → 图表变得杂乱</span></span>
<span class="line"><span>- 不标注具体数值 → 读者需要自行估算变化量</span></span></code></pre></div><h2 id="其他常用图表" tabindex="-1">其他常用图表 <a class="header-anchor" href="#其他常用图表" aria-label="Permalink to &quot;其他常用图表&quot;">​</a></h2><table tabindex="0"><thead><tr><th>图表类型</th><th>适用场景</th><th>注意事项</th></tr></thead><tbody><tr><td><strong>面积图（Area Chart）</strong></td><td>强调累积量趋势</td><td>堆叠面积图超过 3 层后底部趋势难以分辨</td></tr><tr><td><strong>雷达图（Radar Chart）</strong></td><td>多维度评分对比</td><td>不超过 6 个维度，否则&quot;蜘蛛网&quot;失去可读性</td></tr><tr><td><strong>气泡图（Bubble Chart）</strong></td><td>三维数据展示（x, y, 气泡大小）</td><td>面积感知有偏差，数据点避免重叠</td></tr><tr><td><strong>桑基图（Sankey Diagram）</strong></td><td>流量/转化/路径分析</td><td>节点不宜过多，流量宽度按比例展示</td></tr><tr><td><strong>漏斗图（Funnel Chart）</strong></td><td>转化率分析</td><td>注意：漏斗每层的量纲应该一致</td></tr><tr><td><strong>小提琴图（Violin Plot）</strong></td><td>分布+密度展示</td><td>样本量较小时不稳定，需要 &gt; 50 个点</td></tr></tbody></table><h2 id="图表选择的黄金法则" tabindex="-1">图表选择的黄金法则 <a class="header-anchor" href="#图表选择的黄金法则" aria-label="Permalink to &quot;图表选择的黄金法则&quot;">​</a></h2><ol><li><strong>最小化读者的认知负担</strong> — 最常见的图表类型（柱状图、折线图、散点图）通常是最好的选择</li><li><strong>一个图表传递一个信息</strong> — 不要试图在一个图表中塞入过多维度</li><li><strong>先写结论，再选图表</strong> — 明确你想表达的核心观点，然后选择最能支持该观点的图表</li><li><strong>测试你的图表</strong> — 让不了解数据的人看 5 秒，问他们看到了什么</li></ol><h2 id="相关文章" tabindex="-1">相关文章 <a class="header-anchor" href="#相关文章" aria-label="Permalink to &quot;相关文章&quot;">​</a></h2><ul><li><a href="/data-analysis-learning/knowledge-map/km-6-bi-visualization/01-principles">可视化原理</a> — Gestalt 原则、预注意属性、色彩理论</li><li><a href="/data-analysis-learning/knowledge-map/km-6-bi-visualization/03-dashboard-design">Dashboard 设计</a> — 如何将图表组合成有效仪表板</li></ul>`,37)])])}const b=s(e,[["render",l]]);export{g as __pageData,b as default};
