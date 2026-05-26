# 🔧 构建与维护

> 本站基于 [VitePress](https://vitepress.dev/) 构建，以下说明帮助你在本地搭建开发环境、参与内容贡献以及了解站点更新历史。

---

## 一、本地开发

### 环境要求

- **Node.js** >= 18.x (推荐 20 LTS)
- **npm** >= 9.x

### 启动开发服务器

```bash
# 克隆仓库
git clone https://github.com/minkinx/data_analysis.git
cd data_analysis

# 安装依赖
npm install

# 启动开发服务器（热更新）
npm run dev
```

默认在 `http://localhost:5173` 启动，修改 Markdown 文件后浏览器自动刷新。

### 构建生产版本

```bash
npm run build
```

构建产物输出到 `docs/.vitepress/dist/`，可直接部署到任何静态托管服务（如 GitHub Pages、Vercel、Netlify）。

### 本地预览构建结果

```bash
npm run preview
```

在 `http://localhost:4173` 预览构建后的站点。

### 目录结构说明

```
docs/
├── .vitepress/          # VitePress 配置与主题
│   ├── config.mjs       # 站点配置（导航、侧边栏、插件等）
│   └── dist/            # 构建产物（不提交到 Git）
├── public/              # 静态资源（图片、字体等）
├── appendix/            # 附录
├── career/              # 职业发展
├── interview/           # 面试专区
├── knowledge-map/       # 知识地图
├── learning-paths/      # 学习路径
├── index.md             # 首页
└── superpowers/         # 开发辅助（不参与构建）
```

---

## 二、内容写作指南

### Markdown 规范

- 使用 **VitePress Markdown** 语法，支持 Frontmatter、代码高亮、自定义容器等
- 标题层级：`#` 用于页面标题，`##` 用于主要章节，`###` 用于子章节，最多 `####`
- 代码块标明语言：
  ````md
  ```sql
  SELECT * FROM table;
  ```
  ````
- **中文优先**，英文术语首次出现时用括号标注，如"留存率 (Retention Rate)"
- 常用图标：`❗` 提醒、`💡` 提示、`⚠️` 警告
- 链接使用相对路径，省略 `.md` 扩展名（VitePress 的 cleanURLs 特性）
- 表格应包含表头，合理使用对齐标记

### Frontmatter 样例

```yaml
---
title: 页面标题
description: 页面描述（用于 SEO 和社交分享）
---
```

### 新增页面步骤

1. 在对应目录下创建 `.md` 文件
2. 在 `docs/.vitepress/config.mjs` 的对应 `sidebar` 中添加条目
3. 本地运行 `npm run dev` 验证显示和链接
4. 提交 PR

### 写作风格

| 原则 | 说明 |
|------|------|
| **目标读者** | 初中级数据分析师，1-5 年经验 |
| **语言风格** | 正式但不学术化，通俗易懂 |
| **例子为王** | 每个概念配具体例子，避免纯理论描述 |
| **宁缺毋滥** | 不堆砌内容，每条信息都应该有实用价值 |
| **对比意识** | 涉及多种方案时给出对比和选择建议 |

---

## 三、贡献指南

欢迎任何形式的贡献，包括但不限于：

- **修正错误**：发现内容错误、错别字或死链
- **补充内容**：完善现有章节或新增知识点
- **优化表达**：改进不通顺或难以理解的部分
- **代码示例**：补充或修正 SQL / Python 代码片段

### 贡献流程

1. Fork 本仓库
2. 创建新分支：`git checkout -b feature/your-feature-name`
3. 修改内容并提交
4. 推送分支并提交 Pull Request
5. 等待审核与合并

### 贡献要求

- 确保本地 `npm run build` 通过（无死链、无构建错误）
- 内容无明显的抄袭和版权问题
- 尊重现有的写作风格和目录结构
- 新增页面需在 `config.mjs` 中添加导航

### 审查标准

Pull Request 合并前会进行以下检查：

- [ ] 内容准确性和实用性
- [ ] 语法和错别字
- [ ] 链接有效性
- [ ] 构建是否通过
- [ ] 风格一致性

---

## 四、更新日志 (Changelog)

### 2026-05

| 日期 | 变更内容 |
|------|----------|
| 0526 | 填充附录内容（工具速查手册、术语表、构建维护、许可证） |
| 0524 | KM 1. SQL 完全指南 8 个子章节全部填充教学级内容并完成代码审查修复 |
| 0520 之前 | 配置 VitePress 导航与侧边栏、填充学习路径全部 15 篇文章、填充知识地图部分文章 |

### 2026-04

| 日期 | 变更内容 |
|------|----------|
| 0415 | 初始化 VitePress 项目，配置站点结构与部署流水线 |
| 0405 | 撰写 BI 知识指南设计文档与实施计划 |

### 计划中

- [ ] KM 2 - KM 12 完整内容填充
- [ ] 面试专区完整内容
- [ ] 职业发展章节完整内容
- [ ] 搜索功能配置
- [ ] 图床和图表示例集成
- [ ] 在线代码运行环境 (SQL / Python)

---

## 五、部署

本站目前通过以下方式部署：

- **托管平台**：GitHub Pages（通过 GitHub Actions 自动部署）
- **触发方式**：推送至 `main` 分支自动触发构建
- **自定义域名**：无，使用默认 GitHub Pages 域名

如需部署到其他平台（Vercel / Netlify），只需将构建命令设为 `npm run build`，输出目录设为 `docs/.vitepress/dist` 即可。
