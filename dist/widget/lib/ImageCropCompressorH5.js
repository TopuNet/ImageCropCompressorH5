/*
    基于H5的图片裁剪缩小压缩 v1.1.5
    npm install TopuNet-ImageCropCompressorH5
    高京
    2016-09-22
*/
var ImageCropCompressorH5_global = {};

function ImageCropCompressorH5() {

    return {
        // 监听文件域的change事件
        Listener: function(opt) {
            var _this = this;

            if (!ImageCropCompressorH5_global.dom_crop_layer)
                _this.Init.apply(_this);

            var _this = $.extend(_this, ImageCropCompressorH5_global);

            var opt_default = {
                image_input_selector: "input[type=file]", // 监听的文件域选择器。默认input[type=file]
                image_review_success_callback: null, // 图片预览加载完成后回调
                image_width_px: "300", // 图片最终宽度，单位px。默认300
                image_height_px: "300", // 图片最终高度，单位px。默认300
                image_quality_kb: "300", // 图片最大质量，单位kb。默认300
                image_crop_success_callback: function(base64) { // 图片裁剪完成后回调。自动关闭弹层。 function(裁剪后图片的base64){}
                    console.log("base64.length:" + base64.length);
                }
            };

            _this.Paras = $.extend(opt_default, opt);

            // 添加遮罩和边框盒
            _this.dom_img_preview_mask_border = $(document.createElement("img"))
                .css({
                    "position": "fixed",
                    "top": "0",
                    "left": "0",
                    "display": "none"
                        // "-webkit-mask": "url(\"" + c_mask.toDataURL(_this.image_type, 0.01) + "\")" // 用-webkit-mask 安卓拖拽和缩放太卡
                }).addClass("mask_border").appendTo(_this.dom_crop_layer);

            // 根据目标尺寸生成裁剪框和边框
            (function() {
                // 计算裁剪层宽高
                _this.crop_width_px = Math.floor(_this.window_width_px * 0.9);
                _this.crop_height_px = Math.floor(_this.crop_width_px * _this.Paras.image_height_px / _this.Paras.image_width_px);

                if (_this.crop_height_px > Math.floor(_this.window_height_px * 0.7)) {
                    _this.crop_width_px = Math.floor(_this.crop_width_px * _this.window_height_px * 0.7 / _this.crop_height_px);
                    _this.crop_height_px = Math.floor(_this.window_height_px * 0.7);
                }

                // 计算裁剪层位置
                _this.crop_top_px = Math.floor((_this.window_height_px - _this.crop_height_px) / 2);
                _this.crop_left_px = Math.floor((_this.window_width_px - _this.crop_width_px) / 2); // 创建遮罩和边框(canvas)

                var c_border = document.createElement("canvas");
                c_border.width = _this.window_width_px;
                c_border.height = _this.window_height_px;
                var ctx = c_border.getContext("2d");
                ctx.fillStyle = "rgba(0,0,0,.8)";
                ctx.fillRect(0, 0, _this.window_width_px, _this.crop_top_px); // 上
                // 左
                ctx.fillRect(
                    0,
                    _this.crop_top_px,
                    (_this.window_width_px - _this.crop_width_px) / 2,
                    _this.crop_height_px + 2
                );
                // 右
                ctx.fillRect(
                    _this.window_width_px - (_this.window_width_px - _this.crop_width_px) / 2,
                    _this.crop_top_px,
                    (_this.window_width_px - _this.crop_width_px) / 2,
                    _this.crop_height_px + 2
                );
                // 下
                ctx.fillRect(
                    0,
                    _this.crop_top_px + _this.crop_height_px + 2, // +2 解决安卓端露底的bug
                    _this.window_width_px,
                    _this.crop_top_px
                );
                ctx.beginPath();
                ctx.strokeStyle = "#fff";
                ctx.strokeRect(_this.crop_left_px, _this.crop_top_px, _this.crop_width_px, _this.crop_height_px);
                ctx.beginPath();
                ctx.moveTo(_this.crop_left_px, _this.crop_top_px);
                ctx.lineTo(_this.crop_left_px + _this.crop_width_px, _this.crop_top_px);
                ctx.lineTo(_this.crop_left_px + _this.crop_width_px, _this.crop_top_px + _this.crop_height_px);
                ctx.lineTo(_this.crop_left_px, _this.crop_top_px + _this.crop_height_px);
                ctx.lineTo(_this.crop_left_px, _this.crop_top_px);
                ctx.lineWidth = 1;
                ctx.strokeStyle = "#fff";
                ctx.stroke();

                // 设置遮罩和边框盒的图片路径（canvas绘制的遮罩和边框）
                _this.dom_img_preview_mask_border.attr("src", c_border.toDataURL(_this.image_type));
            })();

            $(_this.Paras.image_input_selector).change(function() {

                /*
                    获得本地图片
                    this.files[0]={
                        lastModified: 1425113064332
                        lastModifiedDate: Sat Feb 28 2015 16:44:24 GMT+0800 (中国标准时间)
                        name: "03996648.jpg"
                        size: 656484
                        type: "image/jpeg"
                        webkitRelativePath: ""
                    }
                */
                var f = this.files[0];

                if (!f)
                    return;

                _this.dom_button_confirm.text("加载中…");

                // 记录文件类型
                _this.image_type = f.type;

                // 清空预览盒图片
                _this.dom_img_preview.removeAttr("src");

                // 显示裁剪遮罩
                _this.dom_img_preview.css("display", "none");
                _this.dom_crop_layer.css("display", "block");

                // 读取图片到filereader
                var reader = new FileReader();
                reader.onload = function() {

                    // 图片原始data64
                    var base64_ori = reader.result;

                    var img = new Image();
                    img.src = base64_ori;

                    // 原图加载后的回调
                    var img_review_render = function(img) {

                        // 获得图片宽高和宽高比
                        _this.img_ori_ratio_per = img.width / img.height;

                        // 获得屏幕尺寸及宽高比
                        _this.window_width_px = $(window).width();
                        _this.window_height_px = $(window).height();
                        _this.window_ratio_per = _this.window_width_px / _this.window_height_px;

                        // 获得裁剪盒宽高比
                        _this.crop_ratio_per = _this.crop_width_px / _this.crop_height_px;

                        // 获得图片盒显示尺寸 (图片宽高比大于裁剪盒宽高比时，高等于裁剪盒高，宽按比例缩；小于等于裁剪盒宽高比时，宽等于裁剪盒宽，高按比例缩)
                        if (_this.img_ori_ratio_per > _this.crop_ratio_per) {
                            _this.img_preview_height_px = _this.crop_height_px;
                            _this.img_preview_width_px = _this.img_ori_width_px / _this.img_ori_height_px * _this.img_preview_height_px;
                        } else {
                            _this.img_preview_width_px = _this.crop_width_px;
                            _this.img_preview_height_px = _this.img_ori_height_px / _this.img_ori_width_px * _this.img_preview_width_px;
                        }

                        // 获得图片盒位置（居中显示）
                        var top = (_this.img_preview_height_px - _this.window_height_px) / -2;
                        var left = (_this.img_preview_width_px - _this.window_width_px) / -2;

                        // 设置遮罩层显示
                        _this.dom_img_preview_mask_border.css("display", "block");

                        // 设置确定按钮的位置
                        _this.dom_button_confirm.css({
                            "top": (_this.crop_top_px * 1.3 + _this.crop_height_px) + "px",
                        });

                        // 设置图片预览盒的尺寸、位置及图片路径，并显示
                        _this.dom_img_preview
                            .attr("src", img.src)
                            .css({
                                "position": "absolute",
                                "width": _this.img_preview_width_px + "px",
                                "height": _this.img_preview_height_px + "px",
                                "top": top + "px",
                                "left": left + "px",
                                "display": "block"
                            });

                        // 监听图片拖动和缩放
                        _this.img_preview_drag.apply(_this);

                        // 监听按钮点击
                        _this.button_click.apply(_this, [img, function(base64) {

                            if (_this.Paras.image_crop_success_callback)
                                _this.Paras.image_crop_success_callback(base64);

                            // 关闭弹层
                            _this.bg_close.apply(_this);

                        }]);

                        // 回调
                        if (_this.Paras.image_review_success_callback)
                            _this.Paras.image_review_success_callback();
                    };

                    // 旋转图片
                    var img_rotate = function(img) {
                        // 获取图片朝向
                        var Orientation = _this.image_exif.Orientation;

                        // 创建canvas
                        var canvas = document.createElement("canvas");

                        // 如6、8，则对换宽高
                        if (Orientation > 3) {
                            _this.img_ori_width_px = img.height;
                            _this.img_ori_height_px = img.width;
                        } else {
                            _this.img_ori_width_px = img.width;
                            _this.img_ori_height_px = img.height;
                        }

                        // 必要则缩小
                        var ratio = 1;
                        if (_this.img_ori_width_px > 1000)
                            ratio = 1000 / _this.img_ori_width_px;

                        // 如果裁剪后高度小于裁剪框高度，则重新计算
                        if (_this.img_ori_height_px * ratio < _this.crop_height_px * 1.5) {
                            ratio = _this.crop_height_px * 1.5 / _this.img_ori_height_px;
                        }

                        // 设置canvas宽高
                        canvas.width = _this.img_ori_width_px * ratio;
                        canvas.height = _this.img_ori_height_px * ratio;

                        var ctx = canvas.getContext("2d");

                        // 旋转图片至Orientation=1
                        if (Orientation == 3) {
                            ctx.translate(canvas.width, canvas.height);
                            ctx.rotate(180 * Math.PI / 180);
                        } else if (Orientation == 6) {
                            ctx.translate(canvas.width, 0);
                            ctx.rotate(90 * Math.PI / 180);
                        } else if (Orientation == 8) {
                            ctx.translate(0, canvas.height);
                            ctx.rotate(-90 * Math.PI / 180);
                        }

                        // 重画图片到canvas（缩小）
                        ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, img.width * ratio, img.height * ratio);

                        // 重新加载图片
                        var _img = new Image();
                        _img.src = canvas.toDataURL(_this.image_type);
                        _img.width = canvas.width;
                        _img.height = canvas.height;

                        // 完成旋转，进入渲染方法
                        img_review_render(_img);
                    };

                    // 获得图片Exif
                    var _get_exif = function() {

                        _this.image_exif = null;
                        _this.get_exif.apply(_this, [img, function() {
                            img_rotate(img);
                        }]);
                    };

                    if (img.complete) {
                        _get_exif(img);
                    } else {
                        img.onload = function() {
                            _get_exif(img);
                        };
                    }

                    // 缩小
                    // _this.img_Resize.apply(_this, [{
                    //     img_obj: img,
                    //     resize_kind: 3,
                    //     size: 1,
                    //     size_unit: "times",
                    //     Callback_success: function(img) {

                    //         img_review_render(img);

                    //         // 压缩
                    //         // _this.img_Compress(img, 200, img_review_render);
                    //     }
                    // }]);

                };

                setTimeout(function() {
                    reader.readAsDataURL(f);
                }, 200);
            });
        },
        // 初始化，增加必要的盒
        Init: function() {
            var _this = this;

            // 生成时间戳——作随机数用
            var dt = new Date();
            var _stamp = Date.parse(dt).toString();

            var dom_body = $("body");

            // 添加crop_layer
            ImageCropCompressorH5_global.dom_crop_layer = $(document.createElement("section"))
                .addClass("crop_layer" + _stamp)
                .css({
                    "width": "100vw",
                    "height": "100vh",
                    "top": "0",
                    "left": "0",
                    "background": "#000",
                    "position": "fixed",
                    "z-index": "8888",
                    "display": "none"
                }).appendTo(dom_body);

            // 获得窗口宽高及宽高比
            ImageCropCompressorH5_global.window_width_px = $(window).width();
            ImageCropCompressorH5_global.window_height_px = $(window).height();
            ImageCropCompressorH5_global.window_ratio_per = ImageCropCompressorH5_global.window_width_px / ImageCropCompressorH5_global.window_height_px;

            // 添加img_preview盒
            ImageCropCompressorH5_global.dom_img_preview = $(document.createElement("img"))
                .css("display", "none").appendTo(ImageCropCompressorH5_global.dom_crop_layer);

            // 创建确定按钮
            ImageCropCompressorH5_global.dom_button_confirm = $(document.createElement("div"))
                .css({
                    "position": "fixed",
                    "left": "50%",
                    "bottom": "10vh",
                    "width": "26vw",
                    "height": "8vw",
                    "line-height": "8vw",
                    "margin-left": "-13vw",
                    "color": "#ccc",
                    "text-align": "center",
                    "font-size": "4vw",
                    "border": "solid 1px #ddd",
                    "border-radius": "5px",
                    "z-index": "8999"
                })
                .text("加载中…")
                .appendTo(ImageCropCompressorH5_global.dom_crop_layer);
        },
        // 监听图片预览盒的拖拽及缩放事件
        img_preview_drag: function() {

            var _this = this;

            _this.touches_count = 0; // 触屏手指数量
            // this.scaling = false; // 正在缩放（忽略移动）

            var x_ori = [],
                y_ori = []; // 原始位置的(x,y)。x和y都是数组，可以记录多个手指的touch

            var dom_image_preview_left_px;
            var dom_image_preview_top_px;
            var dom_image_preview_width_px;
            var dom_image_preview_height_px;

            // 两点间距离——缩放用
            var distance = {}; // 0-初始位置距离 1-最终位置距离

            // 计算image_preview盒的尺寸及位置
            var width_px;
            var height_px;
            var left_px;
            var top_px;

            // 距离差系数
            var distance_plus = 1,
                distance_plus_distance_split = 10, // 调整系数间隔距离
                distance_plus_min = 0.5, // 最下系数
                distance_plus_max = 2.5, // 最大系数
                distance_plus_step = 0.05; // 系数调整阶梯

            // 计算两点间距离
            var cal_distance = function(x1, x2, y1, y2) {
                var distance;
                // 初始距离
                if (y1 == y2) { // 如果y坐标相等，距离为x的差
                    distance = x2 - x1;
                } else if (x1 == x2) { // 如果y坐标不相等 且 x坐标相等，距离为y的差
                    distance = y2 - y1;
                } else { // 如果x、y都不相等，则距离为直角三角形的斜边长度 
                    var a, b;
                    a = y2 - y1;
                    b = x2 - x1;
                    distance = Math.sqrt(a * a + b * b);
                }
                return distance;
            };

            var window_touchstart = function(e) {
                _this.touches_count = e.touches.length;

                var i = 0;
                for (; i < _this.touches_count; i++) {
                    x_ori[i] = e.touches[i].clientX;
                    y_ori[i] = e.touches[i].clientY;
                }

                dom_image_preview_left_px = _this.dom_img_preview.position().left;
                dom_image_preview_top_px = _this.dom_img_preview.position().top;
                width_px = dom_image_preview_width_px = _this.dom_img_preview.width(); // 这里给width_px赋值，是因为touchmove的缩放时，要根据width_px获得缩放系数
                height_px = dom_image_preview_height_px = _this.dom_img_preview.height();

                distance[0] = cal_distance(x_ori[0], x_ori[1], y_ori[0], y_ori[1]);
            };

            var window_touchmove = function(e) {

                e.preventDefault();

                var x_now = {},
                    y_now = {};
                var i = 0;
                for (; i < e.touches.length; i++) {
                    x_now[i] = e.touches[i].clientX;
                    y_now[i] = e.touches[i].clientY;
                }
                if (_this.touches_count == 1) { // 移动

                    var x_diff = x_now[0] - x_ori[0];
                    var y_diff = y_now[0] - y_ori[0];

                    var top = dom_image_preview_top_px + y_diff,
                        left = dom_image_preview_left_px + x_diff;

                    _this.dom_img_preview.css({ top: top + "px", left: left + "px" });

                } else { // 缩放

                    if (e.touches.length == 1)
                        return;

                    // 计算两点之间距离
                    distance[1] = cal_distance(x_now[0], x_now[1], y_now[0], y_now[1]);

                    // 距离差
                    var distance_diff = distance[0] - distance[1];

                    // 缩放后的宽高
                    var width_new_px, height_new_px;
                    width_new_px = dom_image_preview_width_px - distance_diff * distance_plus;
                    height_new_px = width_new_px / _this.img_ori_ratio_per;

                    // 调整位置
                    left_px = dom_image_preview_left_px + (dom_image_preview_width_px - width_new_px) / 2;
                    top_px = dom_image_preview_top_px + (dom_image_preview_height_px - height_new_px) / 2;

                    // 如果放大的预览盒宽高超过原图片宽高，则退出
                    // 如果缩小的预览盒宽高小于原图片宽高的一半，则退出
                    if (
                        width_new_px >= _this.img_ori_width_px ||
                        height_new_px >= _this.img_ori_height_px
                    ) {
                        distance_plus = distance_plus_max;
                        return;
                    } else if (
                        width_new_px <= _this.crop_width_px / 2 ||
                        height_new_px <= _this.crop_height_px / 2
                    ) {
                        distance_plus = 1;
                        return;
                    }

                    // 绝对值如达标，则调整distance_plus
                    if (Math.abs(distance_diff) >= distance_plus_distance_split) {
                        if (distance_diff < 0)
                            distance_plus += distance_plus_step;
                        else
                            distance_plus -= distance_plus_step;
                        if (distance_plus > distance_plus_max)
                            distance_plus = distance_plus_max;
                        if (distance_plus < distance_plus_min)
                            distance_plus = distance_plus_min;

                        // 重设初始数据
                        var _i = 0;
                        for (; _i < _this.touches_count; _i++) {
                            x_ori[_i] = x_now[_i];
                            y_ori[_i] = y_now[_i];
                        }
                        dom_image_preview_top_px = top_px;
                        dom_image_preview_left_px = left_px;
                        dom_image_preview_width_px = width_new_px;
                        dom_image_preview_height_px = height_new_px;
                        distance[0] = cal_distance(x_ori[0], x_ori[1], y_ori[0], y_ori[1]);

                    }

                    width_px = width_new_px;
                    height_px = height_new_px;

                    _this.dom_img_preview.css({
                        "width": width_px + "px",
                        "left": left_px + "px",
                        "height": height_px + "px",
                        "top": top_px + "px"
                    });

                }
            };

            var window_touchend = function() {

                // 需要调整
                var need_move = false;

                // 需要调整到的位置
                var animate_width = _this.dom_img_preview.width(),
                    animate_height = _this.dom_img_preview.height(),
                    animate_top = _this.dom_img_preview.position().top,
                    animate_left = _this.dom_img_preview.position().left;

                // 判断是否需要改变预览盒大小
                if (animate_width < _this.crop_width_px) {
                    need_move = true;

                    (function() {
                        var diff = _this.crop_width_px - animate_width;
                        animate_width += diff;
                        animate_left -= diff / 2;
                        animate_height += diff / _this.img_ori_ratio_per;
                        animate_top -= diff / _this.img_ori_ratio_per / 2;
                    })();
                }
                if (animate_height < _this.crop_height_px) {
                    need_move = true;

                    (function() {
                        var diff = _this.crop_height_px - animate_height;
                        animate_height += diff;
                        animate_top -= diff / 2;
                        animate_width += diff * _this.img_ori_ratio_per;
                        animate_left -= diff * _this.img_ori_ratio_per / 2;
                    })();
                }

                // 获得边框四个角的坐标
                var border_position_range = {
                    x: {
                        min: _this.crop_left_px,
                        max: _this.crop_left_px + _this.crop_width_px
                    },
                    y: {
                        min: _this.crop_top_px,
                        max: _this.crop_top_px + _this.crop_height_px
                    }
                };

                // 判断是否需要移动预览盒
                if (animate_left > border_position_range.x.min) {
                    need_move = true;
                    animate_left = border_position_range.x.min;
                } else if (animate_left + animate_width < border_position_range.x.max) {
                    need_move = true;
                    animate_left = border_position_range.x.max - animate_width;
                }
                if (animate_top > border_position_range.y.min) {
                    need_move = true;
                    animate_top = border_position_range.y.min;
                } else if (animate_top + animate_height < border_position_range.y.max) {
                    need_move = true;
                    animate_top = border_position_range.y.max - animate_height;
                }

                // 执行调整
                if (need_move) {
                    _this.dom_img_preview
                        .css({
                            "-webkit-transition": "all .2s ease-out",
                            "transition": "all .2s ease-out",
                            "width": animate_width,
                            "height": animate_height,
                            "top": animate_top,
                            "left": animate_left
                        });

                    // 清除transition
                    setTimeout(function() {
                        _this.dom_img_preview
                            .css({
                                "-webkit-transition": "",
                                "transition": ""
                            });
                    }, 200);
                }

                _this.touches_count = 0;
            };

            $(_this.dom_crop_layer).unbind("touchstart").on("touchstart", window_touchstart);

            $(_this.dom_crop_layer).unbind("touchmove").on("touchmove", window_touchmove);

            $(_this.dom_crop_layer).unbind("touchend").on("touchend", window_touchend);
        },
        // 图片压缩。
        /*
            obj：源图片对象 或 图片Base64 或 canvas对象
            quality：压缩目标质量（KB）
            Callback(base64): 压缩后的base64
        */
        img_Compress: function(obj, quality, Callback) {

            var _this = this;

            // 根据目标质量和源图质量，算得压缩比
            var get_ratio = function(base64) {

                //源图片质量
                var quality_old = Math.floor(base64.length / 1024);

                //计算目标图片的质量比 ratio
                return (quality / quality_old);
            };

            // 创建canvas，并执行压缩
            var create_canvas = function(obj) {

                // 如果obj对象是base64，则创建Image
                var img = new Image();
                if (!obj.src)
                    img.src = obj;

                // 执行创建
                var doCreate = function() {
                    var canvas = document.createElement("canvas");
                    canvas.width = img.width;
                    canvas.height = img.height;
                    var ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                    // 继续执行压缩
                    doComp(canvas);
                };

                // 加载图片
                if (img.complete)
                    doCreate();
                else {
                    img.onload = function() {
                        doCreate();
                    };
                }
            };

            // 执行压缩
            var doComp = function(canvas) {

                var base64 = canvas.toDataURL(_this.image_type);

                var ratio = get_ratio(base64);

                if (ratio < 0.15)
                    base64 = canvas.toDataURL(_this.image_type, 0.15);
                else if (ratio < 1)
                    base64 = canvas.toDataURL(_this.image_type, ratio);

                if (Callback)
                    Callback(base64);
            };

            // 判断obj类型
            if (typeof obj === "object") {

                if (obj.src) { // 图片对象
                    create_canvas(obj);
                } else { // canvas对象 直接执行压缩
                    doComp(obj);
                }
            } else { // Base64
                create_canvas(obj);
            }
        },
        // 监听按钮点击事件
        button_click: function(img, Callback_success) {
            var _this = this;

            _this.dom_button_confirm.text("确 定").unbind("click").on("click", function() {

                $(this).text("处理中…");

                var doCrop = function() {

                    var img_width_px = img.width;
                    var img_height_px = img.height;

                    // 获得预览盒与原图的缩放比
                    var ratio_per = (img_width_px / _this.dom_img_preview.width() + img_height_px / _this.dom_img_preview.height()) / 2;

                    // 利用canvas裁剪图片
                    var canvas = document.createElement("canvas");
                    var crop_width_px = Math.floor(_this.crop_width_px * ratio_per);
                    var crop_height_px = Math.floor(_this.crop_height_px * ratio_per);

                    // 裁剪宽高容错
                    if (crop_width_px > img_width_px) {
                        crop_height_px = Math.floor(img_width_px * crop_height_px / crop_width_px);
                        crop_width_px = img.width;
                    }
                    if (crop_height_px > img_height_px) {
                        crop_width_px = Math.floor(img_height_px * crop_width_px / crop_height_px);
                        crop_height_px = img_height_px;
                    }

                    canvas.width = crop_width_px;
                    canvas.height = crop_height_px;
                    var ctx = canvas.getContext("2d");
                    var sx = Math.floor((_this.crop_left_px - _this.dom_img_preview.position().left) * ratio_per);
                    var sy = Math.floor((_this.crop_top_px - _this.dom_img_preview.position().top) * ratio_per);

                    // 裁剪位置和裁剪宽高 容错
                    if (sx + crop_width_px >= img_width_px)
                        sx -= sx + crop_width_px - img_width_px;
                    if (sx < 0)
                        sx = 0;

                    if (sy + crop_height_px >= img_height_px)
                        sy -= sy + crop_height_px - img_height_px;
                    if (sy < 0)
                        sy = 0;

                    // 裁剪
                    ctx.drawImage(img, sx, sy, crop_width_px, crop_height_px, 0, 0, crop_width_px, crop_height_px);

                    // 压缩
                    if (Callback_success)
                        _this.img_Compress.apply(_this, [canvas, _this.Paras.image_quality_kb, Callback_success]);
                };

                setTimeout(function() {
                    if (img.complete)
                        doCrop();
                    else {
                        img.onload = function() {
                            doCrop();
                        };
                    }
                }, 0);

            });
        },
        // 获得图片exif信息，存入this.image_exif
        get_exif: function(img, Callback) {

            var _this = this;

            if (_this.image_exif) {
                if (Callback)
                    Callback();
                return;
            }

            EXIF.getData(img, function() {
                _this.image_exif = EXIF.getAllTags(this);

                if (Callback)
                    Callback();
            });
        },
        // 关闭弹层
        bg_close: function() {
            this.dom_crop_layer.css("display", "none");
            this.dom_img_preview_mask_border.css("display", "none");
        }

    };
}

if (typeof define === "function" && define.amd) {
    define(["lib/exif"], function() {
        return ImageCropCompressorH5;
    });
}
