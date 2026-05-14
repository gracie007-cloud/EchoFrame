export function installCanvasBridge({ getPayload, applyHostContext, postBridge }) {
  window.EchoFrameCanvasApp = {
    getPayload,
    setContext: (payload) => applyHostContext(payload || {})
  };

  window.addEventListener("message", (event) => {
    const message = event.data || {};
    if (message.source !== "echoframe-host") {
      return;
    }
    if (message.type === "ECHOF_FRAME_CONTEXT") {
      applyHostContext(message.payload || {});
      postBridge("ECHOF_FRAME_CONTEXT_APPLIED");
    }
  });
}
