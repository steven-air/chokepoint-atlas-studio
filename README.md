# Chokepoint Atlas Studio 中文说明

[English README](./README_EN.md)

Chokepoint Atlas Studio 是 `Chokepoint Atlas` 的二开版本，目标是把原来的 Agent Skill 和 Python 脚本做成更容易使用的研究工具。

它默认提供两种入口：

- CLI：适合批量生成、自动化、重复跑研究包
- Web Studio：适合在浏览器里粘贴 JSON、查看评分、备忘录和图谱

核心逻辑不变：先把一个 AI 基建叙事拆成真实供应链，再找最可能卡住系统的瓶颈层，用证据交叉验证，最后再给方向和候选公司。

## 适合研究什么

- AI 光通信
- 半导体封装和测试
- 数据中心供电
- 液冷和热管理
- 机器人供应链
- AI factory 基础设施
- 其他有真实产能、认证周期、替代性约束的产业链

它不是一个直接报股票代码的工具。正确用法是先建立 thesis，再看名字。

## 安装

需要 Python 3.10 或更新版本。

```bash
git clone https://github.com/steven-air/chokepoint-atlas-studio.git
cd chokepoint-atlas-studio
python -m pip install -e .
```

本项目运行时不依赖第三方包。

如果 Windows 上 `chokepoint-atlas` 命令不在 PATH，可以直接用：

```bash
python -m chokepoint_atlas.cli --help
```

## CLI 使用

生成单 lane 输入模板：

```bash
python -m chokepoint_atlas.cli init --kind pack --output my-lane.json
```

生成研究包：

```bash
python -m chokepoint_atlas.cli build --input my-lane.json --output out/my-lane
```

比较多个 lane：

```bash
python -m chokepoint_atlas.cli init --kind compare --output lanes.json
python -m chokepoint_atlas.cli compare --input lanes.json --output out/lane-compare
```

从 source bundle 跑完整 pipeline：

```bash
python -m chokepoint_atlas.cli init --kind sources --output sources.json
python -m chokepoint_atlas.cli pipeline --input sources.json --output out/source-pipeline
```

输出包括：

- `quick_scan.md`
- `evidence_memo.md`
- `scorecard.json`
- `graph.json`
- `graph_mermaid.md`
- `validation_report.json`
- `catalyst_watch.md`

## Web Studio 使用

启动本地浏览器界面：

```bash
python -m chokepoint_atlas.cli studio
```

打开：

```text
http://127.0.0.1:8765/
```

Web Studio 默认中文界面，支持三种模式：

- 研究包：单条供应链研究包
- 方向比较：多条方向比较
- 资料流水线：从松散资料包生成 draft，再生成最终研究包

界面会加载示例 JSON，也可以直接粘贴自己的 JSON，然后点 `运行` 预览结果。

## 二开优化内容

这个版本已经补了：

- `pyproject.toml`，支持 `pip install -e .`
- 统一 CLI：`init`、`build`、`compare`、`pipeline`、`studio`
- 无依赖 Web Studio
- 默认中文 README 和中文 Web 界面
- 安装文档 `INSTALL.md`
- 优化评审文档 `docs/OPTIMIZATION_REVIEW.md`

## 后续可以继续优化

- Web 表单化编辑，不再要求手写 JSON
- 一键导出 HTML 报告
- 证据 freshness / credibility 评分
- catalyst watchlist 状态跟踪
- 更多示例行业模板
- CLI 和 Web 的自动化测试
