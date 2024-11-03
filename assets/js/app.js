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

  // 使用更精确的选择器来获取内容区域内的 h2 和 h3 标题
  const headers = document.querySelectorAll('#content h2:not(.post-title):not(.tags-title), #content h3');
  
  headers.forEach(header => {
      // 检查标题是否有 ID
      const headerId = header.id;
      if (!headerId) {
          console.log('Header without ID:', header.textContent);
          return; // 跳过没有 ID 的标题
      }

      // 检查这个 ID 是否在目录中存在
      if (tocIds.includes(headerId)) {
          console.log('Processing header:', headerId);
          
          // 保存原始标题的 margin
          const computedStyle = window.getComputedStyle(header);
          const marginTop = computedStyle.marginTop;
          const marginBottom = computedStyle.marginBottom;
          
          // 创建包装器
          const wrapper = document.createElement('div');
          wrapper.className = 'heading-wrapper';
          
          // 应用原始标题的 margin 到包装器
          wrapper.style.marginTop = marginTop;
          wrapper.style.marginBottom = marginBottom;
          
          // 创建锚点链接
          const anchor = document.createElement('a');
          anchor.className = 'heading-anchor';
          anchor.href = `#${headerId}`;
          anchor.textContent = '#';
          anchor.setAttribute('aria-label', `Link to ${header.textContent}`);
          
          // 将标题包装在 wrapper 中
          header.parentNode.insertBefore(wrapper, header);
          wrapper.appendChild(header);
          wrapper.appendChild(anchor);
          
          // 重置标题的 margin（因为现在由 wrapper 控制）
          header.style.margin = '0';
          
          // 点击锚点链接时更新 URL
          anchor.addEventListener('click', function(e) {
              e.preventDefault();
              window.location.hash = headerId;
          });
      }
  });
});