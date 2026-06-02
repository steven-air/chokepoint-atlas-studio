const input = document.querySelector("#inputJson");
const output = document.querySelector("#output");
const summary = document.querySelector("#summary");
const statusEl = document.querySelector("#status");
const modeEl = document.querySelector("#mode");
const tabs = [...document.querySelectorAll(".tab")];

let lastResult = null;
let activeTab = "overview";

const scoreLabels = {
  constraint_score: "瓶颈强度",
  evidence_score: "证据强度",
  consensus_score: "共识差",
  mispricing_score: "错配空间",
  catalyst_score: "催化剂",
  total_average: "综合",
  constraint: "瓶颈强度",
  evidence: "证据强度",
  consensus: "共识差",
  mispricing: "错配空间",
  catalyst: "催化剂",
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setStatus(text, kind = "ready") {
  statusEl.textContent = text;
  statusEl.className = `status ${kind}`;
}

function activeModeLabel() {
  return modeEl.options[modeEl.selectedIndex]?.textContent || "研究包";
}

function priorityBadge(priority) {
  const text = String(priority || "未评级");
  const cls = text.includes("high") || text.includes("High") ? "" : text.includes("Lower") ? "danger" : "warn";
  return `<span class="badge ${cls}">${escapeHtml(text)}</span>`;
}

function scoreBar(label, value) {
  const num = Number(value || 0);
  const pct = Math.max(0, Math.min(100, (num / 5) * 100));
  return `
    <div class="metricRow">
      <span>${escapeHtml(label)}</span>
      <div class="bar"><span style="width:${pct}%"></span></div>
      <strong>${num.toFixed(2)}</strong>
    </div>
  `;
}

function renderScoreBars(scores = {}) {
  const keys = Object.keys(scores).filter((key) => typeof scores[key] === "number");
  if (!keys.length) return `<p>暂无评分数据。</p>`;
  return `<div class="metricList">${keys.map((key) => scoreBar(scoreLabels[key] || key, scores[key])).join("")}</div>`;
}

function renderMarkdown(text) {
  return `<pre class="markdown">${escapeHtml(text || "暂无内容。")}</pre>`;
}

function getPack() {
  return lastResult?.research_pack || null;
}

function getEvidence() {
  const pack = getPack();
  return pack?.evidence || [];
}

function getCatalysts() {
  const pack = getPack();
  return pack?.catalysts || [];
}

function getScorecard() {
  return lastResult?.scorecard || null;
}

function getLaneScores() {
  return getScorecard()?.lane?.scores || getPack()?.lane_score || {};
}

function renderSummary() {
  if (!lastResult) {
    summary.innerHTML = `
      <div class="summaryCard"><span>当前模式</span><strong>${escapeHtml(activeModeLabel())}</strong><em>加载示例或粘贴 JSON 后运行</em></div>
      <div class="summaryCard"><span>2.0 模块</span><strong>4 个</strong><em>证据 / 图谱 / 评分 / 输出</em></div>
      <div class="summaryCard"><span>状态</span><strong>待运行</strong><em>保留原始 JSON 编辑</em></div>
      <div class="summaryCard"><span>输出</span><strong>预览</strong><em>运行后生成结构化视图</em></div>
    `;
    return;
  }

  if (lastResult.mode === "compare") {
    const lanes = lastResult.lane_ranking?.lanes || [];
    const top = lanes[0];
    summary.innerHTML = `
      <div class="summaryCard"><span>模式</span><strong>方向比较</strong><em>${lanes.length} 条赛道</em></div>
      <div class="summaryCard"><span>第一优先级</span><strong>${escapeHtml(top?.lane || "-")}</strong><em>${escapeHtml(top?.priority || "")}</em></div>
      <div class="summaryCard"><span>最高综合分</span><strong>${Number(top?.lane_score?.total_average || 0).toFixed(2)}</strong><em>满分 5</em></div>
      <div class="summaryCard"><span>候选名称</span><strong>${escapeHtml((top?.top_names || []).join(", ") || "-")}</strong><em>Top names</em></div>
    `;
    return;
  }

  const pack = getPack();
  const laneScores = getLaneScores();
  const graph = lastResult.graph || {};
  summary.innerHTML = `
    <div class="summaryCard"><span>赛道</span><strong>${escapeHtml(pack?.thesis?.lane || "-")}</strong><em>${escapeHtml(pack?.meta?.title || "")}</em></div>
    <div class="summaryCard"><span>优先级</span><strong>${escapeHtml(pack?.lane_priority || getScorecard()?.lane?.priority || "-")}</strong><em>综合分 ${Number(laneScores.total_average || 0).toFixed(2)} / 5</em></div>
    <div class="summaryCard"><span>证据</span><strong>${getEvidence().length}</strong><em>按强度排序</em></div>
    <div class="summaryCard"><span>图谱</span><strong>${graph.nodes?.length || 0} 节点</strong><em>${graph.edges?.length || 0} 条关系</em></div>
  `;
}

function renderOverview() {
  if (!lastResult) {
    return `<div class="emptyState">运行当前输入后查看 2.0 研究包总览。</div>`;
  }

  if (lastResult.mode === "compare") {
    const lanes = lastResult.lane_ranking?.lanes || [];
    return `
      <div class="contentGrid">
        <div class="tableCard full">
          <h3>多赛道优先级</h3>
          ${renderLaneTable(lanes)}
        </div>
        <div class="contentCard full">
          <h3>比较备忘录</h3>
          ${renderMarkdown(lastResult.lane_compare_memo)}
        </div>
      </div>
    `;
  }

  const pack = getPack();
  const thesis = pack?.thesis || {};
  const topNames = getScorecard()?.names?.slice(0, 5) || pack?.top_names || [];
  return `
    <div class="contentGrid">
      <div class="contentCard full">
        <h3>核心判断</h3>
        <p>${escapeHtml(thesis.thesis_sentence || "暂无 thesis。")}</p>
      </div>
      <div class="contentCard">
        <h3>瓶颈判断</h3>
        <p>${escapeHtml(thesis.bottleneck_call || "-")}</p>
      </div>
      <div class="contentCard">
        <h3>反证条件</h3>
        <p>${escapeHtml(thesis.thesis_breaker || "-")}</p>
      </div>
      <div class="tableCard full">
        <h3>候选名称评分</h3>
        ${renderNameTable(topNames)}
      </div>
    </div>
  `;
}

function renderLaneTable(lanes) {
  if (!lanes.length) return `<p>暂无赛道数据。</p>`;
  return `
    <table>
      <thead>
        <tr><th>排名</th><th>赛道</th><th>终端系统</th><th>综合分</th><th>优先级</th><th>Top names</th></tr>
      </thead>
      <tbody>
        ${lanes
          .map(
            (lane, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${escapeHtml(lane.lane)}</td>
                <td>${escapeHtml(lane.end_system)}</td>
                <td>${Number(lane.lane_score?.total_average || 0).toFixed(2)}</td>
                <td>${priorityBadge(lane.priority)}</td>
                <td>${escapeHtml((lane.top_names || []).join(", "))}</td>
              </tr>
            `,
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function renderNameTable(names) {
  if (!names.length) return `<p>暂无候选公司。</p>`;
  return `
    <table>
      <thead>
        <tr><th>代码</th><th>公司</th><th>角色</th><th>层级</th><th>综合分</th><th>风险</th></tr>
      </thead>
      <tbody>
        ${names
          .map(
            (item) => `
              <tr>
                <td><strong>${escapeHtml(item.ticker)}</strong></td>
                <td>${escapeHtml(item.name)}</td>
                <td>${escapeHtml(item.role)}</td>
                <td>${escapeHtml(item.stack_layer)}</td>
                <td>${Number(item.scores?.total_average ?? item.total_average ?? 0).toFixed(2)}</td>
                <td>${escapeHtml(item.risk || "-")}</td>
              </tr>
            `,
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function renderEvidence() {
  const evidence = getEvidence();
  if (!evidence.length) return `<div class="emptyState">当前结果没有证据列表。</div>`;
  return `
    <div class="tableCard full">
      <h3>证据分层</h3>
      <table>
        <thead>
          <tr><th>强度</th><th>实体</th><th>标题</th><th>摘要</th><th>来源</th></tr>
        </thead>
        <tbody>
          ${evidence
            .map((item) => {
              const label = item.label || item.tier || "Needs verification";
              const badgeClass = label === "Confirmed" ? "" : label === "Inferred" ? "warn" : "danger";
              return `
                <tr>
                  <td><span class="badge ${badgeClass}">${escapeHtml(label)}</span></td>
                  <td>${escapeHtml(item.entity)}</td>
                  <td>${escapeHtml(item.title)}</td>
                  <td>${escapeHtml(item.summary)}</td>
                  <td>${item.url ? `<a href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">打开</a>` : "-"}</td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderScore() {
  if (lastResult?.mode === "compare") {
    return `<div class="tableCard full"><h3>方向评分</h3>${renderLaneTable(lastResult.lane_ranking?.lanes || [])}</div>`;
  }
  const scorecard = getScorecard();
  if (!scorecard) return `<div class="emptyState">当前结果没有评分卡。</div>`;
  return `
    <div class="contentGrid">
      <div class="contentCard">
        <h3>Lane Score</h3>
        ${renderScoreBars(scorecard.lane?.scores || {})}
      </div>
      <div class="contentCard">
        <h3>催化剂观察</h3>
        ${renderCatalysts()}
      </div>
      <div class="tableCard full">
        <h3>Name Score</h3>
        ${renderNameTable(scorecard.names || [])}
      </div>
    </div>
  `;
}

function renderCatalysts() {
  const catalysts = getCatalysts();
  if (!catalysts.length) return `<p>暂无催化剂。</p>`;
  return `<ul>${catalysts.map((item) => `<li>${escapeHtml(item.label)}：${escapeHtml(item.watch_for || "")}</li>`).join("")}</ul>`;
}

function renderGraph() {
  if (lastResult?.mode === "compare") {
    return `<div class="emptyState">方向比较模式暂不生成关系图谱，请切换到研究包或资料流水线。</div>`;
  }
  const graph = lastResult?.graph || {};
  return `
    <div class="graphStats">
      <div class="summaryCard"><span>节点</span><strong>${graph.nodes?.length || 0}</strong><em>系统 / 部件 / 公司 / 证据 / 催化剂</em></div>
      <div class="summaryCard"><span>关系</span><strong>${graph.edges?.length || 0}</strong><em>depends / supplies / confirmed</em></div>
      <div class="summaryCard"><span>Mermaid</span><strong>${lastResult?.graph_mermaid ? "已生成" : "无"}</strong><em>可复制到支持 Mermaid 的工具</em></div>
    </div>
    ${renderMarkdown(lastResult?.graph_mermaid || "暂无图谱。")}
  `;
}

function renderJson() {
  return `<pre class="jsonBlock">${escapeHtml(JSON.stringify(lastResult || {}, null, 2))}</pre>`;
}

function render() {
  renderSummary();
  const views = {
    overview: renderOverview,
    memo: () => renderMarkdown(lastResult?.evidence_memo || lastResult?.lane_compare_memo || "暂无备忘录。"),
    evidence: renderEvidence,
    score: renderScore,
    graph: renderGraph,
    json: renderJson,
  };
  output.innerHTML = (views[activeTab] || views.overview)();
}

async function loadSample() {
  setStatus("正在加载示例...");
  const response = await fetch(`/api/sample?kind=${encodeURIComponent(modeEl.value)}`);
  const payload = await response.json();
  input.value = JSON.stringify(payload, null, 2);
  setStatus("示例已加载", "success");
}

async function buildPack() {
  try {
    setStatus("正在运行...");
    const payload = JSON.parse(input.value);
    const response = await fetch(`/api/build?mode=${encodeURIComponent(modeEl.value)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!result.ok) {
      throw new Error(result.error || "运行失败");
    }
    lastResult = result;
    setStatus("运行成功", "success");
    render();
  } catch (error) {
    lastResult = null;
    renderSummary();
    output.innerHTML = `<div class="errorState">${escapeHtml(error.message || error)}</div>`;
    setStatus("错误", "error");
  }
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    activeTab = tab.dataset.tab;
    render();
  });
});

document.querySelector("#loadSample").addEventListener("click", loadSample);
document.querySelector("#buildPack").addEventListener("click", buildPack);
modeEl.addEventListener("change", () => {
  lastResult = null;
  activeTab = "overview";
  tabs.forEach((item) => item.classList.toggle("active", item.dataset.tab === "overview"));
  renderSummary();
  loadSample().then(buildPack);
});

renderSummary();
loadSample().then(buildPack);
