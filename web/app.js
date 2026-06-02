const input = document.querySelector("#inputJson");
const output = document.querySelector("#output");
const statusEl = document.querySelector("#status");
const modeEl = document.querySelector("#mode");
const tabs = [...document.querySelectorAll(".tab")];

let lastResult = null;
let activeTab = "quick";

function setStatus(text) {
  statusEl.textContent = text;
}

function render() {
  if (!lastResult) {
    output.textContent = "运行当前输入后查看结果。";
    return;
  }
  const views = {
    quick: lastResult.quick_scan || lastResult.ranked_lane_table || "当前模式没有快速视图。",
    memo: lastResult.evidence_memo || lastResult.lane_compare_memo || "当前模式没有备忘录。",
    score: JSON.stringify(lastResult.scorecard || lastResult.lane_ranking || lastResult.extraction_report || {}, null, 2),
    graph: lastResult.graph_mermaid || "当前模式没有图谱。",
    json: JSON.stringify(lastResult, null, 2),
  };
  output.textContent = views[activeTab] || "";
}

async function loadSample() {
  setStatus("正在加载示例...");
  const response = await fetch(`/api/sample?kind=${encodeURIComponent(modeEl.value)}`);
  const payload = await response.json();
  input.value = JSON.stringify(payload, null, 2);
  setStatus("示例已加载");
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
    setStatus("运行成功");
    render();
  } catch (error) {
    lastResult = null;
    output.textContent = String(error.message || error);
    setStatus("错误");
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
  loadSample().then(buildPack);
});

loadSample().then(buildPack);
