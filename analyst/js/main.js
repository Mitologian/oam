import { fetchBatchDetail } from "./api.js";
import { aggregateBatch } from "./analysis.js";
import { buildDiagnosis } from "./diagnosis.js";
import {
  renderExecutiveSummary,
  renderRankings,
  renderCausalChains,
  renderBatchHeader,
  renderOpenResponsesExplorer
} from "./render.js";

const params = new URLSearchParams(window.location.search);
const batchId = params.get("batch");

const CHART_MAX_SCORE = 4;

const GAP_ID_ORDER = [
  "strategic_clarity",
  "leadership_alignment",
  "execution_system",
  "collaboration",
  "capability_fit",
  "culture_engagement"
];

const GAP_LABEL_ORDER = [
  "Strategic Clarity Gap",
  "Leadership Alignment Gap",
  "Execution System Gap",
  "Collaboration Gap",
  "Capability Fit Gap",
  "Culture Engagement Gap"
];

const LEGACY_GAP_ID_MAP = {
  strategic_clarity: "strategic_clarity",
  leadership_alignment: "leadership_alignment",
  execution_system: "execution_system",
  collaboration: "collaboration",
  capability_fit: "capability_fit",
  culture_engagement: "culture_engagement",

  // legacy ids
  strategy_translation: "execution_system",
  capability: "capability_fit"
};

const GAP_LABEL_MAP = {
  strategic_clarity: "Strategic Clarity Gap",
  leadership_alignment: "Leadership Alignment Gap",
  execution_system: "Execution System Gap",
  collaboration: "Collaboration Gap",
  capability_fit: "Capability Fit Gap",
  culture_engagement: "Culture Engagement Gap"
};

const LAYER_ORDER = [
  "Strategic Foundation",
  "Leadership System",
  "Management Cascade",
  "Team Execution",
  "Individual Development"
];

const DRIVER_ORDER = [
  "D1", "D2", "D3", "D4", "D5", "D6",
  "D7", "D8", "D9", "D10", "D11", "D12"
];

const DRIVER_NAME_MAP = {
  D1: "Vision & Direction Clarity",
  D2: "Strategy & Priority to Team Alignment",
  D3: "Leadership Alignment & Consistency",
  D4: "Role & Responsibility Clarity",
  D5: "Decision Making Effectiveness",
  D6: "Management System Alignment & KPI Clarity",
  D7: "Performance & Accountability",
  D8: "Communication Flow",
  D9: "Cross-Team Collaboration",
  D10: "Capability & Skill Readiness",
  D11: "Ownership & Initiative",
  D12: "Feedback & Continuous Learning"
};

function safeNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatScore(value, digits = 2) {
  const num = safeNumber(value, 0);
  return num.toFixed(digits);
}

function titleCase(text) {
  if (!text || typeof text !== "string") return "-";
  return text
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function getEl(id) {
  return document.getElementById(id);
}

function getReadinessStatus(responseCount) {
  const count = safeNumber(responseCount, 0);

  if (count < 8) {
    return { label: "Insufficient Data", className: "status-insufficient", progress: 18 };
  }
  if (count <= 14) {
    return { label: "Early Signal Only", className: "status-weak", progress: 42 };
  }
  if (count <= 29) {
    return { label: "Ready for Analysis", className: "status-stable", progress: 72 };
  }
  return { label: "High Confidence Sample", className: "status-strong", progress: 100 };
}

function getStatusClass(score) {
  if (score <= 1.9) return "tile-critical";
  if (score <= 2.7) return "tile-weak";
  if (score <= 3.4) return "tile-stable";
  return "tile-strong";
}

function getStatusLabel(score) {
  if (score <= 1.9) return "Critical";
  if (score <= 2.7) return "Weak";
  if (score <= 3.4) return "Stable";
  return "Strong";
}

function extractHealthScore(aggregate, diagnosis) {
  const candidateValues = [
    diagnosis?.overallScore,
    aggregate?.overallScore,
    aggregate?.healthScore
  ];

  for (const value of candidateValues) {
    const num = Number(value);
    if (Number.isFinite(num) && num > 0) return num;
  }

  const driverScores =
    extractDriverArray(aggregate, diagnosis)
      .map(item => safeNumber(item.score, NaN))
      .filter(Number.isFinite);

  if (driverScores.length) {
    const avg = driverScores.reduce((sum, n) => sum + n, 0) / driverScores.length;
    return Number(avg.toFixed(2));
  }

  return 0;
}

function extractDominantLayer(diagnosis, aggregate) {
  return (
    diagnosis?.likelyLayer ||
    diagnosis?.dominantLayer?.label ||
    diagnosis?.dominantLayer ||
    aggregate?.dominantLayer?.label ||
    aggregate?.dominantLayer ||
    "-"
  );
}

function extractDriverArray(aggregate, diagnosis) {
  const sources = [
    aggregate?.drivers,
    diagnosis?.drivers,
    diagnosis?.weakestDrivers
  ];

  for (const source of sources) {
    if (Array.isArray(source) && source.length) {
      return source.map(item => {
        const code =
          item.code ||
          item.id ||
          item.key ||
          item.driverCode ||
          item.driver ||
          item.name ||
          "-";

        const label =
          item.label ||
          item.title ||
          item.name ||
          DRIVER_NAME_MAP[code] ||
          titleCase(String(code));

        const score =
          item.score ??
          item.value ??
          item.avg ??
          item.average ??
          item.mean ??
          0;

        return {
          code,
          id: code,
          name: label,
          label,
          score: safeNumber(score, 0)
        };
      });
    }
  }

  return [];
}

function normalizeGapId(id, label) {
  const rawId = String(id || "").trim();
  const rawLabel = String(label || "").trim().toLowerCase();

  if (LEGACY_GAP_ID_MAP[rawId]) return LEGACY_GAP_ID_MAP[rawId];

  if (rawLabel.includes("strategic clarity")) return "strategic_clarity";
  if (rawLabel.includes("leadership alignment")) return "leadership_alignment";
  if (rawLabel.includes("execution system")) return "execution_system";
  if (rawLabel.includes("strategy translation")) return "execution_system";
  if (rawLabel.includes("collaboration")) return "collaboration";
  if (rawLabel.includes("capability fit")) return "capability_fit";
  if (rawLabel === "capability" || rawLabel.includes("capability gap")) return "capability_fit";
  if (rawLabel.includes("culture engagement")) return "culture_engagement";
  if (rawLabel.includes("culture & engagement")) return "culture_engagement";

  return rawId || "-";
}

function normalizeGapLabel(id, label) {
  const finalId = normalizeGapId(id, label);
  return GAP_LABEL_MAP[finalId] || titleCase(String(label || finalId));
}

function extractGapArray(aggregate, diagnosis) {
  const sources = [
    aggregate?.gaps,
    diagnosis?.gaps,
    diagnosis?.weakestGaps
  ];

  for (const source of sources) {
    if (Array.isArray(source) && source.length) {
      const normalized = source.map(item => {
        const rawId = item.id || item.code || item.key || item.label || "-";
        const rawLabel =
          item.label ||
          item.title ||
          item.name ||
          item.code ||
          item.id ||
          "-";

        const finalId = normalizeGapId(rawId, rawLabel);

        const score =
          item.score ??
          item.value ??
          item.avg ??
          item.average ??
          0;

        return {
          id: finalId,
          label: normalizeGapLabel(rawId, rawLabel),
          score: safeNumber(score, 0)
        };
      });

      // merge duplicates caused by legacy/new ids collapsing into same final id
      const mergedMap = {};
      normalized.forEach(item => {
        if (!mergedMap[item.id]) {
          mergedMap[item.id] = { ...item, _count: 1 };
        } else {
          mergedMap[item.id].score += item.score;
          mergedMap[item.id]._count += 1;
        }
      });

      return Object.values(mergedMap).map(item => ({
        id: item.id,
        label: item.label,
        score: Number((item.score / item._count).toFixed(2))
      }));
    }
  }

  return [];
}

function extractLayerArray(aggregate, diagnosis) {
  const sources = [
    aggregate?.layers,
    diagnosis?.layers
  ];

  for (const source of sources) {
    if (Array.isArray(source) && source.length) {
      return source.map(item => {
        const label =
          item.label ||
          item.title ||
          item.name ||
          item.code ||
          item.id ||
          "-";

        const score =
          item.score ??
          item.value ??
          item.avg ??
          item.average ??
          0;

        return {
          label: titleCase(String(label)),
          score: safeNumber(score, 0)
        };
      });
    }
  }

  const dominantLayer = extractDominantLayer(diagnosis, aggregate);
  if (dominantLayer && dominantLayer !== "-") {
    return [{ label: titleCase(String(dominantLayer)), score: 1 }];
  }

  return [];
}

function renderKpiStrip({ responseCount, readiness, healthScore, dominantLayer }) {
  const responsesEl = getEl("kpiResponses");
  const readinessEl = getEl("kpiReadiness");
  const healthEl = getEl("kpiHealthScore");
  const layerEl = getEl("kpiLayer");

  if (responsesEl) responsesEl.textContent = String(responseCount ?? 0);
  if (readinessEl) readinessEl.textContent = readiness?.label || "-";
  if (healthEl) healthEl.textContent = healthScore ? formatScore(healthScore, 2) : "-";
  if (layerEl) layerEl.textContent = dominantLayer || "-";
}

function renderConfidenceMeter(readiness) {
  const fillEl = getEl("confidenceFill");
  const labelEl = getEl("confidenceStatusLabel");

  if (fillEl) {
    fillEl.style.width = `${clamp(safeNumber(readiness?.progress, 0), 0, 100)}%`;
  }

  if (labelEl) {
    labelEl.textContent = readiness?.label || "Awaiting data";
    labelEl.className = `confidence-status ${readiness?.className || ""}`.trim();
  }
}

function renderDriverMatrix(drivers) {
  const container = getEl("driverMatrix");
  if (!container) return;

  container.innerHTML = "";

  if (!drivers.length) {
    container.innerHTML = `<div class="empty-note">No driver data available yet.</div>`;
    return;
  }

  const ordered = [...drivers].sort(
    (a, b) => DRIVER_ORDER.indexOf(a.id) - DRIVER_ORDER.indexOf(b.id)
  );

  const topRiskIds = new Set(
    [...drivers]
      .sort((a, b) => a.score - b.score)
      .slice(0, 3)
      .map(d => d.id)
  );

  ordered.forEach(driver => {
    const tile = document.createElement("div");
    tile.className = `driver-tile ${getStatusClass(driver.score)}`;

    tile.innerHTML = `
      <div class="driver-code">${driver.id}</div>
      <div class="driver-name">
        ${driver.name}
        ${topRiskIds.has(driver.id) ? '<span class="top-risk">Top Risk</span>' : ''}
      </div>
      <div class="driver-score">${driver.score.toFixed(2)}</div>
      <div class="driver-status">${getStatusLabel(driver.score)}</div>
    `;

    container.appendChild(tile);
  });
}

function clearChartPlaceholder(canvasId) {
  const canvas = getEl(canvasId);
  if (!canvas) return null;

  const container = canvas.parentElement;
  if (!container) return null;

  const oldBars = container.querySelector(".fallback-bar-chart");
  if (oldBars) oldBars.remove();

  return { container };
}

function hidePlaceholderNote(container) {
  const note = container.querySelector(".chart-placeholder-note");
  if (note) note.style.display = "none";
}

function showPlaceholderNote(container, message = "No sufficient data available for this visual yet.") {
  const note = container.querySelector(".chart-placeholder-note");
  if (note) {
    note.style.display = "block";
    note.textContent = message;
  }
}

function getBarChartHeight(itemCount, options = {}) {
  const {
    rowHeight = 54,
    extraPadding = 24,
    minHeight = 140,
    maxHeight = 760
  } = options;

  const computed = itemCount * rowHeight + extraPadding;
  return clamp(computed, minHeight, maxHeight);
}

function getBarSeverityClass(score) {
  if (score <= 1.9) return "is-critical";
  if (score <= 2.7) return "is-weak";
  if (score <= 3.4) return "is-stable";
  return "is-strong";
}

function buildFallbackBarChart(items, options = {}) {
  const {
    valueFormatter = value => formatScore(value, 2),
    emptyText = "No data available",
    chartMaxScore = CHART_MAX_SCORE,
    severeIds = new Set(),
    keyField = "label"
  } = options;

  const wrapper = document.createElement("div");
  wrapper.className = "fallback-bar-chart";

  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "fallback-empty";
    empty.textContent = emptyText;
    wrapper.appendChild(empty);
    return wrapper;
  }

  items.forEach(item => {
    const row = document.createElement("div");
    row.className = "fallback-bar-row";

    const header = document.createElement("div");
    header.className = "fallback-bar-header";

    const labelWrap = document.createElement("div");
    labelWrap.className = "fallback-bar-label-wrap";

    const label = document.createElement("div");
    label.className = "fallback-bar-label";
    label.textContent = item.label || "-";

    labelWrap.appendChild(label);

    const itemKey = item[keyField] || item.label;
    if (severeIds.has(itemKey)) {
      const flag = document.createElement("span");
      flag.className = "severity-flag";
      flag.textContent = "Top Risk";
      labelWrap.appendChild(flag);
    }

    const value = document.createElement("div");
    value.className = "fallback-bar-value";
    value.textContent = valueFormatter(item.score);

    header.appendChild(labelWrap);
    header.appendChild(value);

    const track = document.createElement("div");
    track.className = "fallback-bar-track";

    const fill = document.createElement("div");
    fill.className = `fallback-bar-fill ${getBarSeverityClass(item.score)}`;

    const widthPct = chartMaxScore > 0 ? (safeNumber(item.score, 0) / chartMaxScore) * 100 : 0;
    fill.style.width = `${clamp(widthPct, 0, 100)}%`;

    const idealMarker = document.createElement("div");
    idealMarker.className = "fallback-bar-ideal-marker";
    idealMarker.title = `Ideal target: ${chartMaxScore}`;

    track.appendChild(fill);
    track.appendChild(idealMarker);
    row.appendChild(header);
    row.appendChild(track);
    wrapper.appendChild(row);
  });

  return wrapper;
}

function injectFallbackChartStylesOnce() {
  if (document.getElementById("fallbackBarChartStyles")) return;

  const style = document.createElement("style");
  style.id = "fallbackBarChartStyles";
  style.textContent = `
    .fallback-bar-chart { position: absolute; inset: 0; padding: 18px; overflow: hidden; background: transparent; }
    .fallback-empty { display: flex; align-items: center; justify-content: center; min-height: 100%; color: #6b7280; font-size: 13px; text-align: center; padding: 24px; }
    .fallback-bar-row + .fallback-bar-row { margin-top: 14px; }
    .fallback-bar-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 14px; margin-bottom: 7px; }
    .fallback-bar-label-wrap { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; max-width: 80%; }
    .fallback-bar-label { font-size: 13px; line-height: 1.45; font-weight: 600; color: #171717; }
    .fallback-bar-value { flex-shrink: 0; font-size: 12px; font-weight: 700; color: #525866; }
    .fallback-bar-track { position: relative; width: 100%; height: 10px; border-radius: 999px; background: #eef1f4; overflow: hidden; border: 1px solid #e6e7eb; }
    .fallback-bar-fill { position: relative; z-index: 1; height: 100%; border-radius: 999px; transition: width 0.25s ease; }
    .fallback-bar-fill.is-critical { background: linear-gradient(90deg, #c62828 0%, #b91c1c 100%); }
    .fallback-bar-fill.is-weak { background: linear-gradient(90deg, #d97706 0%, #b45309 100%); }
    .fallback-bar-fill.is-stable { background: linear-gradient(90deg, #eab308 0%, #ca8a04 100%); }
    .fallback-bar-fill.is-strong { background: linear-gradient(90deg, #16a34a 0%, #15803d 100%); }
    .fallback-bar-ideal-marker { position: absolute; top: -1px; right: 0; width: 2px; height: calc(100% + 2px); background: rgba(23, 23, 23, 0.22); z-index: 2; }
  `;
  document.head.appendChild(style);
}

function setChartPanelHeight(canvasId, height) {
  const canvas = getEl(canvasId);
  if (!canvas) return;

  const placeholder = canvas.parentElement;
  if (!placeholder) return;

  placeholder.style.minHeight = `${height}px`;
  placeholder.style.height = `${height}px`;
}

function getTop3LowestKeys(items, keyField = "label") {
  return new Set(
    [...items]
      .sort((a, b) => safeNumber(a.score, 0) - safeNumber(b.score, 0))
      .slice(0, 3)
      .map(item => item[keyField] || item.label)
  );
}

function renderGapPatternChart(gapItems) {
  const ref = clearChartPlaceholder("gapPatternChart");
  if (!ref) return;
  const { container } = ref;

  if (!gapItems.length) {
    showPlaceholderNote(container, "Gap pattern visual will appear once gap score data is available.");
    return;
  }

  hidePlaceholderNote(container);

  const ordered = [...gapItems].sort((a, b) => {
    const idxA = GAP_ID_ORDER.indexOf(a.id);
    const idxB = GAP_ID_ORDER.indexOf(b.id);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return 0;
  });

  const severeIds = getTop3LowestKeys(gapItems, "label");

  setChartPanelHeight("gapPatternChart", getBarChartHeight(ordered.length, {
    rowHeight: 54,
    extraPadding: 24,
    minHeight: 220,
    maxHeight: 500
  }));

  const chart = buildFallbackBarChart(ordered, {
    valueFormatter: value => formatScore(value, 2),
    emptyText: "No gap pattern data available.",
    chartMaxScore: CHART_MAX_SCORE,
    severeIds,
    keyField: "label"
  });

  container.appendChild(chart);
}

function renderLayerConcentrationChart(layerItems) {
  const ref = clearChartPlaceholder("layerConcentrationChart");
  if (!ref) return;
  const { container } = ref;

  if (!layerItems.length) {
    showPlaceholderNote(container, "Layer concentration visual will appear once layer mapping data is available.");
    return;
  }

  hidePlaceholderNote(container);

  const ordered = [...layerItems].sort(
    (a, b) => LAYER_ORDER.indexOf(a.label) - LAYER_ORDER.indexOf(b.label)
  );

  const severeIds = getTop3LowestKeys(layerItems, "label");

  setChartPanelHeight("layerConcentrationChart", getBarChartHeight(ordered.length, {
    rowHeight: 54,
    extraPadding: 24,
    minHeight: 220,
    maxHeight: 500
  }));

  const chart = buildFallbackBarChart(ordered, {
    valueFormatter: value => formatScore(value, 2),
    emptyText: "No layer concentration data available.",
    chartMaxScore: CHART_MAX_SCORE,
    severeIds,
    keyField: "label"
  });

  container.appendChild(chart);
}

function renderEmptyStateHeader(info) {
  renderBatchHeader(info);

  renderKpiStrip({
    responseCount: info.responseCount || 0,
    readiness: getReadinessStatus(info.responseCount || 0),
    healthScore: 0,
    dominantLayer: "-"
  });

  renderConfidenceMeter(getReadinessStatus(info.responseCount || 0));

  const primaryProblemEl = getEl("primaryProblem");
  if (primaryProblemEl) {
    primaryProblemEl.innerHTML = `<span class="executive-main-title">No submission data found</span>`;
  }

  const whyEl = getEl("why");
  if (whyEl) whyEl.innerText = "-";

  const actionsEl = getEl("actions");
  if (actionsEl) {
    actionsEl.innerHTML = `<li class="empty-note">No recommended actions available because no submissions were found.</li>`;
  }

  renderDriverMatrix([]);
  renderGapPatternChart([]);
  renderLayerConcentrationChart([]);
  renderOpenResponsesExplorer([]);
}

async function init() {
  injectFallbackChartStylesOnce();

  const data = await fetchBatchDetail(batchId);
  const submissions = data.submissions || [];

  const headerInfo = {
    batchId,
    organizationName:
      data.organizationName ||
      submissions[0]?.metadata?.organizationName ||
      "Unknown Organization",
    divisionName:
      data.divisionName ||
      submissions[0]?.metadata?.divisionName ||
      "-",
    responseCount: data.responseCount || submissions.length || 0
  };

  renderBatchHeader(headerInfo);

  if (!submissions.length) {
    renderEmptyStateHeader(headerInfo);
    return;
  }

  const aggregate = aggregateBatch(submissions);
  const diagnosis = buildDiagnosis(aggregate);

  renderExecutiveSummary(diagnosis);
  renderRankings(diagnosis);
  renderCausalChains(diagnosis);
  renderOpenResponsesExplorer(submissions);

  const responseCount = safeNumber(headerInfo.responseCount, submissions.length);
  const readiness = getReadinessStatus(responseCount);
  const healthScore = extractHealthScore(aggregate, diagnosis);
  const dominantLayer = extractDominantLayer(diagnosis, aggregate);

  renderKpiStrip({
    responseCount,
    readiness,
    healthScore,
    dominantLayer
  });

  renderConfidenceMeter(readiness);

  const driverItems = extractDriverArray(aggregate, diagnosis);
  const gapItems = extractGapArray(aggregate, diagnosis);
  const layerItems = extractLayerArray(aggregate, diagnosis);

  renderDriverMatrix(driverItems);
  renderGapPatternChart(gapItems);
  renderLayerConcentrationChart(layerItems);
}

init().catch(error => {
  console.error("Failed to initialize analyst dashboard:", error);

  const primaryProblemEl = getEl("primaryProblem");
  if (primaryProblemEl) {
    primaryProblemEl.innerHTML = `<span class="executive-main-title">Failed to load dashboard data</span>`;
  }

  const whyEl = getEl("why");
  if (whyEl) {
    whyEl.innerText = "Please check the batch ID, API response, or module imports.";
  }
});