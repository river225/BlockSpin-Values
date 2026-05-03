function getSpreadsheetIdFromMode() {
  const mode = String(process.env.MODE || "test").toLowerCase();
  if (mode === "main") return process.env.MAIN_SPREADSHEET_ID || "";
  return process.env.TEST_SPREADSHEET_ID || "";
}

async function fetchSheetRows(sheetName) {
  const spreadsheetId = getSpreadsheetIdFromMode();
  if (!spreadsheetId) throw new Error("Spreadsheet ID is missing for current MODE.");

  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&headers=1&sheet=${encodeURIComponent(sheetName)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Sheet request failed (${res.status})`);

  const text = await res.text();
  const json = JSON.parse(text.substring(47, text.length - 2));
  const cols = (json.table.cols || []).map((c) => (c.label || "").trim());
  const rows = json.table.rows || [];

  return rows.map((row) => {
    const out = {};
    cols.forEach((label, i) => {
      const cell = row.c?.[i];
      out[label] = cell?.f ?? cell?.v ?? "";
    });
    return out;
  });
}

module.exports = { getSpreadsheetIdFromMode, fetchSheetRows };
