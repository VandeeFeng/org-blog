(() => {
  const path = location.pathname;
  const isExcludedPage =
    /\/archive\.html$|\/tags\.html$|\/tag-[^/]+\.html$/.test(path);
  const isIndexPage = /\/blog\/?$|\/blog\/index\.html$/.test(path);
  const isArticlePage = !isExcludedPage && !isIndexPage;

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
    ).then(() => window.pangu && pangu.autoSpacingPage());
  }

  if (isArticlePage) {
    if (document.querySelector(".org-src-container")) {
      loadScript("assets/js/copyCode.js");
    }

    if (document.querySelector("#content .img")) {
      loadStyle(
        "https://testingcf.jsdelivr.net/npm/@fancyapps/ui@4.0.12/dist/fancybox.css",
      );
      loadScript(
        "https://testingcf.jsdelivr.net/npm/@fancyapps/ui@4.0.12/dist/fancybox.umd.js",
      ).then(() => {
        if (typeof Fancybox === "undefined") return;
        document.querySelectorAll(".img").forEach((imgElement) => {
          imgElement.setAttribute("data-fancybox", "gallery");
        });
        Fancybox.bind("[data-fancybox='gallery']", {
          loop: true,
          buttons: ["zoom", "close"],
        });
      });
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
      .then(() => loadScript("assets/js/search.js"))
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

  input.addEventListener("focus", loadSearch);
  input.addEventListener("input", loadSearch);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.isComposing) {
      event.preventDefault();
      loadSearch();
    }
  });
  input.form?.addEventListener("submit", (event) => {
    event.preventDefault();
    loadSearch();
  });
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
