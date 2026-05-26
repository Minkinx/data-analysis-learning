import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'BI 数据分析知识指南',
  description: '面向初中级数据分析师的系统化知识体系',
  lang: 'zh-CN',
  lastUpdated: true,
  cleanUrls: true,
  srcExclude: ['superpowers/**'],

  themeConfig: {
    logo: null,
    siteTitle: 'BI 知识指南',
    nav: [
      { text: '首页', link: '/' },
      { text: '学习路径', link: '/learning-paths/' },
      { text: '知识地图', link: '/knowledge-map/' },
      { text: '面试专区', link: '/interview/' },
      { text: '职业发展', link: '/career/' },
      { text: '附录', link: '/appendix/' },
    ],

    sidebar: {
      '/learning-paths/': [
        {
          text: '学习路径',
          items: [
            { text: '概览', link: '/learning-paths/' },
            {
              text: '路径一：基础能力巩固',
              collapsed: false,
              items: [
                { text: 'SQL 核心精讲', link: '/learning-paths/path-1-basics/01-sql-core' },
                { text: 'Python 数据分析', link: '/learning-paths/path-1-basics/02-python' },
                { text: '统计学快速复习', link: '/learning-paths/path-1-basics/03-statistics' },
              ]
            },
            {
              text: '路径二：独立分析能力',
              collapsed: true,
              items: [
                { text: '数据建模入门', link: '/learning-paths/path-2-core/01-data-modeling' },
                { text: '分析方法论', link: '/learning-paths/path-2-core/02-analysis-methods' },
                { text: 'BI 工具实战', link: '/learning-paths/path-2-core/03-bi-tools' },
                { text: '业务指标体系建设', link: '/learning-paths/path-2-core/04-metrics' },
                { text: '数据可视化与报告', link: '/learning-paths/path-2-core/05-visualization' },
              ]
            },
            {
              text: '路径三：进阶突破',
              collapsed: true,
              items: [
                { text: '数据工程基础', link: '/learning-paths/path-3-advanced/01-data-engineering' },
                { text: '实验与因果推断', link: '/learning-paths/path-3-advanced/02-experiments' },
                { text: '数据治理与质量', link: '/learning-paths/path-3-advanced/03-governance' },
                { text: 'ML for BI', link: '/learning-paths/path-3-advanced/04-ml' },
              ]
            },
            {
              text: '路径四：职场进阶',
              collapsed: true,
              items: [
                { text: '沟通与协作', link: '/learning-paths/path-4-career/01-communication' },
                { text: '分析思维培养', link: '/learning-paths/path-4-career/02-thinking' },
                { text: '职业发展', link: '/learning-paths/path-4-career/03-development' },
              ]
            },
          ]
        }
      ],
      '/knowledge-map/': [
        {
          text: '知识地图',
          items: [
            { text: '概览', link: '/knowledge-map/' },
            { text: 'KM 1. SQL 完全指南', link: '/knowledge-map/km-1-sql/' },
            { text: 'KM 2. Python 数据分析', link: '/knowledge-map/km-2-python' },
            { text: 'KM 3. 统计学与概率论', link: '/knowledge-map/km-3-statistics' },
            { text: 'KM 4. 数据建模', link: '/knowledge-map/km-4-data-modeling/' },
            { text: 'KM 5. 分析方法论', link: '/knowledge-map/km-5-analysis-methods/' },
            { text: 'KM 6. BI 工具与可视化', link: '/knowledge-map/km-6-bi-visualization/' },
            { text: 'KM 7. 业务指标体系', link: '/knowledge-map/km-7-metrics/' },
            { text: 'KM 8. 数据工程基础', link: '/knowledge-map/km-8-data-engineering' },
            { text: 'KM 9. 实验与因果推断', link: '/knowledge-map/km-9-experiments' },
            { text: 'KM 10. 数据治理与质量', link: '/knowledge-map/km-10-governance' },
            { text: 'KM 11. 机器学习基础', link: '/knowledge-map/km-11-ml' },
            { text: 'KM 12. 数据产品与工具链', link: '/knowledge-map/km-12-tools' },
          ]
        }
      ],
      '/interview/': [
        {
          text: '面试专区',
          items: [
            { text: '概览', link: '/interview/' },
            { text: 'IP 1. SQL 面试题库', link: '/interview/ip-1-sql/' },
            { text: 'IP 2. Python 面试题', link: '/interview/ip-2-python' },
            { text: 'IP 3. 统计学与概率题', link: '/interview/ip-3-statistics' },
            { text: 'IP 4. Case Study', link: '/interview/ip-4-case-study/' },
            { text: 'IP 5. Product Sense', link: '/interview/ip-5-product-sense' },
            { text: 'IP 6. 行为面试', link: '/interview/ip-6-behavioral' },
            { text: 'IP 7. 面试策略', link: '/interview/ip-7-strategy' },
          ]
        }
      ],
      '/career/': [
        {
          text: '职业发展',
          items: [
            { text: '概览', link: '/career/' },
            { text: '岗位全景图', link: '/career/cd-1-overview' },
            { text: '能力成长路线', link: '/career/cd-2-growth-path' },
            { text: '学习资源推荐', link: '/career/cd-3-resources' },
            { text: '职场软技能', link: '/career/cd-4-soft-skills' },
          ]
        }
      ],
      '/appendix/': [
        {
          text: '附录',
          items: [
            { text: '概览', link: '/appendix/' },
            { text: '工具速查手册', link: '/appendix/ap-1-cheatsheets' },
            { text: '术语表', link: '/appendix/ap-2-glossary' },
            { text: '构建与维护', link: '/appendix/ap-3-maintenance' },
            { text: '许可证与声明', link: '/appendix/ap-4-license' },
          ]
        }
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/minkinx' },
    ],

    footer: {
      message: '基于 CC BY-NC-SA 4.0 许可发布',
      copyright: 'Copyright 2026-present',
    },

    editLink: {
      pattern: 'https://github.com/minkinx/data_analysis/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页',
    },

    lastUpdatedText: '最后更新',
  },
})
