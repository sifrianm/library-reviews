/**
 * Catalog enrichment for the library-reviews site.
 *
 * Input: published adults + kids *reviews* CSVs (not the כריכות sheet).
 * Output: this spreadsheet — one row per review title attempted.
 * סטטוס עדכון: empty = retry; OK = unique catalog match; fail = do not retry.
 *
 * Standalone project (script.google.com): set CONFIG.spreadsheetId to the
 * spreadsheet ID from the sheet URL:
 *   https://docs.google.com/spreadsheets/d/<THIS_ID>/edit
 * Then run menuDryRun / menuRun from the editor (Run ▶).
 */

var CONFIG = {
  // Paste the ID from the enrichment sheet URL (between /d/ and /edit).
  spreadsheetId: "",

  adultsCsvUrl:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTl4L0RFkLX5xrr3X3CXcs5pQUBk4Q2BG-ORm90yt8-czXZlTz3E7flpSUb-Q2vmLzC4uURw2OLRZQ5/pub?gid=437656259&single=true&output=csv",
  kidsCsvUrl:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQoh_rqxOaJQaxGx3E_RPS61BkyjP3OAh_s2EoJZkmQI-b9P48uP8T2lorPGxdD-33XfByxlrYFT5lB/pub?gid=564123315&single=true&output=csv",
  reviewBookHeader: "שם הספר",
  catalogOrigin: "https://nmonosson.agronplus.org",
  maxPerRun: 30,
  sleepMs: 2000,
  headers: [
    "שם ספר",
    "מחבר",
    "מזהה כותר",
    "קישור לקטלוג",
    "קישור לכריכה",
    "תקציר",
    "סוגה",
    "סטטוס עדכון",
    "עדכון אחרון",
  ],
  statusOk: "OK",
  statusFail: "fail",
};

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("העשרת קטלוג")
    .addItem("הרצה יבשה (בלי כתיבה)", "menuDryRun")
    .addItem("הרצה אמיתית", "menuRun")
    .addToUi();
}

function menuDryRun() {
  runEnrichment({ dryRun: true });
}

function menuRun() {
  runEnrichment({ dryRun: false });
}

/** Daily trigger should call this (real write). */
function scheduledEnrichment() {
  runEnrichment({ dryRun: false });
}

function runEnrichment(opts) {
  var dryRun = !!(opts && opts.dryRun);
  var ss = getSpreadsheet_();
  var sheet = ss.getSheets()[0];
  ensureHeaders_(sheet);

  var existing = loadExistingRows_(sheet);
  var books = collectReviewBooks_();
  var pending = [];
  for (var i = 0; i < books.length; i++) {
    var prev = existing[normalizeTitle_(books[i].title)];
    if (prev && isTerminalStatus_(prev.status)) continue;
    pending.push({
      title: books[i].title,
      author: books[i].author || "",
      sheetRow: prev ? prev.row : 0,
    });
  }

  var processed = 0;
  var written = 0;
  var failed = 0;
  var stopped = false;

  for (var t = 0; t < pending.length && processed < CONFIG.maxPerRun; t++) {
    var title = pending[t].title;
    var reviewAuthor = pending[t].author || "";
    var sheetRow = pending[t].sheetRow;
    processed++;
    try {
      var html = searchCatalog_(title);
      if (!looksLikeResultsPage_(html)) {
        log_(ss, "error", title, "stopped", "results HTML did not look like a search page (theme change?)");
        stopped = true;
        break;
      }
      var cards = parseResultCards_(html);
      var pick = pickMatch_(title, reviewAuthor, cards);
      if (pick.status !== "unique") {
        if (!dryRun) {
          upsertRow_(sheet, sheetRow, failRow_(title));
          if (!sheetRow) {
            existing[normalizeTitle_(title)] = { row: sheet.getLastRow(), status: CONFIG.statusFail };
          } else {
            existing[normalizeTitle_(title)].status = CONFIG.statusFail;
          }
        }
        failed++;
        log_(ss, pick.status, title, dryRun ? "would_fail" : "fail", pick.note || "");
      } else {
        var details = fetchDetails_(pick.card.titleNo);
        var row = buildRow_(title, pick.card, details);
        if (!dryRun) {
          upsertRow_(sheet, sheetRow, row);
          existing[normalizeTitle_(title)] = {
            row: sheetRow || sheet.getLastRow(),
            status: CONFIG.statusOk,
          };
        }
        written++;
      }
    } catch (err) {
      if (!dryRun) {
        upsertRow_(sheet, sheetRow, failRow_(title));
      }
      failed++;
      log_(ss, "error", title, dryRun ? "would_fail" : "fail", String(err && err.message ? err.message : err));
    }
    if (t + 1 < pending.length && processed < CONFIG.maxPerRun) {
      Utilities.sleep(CONFIG.sleepMs);
    }
  }

  var msg =
    (dryRun ? "הרצה יבשה: " : "הרצה: ") +
    processed +
    " טופלו, " +
    written +
    (dryRun ? " היו OK, " : " OK, ") +
    failed +
    (dryRun ? " היו fail." : " fail.") +
    (stopped ? " נעצרה בגלל מבנה HTML לא צפוי." : "") +
    (failed || stopped ? " כשלונות בגיליון לוג." : "");
  Logger.log(msg);
}

function getSpreadsheet_() {
  if (CONFIG.spreadsheetId) {
    return SpreadsheetApp.openById(CONFIG.spreadsheetId.trim());
  }
  var active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;
  throw new Error(
    "Set CONFIG.spreadsheetId in CatalogEnrich.gs to the sheet ID from the URL: " +
      "https://docs.google.com/spreadsheets/d/<ID>/edit"
  );
}

function ensureHeaders_(sheet) {
  var expected = CONFIG.headers;
  var last = sheet.getLastColumn();
  if (sheet.getLastRow() < 1 || last < expected.length) {
    sheet.getRange(1, 1, 1, expected.length).setValues([expected]);
    sheet.setFrozenRows(1);
    return;
  }
  var got = sheet.getRange(1, 1, 1, expected.length).getValues()[0];
  for (var i = 0; i < expected.length; i++) {
    if (String(got[i] || "").trim() !== expected[i]) {
      throw new Error(
        "שורה 1 חייבת להיות בדיוק: " + expected.join(" | ") + " (נמצא: " + got.join(" | ") + ")"
      );
    }
  }
}

function loadExistingRows_(sheet) {
  var map = {};
  var last = sheet.getLastRow();
  if (last < 2) return map;
  var width = Math.max(sheet.getLastColumn(), CONFIG.headers.length);
  var vals = sheet.getRange(2, 1, last - 1, width).getValues();
  var statusCol = CONFIG.headers.indexOf("סטטוס עדכון");
  for (var i = 0; i < vals.length; i++) {
    var key = normalizeTitle_(vals[i][0]);
    if (!key) continue;
    map[key] = {
      row: i + 2,
      status: String(statusCol >= 0 ? vals[i][statusCol] : "").trim(),
    };
  }
  return map;
}

function isTerminalStatus_(status) {
  var s = String(status || "").trim();
  return s === CONFIG.statusOk || s === CONFIG.statusFail;
}

function upsertRow_(sheet, rowNumber, values) {
  if (rowNumber) {
    sheet.getRange(rowNumber, 1, 1, values.length).setValues([values]);
  } else {
    sheet.appendRow(values);
  }
}

function failRow_(title) {
  return [title, "", "", "", "", "", "", CONFIG.statusFail, new Date()];
}

function collectReviewBooks_() {
  var seen = {};
  var out = [];
  var urls = [CONFIG.adultsCsvUrl, CONFIG.kidsCsvUrl];
  for (var u = 0; u < urls.length; u++) {
    var rows = fetchCsv_(urls[u]);
    if (!rows.length) continue;
    var headers = rows[0].map(function (h) {
      return String(h || "").trim();
    });
    var col = headers.indexOf(CONFIG.reviewBookHeader);
    if (col < 0) {
      for (var h = 0; h < headers.length; h++) {
        if (headers[h].indexOf("שם הספר") === 0) {
          col = h;
          break;
        }
      }
    }
    var authorCol = headers.indexOf("שם הסופר");
    if (col < 0) continue;
    for (var r = 1; r < rows.length; r++) {
      var book = String(rows[r][col] || "").trim();
      var key = normalizeTitle_(book);
      if (!key || seen[key]) continue;
      seen[key] = true;
      out.push({
        title: book,
        author: authorCol >= 0 ? String(rows[r][authorCol] || "").trim() : "",
      });
    }
  }
  return out;
}

function fetchCsv_(url) {
  var res = UrlFetchApp.fetch(url, { muteHttpExceptions: true, followRedirects: true });
  if (res.getResponseCode() >= 400) {
    throw new Error("CSV HTTP " + res.getResponseCode() + " " + url);
  }
  return Utilities.parseCsv(res.getContentText());
}

function searchCatalog_(title) {
  var payload = {
    new_search: "",
    "filters[line1][field_combo]": "title",
    "filters[line1][search_text]": title,
    "filters[line1][initial_combo]": "contains",
    "filters[line1][sort_combo]": "title",
  };
  var res = UrlFetchApp.fetch(CONFIG.catalogOrigin + "/results/", {
    method: "post",
    payload: payload,
    muteHttpExceptions: true,
    followRedirects: true,
    headers: { "User-Agent": "library-reviews-enrichment/1.0" },
  });
  if (res.getResponseCode() >= 400) {
    throw new Error("search HTTP " + res.getResponseCode());
  }
  return res.getContentText();
}

function looksLikeResultsPage_(html) {
  if (html.indexOf("agron-title-card") >= 0) return true;
  if (html.indexOf("/results/") >= 0 || html.indexOf("תוצאות") >= 0) return true;
  return html.indexOf("combined_search_form") >= 0;
}

function parseResultCards_(html) {
  var cards = [];
  var re = /class="agron-title-card[^"]*"\s+id="([^"]+)"([\s\S]*?)(?=class="agron-title-card|$)/g;
  var m;
  while ((m = re.exec(html))) {
    var block = m[2];
    var titleM = block.match(/title-details\?title_no=[^"]+">([^<]+)</);
    var authorM = block.match(/מחבר\/ת:\s*([^<]+)/);
    var imgM = block.match(/<img[^>]+src="([^"]+)"/i);
    cards.push({
      titleNo: m[1],
      catalogTitle: decode_(titleM ? titleM[1] : ""),
      author: decode_(authorM ? authorM[1] : ""),
      coverSrc: imgM ? imgM[1].trim() : "",
    });
  }
  return cards;
}

function pickMatch_(reviewTitle, reviewAuthor, cards) {
  if (!cards.length) {
    return { status: "not_found", note: "אין תוצאות" };
  }
  var nt = normalizeTitle_(reviewTitle);
  var titled = [];
  for (var i = 0; i < cards.length; i++) {
    var ct = normalizeTitle_(cards[i].catalogTitle);
    if (ct === nt || ct.indexOf(nt + " ") === 0 || ct.indexOf(nt) === 0) {
      titled.push(cards[i]);
    }
  }
  var pool = titled.length ? titled : cards.length === 1 ? cards : [];
  if (!pool.length) {
    return {
      status: "ambiguous",
      note: cards
        .slice(0, 8)
        .map(function (c) {
          return c.catalogTitle;
        })
        .join(" | "),
    };
  }
  if (pool.length === 1) {
    return { status: "unique", card: pool[0] };
  }
  if (reviewAuthor) {
    var byAuthor = [];
    for (var a = 0; a < pool.length; a++) {
      if (authorsOverlap_(reviewAuthor, pool[a].author)) byAuthor.push(pool[a]);
    }
    if (byAuthor.length === 1) {
      return { status: "unique", card: byAuthor[0] };
    }
  }
  return {
    status: "ambiguous",
    note: pool
      .slice(0, 8)
      .map(function (c) {
        return c.catalogTitle;
      })
      .join(" | "),
  };
}

function fetchDetails_(titleNo) {
  var url = CONFIG.catalogOrigin + "/title-details?title_no=" + encodeURIComponent(titleNo);
  var res = UrlFetchApp.fetch(url, {
    muteHttpExceptions: true,
    followRedirects: true,
    headers: { "User-Agent": "library-reviews-enrichment/1.0" },
  });
  if (res.getResponseCode() >= 400) {
    throw new Error("details HTTP " + res.getResponseCode());
  }
  return parseDetails_(res.getContentText(), titleNo);
}

function parseDetails_(html, titleNo) {
  var author = fieldAfterLabel_(html, "מחבר/ת:");
  var genre = fieldAfterLabel_(html, "ז'אנר:");
  var summary = parseSummary_(html);
  var cover = normalizeCoverUrl_(extractCoverSrc_(html));
  return {
    author: author,
    genre: genre,
    summary: summary,
    coverUrl: cover,
    catalogUrl: CONFIG.catalogOrigin + "/title-details?title_no=" + titleNo,
  };
}

function extractCoverSrc_(html) {
  var m = html.match(/ext_image\.php\?q=([^"'<>]+)/i);
  if (m) {
    return "https://master.library.org.il/ext_image.php?q=" + m[1].trim();
  }
  m = html.match(/<img[^>]+alt="תמונת הספר[^"]*"[^>]+src=["']?([^"'\s>]+)/i);
  if (m) return m[1].trim();
  m = html.match(/images-area[\s\S]*?<img[^>]+src=["']([^"']+)/i);
  return m ? m[1].trim() : "";
}

function fieldAfterLabel_(html, label) {
  var idx = html.indexOf(label);
  if (idx < 0) return "";
  var chunk = html.substring(idx, idx + 500);
  var link = chunk.match(/<a[^>]*>([^<]+)<\/a>/);
  if (link) return decode_(link[1]);
  var span = chunk.match(/<\/span>\s*<span[^>]*>\s*([^<]+)/);
  if (span) return decode_(span[1]);
  return "";
}

function parseSummary_(html) {
  var m = html.match(/<h2[^>]*>\s*תקציר:\s*<\/h2>([\s\S]*?)<\/div>/i);
  if (!m) return "";
  var text = decode_(stripTags_(m[1]));
  // Agron joins cover-image URLs and the blurb with bare \r (no \n). A line
  // that *starts* with http:// would otherwise drop the whole summary.
  var lines = text.split(/[\r\n]+/);
  var keep = [];
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i]
      .replace(/https?:\/\/\S+/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!line) continue;
    keep.push(line);
  }
  return keep.join(" ").replace(/\s+/g, " ").trim();
}

function stripTags_(s) {
  return String(s || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "\n");
}

function normalizeCoverUrl_(raw) {
  var url = String(raw || "").trim();
  if (!url) return "";
  var libnet = url.match(/agron\.libnet\.co\.il:83\/images\/([^"'?\s]+)/i);
  if (libnet) {
    return "https://books.agron.org.il/port_83/" + libnet[1].replace(/\/$/, "");
  }
  // Filenames can contain spaces/Hebrew (e.g. חף מפשע-1.jpg). Do not cut at \s.
  var q = url.match(/ext_image\.php\?q=(.+)/i);
  if (q) {
    var inner = q[1].replace(/["']+$/g, "").trim();
    try {
      inner = decodeURIComponent(inner.replace(/\+/g, " "));
    } catch (e) {
      /* already decoded */
    }
    var again = normalizeCoverUrl_(inner);
    if (again && again.indexOf("books.agron.org.il") >= 0) return again;
    return "https://master.library.org.il/ext_image.php?q=" + encodeURI(inner);
  }
  if (/^https?:\/\//i.test(url) && !/^javascript:/i.test(url) && !/^data:/i.test(url)) {
    try {
      return encodeURI(url);
    } catch (e) {
      return url;
    }
  }
  return "";
}

function buildRow_(reviewTitle, card, details) {
  return [
    reviewTitle,
    details.author || card.author || "",
    card.titleNo,
    details.catalogUrl,
    details.coverUrl || normalizeCoverUrl_(card.coverSrc),
    details.summary || "",
    details.genre || "",
    CONFIG.statusOk,
    new Date(),
  ];
}

function log_(ss, level, title, status, note) {
  var log = ss.getSheetByName("לוג");
  if (!log) {
    log = ss.insertSheet("לוג");
    log.getRange(1, 1, 1, 5).setValues([["זמן", "רמה", "שם ספר", "סטטוס", "הערות"]]);
    log.setFrozenRows(1);
  }
  log.appendRow([new Date(), level, title, status, note]);
}

function normalizeTitle_(s) {
  return String(s || "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function decode_(s) {
  return String(s || "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function authorsOverlap_(a, b) {
  var ta = tokens_(a);
  var tb = tokens_(b);
  if (!ta.length || !tb.length) return false;
  for (var i = 0; i < ta.length; i++) {
    for (var j = 0; j < tb.length; j++) {
      if (ta[i] === tb[j] || ta[i].indexOf(tb[j]) >= 0 || tb[j].indexOf(ta[i]) >= 0) return true;
    }
  }
  return false;
}

function tokens_(s) {
  return normalizeTitle_(s)
    .split(/[\s,;:/]+/)
    .filter(function (t) {
      return t.length > 1;
    });
}
