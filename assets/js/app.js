$(document).ready(function () {
  // 为非封面图片添加 data-fancybox="gallery" 属性并替换 src 为 data-src
  $('.lazy').not(".cover").each(function () {
    // 获取当前图片的 src
    const originalSrc = $(this).attr("src");
    
    // 设置 data-src 和 data-fancybox 属性
    $(this).attr({
      "data-src": originalSrc,  // 设置 data-src 属性
      "src": "",                 // 清空 src 属性
      "data-fancybox": "gallery" // 添加 data-fancybox 属性
    });
  });

  // 初始化 LazyLoad
  const lazyLoadInstance = new LazyLoad({
    elements_selector: ".lazy", // 选择懒加载的元素
  });

  // 初始化 Fancybox
  Fancybox.bind("[data-fancybox='gallery']", {
    loop: true, // 图片循环
    buttons: ["zoom", "close"], // 控制按钮
  });
});
