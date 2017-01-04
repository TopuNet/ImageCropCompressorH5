# 图片裁剪压缩插件，基于H5 v1.1.3
###安装：npm install TopuNet-ImageCropCompressorH5

文件结构：
-------------
        1. widget/lib/*.js 放入项目文件夹jq（原生规范）或widget/lib（AMD规范）中

页面引用：
-------------
原生引用

        1. 页面底端引用 最新版 Jquery.min.js#1.x.x 或 zepto.min.js
        2. 后引用 /jq/exif.js
        3. 后引用 /jq/ImageCropCompressorH5.js

requireJS引用

        依赖ImageCropCompressorH5.js，成功后返回对象ImageCropCompressorH5
        默认依赖zepto，/dist/ImageCropCompressorH5.js最下面的define可以改为jquery.min.js#1.x.x

功能配置及启用：
--------------
1. 初始化（监听某文件域——支持多个文件域——的改变并弹出裁剪层，裁剪后压缩并转为base64）：

        var crop1 = new ImageCropCompressorH5();
        crop1.Listener({
            image_input_selector: "#file_input_1",
            image_review_success_callback: function() {
                console.log("预览加载完毕");
                // $("section.crop_layer").css("display", "block");
            },
            image_width_px: "200", // 图片最终宽度，单位px。默认300
            image_height_px: "200", // 图片最终高度，单位px。默认300
            image_quality_kb: "200", // 图片最大质量，单位kb。默认300
            image_crop_success_callback: function(base64) { // 图片裁剪完成后回调。自动关闭弹层。 function(裁剪后图片的base64){}
                console.log("base64.length:" + base64.length);
                $("img.result_1").attr("src", base64).show(0);
                $("img.result_2").hide(0);
            }
        });

        var crop2 = new ImageCropCompressorH5();
        crop2.Listener({
            image_input_selector: "#file_input_2",
            image_review_success_callback: function() {
                console.log("预览加载完毕");
            },
            image_width_px: "400", // 图片最终宽度，单位px。默认300
            image_height_px: "400", // 图片最终高度，单位px。默认300
            image_quality_kb: "300", // 图片最大质量，单位kb。默认300
            image_crop_success_callback: function(base64) { // 图片裁剪完成后回调。自动关闭弹层。 function(裁剪后图片的base64){}
                console.log("base64.length:" + base64.length);
                $("img.result_2").attr("src", base64).show(0);
                $("img.result_1").hide(0);
            }
        });

2. 单独调用压缩图片方法：

        /*
            obj：源图片对象 或 图片Base64 或 canvas对象
            quality：压缩目标质量（KB）
            Callback(base64): 压缩后的base64
        */
        ImageCropCompressorH5.img_Compress(obj, quality, Callback);

3. 关闭裁剪层

        ImageCropCompressorH5.bg_close();

更新日志：
-------------
v1.1.3

        1. 解决ios和安卓在处理Orientation不等于1的图片时，处理方案不统一的bug。
        解决方法：所有图片在加载的时候，均用canvas重新读取一遍，在读取的过程中，如果Orientation不等于1，则旋转。裁剪时则不再需要判断Orientation。
        2. 判断图片尺寸，适当压缩（尺寸，非质量），提高加载速度。
        3. 图片的移动和缩放在安卓端略卡，还需要继续优化。

v1.1.2

        1. 解决单页面内 含有多个监听时，裁剪盒不能按各自的opt显示正常尺寸的bug

v1.1.1

        1. 增加对同页面内多个文件域监听的支持。每个文件域可以设置自己的参数。
        2. 修改调用方法，详见：功能配置及启用

v1.0.2

        1. 增加关闭裁剪层方法
        
v1.0.1

        1. 制作、发布
        2. 移动端使用，pc端还没太折腾
        