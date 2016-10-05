var index = {
    init: function() {
        this.ImageCrop_Listener.apply(this);
    },
    ImageCrop_Listener: function() {
        ImageCropCompressorH5.init({
            image_input_selector: "#file_input",
            image_review_success_callback: function() {
                console.log("预览加载完毕");
                $("section.crop_layer").css("display", "block");
            }
        });
    }
};