$(document).ready(function () {

  // 处理所有具有 img 类的图片，添加 data-fancybox 属性
  $('.img').each(function () {
    $(this).attr("data-fancybox", "gallery"); // 添加 data-fancybox 属性
  });


  // 初始化 Fancybox
  Fancybox.bind("[data-fancybox='gallery']", {
    loop: true, // 图片循环
    buttons: ["zoom", "close"], // 控制按钮
  });
});


document.addEventListener('DOMContentLoaded', function() {
  // 获取目录中的所有链接及其对应的ID
  const tocLinks = document.querySelectorAll('#text-table-of-contents a');
  const tocIds = Array.from(tocLinks).map(link => {
      const href = link.getAttribute('href');
      return href ? href.substring(1) : null;
  }).filter(id => id); // 过滤掉 null 值

  // 使用更精确的选择器来获取内容区域内的 h2、h3 和 h4 标题
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
          wrapper.style.padding = '0.2em 0';
          
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
          
          anchor.addEventListener('click', function(e) {
              e.preventDefault();
              window.location.hash = headerId;
          });
      }
  });
});