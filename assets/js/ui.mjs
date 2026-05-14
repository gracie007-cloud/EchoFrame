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
  const statusText = busy ? "Creating preview" : ready ? "Ready for preview" : context.status;

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
    '<button class="btn secondary" data-action="reset">Start over</button>',
    "</div>",
    "</header>"
  ].join("");
}

function buildStage(state, context) {
  const subject = state.subjectName || "Your subject";
  const caption = state.script
    ? state.script.split(/\n+/).filter(Boolean)[0]
    : "Tell EchoFrame who this story is about, then let the guide help you shape the first draft.";

  return [
    '<section class="stage-panel">',
    '<div class="stage-head">',
    "<div><h2>Your Story Preview</h2><p>" + escapeHtml(context.delivery) + "</p></div>",
    '<span class="mini-pill">' + escapeHtml(friendlyQualityLabel(state.quality)) + "</span>",
    "</div>",
    '<div class="stage-wrap">',
    '<canvas class="stage-canvas" id="stage-canvas" width="960" height="540"></canvas>',
    '<div class="stage-overlay">',
    '<div class="caption-strip">' + escapeHtml(caption) + "</div>",
    '<div class="meter-cluster">',
    meter("SOURCE", complianceScore(state)),
    meter("VOICE", Math.round(60 + state.expression * 0.32)),
    meter("LOOK", Math.round(42 + state.traitIntensity * 0.46)),
    "</div>",
    "</div>",
    "</div>",
    '<div class="stage-meta">',
    meta("About", subject),
    meta("Story kind", friendlySubjectType(state.subjectType)),
    meta("Narrator", friendlyVoiceLabel(state.voice)),
    meta("Backdrop", friendlySceneLabel(state.scene)),
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
    buildGuidePanel(state, context),
    buildTabContent(state, context),
    "</div>",
    "</section>"
  ].join("");
}

function buildGuidePanel(state, context) {
  const guide = guideForState(state, context);
  return [
    '<section class="guide-card" aria-label="AI story guide">',
    '<div class="guide-head">',
    '<div class="guide-orb">AI</div>',
    '<div class="guide-copy">',
    "<h2>Echo, your story guide</h2>",
    "<p>" + escapeHtml(guide.message) + "</p>",
    "</div>",
    "</div>",
    '<div class="guide-suggestion"><span>Next best step</span><strong>' + escapeHtml(guide.next) + "</strong></div>",
    '<div class="guide-steps">' + guideSteps(state, context).map(stepTemplate).join("") + "</div>",
    '<div class="action-row guide-actions">' + guideActions(state, context).join("") + "</div>",
    "</section>"
  ].join("");
}

function guideForState(state, context) {
  const hasSubject = Boolean(state.subjectName && state.sourceText);
  const hasScript = Boolean(state.script);
  const hasLook = Boolean(state.subjectType && state.archetype);
  const hasVoice = Boolean(state.voice && state.scene);
  const busy = state.progress > 0 && state.progress < 100;
  const ready = readiness(state, context).every((item) => item.ok);

  if (busy) {
    return {
      message: "I am turning your choices into a short preview. You can keep editing while the progress bar moves.",
      next: "Watch the preview progress, then prepare the share package."
    };
  }
  if (!hasSubject) {
    return {
      message: "Start with plain-language notes. A name and a few facts are enough for a first pass.",
      next: "Add who the story is about and what people should know."
    };
  }
  if (!hasScript) {
    return {
      message: "I can turn your notes into a first-person narration that still leaves room for your edits.",
      next: "Use the writing helper, then adjust any wording that does not sound right."
    };
  }
  if (!hasLook) {
    return {
      message: "The story has a voice on the page. Now choose how the subject should feel on screen.",
      next: "Pick a look, style, and setting."
    };
  }
  if (!hasVoice) {
    return {
      message: "The visual direction is ready. A narrator style and setting will make the idea easier to imagine.",
      next: "Choose a narrator and backdrop."
    };
  }
  if (ready) {
    return {
      message: "Everything needed for a preview is in place. The next pass is about taste: pacing, polish, and trust details.",
      next: state.progress >= 100 ? "Prepare the share package or refine the draft." : "Create a preview."
    };
  }
  return {
    message: "The guide is checking the remaining details for this workspace.",
    next: "Finish the highlighted checklist items."
  };
}

function guideSteps(state, context) {
  return [
    { label: "Tell the story", done: Boolean(state.subjectName && state.sourceText) },
    { label: "Write the narration", done: Boolean(state.script) },
    { label: "Choose the look", done: Boolean(state.subjectType && state.archetype && state.scene) },
    { label: context.key === "canvas" ? "Share with host" : "Create preview", done: state.progress >= 100 || Boolean(state.exportId) }
  ];
}

function stepTemplate(step, index, steps) {
  const firstOpen = steps.findIndex((item) => !item.done);
  const active = firstOpen === index;
  return [
    '<div class="guide-step ' + (step.done ? "is-done" : "") + (active ? " is-active" : "") + '">',
    '<span class="guide-step-index">' + (step.done ? "✓" : index + 1) + "</span>",
    "<strong>" + escapeHtml(step.label) + "</strong>",
    "</div>"
  ].join("");
}

function guideActions(state, context) {
  const actions = [];
  if (!state.script) {
    actions.push('<button class="btn teal" data-action="draft">Write a starter script</button>');
  }
  actions.push('<button class="btn secondary" data-action="sample">Show me an example</button>');
  if (state.script && state.tab !== "avatar" && context.tabs.includes("avatar")) {
    actions.push('<button class="btn secondary" data-tab="avatar">Choose the look</button>');
  }
  if (state.script && context.tabs.includes("render")) {
    actions.push('<button class="btn clay" data-tab="render">Preview my story</button>');
  }
  return actions;
}

function tabLabel(tab) {
  const labels = {
    story: "Story",
    avatar: "Look",
    voice: "Voice",
    render: "Preview",
    ops: "Team"
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
    inputField("Who is the story about?", "subjectName", state.subjectName, "text"),
    selectField("Story mood", "tone", state.tone, ["reflective", "scholarly", "dramatic", "mythic", "intimate"]),
    selectField("How closely should it follow sources?", "accuracy", state.accuracy, ["verified", "speculative inline", "creative fiction"]),
    rangeField("Video length", "duration", state.duration, 30, 240, 5, " sec"),
    '<div class="field full"><label for="sourceText">Paste notes, links, or a short bio</label><textarea id="sourceText" data-field="sourceText">' + escapeHtml(state.sourceText) + "</textarea></div>",
    '<div class="field full"><label for="script">Guided script draft</label><textarea id="script" data-field="script">' + escapeHtml(state.script) + "</textarea></div>",
    "</div>",
    '<div class="action-row">',
    '<button class="btn teal" data-action="draft">Help me write it</button>',
    '<button class="btn secondary" data-action="sample">Show me an example</button>',
    '<button class="btn secondary" data-action="clear-script">Clear draft</button>',
    "</div>",
    "</div>"
  ].join("");
}

function buildAvatarTab(state) {
  const typeButtons = ["human", "animal", "mythical", "fictional", "artifact"].map((type) => {
    return '<button class="chip ' + (state.subjectType === type ? "is-active" : "") + '" data-value="' + type + '" data-action="subject-type">' + friendlySubjectType(type) + "</button>";
  }).join("");
  const options = archetypes[state.subjectType] || archetypes.human;
  const archetypeButtons = options.map((name) => {
    return '<button class="chip ' + (state.archetype === name ? "is-active" : "") + '" data-value="' + escapeAttr(name) + '" data-action="archetype">' + escapeHtml(name) + "</button>";
  }).join("");

  return [
    '<div class="section-band">',
    '<div class="field"><label>Who or what is it?</label><div class="chip-row">' + typeButtons + "</div></div>",
    '<div class="field"><label>Starting style</label><div class="chip-row">' + archetypeButtons + "</div></div>",
    '<div class="field-grid">',
    selectField("Visual mood", "visualStyle", state.visualStyle, ["documentary realism", "vintage cinema", "stylized cartoon", "oil portrait", "mythic anime"]),
    rangeField("Signature traits", "traitIntensity", state.traitIntensity, 0, 100, 1, "%"),
    rangeField("Expressiveness", "expression", state.expression, 0, 100, 1, "%"),
    selectField("Backdrop", "scene", state.scene, ["archive", "forest", "city", "cosmos", "studio"]),
    "</div>",
    "</div>"
  ].join("");
}

function buildVoiceTab(state) {
  return [
    '<div class="section-band">',
    '<div class="field-grid">',
    selectField("Narrator style", "voice", state.voice, ["neutral", "elder", "youth", "authoritative", "whisper", "mythic", "synthetic"]),
    selectField("Spoken language", "language", state.language, ["en-US", "en-GB", "fr-CA", "es-US", "ja-JP"]),
    rangeField("Voice height", "pitch", state.pitch, 0.6, 1.6, 0.1, "x"),
    rangeField("Speaking pace", "tempo", state.tempo, 0.6, 1.6, 0.1, "x"),
    selectField("Share format", "output", state.output, ["web mp4", "vertical mp4", "webm preview", "vtt captions"]),
    selectField("Preview polish", "quality", state.quality, ["fast preview", "balanced", "cinematic"]),
    "</div>",
    '<div class="toggle-grid">',
    toggle("captions", "Captions", "Add readable text for accessibility and silent playback.", state.captions),
    toggle("watermark", "AI-created label", "Show that the story preview was made with AI assistance.", state.watermark),
    toggle("c2pa", "Proof of origin", "Keep origin details with the exported package.", state.c2pa),
    "</div>",
    "</div>"
  ].join("");
}

function buildRenderTab(state, context) {
  const items = readiness(state, context).map((item) => {
    const cls = item.ok ? "ok" : "bad";
    const text = item.ok ? "Ready" : "Add this";
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
    '<button class="btn clay" data-action="render" ' + (canRender ? "" : "disabled") + ">Create preview</button>",
    '<button class="btn secondary" data-action="export">Prepare share package</button>',
    context.key === "canvas" ? '<button class="btn teal" data-action="post-canvas">Share with host</button>' : "",
    "</div>",
    buildPreviewSummary(state, context),
    context.key === "internal" ? buildTechnicalDetails("Team payload", JSON.stringify(buildPayload(state, context), null, 2)) : "",
    "</div>"
  ].join("");
}

function buildOpsTab(state) {
  return [
    '<div class="section-band">',
    '<div class="field-grid">',
    selectField("Team priority", "queuePriority", state.queuePriority, ["low", "normal", "high", "critical"]),
    inputField("Team update URL", "webhook", state.webhook, "url"),
    '<div class="field full"><label for="internalNotes">Review notes</label><textarea id="internalNotes" data-field="internalNotes">' + escapeHtml(state.internalNotes) + "</textarea></div>",
    "</div>",
    '<div class="toggle-grid">',
    toggle("consent", "Permission check passed", "Keep this on before sharing outside the team.", state.consent),
    toggle("privateSources", "Keep source notes private", "Hide sensitive source notes from public packages.", state.privateSources),
    toggle("c2pa", "Proof of origin", "Include origin details for publishing partners.", state.c2pa),
    "</div>",
    buildTechnicalDetails("Team review data", JSON.stringify(buildOpsPayload(state), null, 2)),
    "</div>"
  ].join("");
}

function buildSidePanel(state, context) {
  const titleText = context.side === "ops" ? "Team Review" : context.side === "bridge" ? "Host Sharing" : "Story Guide";
  return [
    '<aside class="side-panel">',
    '<div class="side-head"><div><h2>' + escapeHtml(titleText) + "</h2><p>" + escapeHtml(context.delivery) + "</p></div></div>",
    '<div class="side-body">',
    buildSideBody(state, context),
    "</div>",
    "</aside>"
  ].join("");
}

function buildSideBody(state, context) {
  if (context.side === "ops") {
    return [
      '<div class="mini-section"><h3>Review Snapshot</h3><ul class="metric-list">',
      metric("Priority", friendlyPriorityLabel(state.queuePriority)),
      metric("Readiness", complianceScore(state) + "%"),
      metric("Team updates", state.webhook ? "On" : "Off"),
      "</ul></div>",
      '<div class="mini-section"><h3>Trust Notes</h3><p>' + escapeHtml(auditLine(state)) + "</p></div>",
      buildTechnicalDetails("Operations data", JSON.stringify(buildOpsPayload(state), null, 2))
    ].join("");
  }

  if (context.side === "bridge") {
    return [
      '<div class="mini-section"><h3>Host Page</h3><p>' + escapeHtml(state.bridgeStatus) + "</p></div>",
      '<div class="action-row"><button class="btn teal" data-action="post-canvas">Share update</button><button class="btn secondary" data-action="post-save">Save story</button></div>',
      '<div class="mini-section"><h3>What Will Be Shared</h3><ul class="metric-list">',
      metric("Subject", state.subjectName || "Not set"),
      metric("Story draft", state.script ? "Ready" : "Needs writing"),
      metric("Format", friendlyOutputLabel(state.output)),
      "</ul></div>",
      buildTechnicalDetails("Bridge details", JSON.stringify(canvasBridgeSpec(state), null, 2))
    ].join("");
  }

  const guide = guideForState(state, context);
  return [
    '<div class="mini-section"><h3>Next Step</h3><p>' + escapeHtml(guide.next) + "</p></div>",
    '<div class="mini-section"><h3>Your Share Package</h3><ul class="metric-list">',
    metric("Format", friendlyOutputLabel(state.output)),
    metric("Length", friendlyDuration(state.duration)),
    metric("Package", state.exportId || "Not prepared yet"),
    "</ul></div>",
    '<div class="mini-section"><h3>Trust & Clarity</h3><p>' + escapeHtml(provenanceLine(state)) + "</p></div>"
  ].join("");
}

function buildPreviewSummary(state, context) {
  return [
    '<div class="summary-card">',
    "<h3>Preview Summary</h3>",
    '<div class="summary-grid">',
    summaryItem("Story", state.subjectName || "Untitled"),
    summaryItem("Mood", optionLabel(state.tone)),
    summaryItem("Look", optionLabel(state.visualStyle)),
    summaryItem("Narrator", friendlyVoiceLabel(state.voice)),
    summaryItem("Format", friendlyOutputLabel(state.output)),
    summaryItem("Package", state.exportId || "Not prepared yet"),
    "</div>",
    '<p class="summary-note">' + escapeHtml(context.key === "internal" ? auditLine(state) : provenanceLine(state)) + "</p>",
    "</div>"
  ].join("");
}

function summaryItem(label, value) {
  return '<div><span>' + escapeHtml(label) + "</span><strong>" + escapeHtml(value) + "</strong></div>";
}

function buildTechnicalDetails(label, content) {
  return [
    '<details class="payload-details">',
    "<summary>" + escapeHtml(label) + "</summary>",
    '<pre class="json-preview">' + escapeHtml(content) + "</pre>",
    "</details>"
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
      return '<option value="' + escapeAttr(option) + '" ' + (String(value) === option ? "selected" : "") + ">" + escapeHtml(optionLabel(option)) + "</option>";
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
    '<strong id="' + field + '-value">' + escapeHtml(value + suffix) + "</strong>",
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

function optionLabel(value) {
  const labels = {
    verified: "Stay close to the facts",
    "speculative inline": "Clearly mark imagined moments",
    "creative fiction": "Freely imagined story",
    "documentary realism": "Documentary realism",
    "vintage cinema": "Vintage cinema",
    "stylized cartoon": "Stylized animation",
    "oil portrait": "Painted portrait",
    "mythic anime": "Mythic animation",
    archive: "Archive room",
    forest: "Forest path",
    city: "City streets",
    cosmos: "Star field",
    studio: "Simple studio",
    "en-US": "English (US)",
    "en-GB": "English (UK)",
    "fr-CA": "French (Canada)",
    "es-US": "Spanish (US)",
    "ja-JP": "Japanese",
    "web mp4": "Standard video",
    "vertical mp4": "Vertical video",
    "webm preview": "Quick web preview",
    "vtt captions": "Caption file",
    "fast preview": "Fast draft",
    balanced: "Balanced",
    cinematic: "Cinematic",
    low: "Low",
    normal: "Normal",
    high: "High",
    critical: "Urgent"
  };
  return labels[value] || title(value);
}

function friendlySubjectType(value) {
  const labels = {
    human: "Person",
    animal: "Animal",
    mythical: "Legend",
    fictional: "Fictional character",
    artifact: "Object"
  };
  return labels[value] || title(value);
}

function friendlyVoiceLabel(value) {
  const labels = {
    neutral: "Calm",
    elder: "Wise elder",
    youth: "Young narrator",
    authoritative: "Confident guide",
    whisper: "Quiet",
    mythic: "Storybook",
    synthetic: "Digital"
  };
  return labels[value] || title(value);
}

function friendlySceneLabel(value) {
  return optionLabel(value);
}

function friendlyQualityLabel(value) {
  return optionLabel(value);
}

function friendlyOutputLabel(value) {
  return optionLabel(value);
}

function friendlyPriorityLabel(value) {
  return optionLabel(value);
}

function friendlyDuration(value) {
  const seconds = Number(value) || 0;
  if (seconds < 60) {
    return seconds + " seconds";
  }
  const minutes = Math.floor(seconds / 60);
  const leftover = seconds % 60;
  return leftover ? minutes + " min " + leftover + " sec" : minutes + " minutes";
}
