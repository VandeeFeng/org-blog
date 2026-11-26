/* Search the publish-time index with Fuse.js. */

function initSearch(indexUrl) {
  const searchInput = document.getElementById("search-input");
  const searchResults = document.getElementById("search-results");
  const content = document.getElementById("content");
  const minimumQueryLength = 2;
  const searchDelay = 150;
  const snippetContext = 40;
  const maximumSnippets = 3;
  let searchIndex;
  let indexPromise;
  let searchTimer;

  if (!searchInput || !searchResults || !content) return;
  let isComposing = searchInput.dataset.searchComposing === "true";

  searchResults.setAttribute("aria-live", "polite");

  function showMessage(message) {
    searchResults.textContent = message;
    content.style.display = "none";
    searchResults.style.display = "block";
  }

  function showIndexError(error) {
    console.error("Error loading search index:", error);
    if (searchInput.value.trim().length >= minimumQueryLength) {
      showMessage("Search index failed to load. Press Enter to retry.");
    }
  }

  function loadIndex() {
    if (indexPromise) return indexPromise;
    indexPromise = fetch(indexUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Search index load failed: ${response.status}`);
        }
        return response.json();
      })
      .then((posts) => {
        searchIndex = new Fuse(posts, {
          keys: [{ name: "title", weight: 2 }, "content"],
          threshold: 0.4,
          ignoreLocation: true,
          includeMatches: true,
          minMatchCharLength: minimumQueryLength,
        });
        search();
      })
      .catch((error) => {
        indexPromise = null;
        searchIndex = null;
        showIndexError(error);
      });
    return indexPromise;
  }

  function highlightText(text, ranges, offset = 0) {
    const fragment = document.createDocumentFragment();
    let cursor = 0;
    for (const [first, last] of ranges) {
      const start = Math.max(cursor, first - offset);
      const end = Math.min(text.length, last - offset + 1);
      if (start >= end) continue;
      fragment.appendChild(document.createTextNode(text.slice(cursor, start)));
      const mark = document.createElement("mark");
      mark.textContent = text.slice(start, end);
      fragment.appendChild(mark);
      cursor = end;
    }
    fragment.appendChild(document.createTextNode(text.slice(cursor)));
    return fragment;
  }

  function createResultLink(url) {
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener";
    return link;
  }

  function appendSnippets(resultItem, post, ranges) {
    let previousEnd = -1;
    let snippetCount = 0;

    for (const [first, last] of ranges) {
      if (first < previousEnd) continue;

      const start = Math.max(0, first - snippetContext);
      const end = Math.min(post.content.length, last + 1 + snippetContext);
      const header = (post.headers || []).reduce((nearest, current) => {
        if (
          current.index <= first &&
          (!nearest || current.index > nearest.index)
        ) {
          return current;
        }
        return nearest;
      }, null);
      const url = header?.id ? `${post.url}#${header.id}` : post.url;
      const snippet = document.createElement("div");
      snippet.className = "search-result-snippet";

      const link = createResultLink(url);
      link.className = "snippet-link";
      if (start > 0) link.appendChild(document.createTextNode("..."));
      link.appendChild(
        highlightText(post.content.slice(start, end), ranges, start),
      );
      if (end < post.content.length)
        link.appendChild(document.createTextNode("..."));

      snippet.appendChild(link);
      resultItem.appendChild(snippet);
      previousEnd = end;
      snippetCount += 1;
      if (snippetCount === maximumSnippets) break;
    }
  }

  function displayResults(results) {
    searchResults.replaceChildren();
    if (results.length === 0) {
      showMessage("No results found.");
      return;
    }

    const fragment = document.createDocumentFragment();
    for (const { item: post, matches } of results) {
      const resultItem = document.createElement("div");
      resultItem.className = "search-result";
      const title = createResultLink(post.url);
      const titleMatch = matches.find((match) => match.key === "title");
      title.appendChild(highlightText(post.title, titleMatch?.indices || []));
      resultItem.appendChild(title);

      const bodyMatch = matches.find((match) => match.key === "content");
      appendSnippets(resultItem, post, bodyMatch?.indices || []);
      fragment.appendChild(resultItem);
    }
    searchResults.appendChild(fragment);
    content.style.display = "none";
    searchResults.style.display = "block";
  }

  function search() {
    clearTimeout(searchTimer);
    if (isComposing) return;
    const query = searchInput.value.trim();
    if (query.length < minimumQueryLength) {
      content.style.display = "block";
      searchResults.style.display = "none";
      return;
    }
    if (!searchIndex) {
      showMessage("Loading search index...");
      loadIndex();
      return;
    }
    displayResults(searchIndex.search(query));
  }

  searchInput.addEventListener("input", (event) => {
    clearTimeout(searchTimer);
    if (event.isComposing) {
      isComposing = true;
      return;
    }
    if (searchInput.value.trim().length < minimumQueryLength) {
      search();
      return;
    }
    searchTimer = setTimeout(search, searchDelay);
  });
  searchInput.addEventListener("compositionstart", () => {
    isComposing = true;
    clearTimeout(searchTimer);
  });
  searchInput.addEventListener("compositionend", () => {
    isComposing = false;
    search();
  });
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.isComposing) {
      event.preventDefault();
      search();
    }
  });

  searchInput.form?.addEventListener("submit", (event) => {
    event.preventDefault();
    search();
  });

  if (searchInput.value.trim().length >= minimumQueryLength) {
    search();
  }
}

(() => {
  const indexUrl = new URL("../search-index.json", document.currentScript.src)
    .href;
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => initSearch(indexUrl));
  } else {
    initSearch(indexUrl);
  }
})();
