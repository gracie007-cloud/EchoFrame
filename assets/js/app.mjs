import { archetypes, contexts, defaultState, renderSteps } from "./config.mjs";
import { installCanvasBridge } from "./bridge.mjs";
import { buildAppShell } from "./ui.mjs";
import { buildPayload, makeExportId } from "./payload.mjs";
import { cloneDefaultState, loadState, persistState, storageKeyForContext } from "./state.mjs";
import { createStagePainter } from "./canvas-preview.mjs";

export function createEchoFrameApp(root) {
  return new EchoFrameApp(root);
}

class EchoFrameApp {
  constructor(root) {
    const bodyContext = document.body.dataset.context || "external";
    this.root = root;
    this.context = contexts[bodyContext] || contexts.external;
    this.storageKey = storageKeyForContext(this.context);
    this.state = loadState(this.storageKey, defaultState);
    this.renderTimer = null;
    this.stagePainter = createStagePainter({
      getState: () => this.state,
      getContext: () => this.context
    });
  }

  start() {
    installCanvasBridge({
      getPayload: () => buildPayload(this.state, this.context),
      applyHostContext: (payload) => this.applyHostContext(payload),
      postBridge: (type) => this.postBridge(type)
    });
    this.render();
  }

  persist() {
    persistState(this.storageKey, this.state);
  }

  setState(patch, shouldRender = true) {
    this.state = Object.assign({}, this.state, patch);
    this.persist();
    if (shouldRender) {
      this.render();
    }
  }

  render() {
    if (!this.context.tabs.includes(this.state.tab)) {
      this.state.tab = this.context.tabs[0];
      this.persist();
    }

    this.root.className = "app-shell app-" + this.context.key;
    this.root.innerHTML = buildAppShell({
      state: this.state,
      context: this.context
    });

    this.bindEvents();
    this.stagePainter.scheduleStagePaint();
  }

  bindEvents() {
    this.root.querySelectorAll("[data-tab]").forEach((button) => {
      button.addEventListener("click", () => this.setState({ tab: button.dataset.tab }));
    });

    this.root.querySelectorAll("[data-field]").forEach((control) => {
      const field = control.dataset.field;
      const update = () => {
        let value;
        if (control.type === "checkbox") {
          value = control.checked;
        } else if (control.type === "range") {
          value = Number(control.value);
          const label = document.getElementById(field + "-value");
          if (label) {
            const suffix = field === "duration" ? "sec" : field === "pitch" || field === "tempo" ? "x" : "%";
            label.textContent = value + suffix;
          }
        } else {
          value = control.value;
        }
        this.state[field] = value;
        this.persist();
      };
      control.addEventListener("input", update);
      control.addEventListener("change", () => {
        update();
        if (control.tagName === "SELECT" || control.type === "checkbox") {
          this.render();
        }
      });
    });

    this.root.querySelectorAll("[data-action]").forEach((button) => {
      button.addEventListener("click", () => this.handleAction(button.dataset.action, button.dataset.value));
    });
  }

  handleAction(action, value) {
    if (action === "reset") {
      this.stopRenderTimer();
      this.state = cloneDefaultState(defaultState);
      this.persist();
      this.render();
      return;
    }
    if (action === "draft") {
      this.setState({ script: this.draftScript(), tab: "story" });
      return;
    }
    if (action === "sample") {
      this.setState(this.sampleProject());
      return;
    }
    if (action === "clear-script") {
      this.setState({ script: "" });
      return;
    }
    if (action === "subject-type") {
      const first = (archetypes[value] || [this.state.archetype])[0];
      this.setState({ subjectType: value, archetype: first });
      return;
    }
    if (action === "archetype") {
      this.setState({ archetype: value });
      return;
    }
    if (action === "render") {
      this.startRender();
      return;
    }
    if (action === "export") {
      this.setState({
        exportId: makeExportId(this.state),
        renderStatus: "Export manifest built",
        progress: Math.max(this.state.progress, 100)
      });
      return;
    }
    if (action === "post-canvas") {
      this.postBridge("ECHOF_FRAME_UPDATE");
      return;
    }
    if (action === "post-save") {
      this.postBridge("ECHOF_FRAME_SAVE");
    }
  }

  draftScript() {
    const name = this.state.subjectName || "this subject";
    const source = this.state.sourceText || "the available record";
    const tone = this.state.tone;
    return [
      "[Verified] I am " + name + ", speaking from the record that shaped my life.",
      "[Verified] " + source,
      "[Speculative] In a " + tone + " voice, I connect the turning points that made my story endure.",
      "[Verified] This reconstruction closes with provenance, captions, and a clear AI disclosure."
    ].join("\n");
  }

  sampleProject() {
    return {
      subjectName: "The Rosetta Stone",
      subjectType: "artifact",
      archetype: "Rosetta Stone",
      sourceText: "A granodiorite decree that helped scholars unlock Egyptian hieroglyphs.",
      script: [
        "[Verified] I was carved with a decree, repeated in scripts that crossed kingdoms.",
        "[Verified] Centuries later, my surface became a bridge between languages.",
        "[Speculative] I remember hands, dust, and the quiet pressure of people searching for meaning."
      ].join("\n"),
      tone: "scholarly",
      accuracy: "speculative inline",
      scene: "archive",
      visualStyle: "documentary realism",
      voice: "elder",
      tab: "story"
    };
  }

  startRender() {
    this.stopRenderTimer();
    this.setState({ progress: 1, renderStatus: renderSteps[0], exportId: "" }, false);
    this.render();

    let step = 0;
    this.renderTimer = window.setInterval(() => {
      const nextProgress = Math.min(100, this.state.progress + 5 + Math.round(Math.random() * 5));
      if (nextProgress >= ((step + 1) / renderSteps.length) * 100 && step < renderSteps.length - 1) {
        step += 1;
      }
      this.state.progress = nextProgress;
      this.state.renderStatus = nextProgress >= 100 ? "Preview render complete" : renderSteps[step];
      this.persist();
      this.updateRenderProgress();
      if (nextProgress >= 100) {
        this.state.exportId = makeExportId(this.state);
        this.persist();
        this.stopRenderTimer();
        this.render();
      }
    }, 320);
  }

  stopRenderTimer() {
    if (this.renderTimer) {
      window.clearInterval(this.renderTimer);
      this.renderTimer = null;
    }
  }

  updateRenderProgress() {
    const fill = document.getElementById("render-progress");
    const status = document.getElementById("render-status");
    if (fill) {
      fill.style.width = this.state.progress + "%";
    }
    if (status) {
      status.textContent = this.state.renderStatus;
    }
  }

  postBridge(type) {
    const message = {
      source: "echoframe-canvas-app",
      type,
      payload: buildPayload(this.state, this.context)
    };
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(message, "*");
    }
    this.setState({ bridgeStatus: type + " sent at " + new Date().toLocaleTimeString() }, true);
  }

  applyHostContext(payload) {
    const patch = {};
    if (payload.subject) patch.subjectName = payload.subject;
    if (payload.source_brief) patch.sourceText = payload.source_brief;
    if (payload.script) patch.script = payload.script;
    if (payload.type && archetypes[payload.type]) patch.subjectType = payload.type;
    if (payload.archetype) patch.archetype = payload.archetype;
    patch.bridgeStatus = "Host context applied";
    this.setState(patch, true);
  }
}
