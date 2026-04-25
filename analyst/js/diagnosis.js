import {
  GAP_LABEL_MAP,
  DRIVER_MAP,
  FP_MAP,
  GAP_INTERVENTION,
  DRIVER_LAYER_MAP,
  DRIVER_STATUS_RULES,
  CAUSAL_CHAINS
} from "./config.js";

export function rankLowest(items, n = 3) {
  return [...items].sort((a, b) => a.score - b.score).slice(0, n);
}

export function mapGapLabels(gaps) {
  return gaps.map(g => ({
    ...g,
    label: GAP_LABEL_MAP[g.id] || g.id
  }));
}

function getDriverStatus(score) {
  if (score <= DRIVER_STATUS_RULES.criticalMax) return "Critical";
  if (score <= DRIVER_STATUS_RULES.weakMax) return "Weak";
  if (score <= DRIVER_STATUS_RULES.stableMax) return "Stable";
  return "Strong";
}

function getStatusClass(status) {
  if (status === "Critical") return "status-critical";
  if (status === "Weak") return "status-weak";
  if (status === "Stable") return "status-stable";
  return "status-strong";
}

export function mapDriverLabels(drivers) {
  return drivers.map(d => {
    const status = getDriverStatus(d.score);
    return {
      ...d,
      label: DRIVER_MAP[d.id] || d.id,
      layer: DRIVER_LAYER_MAP[d.id] || "-",
      status,
      statusClass: getStatusClass(status)
    };
  });
}

export function mapFPLabels(fps) {
  return fps.map(fp => {
    const status = getDriverStatus(fp.score);
    return {
      ...fp,
      label: FP_MAP[fp.id] || fp.id,
      status,
      statusClass: getStatusClass(status)
    };
  });
}

function enrichGapLabels(gaps) {
  return gaps.map(g => {
    const status = getDriverStatus(g.score);
    return {
      ...g,
      label: GAP_LABEL_MAP[g.id] || g.id,
      status,
      statusClass: getStatusClass(status)
    };
  });
}

function detectCausalChains(mappedDrivers) {
  const driverScoreMap = Object.fromEntries(mappedDrivers.map(d => [d.id, d]));
  const results = [];

  CAUSAL_CHAINS.forEach(chain => {
    const chainDrivers = (chain.drivers || [])
      .map(id => driverScoreMap[id])
      .filter(Boolean);

    if (!chainDrivers.length) return;

    const weakCount = chainDrivers.filter(
      d => d.status === "Weak" || d.status === "Critical"
    ).length;

    const criticalCount = chainDrivers.filter(
      d => d.status === "Critical"
    ).length;

    const total = chainDrivers.length;
    const matchRatio = weakCount / total;

    let confidence = null;

    if (total === 1) {
      if (weakCount === 1) {
        confidence = chainDrivers[0].status === "Critical" ? "High" : "Medium";
      }
    } else {
      if (matchRatio >= 1) confidence = criticalCount >= 1 ? "High" : "Medium";
      else if (matchRatio >= 0.67) confidence = "Medium";
      else if (matchRatio >= 0.5) confidence = "Low";
    }

    if (confidence) {
      results.push({
        ...chain,
        confidence,
        matchedDrivers: chainDrivers
      });
    }
  });

  const confidenceOrder = { High: 3, Medium: 2, Low: 1 };

  return results.sort((a, b) => {
    const confDiff = confidenceOrder[b.confidence] - confidenceOrder[a.confidence];
    if (confDiff !== 0) return confDiff;
    return b.matchedDrivers.length - a.matchedDrivers.length;
  });
}

function buildWhyText(weakestFPs) {
  if (!weakestFPs.length) {
    return "No failure point pattern detected.";
  }

  const top3 = weakestFPs.slice(0, 3);

  return `The current pattern appears to be driven by breakdowns in ${top3
    .map(i => `${i.label} (${i.id})`)
    .join(", ")}.`;
}

function buildGapActions(weakestGaps) {
  const actions = [];

  weakestGaps.forEach(g => {
    const interventionList = GAP_INTERVENTION[g.id] || [];

    if (!interventionList.length) {
      actions.push({
        id: g.id,
        gap: g.label,
        action: "Further diagnosis required.",
        score: g.score,
        status: g.status,
        statusClass: g.statusClass
      });
      return;
    }

    interventionList.forEach(text => {
      actions.push({
        id: g.id,
        gap: g.label,
        action: text,
        score: g.score,
        status: g.status,
        statusClass: g.statusClass
      });
    });
  });

  return actions;
}

function buildPrimaryNarrative(primaryDriver, topGap, likelyLayer) {
  if (!primaryDriver) {
    return "No primary diagnosis narrative is available yet.";
  }

  const driverPart = `${primaryDriver.label} is currently the most visible area of underperformance`;
  const layerPart = likelyLayer && likelyLayer !== "-"
    ? `, concentrated mainly in the ${likelyLayer} layer`
    : "";
  const gapPart = topGap
    ? `, with the strongest systemic signal pointing to ${topGap.label}`
    : "";

  return `${driverPart}${layerPart}${gapPart}.`;
}

export function buildDiagnosis(aggregate) {
  const mappedDrivers = mapDriverLabels(aggregate.drivers || []);
  const mappedFPs = mapFPLabels(aggregate.fps || []);
  const mappedGaps = enrichGapLabels(aggregate.gaps || []);
  const mappedLayers = (aggregate.layers || []).map(layer => {
    const status = getDriverStatus(layer.score);
    return {
      ...layer,
      label: layer.label || layer.name || layer.id,
      status,
      statusClass: getStatusClass(status)
    };
  });

  const weakestDrivers = rankLowest(mappedDrivers, 3);
  const weakestFPs = rankLowest(mappedFPs, 5);
  const weakestGaps = rankLowest(mappedGaps, 3);

  const causalChains = detectCausalChains(mappedDrivers).slice(0, 4);

  const primaryDriver = weakestDrivers[0] || null;
  const supportingDrivers = weakestDrivers.slice(1);
  const dominantGap = weakestGaps[0] || null;
  const likelyLayer = primaryDriver?.layer || "-";

  const whyText = buildWhyText(weakestFPs);
  const actions = buildGapActions(weakestGaps);

  const overallScore = mappedDrivers.length
    ? Number(
        (
          mappedDrivers.reduce((sum, item) => sum + item.score, 0) /
          mappedDrivers.length
        ).toFixed(2)
      )
    : 0;

  const primaryNarrative = buildPrimaryNarrative(
    primaryDriver,
    dominantGap,
    likelyLayer
  );

  return {
    overallScore,

    primaryDriver,
    supportingDrivers,

    dominantGap,
    weakestDrivers,
    weakestFPs,
    weakestGaps,
    likelyLayer,
    layers: mappedLayers,

    whyText,
    actions,
    primaryNarrative,

    drivers: mappedDrivers,
    fps: mappedFPs,
    gaps: mappedGaps,

    causalChains
  };
}