(() => {
  const scriptBase = new URL(".", document.currentScript.src);
  const sitePath = new URL("../../", scriptBase).pathname;
  const path = location.pathname;
  const isIndexPage =
    path === sitePath ||
    path === sitePath.slice(0, -1) ||
    path === `${sitePath}index.html`;
  const isArticlePage = Boolean(
    document.querySelector("#content h1.post-title"),
  );

  const reportLoadError = (error) =>
    console.error("Error loading page resource:", error);

  const loadScript = (src) =>
    new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.defer = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });

  const loadStyle = (href) => {
    if (document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  };

  if (isArticlePage || isIndexPage) {
    loadScript(
      "https://testingcf.jsdelivr.net/npm/pangu@7.2.0/dist/browser/pangu.umd.js",
    )
      .then(() => window.pangu && pangu.autoSpacingPage())
      .catch(reportLoadError);
  }

  if (isArticlePage) {
    if (document.querySelector(".org-src-container")) {
      loadScript(new URL("copyCode.js", scriptBase).href).catch(
        reportLoadError,
      );
    }

    if (document.querySelector("#content .img")) {
      loadStyle(
        "https://testingcf.jsdelivr.net/npm/@fancyapps/ui@4.0.12/dist/fancybox.css",
      );
      loadScript(
        "https://testingcf.jsdelivr.net/npm/@fancyapps/ui@4.0.12/dist/fancybox.umd.js",
      )
        .then(() => {
          if (typeof Fancybox === "undefined") return;
          document.querySelectorAll(".img").forEach((imgElement) => {
            imgElement.setAttribute("data-fancybox", "gallery");
          });
          Fancybox.bind("[data-fancybox='gallery']", {
            loop: true,
            buttons: ["zoom", "close"],
          });
        })
        .catch(reportLoadError);
    }
  }

  const input = document.querySelector("#search-input");
  if (!input) return;

  let searchPromise;
  const loadSearch = () => {
    if (searchPromise) return searchPromise;
    searchPromise = loadScript(
      "https://testingcf.jsdelivr.net/npm/fuse.js@7.1.0/dist/fuse.min.js",
    )
      .then(() => loadScript(new URL("search.js", scriptBase).href))
      .then(() => {
        input.removeEventListener("focus", loadSearch);
        input.removeEventListener("input", activateSearch);
        input.removeEventListener("keydown", activateSearch);
        input.form?.removeEventListener("submit", activateSearch);
        input.removeEventListener("compositionstart", trackComposition);
        input.removeEventListener("compositionend", trackComposition);
        delete input.dataset.searchComposing;
      })
      .catch((error) => {
        searchPromise = null;
        console.error("Error loading search scripts:", error);
        if (input.value.trim().length < 2) return;
        const results = document.getElementById("search-results");
        results.textContent = "Search failed to load. Press Enter to retry.";
        results.style.display = "block";
        document.getElementById("content").style.display = "none";
      });
    return searchPromise;
  };

  function activateSearch(event) {
    if (
      event.type === "keydown" &&
      (event.key !== "Enter" || event.isComposing)
    )
      return;
    if (event.type !== "input") event.preventDefault();
    if (input.value.trim().length < 2) {
      document.getElementById("search-results").style.display = "none";
      document.getElementById("content").style.display = "block";
    }
    loadSearch();
  }

  function trackComposition(event) {
    input.dataset.searchComposing = String(event.type === "compositionstart");
  }

  input.addEventListener("compositionstart", trackComposition);
  input.addEventListener("compositionend", trackComposition);
  input.addEventListener("focus", loadSearch);
  input.addEventListener("input", activateSearch);
  input.addEventListener("keydown", activateSearch);
  input.form?.addEventListener("submit", activateSearch);
})();

document.addEventListener("DOMContentLoaded", function () {
  const tocLinks = document.querySelectorAll("#text-table-of-contents a");
  const tocIds = new Set(
    Array.from(tocLinks, (link) => link.getAttribute("href")?.slice(1)).filter(
      Boolean,
    ),
  );

  const headers = document.querySelectorAll(
    "#content h2:not(.post-title):not(.tags-title), #content h3, #content h4",
  );

  headers.forEach((header) => {
    const headerId = header.id;
    if (!headerId) {
      console.log("Header without ID:", header.textContent);
      return;
    }

    if (!tocIds.has(headerId)) return;

    const { marginTop, marginBottom } = window.getComputedStyle(header);

    const wrapper = document.createElement("div");
    wrapper.className = "heading-wrapper";
    wrapper.style.marginTop = marginTop;
    wrapper.style.marginBottom = marginBottom;
    wrapper.style.background = "#fdf6e3";
    wrapper.style.position = "sticky";
    wrapper.style.top = "0";
    wrapper.style.zIndex = "100";

    const anchor = document.createElement("a");
    anchor.className = "heading-anchor";
    anchor.href = `#${headerId}`;
    anchor.textContent = "#";
    anchor.setAttribute("aria-label", `Link to ${header.textContent}`);

    header.parentNode.insertBefore(wrapper, header);
    wrapper.appendChild(header);
    wrapper.appendChild(anchor);

    header.style.margin = "0";
    header.style.padding = "0";

    anchor.addEventListener("click", (event) => {
      event.preventDefault();
      window.location.hash = headerId;
    });
  });
});
