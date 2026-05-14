export function readiness(state, context) {
  const base = [
    { label: "Subject profile", ok: Boolean(state.subjectName && state.sourceText) },
    { label: "Script", ok: Boolean(state.script) },
    { label: "Avatar mapping", ok: Boolean(state.subjectType && state.archetype) },
    { label: "Voice and scene", ok: Boolean(state.voice && state.scene) }
  ];
  if (context.key === "internal") {
    base.push({ label: "Consent gate", ok: Boolean(state.consent) });
    base.push({ label: "Provenance manifest", ok: Boolean(state.c2pa && state.watermark) });
  }
  if (context.key === "canvas") {
    base.push({ label: "Host payload", ok: Boolean(state.subjectName && state.script) });
  }
  return base;
}

export function complianceScore(state) {
  let score = 48;
  if (state.accuracy === "verified") score += 18;
  if (state.accuracy === "speculative inline") score += 10;
  if (state.captions) score += 8;
  if (state.watermark) score += 9;
  if (state.c2pa) score += 9;
  if (state.consent) score += 8;
  return Math.max(0, Math.min(100, score));
}

export function provenanceLine(state) {
  const parts = [];
  parts.push(state.watermark ? "visible label" : "no visible label");
  parts.push(state.c2pa ? "C2PA enabled" : "C2PA off");
  parts.push(state.captions ? "captions included" : "captions off");
  return parts.join(", ") + ".";
}

export function auditLine(state) {
  const sourceMode = state.privateSources ? "private source vault" : "public citations";
  return "Score " + complianceScore(state) + "%, " + sourceMode + ", " + state.queuePriority + " queue.";
}

export function buildPayload(state, context) {
  return {
    context: context.key,
    deployment: context.delivery,
    project: {
      subject: state.subjectName,
      type: state.subjectType,
      archetype: state.archetype,
      source_brief: state.sourceText
    },
    narrative: {
      tone: state.tone,
      accuracy_mode: state.accuracy,
      duration_seconds: Number(state.duration),
      script: state.script
    },
    avatar: {
      visual_style: state.visualStyle,
      trait_intensity: Number(state.traitIntensity),
      expression_range: Number(state.expression),
      scene: state.scene
    },
    voice: {
      profile: state.voice,
      pitch: Number(state.pitch),
      tempo: Number(state.tempo),
      language: state.language
    },
    export: {
      format: state.output,
      quality: state.quality,
      captions: Boolean(state.captions),
      visible_watermark: Boolean(state.watermark),
      c2pa: Boolean(state.c2pa),
      export_id: state.exportId || null
    },
    compliance: {
      score: complianceScore(state),
      consent_gate: Boolean(state.consent),
      accuracy_mode: state.accuracy
    }
  };
}

export function buildOpsPayload(state) {
  return {
    queue: {
      priority: state.queuePriority,
      quality: state.quality,
      expected_duration_seconds: Number(state.duration)
    },
    webhook: {
      url: state.webhook,
      event_types: ["render.started", "render.completed", "compliance.flagged"]
    },
    controls: {
      consent_gate: Boolean(state.consent),
      private_sources: Boolean(state.privateSources),
      c2pa: Boolean(state.c2pa),
      watermark: Boolean(state.watermark)
    },
    notes: state.internalNotes
  };
}

export function canvasBridgeSpec(state) {
  return {
    outbound: ["ECHOF_FRAME_UPDATE", "ECHOF_FRAME_SAVE"],
    inbound: ["ECHOF_FRAME_CONTEXT"],
    source: "echoframe-canvas-app",
    last_status: state.bridgeStatus
  };
}

export function makeExportId(state) {
  const clean = (state.subjectName || "echoframe")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return clean + "-" + Date.now().toString(36);
}
