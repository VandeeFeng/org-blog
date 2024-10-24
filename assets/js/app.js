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
