$(document).ready(function () {
  // 处理所有具有 lazy 类的图片
  $('.lazy').each(function () {
    const originalSrc = $(this).attr("src");
    if (originalSrc) {
      // 将 src 属性名替换为 data-src，并删除原始 src 属性
      $(this).attr({
        "data-src": originalSrc,      // 设置 data-src 属性
        "data-fancybox": "gallery"    // 添加 data-fancybox 属性
      }).removeAttr("src");            // 移除原有的 src 属性
    }
  });

  // 处理所有具有 img 类的图片，添加 data-fancybox 属性
  $('.img').each(function () {
    $(this).attr("data-fancybox", "gallery"); // 添加 data-fancybox 属性
  });

  // 初始化 LazyLoad
  const lazyLoadInstance = new LazyLoad({
    elements_selector: ".lazy", // 选择懒加载的元素
    loaded: function (element) {
      // 将 data-src 赋给 src
      $(element).attr("src", $(element).data("src"));
    }
  });

  // 初始化 Fancybox
  Fancybox.bind("[data-fancybox='gallery']", {
    loop: true, // 图片循环
    buttons: ["zoom", "close"], // 控制按钮
  });
});
