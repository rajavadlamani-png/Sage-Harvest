#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const OUT = path.join(ROOT, "assets", "data", "puja-knowledge.json");
const BASE_URL = "https://rajavadlamani-png.github.io/Sage-Harvest/";

const STOP = new Set(("a an and are as at be been by can could for from has have how if in into is it its may more of on or our that the their them then these this to was we what when where which who will with you your").split(" "));

const TOPIC_SYNONYMS = [
  ["m&a", ["m&a","m and a","mergers and acquisitions","due diligence","acquisition","transaction"]],
  ["digital", ["digital","ai","artificial intelligence","analytics","data","digital transformation","decision support"]],
  ["sustainability", ["sustainability","climate","carbon","mrv","resource efficiency","low emission","regenerative"]],
  ["international", ["international","global","global network","global expansion","trade","export","cross-border","market entry","buyer","partner"]],
  ["founder", ["founder","principal advisor","raja vadlamani"]],
  ["careers", ["careers","career","collaboration","associate consultant","subject matter expert","strategic partner"]],
  ["labs", ["labs","research","models","tools","proof of concept","climate ledger","carbon reduction calculator"]],
  ["insights", ["insights","articles","knowledge hub","linkedin","supply chain with raja","sathi"]],
  ["puja", ["puja","ai-assisted","voice guide","gemini","cloudflare worker"]],
  ["privacy", ["privacy","data protection","cookies","analytics","third party"]],
  ["confidentiality", ["confidentiality","confidential","nda","non disclosure","restricted information"]]
];

function walk(dir) {
  const out = [];
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    if (name.name === ".git" || name.name === "node_modules") continue;
    const full = path.join(dir, name.name);
    if (name.isDirectory()) out.push(...walk(full));
    else if (name.isFile() && name.name.endsWith(".html")) out.push(full);
  }
  return out;
}
function decode(s) {
  return s
    .replace(/&amp;/g, "&").replace(/&nbsp;/g, " ")
    .replace(/&#39;/g, "'").replace(/&quot;/g, '"')
    .replace(/&ndash;/g, "–").replace(/&mdash;/g, "—")
    .replace(/&#x27;/g, "'").replace(/&#x2019;/g, "’");
}
function clean(s) {
  return decode(
    s.replace(/<script[\\s\\S]*?<\\/script>/gi, " ")
      .replace(/<style[\\s\\S]*?<\\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\\s+/g, " ").trim()
  );
}
function titleOf(html, fallback) {
  return clean((html.match(/<title[^>]*>([\\s\\S]*?)<\\/title>/i) || ["", fallback])[1]);
}
function sectionsOf(html) {
  const main = (html.match(/<main[\\s\\S]*?<\\/main>/i) || [""])[0]
    .replace(/<script[\\s\\S]*?<\\/script>/gi, " ")
    .replace(/<style[\\s\\S]*?<\\/style>/gi, " ");
  const re = /<h([1-3])[^>]*>([\\s\\S]*?)<\\/h\\1>/gi;
  const hits = [...main.matchAll(re)];
  const sections = [];
  for (let i = 0; i < hits.length; i++) {
    const end = i + 1 < hits.length ? hits[i + 1].index : main.length;
    const text = clean(main.slice(hits[i].index, end));
    if (text) sections.push({ heading: clean(hits[i][2]), text });
  }
  return sections;
}
function keywords(text) {
  return [...new Set(clean(text).toLowerCase()
    .replace(/[^a-z0-9\\s-]/g, " ").split(/\\s+/)
    .filter(w => w.length > 3 && !STOP.has(w)))].slice(0, 80);
}
function synonymsFor(text, relPath) {
  const lower = (relPath + " " + text).toLowerCase();
  const found = [];
  for (const [trigger, synonyms] of TOPIC_SYNONYMS) {
    if (lower.includes(trigger)) found.push(...synonyms);
  }
  return [...new Set(found)];
}

const files = walk(ROOT)
  .filter(f => !f.includes(path.join(ROOT, ".git")))
  .filter(f => path.basename(f) !== "home-v2.html");

const entries = [];
for (const file of files) {
  const rel = path.relative(ROOT, file).replace(/\\/g, "/");
  const html = fs.readFileSync(file, "utf8");
  const title = titleOf(html, rel);
  const url = BASE_URL + rel;
  for (const [i, section] of sectionsOf(html).entries()) {
    const syn = synonymsFor(section.heading + " " + section.text, rel);
    entries.push({
      id: rel.replace(/\\.html$/, "").replace(/\\//g, "-") + "-" + String(i + 1).padStart(2, "0"),
      page_title: title,
      url,
      section_heading: section.heading,
      text: section.text,
      keywords: [...new Set([...keywords(section.heading + " " + section.text), ...syn])],
      synonyms: syn
    });
  }

  if (rel === "index.html") {
    const launch = clean((html.match(/<aside[^>]*class="launch-notice"[\\s\\S]*?<\\/aside>/i) || [""])[0]);
    if (launch) {
      entries.unshift({
        id: "site-launch-notice",
        page_title: title,
        url,
        section_heading: "Site launch notice",
        text: launch,
        keywords: ["consulting engagements", "1 april 2027", "information", "prospective enquiries", "engagements commence"],
        synonyms: ["launch date", "consulting start date", "when do engagements commence"]
      });
    }
  }
}

const result = {
  version: new Date().toISOString().slice(0, 10),
  source: "Visible text extracted from published Sage Harvest HTML pages. home-v2.html is excluded because it is a legacy duplicate whose canonical URL is the homepage.",
  entries
};
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(result, null, 2) + "\\n");
console.log(`Generated ${entries.length} Puja knowledge entries at ${OUT}`);
