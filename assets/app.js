$(document).ready(function () {
  // 为非封面图片添加 data-fancybox="gallery" 属性
  $('.img').not(".cover").each(function () {
    $(this).attr("data-fancybox", "gallery");
  });

  // 初始化 Fancybox
  Fancybox.bind("[data-fancybox='gallery']", {
    loop: true, // 图片循环
    buttons: ["zoom", "close"], // 控制按钮
  });
});
