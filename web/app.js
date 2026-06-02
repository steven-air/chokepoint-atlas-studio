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
    output.textContent = "Run the current input to see results.";
    return;
  }
  const views = {
    quick: lastResult.quick_scan || lastResult.ranked_lane_table || "No quick view for this mode.",
    memo: lastResult.evidence_memo || lastResult.lane_compare_memo || "No memo for this mode.",
    score: JSON.stringify(lastResult.scorecard || lastResult.lane_ranking || lastResult.extraction_report || {}, null, 2),
    graph: lastResult.graph_mermaid || "No graph for this mode.",
    json: JSON.stringify(lastResult, null, 2),
  };
  output.textContent = views[activeTab] || "";
}

async function loadSample() {
  setStatus("Loading sample...");
  const response = await fetch(`/api/sample?kind=${encodeURIComponent(modeEl.value)}`);
  const payload = await response.json();
  input.value = JSON.stringify(payload, null, 2);
  setStatus("Sample loaded");
}

async function buildPack() {
  try {
    setStatus("Building...");
    const payload = JSON.parse(input.value);
    const response = await fetch(`/api/build?mode=${encodeURIComponent(modeEl.value)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!result.ok) {
      throw new Error(result.error || "Build failed");
    }
    lastResult = result;
    setStatus("Built successfully");
    render();
  } catch (error) {
    lastResult = null;
    output.textContent = String(error.message || error);
    setStatus("Error");
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
