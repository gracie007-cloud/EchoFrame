import { archetypes } from "./config.mjs";
import {
  auditLine,
  buildOpsPayload,
  buildPayload,
  canvasBridgeSpec,
  complianceScore,
  provenanceLine,
  readiness
} from "./payload.mjs";
import { escapeAttr, escapeHtml, title } from "./utils.mjs";

export function buildAppShell({ state, context }) {
  return [
    buildHeader(state, context),
    '<div class="main-grid ' + (context.compact ? "is-compact" : "") + '">',
    buildStage(state, context),
    buildWorkspace(state, context),
    buildSidePanel(state, context),
    "</div>"
  ].join("");
}

function buildHeader(state, context) {
  const busy = state.progress > 0 && state.progress < 100;
  const ready = readiness(state, context).every((item) => item.ok);
  const dotClass = busy ? "is-busy" : ready ? "" : "is-warn";
  const statusText = busy ? "Rendering" : ready ? context.status : "Needs inputs";

  return [
    '<header class="topbar">',
    '<div class="brand">',
    '<div class="brand-mark">EF</div>',
    "<div>",
    "<h1>" + escapeHtml(context.headline) + "</h1>",
    "<p>" + escapeHtml(context.subhead) + "</p>",
    "</div>",
    "</div>",
    '<div class="context-pill">' + escapeHtml(context.label) + "</div>",
    '<div class="top-actions">',
    '<div class="status-pill"><span class="status-dot ' + dotClass + '"></span>' + escapeHtml(statusText) + "</div>",
    '<button class="btn secondary" data-action="reset">Reset</button>',
    "</div>",
    "</header>"
  ].join("");
}

function buildStage(state, context) {
  const subject = state.subjectName || "Untitled subject";
  const caption = state.script
    ? state.script.split(/\n+/).filter(Boolean)[0]
    : "I am " + subject + ", and this record begins with the sources you provide.";

  return [
    '<section class="stage-panel">',
    '<div class="stage-head">',
    "<div><h2>Live Preview</h2><p>" + escapeHtml(context.delivery) + "</p></div>",
    '<span class="mini-pill">' + escapeHtml(state.quality) + "</span>",
    "</div>",
    '<div class="stage-wrap">',
    '<canvas class="stage-canvas" id="stage-canvas" width="960" height="540"></canvas>',
    '<div class="stage-overlay">',
    '<div class="caption-strip">' + escapeHtml(caption) + "</div>",
    '<div class="meter-cluster">',
    meter("FACT", complianceScore(state)),
    meter("SYNC", Math.round(60 + state.expression * 0.32)),
    meter("RIG", Math.round(42 + state.traitIntensity * 0.46)),
    "</div>",
    "</div>",
    "</div>",
    '<div class="stage-meta">',
    meta("Subject", subject),
    meta("Type", state.subjectType),
    meta("Voice", state.voice),
    meta("Scene", state.scene),
    "</div>",
    "</section>"
  ].join("");
}

function meter(label, value) {
  const bounded = Math.max(0, Math.min(100, Number(value) || 0));
  return [
    '<div class="meter">',
    "<span>" + escapeHtml(label) + "</span>",
    '<div class="meter-track"><div class="meter-fill" style="width:' + bounded + '%"></div></div>',
    "</div>"
  ].join("");
}

function meta(label, value) {
  return "<div><span>" + escapeHtml(label) + "</span><strong>" + escapeHtml(value || "-") + "</strong></div>";
}

function buildWorkspace(state, context) {
  return [
    '<section class="workspace-panel">',
    '<div class="tab-row" role="tablist">',
    context.tabs.map((tab) => {
      return '<button class="tab ' + (state.tab === tab ? "is-active" : "") + '" data-tab="' + tab + '">' + tabLabel(tab) + "</button>";
    }).join(""),
    "</div>",
    '<div class="workspace-body">',
    buildTabContent(state, context),
    "</div>",
    "</section>"
  ].join("");
}

function tabLabel(tab) {
  const labels = {
    story: "Story",
    avatar: "Avatar",
    voice: "Voice",
    render: "Render",
    ops: "Ops"
  };
  return labels[tab] || tab;
}

function buildTabContent(state, context) {
  if (state.tab === "avatar") {
    return buildAvatarTab(state);
  }
  if (state.tab === "voice") {
    return buildVoiceTab(state);
  }
  if (state.tab === "render") {
    return buildRenderTab(state, context);
  }
  if (state.tab === "ops") {
    return buildOpsTab(state);
  }
  return buildStoryTab(state);
}

function buildStoryTab(state) {
  return [
    '<div class="section-band">',
    '<div class="field-grid">',
    inputField("Subject", "subjectName", state.subjectName, "text"),
    selectField("Narrative tone", "tone", state.tone, ["reflective", "scholarly", "dramatic", "mythic", "intimate"]),
    selectField("Accuracy mode", "accuracy", state.accuracy, ["verified", "speculative inline", "creative fiction"]),
    rangeField("Duration", "duration", state.duration, 30, 240, 5, "sec"),
    '<div class="field full"><label for="sourceText">Source brief</label><textarea id="sourceText" data-field="sourceText">' + escapeHtml(state.sourceText) + "</textarea></div>",
    '<div class="field full"><label for="script">First-person script</label><textarea id="script" data-field="script">' + escapeHtml(state.script) + "</textarea></div>",
    "</div>",
    '<div class="action-row">',
    '<button class="btn teal" data-action="draft">Draft script</button>',
    '<button class="btn secondary" data-action="sample">Load sample</button>',
    '<button class="btn secondary" data-action="clear-script">Clear script</button>',
    "</div>",
    "</div>"
  ].join("");
}

function buildAvatarTab(state) {
  const typeButtons = ["human", "animal", "mythical", "fictional", "artifact"].map((type) => {
    return '<button class="chip ' + (state.subjectType === type ? "is-active" : "") + '" data-value="' + type + '" data-action="subject-type">' + title(type) + "</button>";
  }).join("");
  const options = archetypes[state.subjectType] || archetypes.human;
  const archetypeButtons = options.map((name) => {
    return '<button class="chip ' + (state.archetype === name ? "is-active" : "") + '" data-value="' + escapeAttr(name) + '" data-action="archetype">' + escapeHtml(name) + "</button>";
  }).join("");

  return [
    '<div class="section-band">',
    '<div class="field"><label>Classification</label><div class="chip-row">' + typeButtons + "</div></div>",
    '<div class="field"><label>Archetype</label><div class="chip-row">' + archetypeButtons + "</div></div>",
    '<div class="field-grid">',
    selectField("Visual style", "visualStyle", state.visualStyle, ["documentary realism", "vintage cinema", "stylized cartoon", "oil portrait", "mythic anime"]),
    rangeField("Trait intensity", "traitIntensity", state.traitIntensity, 0, 100, 1, "%"),
    rangeField("Expression range", "expression", state.expression, 0, 100, 1, "%"),
    selectField("Scene", "scene", state.scene, ["archive", "forest", "city", "cosmos", "studio"]),
    "</div>",
    "</div>"
  ].join("");
}

function buildVoiceTab(state) {
  return [
    '<div class="section-band">',
    '<div class="field-grid">',
    selectField("Voice profile", "voice", state.voice, ["neutral", "elder", "youth", "authoritative", "whisper", "mythic", "synthetic"]),
    selectField("Language", "language", state.language, ["en-US", "en-GB", "fr-CA", "es-US", "ja-JP"]),
    rangeField("Pitch", "pitch", state.pitch, 0.6, 1.6, 0.1, "x"),
    rangeField("Tempo", "tempo", state.tempo, 0.6, 1.6, 0.1, "x"),
    selectField("Output", "output", state.output, ["web mp4", "vertical mp4", "webm preview", "vtt captions"]),
    selectField("Render quality", "quality", state.quality, ["fast preview", "balanced", "cinematic"]),
    "</div>",
    '<div class="toggle-grid">',
    toggle("captions", "Caption track", "Generate VTT/SRT aligned to the narration.", state.captions),
    toggle("watermark", "Visible AI provenance mark", "Applies the EchoFrame reconstruction label.", state.watermark),
    toggle("c2pa", "C2PA manifest", "Adds export metadata for provenance-aware hosts.", state.c2pa),
    "</div>",
    "</div>"
  ].join("");
}

function buildRenderTab(state, context) {
  const items = readiness(state, context).map((item) => {
    const cls = item.ok ? "ok" : "bad";
    const text = item.ok ? "Ready" : "Missing";
    return "<li><span>" + escapeHtml(item.label) + '</span><strong class="' + cls + '">' + text + "</strong></li>";
  }).join("");
  const busy = state.progress > 0 && state.progress < 100;
  const canRender = readiness(state, context).every((item) => item.ok) && !busy;

  return [
    '<div class="section-band">',
    '<ul class="readiness-list">' + items + "</ul>",
    '<div class="progress-box">',
    '<div class="progress-track"><div class="progress-fill" id="render-progress" style="width:' + state.progress + '%"></div></div>',
    '<strong id="render-status">' + escapeHtml(state.renderStatus) + "</strong>",
    "</div>",
    '<div class="action-row">',
    '<button class="btn clay" data-action="render" ' + (canRender ? "" : "disabled") + ">Render preview</button>",
    '<button class="btn secondary" data-action="export">Build export manifest</button>',
    context.key === "canvas" ? '<button class="btn teal" data-action="post-canvas">Post to host</button>' : "",
    "</div>",
    '<pre class="json-preview">' + escapeHtml(JSON.stringify(buildPayload(state, context), null, 2)) + "</pre>",
    "</div>"
  ].join("");
}

function buildOpsTab(state) {
  return [
    '<div class="section-band">',
    '<div class="field-grid">',
    selectField("Queue priority", "queuePriority", state.queuePriority, ["low", "normal", "high", "critical"]),
    inputField("Webhook", "webhook", state.webhook, "url"),
    '<div class="field full"><label for="internalNotes">Internal notes</label><textarea id="internalNotes" data-field="internalNotes">' + escapeHtml(state.internalNotes) + "</textarea></div>",
    "</div>",
    '<div class="toggle-grid">',
    toggle("consent", "Consent gate passed", "Blocks export when disabled.", state.consent),
    toggle("privateSources", "Private source vault", "Keeps citations out of public manifests.", state.privateSources),
    toggle("c2pa", "C2PA manifest", "Required for internal publishing.", state.c2pa),
    "</div>",
    '<pre class="json-preview">' + escapeHtml(JSON.stringify(buildOpsPayload(state), null, 2)) + "</pre>",
    "</div>"
  ].join("");
}

function buildSidePanel(state, context) {
  const titleText = context.side === "ops" ? "Control Plane" : context.side === "bridge" ? "Host Bridge" : "Export Package";
  return [
    '<aside class="side-panel">',
    '<div class="side-head"><div><h2>' + titleText + "</h2><p>" + escapeHtml(context.delivery) + "</p></div></div>",
    '<div class="side-body">',
    buildSideBody(state, context),
    "</div>",
    "</aside>"
  ].join("");
}

function buildSideBody(state, context) {
  if (context.side === "ops") {
    return [
      '<div class="mini-section"><h3>Queue</h3><ul class="metric-list">',
      metric("Priority", state.queuePriority),
      metric("Compliance", complianceScore(state) + "%"),
      metric("Webhook", state.webhook ? "Configured" : "None"),
      "</ul></div>",
      '<div class="mini-section"><h3>Audit</h3><p>' + escapeHtml(auditLine(state)) + "</p></div>",
      '<pre class="code-preview">' + escapeHtml(JSON.stringify(buildOpsPayload(state), null, 2)) + "</pre>"
    ].join("");
  }

  if (context.side === "bridge") {
    return [
      '<div class="mini-section"><h3>Bridge status</h3><p>' + escapeHtml(state.bridgeStatus) + "</p></div>",
      '<div class="action-row"><button class="btn teal" data-action="post-canvas">Post update</button><button class="btn secondary" data-action="post-save">Post save</button></div>',
      '<pre class="code-preview">' + escapeHtml(JSON.stringify(canvasBridgeSpec(state), null, 2)) + "</pre>"
    ].join("");
  }

  return [
    '<div class="mini-section"><h3>Package</h3><ul class="metric-list">',
    metric("Visibility", "External"),
    metric("Format", state.output),
    metric("Export id", state.exportId || "Not built"),
    "</ul></div>",
    '<div class="mini-section"><h3>Provenance</h3><p>' + escapeHtml(provenanceLine(state)) + "</p></div>",
    '<pre class="code-preview">' + escapeHtml(JSON.stringify(buildPayload(state, context), null, 2)) + "</pre>"
  ].join("");
}

function inputField(label, field, value, type) {
  return [
    '<div class="field">',
    '<label for="' + field + '">' + escapeHtml(label) + "</label>",
    '<input id="' + field + '" data-field="' + field + '" type="' + type + '" value="' + escapeAttr(value) + '">',
    "</div>"
  ].join("");
}

function selectField(label, field, value, values) {
  return [
    '<div class="field">',
    '<label for="' + field + '">' + escapeHtml(label) + "</label>",
    '<select id="' + field + '" data-field="' + field + '">',
    values.map((option) => {
      return '<option value="' + escapeAttr(option) + '" ' + (String(value) === option ? "selected" : "") + ">" + title(option) + "</option>";
    }).join(""),
    "</select>",
    "</div>"
  ].join("");
}

function rangeField(label, field, value, min, max, step, suffix) {
  return [
    '<div class="field">',
    '<label for="' + field + '">' + escapeHtml(label) + "</label>",
    '<div class="range-line">',
    '<input id="' + field + '" data-field="' + field + '" type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + escapeAttr(value) + '">',
    '<strong id="' + field + '-value">' + escapeHtml(value) + suffix + "</strong>",
    "</div>",
    "</div>"
  ].join("");
}

function toggle(field, label, detail, checked) {
  return [
    '<label class="toggle">',
    '<input type="checkbox" data-field="' + field + '" ' + (checked ? "checked" : "") + ">",
    '<div><strong class="toggle-label">' + escapeHtml(label) + '</strong><span>' + escapeHtml(detail) + "</span></div>",
    "</label>"
  ].join("");
}

function metric(label, value) {
  return "<li><span>" + escapeHtml(label) + "</span><strong>" + escapeHtml(value) + "</strong></li>";
}
