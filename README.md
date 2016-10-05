# 图片裁剪压缩插件，基于H5 v1.0.2
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
1. 初始化（监听某文件域的改变并弹出裁剪层，裁剪后压缩并转为base64）：

        var opt = {
            image_input_selector: "input[type=file]", // 监听的文件域选择器。默认input[type=file]
            image_review_success_callback: null, // 图片预览加载完成后回调
            image_width_px: "200", // 图片最终宽度，单位px。默认300
            image_height_px: "400", // 图片最终高度，单位px。默认300
            image_quality_kb: "150", // 图片最大质量，单位kb。默认300
            image_crop_success_callback: function(base64) { // 图片裁剪完成后回调。自动关闭弹层。 function(裁剪后图片的base64){}

                // Do Sth.
                console.log("base64.length:" + base64.length);

            }
        };

        ImageCropCompressorH5.init(opt);

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
v1.0.2

        1. 增加关闭裁剪层方法
        
v1.0.1

        1. 制作、发布
        2. 移动端使用，pc端还没太折腾
        