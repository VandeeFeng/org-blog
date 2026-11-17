function initCopyCode() {
  const maximumPreviewLines = 50;
  const mobileWidth = 768;
  const buttonResetDelay = 2000;
  const batchSize = 5;
  const minimumIdleTime = 4;
  const codeState = { collapsed: "collapsed", expanded: "expanded" };
  const collapseBlocks = new WeakMap();

  const observer = new IntersectionObserver((entries) => {
    if (window.innerWidth <= mobileWidth) return;
    for (const entry of entries) {
      if (!entry.isIntersecting) collapseBlocks.get(entry.target)?.();
    }
  });

  const runWhenIdle =
    window.requestIdleCallback || ((callback) => setTimeout(callback, 0));
  const codeBlocks = Array.from(
    document.querySelectorAll(".org-src-container"),
  );

  const initCodeBlock = (block) => {
    const pre = block.querySelector("pre");
    if (!pre) return;

    const originalHtml = pre.innerHTML;
    const plainText = pre.textContent;
    const lines = originalHtml.split("\n");
    const language = pre.className.match(/src-([\w-]+)/)?.[1];
    pre.setAttribute(
      "data-lang",
      language && language !== "nil" ? language : "code",
    );
    pre.style.setProperty("--show-lang-label", "block");

    const copyButton = document.createElement("button");
    copyButton.className = "copy-button";
    copyButton.textContent = "Copy";
    copyButton.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(plainText);
        copyButton.textContent = "Copied!";
        copyButton.classList.add("copied");
      } catch (error) {
        console.error("Copy Failed:", error);
        copyButton.textContent = "Copy Failed";
      }
      setTimeout(() => {
        copyButton.textContent = "Copy";
        copyButton.classList.remove("copied");
      }, buttonResetDelay);
    });
    block.appendChild(copyButton);

    if (lines.length <= maximumPreviewLines) return;
    const previewHtml = lines.slice(0, maximumPreviewLines).join("\n");
    let state = codeState.collapsed;
    const wrapper = document.createElement("div");
    wrapper.className = "expand-wrapper";
    const ellipsis = document.createElement("span");
    ellipsis.textContent = "...";
    ellipsis.className = "code-ellipsis";
    const toggleButton = document.createElement("button");
    toggleButton.className = "toggle-button";

    function renderCode(nextState) {
      state = nextState;
      if (state === codeState.expanded) {
        pre.innerHTML = originalHtml;
        pre.style.maxHeight = "700px";
        toggleButton.textContent = "Collapse";
        wrapper.replaceChildren(toggleButton);
      } else {
        pre.innerHTML = previewHtml;
        pre.style.maxHeight = "400px";
        toggleButton.textContent = "Expand";
        wrapper.replaceChildren(ellipsis, toggleButton);
      }
      pre.appendChild(wrapper);
    }

    toggleButton.addEventListener("click", () => {
      renderCode(
        state === codeState.collapsed
          ? codeState.expanded
          : codeState.collapsed,
      );
    });
    collapseBlocks.set(block, () => {
      if (state === codeState.expanded) renderCode(codeState.collapsed);
    });
    renderCode(codeState.collapsed);
    observer.observe(block);
  };

  let index = 0;
  const processBatch = (deadline) => {
    const end = Math.min(index + batchSize, codeBlocks.length);
    while (
      index < end &&
      (!deadline?.timeRemaining || deadline.timeRemaining() > minimumIdleTime)
    ) {
      initCodeBlock(codeBlocks[index]);
      index += 1;
    }
    if (index < codeBlocks.length) runWhenIdle(processBatch);
  };

  runWhenIdle(processBatch);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCopyCode);
} else {
  initCopyCode();
}
