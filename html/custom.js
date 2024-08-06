document.addEventListener('DOMContentLoaded', function() {
    function getParameterByName(name, url = window.location.href) {
        name = name.replace(/[\[\]]/g, '\\$&');
        const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
        const results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }

    const productHandle = getParameterByName('product_handle');
    if (productHandle) {
        fetch(`/products/${productHandle}.json`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data && data.product) {
                    const productName = data.product.title;
                    document.getElementById('product-name').innerText = productName;
                } else {
                    console.error('Invalid product data:', data);
                    document.getElementById('product-name').innerText = 'Product not found';
                }
            })
            .catch(error => console.error('Error fetching product details:', error));

        document.getElementById('back-button').addEventListener('click', function() {
            window.location.href = `/products/${productHandle}`;
        });
    } else {
        console.error('Product handle is missing from the URL');
        document.getElementById('product-name').innerText = 'Product handle missing';
    }


    // resize the stage
    function resizeStage(wrapper, stage, aspectRatio) {
        const wrapperWidth = wrapper.clientWidth - 40; // Subtracting margin
        const wrapperHeight = wrapper.clientHeight - 40; // Subtracting margin

        let stageWidth = wrapperWidth;
        let stageHeight = stageWidth / aspectRatio;

        if (stageHeight > wrapperHeight) {
            stageHeight = wrapperHeight;
            stageWidth = stageHeight * aspectRatio;
        }
        console.log('wrapper')
        console.log(wrapperWidth)
        console.log(wrapperHeight)

        console.log('the stage width and height')
        console.log(stageWidth)
        console.log(stageHeight)

        stage.width(stageWidth);
        stage.height(stageHeight);

        stage.batchDraw();
    }

    //const wallpaperImageUrl = getParameterByName('wallpaper_image');
    const wallpaperImageUrl = "./Arboretum-full-1200-108.jpg";
    const widthInputElement = document.getElementById('width');
    const heightInputElement = document.getElementById('height');


    // Define minimum and maximum allowed values in inches
const minWidth = 96;
const minHeight = 72;
const maxWidth = 1200;
const maxHeight = 144;

const image_original_width = 8189;
const image_original_height = 737;

let current_input_user_inch_width = 96;
let current_input_user_inch_height = 72;

const initialStageWidth = 960; // Initial stage width
const initialStageHeight = 720; // Initial stage height

let current_input_user_inch_height_scale = initialStageHeight/image_original_height;
let current_input_user_inch_width_scale = current_input_user_inch_height_scale;

const wrapper = document.querySelector('.walltool-canvas-wrapper');
let wrapper_width = wrapper.clientWidth;
let wrapper_height = wrapper.clientHeight;

let user_input_aspect_ratio = current_input_user_inch_width/current_input_user_inch_height;

// viewport/stage pixels per inch
let current_user_input_pixels_per_inch_width_scale = initialStageWidth/current_input_user_inch_width;
let current_user_input_pixels_per_inch_height_scale = initialStageHeight/current_input_user_inch_height;

if (wallpaperImageUrl) {
    console.log('Wallpaper Image URL:', wallpaperImageUrl);

    const stage = new Konva.Stage({
        container: 'canvas-container',
        width: initialStageWidth,
        height: initialStageHeight,
        draggable: true
    });

    const layer = new Konva.Layer();
    stage.add(layer);

    resizeStage(wrapper, stage, user_input_aspect_ratio);

    Konva.Image.fromURL(wallpaperImageUrl, function (image) {
        // Initial image setup

        stage.scaleX(current_input_user_inch_width_scale);
        stage.scaleY(current_input_user_inch_height_scale);

        // Get the width and height of the element
        image.setAttrs({
            x: (stage.width() - image.width()) / 2,
            y: 0,
            draggable: true,
            scaleX: 1,
            scaleY: 1
        });
        current_input_user_inch_height_scale = stage.height()/image.height();
        current_input_user_inch_width_scale = current_input_user_inch_height_scale;

        stage.scaleX(current_input_user_inch_width_scale);
        stage.scaleY(current_input_user_inch_height_scale);
        layer.add(image);
        layer.draw();
        const width = image.width();
        const height = image.height();
        console.log('Width:', width);
        console.log('Height:', height);


        // Get current scale
        const scaleX = image.scaleX();
        const scaleY = image.scaleY();
        console.log('ScaleX:', scaleX);
        console.log('ScaleY:', scaleY);

        // Add dragging constraints
        image.on('dragmove', function () {
            const pos = image.position();
            const imgWidth = image.width() * image.scaleX();
            const stageWidth = stage.width();

            // Constrain horizontal dragging
            if (pos.x - imgWidth / 2 > 0) {
                image.x(imgWidth / 2);
            } else if (pos.x + imgWidth / 2 < stageWidth) {
                image.x(stageWidth - imgWidth / 2);
            }

            // Keep the y position constant
            image.y(stage.height() / 2);
        });

        // Function to adjust canvas size based on inputs
        function adjustCanvasSize() {
            const widthInput = parseFloat(widthInputElement.value) || 96;
            const heightInput = parseFloat(heightInputElement.value) || 72;
            current_input_user_inch_width = widthInput;
            current_input_user_inch_height = heightInput;
            current_input_user_inch_width_scale = current_input_user_inch_width/image_original_width;
            current_input_user_inch_height_scale = current_input_user_inch_height/image_original_height;

            // Validate input values
            if (widthInput < minWidth || widthInput > maxWidth || heightInput < minHeight || heightInput > maxHeight) {
                console.log(`Input values out of range: Width: ${widthInput}, Height: ${heightInput}`);
                return;
            }

            let newWidthPixels = widthInput * 10;
            let newHeightPixels = heightInput * 10;

            console.log(`Width Input: ${widthInput}, Height Input: ${heightInput}`);
            console.log(`New Width Pixels: ${newWidthPixels}, New Height Pixels: ${newHeightPixels}`);
            console.log(`Stage width before adjustment: ${stage.width()}, Stage height before adjustment: ${stage.height()}`);

            // Adjust the scale factor and height based on the width input
            if (widthInput > 130) {
                const scaleFactor = 130 / widthInput; // Calculate scaling factor based on the threshold
                newHeightPixels = initialStageHeight * scaleFactor; // Adjust height based on the scaling factor
                image.scaleX(scaleFactor);
                image.scaleY(scaleFactor);
                stage.height(newHeightPixels);
            }

            const currentscaledheight2 = 720 * image.scaleY();
            if (currentscaledheight2 >= 730) {
                const scaleFactorY = heightInput / 100; // Calculate scaling factor based on the threshold
                image.y((stage.height() - newHeightPixels) / 2);
            } else if (heightInput <= widthInput) {
                const scaleFactor = 100 / heightInput; // Calculate scaling factor based on the threshold
                newWidthPixels = initialStageWidth * scaleFactor; // Adjust height based on the scaling factor
                stage.width(newWidthPixels);
            }

            if (heightInput > widthInput) {
                const scaleFactor = 100 / heightInput; // Calculate scaling factor based on the threshold
                newWidthPixels = initialStageWidth * scaleFactor; // Adjust height based on the scaling factor
            }

            // Max size
            const contentleftdiv = document.querySelector('.content-left');
            const widthleft = contentleftdiv.offsetWidth - 100;
            newHeightPixels = Math.min(newHeightPixels, window.innerHeight);

            // Adjust both the stage width and height
            stage.width(newWidthPixels);
            stage.height(newHeightPixels);

            // Scale the image to match the new width, maintaining aspect ratio
            const scaleFactor = newWidthPixels / 8189;
            const scaleFactorY = newHeightPixels / 737;

            const currentscaledwidth = 8189 * image.scaleX();
            const currentscaledheight = 737 * image.scaleY();

            if (currentscaledwidth < newWidthPixels) {
                image.scaleX(scaleFactor);
                image.scaleY(scaleFactor);

                // Update canvas (stage) dimensions based on the new image size
                newHeightPixels = 737 * scaleFactor;
                stage.width(newWidthPixels);
                stage.height(newHeightPixels);

                // Center the image vertically within the stage
                const centeredY = (stage.height() - image.height() * image.scaleY()) / 2;
                image.y(centeredY);

                // Center the image horizontally within the stage
                image.x(stage.width() / 2);
            }

            image.x(stage.width() / 2);
            image.y(stage.height() / 2);

            console.log(`Image position after adjustment: x=${image.x()}, y=${image.y()}`);
            console.log(`Image scale after adjustment: scaleX=${image.scaleX()}, scaleY=${image.scaleY()}`);

            layer.draw();
        }

        // Event listeners for inputs
        widthInputElement.addEventListener('input', function () {
            console.log('Width input changed:', widthInputElement.value);
            adjustCanvasSize();
        });
        heightInputElement.addEventListener('input', function () {
            console.log('Height input changed:', heightInputElement.value);
            adjustCanvasSize();
        });
    });
} else {
    console.error('Wallpaper image URL is missing from the URL');
}


    
    
    // Format and display prices
    document.querySelectorAll('.swatch-price').forEach(function(priceElement) {
        var price = parseFloat(priceElement.getAttribute('data-price')).toFixed(2);
        priceElement.textContent = price;
        console.log(price);
    });

    const heightInput = document.getElementById('height');
    const widthInput = document.getElementById('width');
    const costOutput = document.getElementById('cost');
    const substrateButtons = document.querySelectorAll('.substrate-options');

    function calculateSquareFeet() {
        let height = parseFloat(heightInput.value);
        let width = parseFloat(widthInput.value);

        if (isNaN(height) || isNaN(width)) {
            return 0;
        }

        height = Math.max(Math.min(height, 144), 72);
        width = Math.max(Math.min(width, 1200), 96);

        return ((height * width) / 144).toFixed(2);
    }

    function updateTotalCost() {
        const squareFeet = calculateSquareFeet();

        const selectedButton = document.querySelector('.substrate-options.selected');
        if (selectedButton) {
            const selectedPrice = parseFloat(selectedButton.querySelector('.swatch-price').getAttribute('data-price'));
            if (!isNaN(selectedPrice)) {
                const totalCost = (squareFeet * selectedPrice).toFixed(2);
                costOutput.textContent = totalCost;
            } else {
                costOutput.textContent = '0.00';
            }
        } else {
            costOutput.textContent = '0.00';
        }
    }

    function enforceMinMaxValues() {
        let height = parseFloat(heightInput.value);
        let width = parseFloat(widthInput.value);

        if (isNaN(height) || height < 72) {
            height = 72;
        } else if (height > 144) {
            height = 144;
        }

        if (isNaN(width) || width < 96) {
            width = 96;
        } else if (width > 1200) {
            width = 1200;
        }

        heightInput.value = height;
        widthInput.value = width;

        updateTotalCost();
    }

    heightInput.addEventListener('input', updateTotalCost);
    widthInput.addEventListener('input', updateTotalCost);

    heightInput.addEventListener('blur', enforceMinMaxValues);
    widthInput.addEventListener('blur', enforceMinMaxValues);

    substrateButtons.forEach(button => {
        button.addEventListener('click', function() {
            handleButtonClick(button, substrateButtons);
            updateTotalCost();
        });
    });

    function handleButtonClick(selectedButton, buttons) {
        buttons.forEach(btn => {
            btn.classList.remove('selected');
            const iconCheckmark = btn.querySelector('.icon-checkmark');
            iconCheckmark.querySelector('.icon-solid').style.display = 'none';
            iconCheckmark.querySelector('.icon-regular').style.display = 'block';
        });
        selectedButton.classList.add('selected');
        updateCheckmark(selectedButton);
    }

    function updateCheckmark(button) {
        const iconCheckmark = button.querySelector('.icon-checkmark');
        iconCheckmark.querySelector('.icon-solid').style.display = 'block';
        iconCheckmark.querySelector('.icon-regular').style.display = 'none';
    }

    updateCheckmarks(substrateButtons);

    function updateCheckmarks(buttons) {
        buttons.forEach(button => {
            const iconCheckmark = button.querySelector('.icon-checkmark');
            if (button.classList.contains('selected')) {
                iconCheckmark.querySelector('.icon-solid').style.display = 'block';
                iconCheckmark.querySelector('.icon-regular').style.display = 'none';
            } else {
                iconCheckmark.querySelector('.icon-solid').style.display = 'none';
                iconCheckmark.querySelector('.icon-regular').style.display = 'block';
            }
        });
    }

    updateTotalCost();
});
