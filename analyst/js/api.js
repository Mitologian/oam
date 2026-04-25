const BASE_URL = "https://script.google.com/macros/s/AKfycby1EYlCiC0qy-WvaNX9_rvRxsWmRP1umgUYHhmJdfYtAuqp7wOYqkI2qvsgq0WXguF_Zw/exec";

export async function fetchBatches() {
  const res = await fetch(`${BASE_URL}?mode=listBatches`);
  return await res.json();
}

export async function fetchBatchDetail(batchId) {
  const res = await fetch(`${BASE_URL}?surveyBatchId=${batchId}`);
  return await res.json();
}