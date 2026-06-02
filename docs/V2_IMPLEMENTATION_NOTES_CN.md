# Chokepoint Atlas 2.0 易实现功能评估

## 结论

2.0 里最好优先实现的不是新的复杂模型，而是把源码已经能生成的结构化产物做成网页可读的研究工作台。

当前最适合先做的功能：

1. Evidence Engine 展示层
2. Graph Engine 展示层
3. Scoring Engine 展示层
4. Output Engine 的多视图整合
5. 多赛道比较器 UI

原因很简单：这些数据在现有脚本里已经基本生成了，网页只需要把 `research_pack`、`scorecard`、`graph`、`evidence_memo`、`lane_ranking` 这些结果从纯文本/JSON 变成卡片、表格、评分条和图谱预览。

## 已经好实现并已落地

### Evidence Engine

源码已经会把 evidence 标成 `Confirmed`、`Inferred`、`Weak`、`Needs verification`。网页层最容易做的是证据表：

- 强度标签
- 实体
- 标题
- 摘要
- 来源链接

这一步对用户价值很高，因为它直接解决“这条判断硬不硬”的问题。

### Graph Engine

源码已经生成：

- `graph.json`
- Mermaid 文本

网页层先做图谱统计和 Mermaid 预览即可：

- 节点数
- 关系数
- Mermaid 文本

下一步再做真正的可视化 graph viewer。

### Scoring Engine

源码已经有：

- Lane Score
- Name Score
- `constraint/evidence/consensus/mispricing/catalyst`

网页层最容易做的是评分条和候选公司表格。这能直接让用户比较“哪个方向更值得继续研究”。

### Output Engine

源码已经输出：

- Quick Scan
- Evidence Memo
- Graph Card
- Scorecard
- Catalyst Watch

网页层应该保留 markdown/JSON 原始输出，同时增加结构化浏览。这样不会丢原功能，也能让结果更像产品。

### Lane Compare

源码已经有 `compare_lanes.py`。网页层只需要把 `lane_ranking` 做成排名表，再展示 compare memo。

## 暂时不该重做的功能

### 新闻 / 财报 / 研报抽取器

这部分价值很大，但会引入外部数据源、抓取、去重、引用、可信度和时效问题，复杂度明显高于 UI 展示层。

### 自动投资建议

不应该做成默认能力。产品定位是研究优先级和瓶颈分析，不是直接喊票。

### 大型前端框架迁移

当前 Web Studio 是无依赖本地工具。第一阶段没必要引入 React/Vite/Tailwind。先把信息架构、布局和状态做好。

## 当前网页优化方向

本轮网页 UI 保留了原有功能：

- JSON 输入框
- 加载示例
- 三模式运行：研究包、方向比较、资料流水线
- 原始 JSON 查看

新增/优化：

- 顶部 2.0 模块状态
- 总览摘要卡片
- 候选公司评分表
- 证据分层表
- Lane Score 评分条
- 催化剂观察卡
- 图谱统计和 Mermaid 预览
- 更清晰的响应式布局和错误状态

## 下一步建议

1. 做可视化 graph viewer，而不是只显示 Mermaid 文本。
2. 做表单化 JSON 编辑器，降低输入门槛。
3. 增加一键导出 HTML 报告。
4. 给 evidence 增加 freshness / credibility 字段。
5. 给 catalyst 增加日期和状态，形成 watchlist。
