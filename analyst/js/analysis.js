export function aggregateBatch(submissions) {
  const driverTotals = {};
  const fpTotals = {};
  const gapTotals = {};
  const layerTotals = {};
  let count = submissions.length;

  submissions.forEach(s => {
    Object.entries(s.driverScores).forEach(([k, v]) => {
      driverTotals[k] = (driverTotals[k] || 0) + v;
    });

    Object.entries(s.fpScores).forEach(([k, v]) => {
      fpTotals[k] = (fpTotals[k] || 0) + v;
    });

    Object.entries(s.gapHypothesisScores).forEach(([k, v]) => {
      gapTotals[k] = (gapTotals[k] || 0) + v;
    });

    Object.entries(s.layerScoresMap).forEach(([k, v]) => {
      layerTotals[k] = (layerTotals[k] || 0) + v;
    });
  });

  function avg(obj) {
    return Object.entries(obj).map(([k, v]) => ({
      id: k,
      score: v / count
    }));
  }

  return {
    drivers: avg(driverTotals),
    fps: avg(fpTotals),
    gaps: avg(gapTotals),
    layers: avg(layerTotals)
  };
}