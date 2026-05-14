export const contexts = {
  external: {
    key: "external",
    label: "External",
    headline: "EchoFrame Studio",
    subhead: "Public creator workspace",
    delivery: "Public static deployment",
    status: "Share-ready",
    compact: false,
    tabs: ["story", "avatar", "voice", "render"],
    side: "public"
  },
  internal: {
    key: "internal",
    label: "Internal",
    headline: "EchoFrame Control Room",
    subhead: "Private review and render operations",
    delivery: "Private operator deployment",
    status: "Ops online",
    compact: false,
    tabs: ["story", "avatar", "voice", "render", "ops"],
    side: "ops"
  },
  canvas: {
    key: "canvas",
    label: "Canvas App",
    headline: "EchoFrame Canvas",
    subhead: "Compact embedded studio",
    delivery: "Host-embedded Canvas App",
    status: "Bridge idle",
    compact: true,
    tabs: ["story", "avatar", "render"],
    side: "bridge"
  }
};

export const renderSteps = [
  "Story graph normalized",
  "Avatar rig assembled",
  "Voice prosody mapped",
  "Scene layers composed",
  "Compliance markers applied",
  "Preview encoded"
];

export const archetypes = {
  human: ["Historian", "Explorer", "Artist", "Inventor"],
  animal: ["Fox", "Wolf", "Raven", "Stag"],
  mythical: ["Dragon", "Phoenix", "Sphinx", "Golem"],
  fictional: ["Android", "Elf", "Detective", "Captain"],
  artifact: ["Rosetta Stone", "Compass", "Violin", "Crown"]
};

export const defaultState = {
  tab: "story",
  subjectName: "Ada Lovelace",
  subjectType: "human",
  archetype: "Inventor",
  sourceText: "Mathematician, collaborator, and early computing visionary.",
  script: "",
  tone: "reflective",
  accuracy: "verified",
  duration: 90,
  visualStyle: "vintage cinema",
  traitIntensity: 58,
  expression: 62,
  voice: "authoritative",
  pitch: 1,
  tempo: 1,
  language: "en-US",
  scene: "archive",
  output: "web mp4",
  quality: "balanced",
  captions: true,
  watermark: true,
  consent: true,
  c2pa: true,
  internalNotes: "Museum education review lane.",
  queuePriority: "normal",
  webhook: "https://example.internal/webhooks/echoframe",
  privateSources: true,
  progress: 0,
  renderStatus: "Idle",
  exportId: "",
  bridgeStatus: "Waiting for host",
  lastSaved: ""
};
