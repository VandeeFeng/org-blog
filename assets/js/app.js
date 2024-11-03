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
  const headers = document.querySelectorAll('#content h1, #content h2');
  
  headers.forEach(header => {
      const headerId = header.id || '';
      
      if (headerId) {
          // 创建包装器
          const wrapper = document.createElement('div');
          wrapper.className = 'heading-wrapper';
          
          // 创建锚点链接
          const anchor = document.createElement('a');
          anchor.className = 'heading-anchor';
          anchor.href = `#${headerId}`;
          anchor.textContent = '#';
          
          // 将标题包装在 wrapper 中
          header.parentNode.insertBefore(wrapper, header);
          wrapper.appendChild(header);
          wrapper.appendChild(anchor);
          
          // 点击锚点链接时更新 URL
          anchor.addEventListener('click', function(e) {
              e.preventDefault();
              window.location.hash = headerId;
          });
      }
  });
});