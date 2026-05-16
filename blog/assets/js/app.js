(() => {
  const path = location.pathname;
  const isExcludedPage = /\/archive\.html$|\/tags\.html$|\/tag-[^/]+\.html$/.test(path);
  const isIndexPage = /\/blog\/?$|\/blog\/index\.html$/.test(path);
  const isArticlePage = !isExcludedPage && !isIndexPage;

  const loadScript = (src) =>
    new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.defer = true;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });

  const loadStyle = (href) => {
    if (document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  };

  if (isArticlePage || isIndexPage) {
    loadScript('https://testingcf.jsdelivr.net/npm/pangu@7.2.0/dist/browser/pangu.umd.js').then(
      () => window.pangu && pangu.autoSpacingPage(),
    );
  }

  if (isArticlePage) {
    if (document.querySelector('.org-src-container')) {
      loadScript('assets/js/copyCode.js');
    }

    if (document.querySelector('#content .img')) {
      loadStyle('https://testingcf.jsdelivr.net/npm/@fancyapps/ui@4.0.12/dist/fancybox.css');
      loadScript('https://testingcf.jsdelivr.net/npm/@fancyapps/ui@4.0.12/dist/fancybox.umd.js').then(() => {
        if (typeof Fancybox === 'undefined') return;
        document.querySelectorAll('.img').forEach((imgElement) => {
          imgElement.setAttribute('data-fancybox', 'gallery');
        });
        Fancybox.bind("[data-fancybox='gallery']", {
          loop: true,
          buttons: ['zoom', 'close'],
        });
      });
    }
  }

  const input = document.querySelector('#search-input');
  if (!input) return;

  let searchLoaded = false;
  const loadSearch = () => {
    if (searchLoaded) return Promise.resolve();
    searchLoaded = true;
    return loadScript('assets/js/search.js');
  };

  input.addEventListener('focus', () => loadSearch(), { once: true });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') loadSearch();
  });
  input.form?.addEventListener('submit', async () => {
    await loadSearch();
  });
})();

document.addEventListener('DOMContentLoaded', function () {
  // --- Sticky Headers with Anchors ---
  const tocLinks = document.querySelectorAll('#text-table-of-contents a');
  const tocIds = Array.from(tocLinks).map(link => {
    const href = link.getAttribute('href');
    return href ? href.substring(1) : null;
  }).filter(id => id);

  const headers = document.querySelectorAll('#content h2:not(.post-title):not(.tags-title), #content h3, #content h4');

  headers.forEach(header => {
    const headerId = header.id;
    if (!headerId) {
      console.log('Header without ID:', header.textContent);
      return;
    }

    if (tocIds.includes(headerId)) {
      const computedStyle = window.getComputedStyle(header);
      const marginTop = computedStyle.marginTop;
      const marginBottom = computedStyle.marginBottom;

      const wrapper = document.createElement('div');
      wrapper.className = 'heading-wrapper';
      wrapper.style.marginTop = marginTop;
      wrapper.style.marginBottom = marginBottom;
      wrapper.style.background = '#fdf6e3';
      wrapper.style.position = 'sticky';
      wrapper.style.top = '0';
      wrapper.style.zIndex = '100';

      const anchor = document.createElement('a');
      anchor.className = 'heading-anchor';
      anchor.href = `#${headerId}`;
      anchor.textContent = '#';
      anchor.setAttribute('aria-label', `Link to ${header.textContent}`);

      header.parentNode.insertBefore(wrapper, header);
      wrapper.appendChild(header);
      wrapper.appendChild(anchor);

      header.style.margin = '0';
      header.style.padding = '0';

      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        window.location.hash = headerId;
      });
    }
  });
});
