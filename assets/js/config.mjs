export const contexts = {
  external: {
    key: "external",
    label: "Guided Studio",
    headline: "EchoFrame Story Studio",
    subhead: "A friendly AI guide for shaping narrated video ideas.",
    delivery: "Guided story draft",
    status: "Ready to help",
    compact: false,
    tabs: ["story", "avatar", "voice", "render"],
    side: "public"
  },
  internal: {
    key: "internal",
    label: "Team Review",
    headline: "EchoFrame Team Studio",
    subhead: "Review stories, source notes, and publishing readiness.",
    delivery: "Team review workspace",
    status: "Ready for review",
    compact: false,
    tabs: ["story", "avatar", "voice", "render", "ops"],
    side: "ops"
  },
  canvas: {
    key: "canvas",
    label: "Quick Assist",
    headline: "EchoFrame Quick Story Helper",
    subhead: "A compact guided studio for host pages and embeds.",
    delivery: "Embedded story helper",
    status: "Ready to share",
    compact: true,
    tabs: ["story", "avatar", "render"],
    side: "bridge"
  }
};

export const renderSteps = [
  "Reading your notes",
  "Shaping the story",
  "Sketching the character",
  "Warming up the narrator",
  "Setting the scene",
  "Preparing your preview"
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
  renderStatus: "Ready when you are",
  exportId: "",
  bridgeStatus: "Waiting for host",
  lastSaved: ""
};
