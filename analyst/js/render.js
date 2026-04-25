function safeText(value, fallback = "-") {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value);
}

function safeScore(value, digits = 2, fallback = "-") {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return num.toFixed(digits);
}

function safeClass(value, fallback = "neutral-chip") {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value);
}

function getConfidenceMeaning(confidence) {
  if (confidence === "High") {
    return "Strong pattern match. This chain is clearly visible in the current driver profile.";
  }
  if (confidence === "Medium") {
    return "Moderate pattern match. This chain is partially visible and worth attention, but should not yet be treated as the dominant causal story without deeper validation.";
  }
  return "Weak pattern match. This chain may be emerging, but current evidence is still limited.";
}

function buildLayerReason(diag) {
  if (!diag?.weakestDrivers || !diag.weakestDrivers.length) {
    return "No driver data available to explain layer selection.";
  }

  const sameLayerDrivers = diag.weakestDrivers.filter(
    d => d?.layer === diag?.likelyLayer
  );

  if (sameLayerDrivers.length === diag.weakestDrivers.length) {
    return `Driven by ${sameLayerDrivers
      .map(d => `${safeText(d?.id)} (${safeScore(d?.score)})`)
      .join(", ")}.`;
  }

  if (sameLayerDrivers.length >= 2) {
    return `Clustered around ${sameLayerDrivers
      .map(d => `${safeText(d?.id)} (${safeScore(d?.score)})`)
      .join(", ")}.`;
  }

  const primary = diag?.weakestDrivers?.[0];
  return `Anchored by ${safeText(primary?.id)} (${safeScore(primary?.score)}).`;
}

function buildGapMeta(topGap) {
  if (!topGap) {
    return `<span class="score-chip neutral-chip">-</span>`;
  }

  return `
    <span class="score-chip ${safeClass(topGap.statusClass, "neutral-chip")}">${safeText(topGap.status)}</span>
    <span class="score-chip neutral-chip">${safeScore(topGap.score)}</span>
  `;
}

function renderSimpleEmptyList(el, text) {
  if (!el) return;
  el.innerHTML = `<li class="empty-note">${text}</li>`;
}

function sortDriversById(a, b) {
  const numA = Number(String(a.id || "").replace(/\D/g, "")) || 999;
  const numB = Number(String(b.id || "").replace(/\D/g, "")) || 999;
  return numA - numB;
}

function buildOpenResponseGroups(submissions) {
  const groups = {};

  (submissions || []).forEach((submission, submissionIndex) => {
    const drivers = Array.isArray(submission?.drivers) ? submission.drivers : [];

    drivers.forEach(driver => {
      const text = String(driver?.openEnded || "").trim();
      if (!text) return;

      const driverId = driver?.id || "-";
      const driverName = driver?.name || driverId;

      if (!groups[driverId]) {
        groups[driverId] = {
          id: driverId,
          label: driverName,
          responses: []
        };
      }

      groups[driverId].responses.push({
        responseNumber: groups[driverId].responses.length + 1,
        submissionNumber: submissionIndex + 1,
        text
      });
    });
  });

  return Object.values(groups).sort(sortDriversById);
}

export function renderBatchHeader(meta) {
  const orgEl = document.getElementById("companyName");
  const divisionEl = document.getElementById("divisionName");
  const batchEl = document.getElementById("batchId");
  const countEl = document.getElementById("responseCount");

  if (orgEl) orgEl.innerText = safeText(meta?.organizationName, "Unknown Organization");
  if (divisionEl) divisionEl.innerText = safeText(meta?.divisionName, "-");
  if (batchEl) batchEl.innerText = safeText(meta?.batchId, "-");
  if (countEl) countEl.innerText = safeText(meta?.responseCount ?? 0, "0");
}

export function renderExecutiveSummary(diag) {
  const primaryProblemEl = document.getElementById("primaryProblem");
  const primaryMetaEl = document.getElementById("primaryProblemMeta");
  const primaryMiniEl = document.getElementById("primaryProblemMini");

  const dominantLayerEl = document.getElementById("dominantLayer");
  const dominantLayerReasonEl = document.getElementById("dominantLayerReason");

  const dominantGapEl = document.getElementById("dominantGap");
  const dominantGapMetaEl = document.getElementById("dominantGapMeta");

  const supportingDriversEl = document.getElementById("supportingDrivers");
  const whyEl = document.getElementById("why");
  const actionEl = document.getElementById("actions");

  const primaryDriver = diag?.primaryDriver || null;
  const topGap = diag?.dominantGap || diag?.weakestGaps?.[0] || null;

  if (primaryProblemEl) {
    if (primaryDriver) {
      primaryProblemEl.innerHTML = `
        <div class="item-title-row">
          <span class="code-badge driver-badge">${safeText(primaryDriver.id)}</span>
          <span class="executive-main-title">${safeText(primaryDriver.label)}</span>
        </div>
      `;
    } else {
      primaryProblemEl.innerHTML = `<span class="executive-main-title">No primary problem detected</span>`;
    }
  }

  if (primaryMetaEl) {
    if (primaryDriver) {
      primaryMetaEl.innerHTML = `
        <span class="score-chip ${safeClass(primaryDriver.statusClass, "neutral-chip")}">${safeText(primaryDriver.status)}</span>
        <span class="score-chip neutral-chip">${safeScore(primaryDriver.score)}</span>
        <span class="code-badge layer-badge">${safeText(primaryDriver.layer)}</span>
      `;
    } else {
      primaryMetaEl.innerHTML = `<span class="score-chip neutral-chip">-</span>`;
    }
  }

  if (primaryMiniEl) {
    primaryMiniEl.innerText =
      safeText(
        diag?.primaryNarrative,
        primaryDriver
          ? "This is currently the most visible underperformance area in the batch."
          : "No primary diagnosis narrative is available yet."
      );
  }

  if (dominantLayerEl) {
    dominantLayerEl.innerText = safeText(diag?.likelyLayer, "-");
  }

  if (dominantLayerReasonEl) {
    dominantLayerReasonEl.innerText = buildLayerReason(diag);
  }

  if (dominantGapEl) {
    if (topGap) {
      dominantGapEl.innerHTML = `
        <div class="item-title-row">
          <span class="code-badge gap-badge">${safeText(topGap.id)}</span>
          <span class="executive-side-title">${safeText(topGap.label)}</span>
        </div>
      `;
    } else {
      dominantGapEl.innerHTML = `<span class="executive-side-title">No strong gap hypothesis</span>`;
    }
  }

  if (dominantGapMetaEl) {
    dominantGapMetaEl.innerHTML = buildGapMeta(topGap);
  }

  if (supportingDriversEl) {
    supportingDriversEl.innerHTML = "";

    const supportingDrivers = Array.isArray(diag?.supportingDrivers) ? diag.supportingDrivers : [];
    if (!supportingDrivers.length) {
      supportingDriversEl.innerHTML = `<li class="empty-note">No secondary weak drivers detected.</li>`;
    } else {
      supportingDrivers.forEach(item => {
        const li = document.createElement("li");
        li.innerHTML = `
          <div class="item-title-row">
            <span class="code-badge driver-badge">${safeText(item?.id)}</span>
            <span class="item-title">${safeText(item?.label)}</span>
          </div>
          <div class="item-meta">
            <span class="meta-text">${safeText(item?.layer)}</span>
            <span class="score-chip ${safeClass(item?.statusClass, "neutral-chip")}">${safeText(item?.status)}</span>
            <span class="score">${safeScore(item?.score)}</span>
          </div>
        `;
        supportingDriversEl.appendChild(li);
      });
    }
  }

  if (whyEl) {
    whyEl.innerText = safeText(diag?.whyText, "-");
  }

  if (actionEl) {
    actionEl.innerHTML = "";
    const actions = Array.isArray(diag?.actions) ? diag.actions : [];

    if (!actions.length) {
      actionEl.innerHTML = `<li class="empty-note">No recommended actions available yet.</li>`;
    } else {
      actions.forEach((a, index) => {
        const li = document.createElement("li");
        li.className = "action-item";
        li.innerHTML = `
          <div class="item-title-row">
            <span class="code-badge gap-badge">${safeText(a?.id)}</span>
            <span class="item-title">${safeText(a?.gap)}</span>
          </div>
          <div class="item-meta single-line-meta">
            <span class="score-chip ${safeClass(a?.statusClass, "neutral-chip")}">${safeText(a?.status)}</span>
            <span class="meta-text">${safeText(a?.action)}</span>
          </div>
        `;

        if (index > 0 && actions[index - 1]?.id === a?.id) {
          li.classList.add("action-item-continuation");
        }

        actionEl.appendChild(li);
      });
    }
  }
}

export function renderRankings(diag) {
  const weakestDriversEl = document.getElementById("weakestDrivers");
  const weakestFPsEl = document.getElementById("weakestFPs");
  const weakestGapsEl = document.getElementById("weakestGaps");
  const likelyLayerEl = document.getElementById("likelyLayer");
  const likelyLayerReasonEl = document.getElementById("likelyLayerReason");

  if (likelyLayerEl) {
    likelyLayerEl.innerText = safeText(diag?.likelyLayer, "-");
  }

  if (likelyLayerReasonEl) {
    likelyLayerReasonEl.innerText = buildLayerReason(diag);
  }

  if (weakestDriversEl) {
    weakestDriversEl.innerHTML = "";
    const items = Array.isArray(diag?.weakestDrivers) ? diag.weakestDrivers : [];
    if (!items.length) {
      renderSimpleEmptyList(weakestDriversEl, "No weak drivers detected.");
    } else {
      items.forEach(item => {
        const li = document.createElement("li");
        li.innerHTML = `
          <div class="item-title-row">
            <span class="code-badge driver-badge">${safeText(item?.id)}</span>
            <span class="item-title">${safeText(item?.label)}</span>
          </div>
          <div class="item-meta">
            <span class="meta-text">${safeText(item?.layer)}</span>
            <span class="score-chip ${safeClass(item?.statusClass, "neutral-chip")}">${safeText(item?.status)}</span>
            <span class="score">${safeScore(item?.score)}</span>
          </div>
        `;
        weakestDriversEl.appendChild(li);
      });
    }
  }

  if (weakestFPsEl) {
    weakestFPsEl.innerHTML = "";
    const items = Array.isArray(diag?.weakestFPs) ? diag.weakestFPs : [];
    if (!items.length) {
      renderSimpleEmptyList(weakestFPsEl, "No weak failure points detected.");
    } else {
      items.forEach(item => {
        const li = document.createElement("li");
        li.innerHTML = `
          <div class="item-title-row">
            <span class="code-badge fp-badge">${safeText(item?.id)}</span>
            <span class="item-title">${safeText(item?.label)}</span>
          </div>
          <div class="item-meta">
            <span class="meta-text">Failure Point</span>
            <span class="score-chip ${safeClass(item?.statusClass, "neutral-chip")}">${safeText(item?.status)}</span>
            <span class="score">${safeScore(item?.score)}</span>
          </div>
        `;
        weakestFPsEl.appendChild(li);
      });
    }
  }

  if (weakestGapsEl) {
    weakestGapsEl.innerHTML = "";
    const items = Array.isArray(diag?.weakestGaps) ? diag.weakestGaps : [];
    if (!items.length) {
      renderSimpleEmptyList(weakestGapsEl, "No gap hypothesis detected.");
    } else {
      items.forEach(item => {
        const li = document.createElement("li");
        li.innerHTML = `
          <div class="item-title-row">
            <span class="code-badge gap-badge">${safeText(item?.id)}</span>
            <span class="item-title">${safeText(item?.label)}</span>
          </div>
          <div class="item-meta">
            <span class="meta-text">Preliminary systemic hypothesis</span>
            <span class="score-chip ${safeClass(item?.statusClass, "neutral-chip")}">${safeText(item?.status)}</span>
            <span class="score">${safeScore(item?.score)}</span>
          </div>
        `;
        weakestGapsEl.appendChild(li);
      });
    }
  }
}

export function renderCausalChains(diag) {
  const chainEl = document.getElementById("causalChains");
  if (!chainEl) return;

  chainEl.innerHTML = "";

  if (!diag?.causalChains || !diag.causalChains.length) {
    chainEl.innerHTML = `<p class="empty-note">No strong causal chain detected yet for this batch.</p>`;
    return;
  }

  diag.causalChains.forEach(chain => {
    const card = document.createElement("div");
    card.className = "chain-card";

    const confidenceClass =
      chain?.confidence === "High"
        ? "status-critical"
        : chain?.confidence === "Medium"
        ? "status-stable"
        : "status-weak";

    const matchedDrivers = Array.isArray(chain?.matchedDrivers) ? chain.matchedDrivers : [];

    const chainFlow = matchedDrivers
      .map(
        d => `
          <span class="chain-node">
            <span class="code-badge driver-badge">${safeText(d?.id)}</span>
            ${safeText(d?.label)}
          </span>
        `
      )
      .join(`<span class="chain-arrow">→</span>`);

    const matchedScoreTiles = matchedDrivers
      .map(
        d => `
          <div class="chain-score-tile">
            <div class="chain-score-tile-top">
              <span class="code-badge driver-badge">${safeText(d?.id)}</span>
              <span class="score-chip ${safeClass(d?.statusClass, "neutral-chip")}">${safeText(d?.status)}</span>
            </div>
            <div class="chain-score-tile-title">${safeText(d?.label)}</div>
            <div class="chain-score-tile-bottom">
              <span class="chain-score-tile-layer">${safeText(d?.layer)}</span>
              <span class="chain-score-tile-score">${safeScore(d?.score)}</span>
            </div>
          </div>
        `
      )
      .join("");

    const description =
      safeText(chain?.description, "") ||
      safeText(chain?.whatHappens, "");

    const whyText =
      safeText(chain?.whyHappens, "");

    card.innerHTML = `
      <div class="chain-header">
        <div class="item-title-row">
          <span class="code-badge chain-badge">${safeText(chain?.confidence)}</span>
          <span class="item-title">${safeText(chain?.title)}</span>
        </div>
        <p class="chain-confidence-copy">
          <strong>Pattern Confidence:</strong>
          <span class="score-chip ${confidenceClass}">${safeText(chain?.confidence)}</span>
          ${getConfidenceMeaning(chain?.confidence)}
        </p>
      </div>

      <div class="chain-flow">${chainFlow || `<span class="empty-note">No matched drivers listed.</span>`}</div>

      <div class="chain-copy">
        ${description ? `<p><strong>What likely happens:</strong> ${description}</p>` : ""}
        ${whyText ? `<p><strong>Why this likely happens:</strong> ${whyText}</p>` : ""}
      </div>

      <div class="chain-score-block">
        <h4>Matched Driver Scores</h4>
        <div class="chain-score-grid">
          ${matchedScoreTiles || `<div class="empty-note">No matched driver scores available.</div>`}
        </div>
      </div>
    `;

    chainEl.appendChild(card);
  });
}

export function renderOpenResponsesExplorer(submissions) {
  const toggleBtn = document.getElementById("openResponsesToggle");
  const explorer = document.getElementById("openResponsesExplorer");
  const content = document.getElementById("openResponsesContent");

  if (!toggleBtn || !explorer || !content) return;

  const groups = buildOpenResponseGroups(submissions);

  if (!groups.length) {
    content.innerHTML = `
      <div class="empty-state">
        No qualitative responses are available for this batch yet.
      </div>
    `;
  } else {
    content.innerHTML = groups
      .map(group => {
        const bodyId = `open-response-body-${group.id}`;
        const cards = group.responses
          .map(
            item => `
              <div class="open-response-card">
                <div class="open-response-card-meta">
                  <span class="code-badge driver-badge">${safeText(group.id)}</span>
                  <span class="open-response-response-number">Response #${item.responseNumber}</span>
                </div>
                <div class="open-response-card-text">${safeText(item.text)}</div>
              </div>
            `
          )
          .join("");

        return `
          <div class="open-response-group">
            <div class="open-response-driver-header">
              <div>
                <div class="open-response-driver-title-row">
                  <span class="code-badge driver-badge">${safeText(group.id)}</span>
                  <span class="open-response-driver-title">${safeText(group.label)}</span>
                </div>
                <div class="open-response-count">${group.responses.length} response(s)</div>
              </div>

              <button class="open-response-driver-toggle" data-target="${bodyId}">
                Hide
              </button>
            </div>

            <div id="${bodyId}" class="open-response-grid">
              ${cards}
            </div>
          </div>
        `;
      })
      .join("");
  }

  toggleBtn.onclick = () => {
    const isOpen = explorer.style.display === "block";
    explorer.style.display = isOpen ? "none" : "block";
    toggleBtn.textContent = isOpen ? "Open Response Explorer" : "Hide Response Explorer";
  };

  content.querySelectorAll(".open-response-driver-toggle").forEach(btn => {
    btn.onclick = () => {
      const targetId = btn.getAttribute("data-target");
      const target = document.getElementById(targetId);
      if (!target) return;

      const isHidden = target.style.display === "none";
      target.style.display = isHidden ? "grid" : "none";
      btn.textContent = isHidden ? "Hide" : "Show";
    };
  });
}