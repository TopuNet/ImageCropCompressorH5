var index = {
    init: function() {
        this.ImageCrop_Listener.apply(this);
    },
    ImageCrop_Listener: function() {

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
    }
};
