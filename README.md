# Biographical Avatar Studio

## Deployable App

The interactive EchoFrame app is packaged under three contextual deployments:

- External: `deployments/external/index.html`
- Internal: `deployments/internal/index.html`
- Canvas App: `deployments/canvas-app/index.html`

The static frontend runtime is split into vanilla browser modules under `assets/js/` and served by the Cloud Run-compatible `server.cjs`.

The current static app includes a local AI-assist guide named Echo that gives non-technical users next-step direction, starter-script help, preview readiness, and share-package summaries without changing the exported browser payload contract.

See `DEPLOYMENTS.md` for local run instructions, Cloud Run deployment, and Canvas App bridge details.

an AI-powered video generation app that creates cinematic, first-person biographical documentaries where the subject narrates their own story. It supports historical figures, animals, mythological beings, supernatural entities, and fictional characters. All non-human subjects are rendered as anthropomorphic avatars that preserve defining traits while adopting human-like posture, facial expression, and speech mechanics.

# 🎬 **AethelFrame: First-Person Biographical Avatar Studio**
*“Every life, myth, and legend speaks for itself.”*

---

## 🧭 **Core Concept**
AethelFrame is an AI-powered documentary generation platform that transforms raw biographical data into cinematic, first-person narrative videos. The subject narrates their own story through a dynamically animated, speaking avatar. The system supports **humans, animals, mythological/supernatural beings, fictional characters, and even sentient historical artifacts**, with all non-human subjects rendered as **anthropomorphic avatars** that preserve iconic traits while adopting human-compatible articulation, facial expression, and lip-sync mechanics.

---

## 🔄 **End-to-End Workflow & System Architecture**
The platform operates on a deterministic, cloud-optimized pipeline with optional local preview acceleration:

```
Input (Text/URL/Audio/Images) 
   → NLP Extraction & Story Graph Mapping 
   → AI Script Generation (Editable) 
   → Hybrid Avatar Construction 
   → Acoustic Voice Design & Prosody Tuning 
   → Audio-Driven Facial & Upper-Body Animation 
   → Scene Composition & B-Roll Integration 
   → Cloud-GPU Rendering + C2PA Provenance Embedding 
   → Export (MP4/Web/VTT) 
```

**Dual-Interface Design**: 
- **GUI Dashboard**: Visual, drag-and-drop workflow optimized for creators, educators, and storytellers.
- **Dev CLI / Batch Terminal**: A command-line interface for power users, enabling JSON-based queue management, parameter tweaking, automated script injection, and real-time render monitoring.

---

## 🛠️ **Core Technical Modules**

### 1. Narrative & Script Engine
- **Story Graph Architecture**: An NLP pipeline that extracts biographical entities, dates, and causal relationships, mapping them into a temporal graph. This automatically structures output into a three-act narrative arc (setup, turning point, resolution) with pacing aligned to documentary conventions.
- **Automated Accuracy Tagging**: Every generated script segment is classified in real-time as `[Verified]`, `[Speculative]`, or `[Fictionalized]` based on source reliability. Tags appear as subtle UI indicators and can be enforced in final exports for academic integrity.
- **Tone & Pacing Controls**: Presets (scholarly, intimate, mythic, dramatic) guide LLM generation while maintaining the subject’s historical or thematic voice.

### 2. Hybrid Anthropomorphic Avatar Forge
To resolve the trade-off between rigid templates and unstable pure-generation, AethelFrame employs a **Trait-Mapping + Modular Rigging** methodology:
- **Biological-to-Humanoid Translation**: Defining traits (scales, fur, wings, halos, stone textures) are mapped onto an anthropomorphic skeletal rig. Non-human features become articulated overlays (e.g., wings attach to dynamic bone chains, elongated muzzles use prosthetic-style jaw deformation).
- **Modern Rendering Stack**: Combines FLUX.1/SDXL for initial concept generation, ControlNet for depth/pose conditioning, and TripoSR/NeRF for high-fidelity 3D conversion. Pre-rigged kinematic chains ensure consistent facial topology for reliable lip-sync.
- **Stylistic Outputs**: Photorealistic, stylized cartoon, oil-painting, or mythic-anime variants, all constrained to the same underlying animation skeleton.

### 3. Acoustic Design & Voice Synthesis
- **Non-Human Timbre Engine**: Goes beyond standard TTS by layering harmonics, sub-bass resonance, breath modulation, and acoustic filters. Creates authentic mythic voices (e.g., layered ethereal chorales for deities, rasping stone friction for golems).
- **Voice Cloning & Licensing**: SV2TTS/OpenVoice engines clone voices only with explicit, verifiable consent. Fallback acoustic design generates era- or species-appropriate alternatives.
- **Prosody-Driven Delivery**: Montreal Forced Aligner maps syllabic emphasis to story beats, dynamically adjusting pitch, pacing, and breath pauses to match emotional context.

### 4. Animation, Lip-Sync & Scene Composition
- **Audio-to-Facial Mapping**: LivePortrait and Wav2Lip++ drive temporally consistent mouth, eye, and micro-expression animation. Keyframe anchoring and neural smoothing prevent drift in long-form videos.
- **Script-Aware Gestures**: Inverse Kinematics (IK) upper-body rigs trigger context-aware hand movements, head tilts, and posture shifts synced to narrative punctuation.
- **Dynamic Scene Composer**: HDRI environment generation contextualized to the subject’s era, mythology, or origin. Auto-inserts archival B-roll, timelines, and contextual overlays at script-defined markers.

---

## ⚖️ **Ethical, Legal, Accessibility & Cultural Frameworks**
*Addressing critical industry blind spots, safety is architected into the core pipeline:*

| Domain | Implementation |
|--------|----------------|
| **Copyright & Fair-Use** | Strict IP scanning for modern trademarked/fictional characters. Defaults to transformative, fair-use-compliant generation with mandatory disclaimers. Enterprise tier enables official studio licensing workflows for commercial IP. |
| **Consent & Provenance** | Blocks private living-person generation without cryptographic consent verification. All outputs embed C2PA metadata and visible "AI Biographical Reconstruction" watermarks. |
| **Localization & Accessibility** | Full multi-language TTS pipelines, WCAG 2.2 compliant auto-captioning (SRT/VTT with speaker diarization), and AI-generated audio description tracks for visually impaired audiences. |
| **Cultural & Sacred Sensitivity** | A curatorial prompt layer flags sacred/religious mythological entities. Prevents stereotyping or hallucination by routing requests to expert-reviewed template banks and offering opt-in cultural advisory review modes. |

---

## 🌍 **Target Markets & Monetization Strategy**
Segmented to serve both creative enthusiasts and institutional clients:

| Tier | Price | Features | Target Audience |
|------|-------|----------|-----------------|
| **Starter** | Free | 30s renders, watermark, public-domain only, basic voices, community CLI access | Students, hobbyists |
| **Creator** | $19/mo | 3min renders, HD export, custom voices/avatars, accuracy tags, commercial license | Content creators, indie authors |
| **Studio** | $49/mo | 10min+ renders, priority GPU queue, B-roll library, multi-language captioning, API access | Educators, L&D, media producers |
| **Enterprise** | Custom | Batch rendering, museum/heritage licensing, white-label export, cultural advisory routing, SLA support | Museums, game studios, publishers |

Credits system for heavy renders. Revenue-sharing marketplace for voice actors and historical consultants.

---

## 📅 **Development Roadmap & Risk Mitigation**

| Phase | Timeline | Milestones | Risk & Mitigation |
|-------|----------|------------|-------------------|
| **MVP** | 0–3 mos | Story Graph script engine, 2D/3D avatar preview, base TTS + Wav2Lip++, CLI batch mode | **Temporal drift** → Clip segmentation + keyframe anchoring + manual override tools |
| **v1.0** | 4–6 mos | Acoustic timbre engine, C2PA provenance, WCAG captioning, cultural sensitivity routing | **Compute cost** → Hybrid WebGPU local previews + intelligent prompt caching + cloud auto-scaling |
| **v1.5** | 7–9 mos | NeRF close-up refinement, multi-locale localization, enterprise API, B-roll auto-match | **Voice cloning abuse** → Mandatory consent verification pipeline + audio watermarking |
| **v2.0** | 10–12 mos | Real-time collaborative editing, style-transfer marketplace, edge-render optimization | **IP/Copyright friction** → Automated fair-use compliance checker + studio partnership portal |

---

## 🌟 **Why This Design Wins**
- **Narrative-First Architecture**: The Story Graph ensures documentaries aren't just talking heads, but causally structured biographical experiences.
- **Anthropomorphic Fidelity**: Trait-mapping to standardized rigs guarantees that dragons, sentient artifacts like the Rosetta Stone, or mythic guardians can speak clearly without breaking viewer suspension or animation physics.
- **Ethics & Accessibility by Default**: C2PA provenance, consent gates, multi-language captioning, and cultural guardrails turn legal/compliance risks into platform strengths.
- **Professional-Grade Output**: Bridges generative AI with traditional post-production workflows, making it viable for museum installations, documentary pitching, educational curricula, and transmedia marketing.


