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
        //const wrapperWidth = wrapper.clientWidth - 40; // Subtracting margin
        //const wrapperHeight = wrapper.clientHeight - 40; // Subtracting margin
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

let current_input_user_inch_width = 96;
let current_input_user_inch_height = 72;

    /*
    // match width and heith of reference to compare
const minWidth = 1;
const maxWidth = 65;
const minHeight = 1;
const maxHeight = 65;

let current_input_user_inch_width = 30;
let current_input_user_inch_height = 20;
*/

widthInputElement.value = current_input_user_inch_width;
widthInputElement.min = minWidth;
widthInputElement.max = maxWidth;
heightInputElement.value = current_input_user_inch_height;
heightInputElement.min = minHeight;
heightInputElement.max = maxHeight;



const initialStageWidth = 960; // Initial stage width
const initialStageHeight = 720; // Initial stage height

/*
let current_input_user_inch_height_scale = initialStageHeight/image_original_height;
let current_input_user_inch_width_scale = current_input_user_inch_height_scale;
*/
let current_input_user_inch_height_scale = 1;
let current_input_user_inch_width_scale = 1;

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

           // x: (stage.width() - image.width()) / 2,
        // Get the width and height of the element
        image.setAttrs({
            x: 0,
            y: 0,
            draggable: true,
            scaleX: 1,
            scaleY: 1
        });
        current_input_user_inch_height_scale = stage.height()/image.height();
        current_input_user_inch_width_scale = current_input_user_inch_height_scale;

        stage.scaleX(current_input_user_inch_width_scale);
        stage.scaleY(current_input_user_inch_height_scale);

        console.log('initial scale' + current_input_user_inch_width_scale);
        new_x = (stage.width() - (image.width()*current_input_user_inch_width_scale)) / 2;
        //console.log('new x is ' + new_x)
        // new algorithm moves and scales the stage and keeps the image at x=0 y=0 and keeps the scale the same
        stage.x(new_x);
        //image.y(0);

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
        // not sure how this works or how its still working with new code
        // chatgpt gives me alternate code for panning
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
            image.y(0);
        });

        // Function to adjust canvas size based on inputs
        function adjustCanvasSize() {
            // new algorithm moves and scales the stage and keeps the image at x=0 y=0 and keeps the scale the same
            const widthInput = parseFloat(widthInputElement.value) || minWidth;
            const heightInput = parseFloat(heightInputElement.value) || minHeight;
            current_input_user_inch_width = widthInput;
            current_input_user_inch_height = heightInput;

            // Validate input values
            if (widthInput < minWidth || widthInput > maxWidth || heightInput < minHeight || heightInput > maxHeight) {
                console.log(`Input values out of range: Width: ${widthInput}, Height: ${heightInput}`);
                return;
            }
            console.log('image height is ' + image.height())
            console.log('image width is ' + image.width())

            image.x(0)
            image.y(0)

            user_input_aspect_ratio = widthInput/heightInput;
            resizeStage(wrapper, stage, user_input_aspect_ratio);

            current_input_user_inch_height_scale = stage.height()/image.height();
            current_input_user_inch_width_scale = current_input_user_inch_height_scale;


            stage.scaleX(current_input_user_inch_width_scale);
            stage.scaleY(current_input_user_inch_height_scale);


            let new_x = (stage.width() - (image.width()*current_input_user_inch_width_scale)) / 2;
            console.log('new x is ' + new_x)
            stage.x(new_x);
            console.log('user input aspect ratio is: ' + user_input_aspect_ratio)
            console.log('the scale is ' +current_input_user_inch_width_scale )

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

        window.addEventListener('resize', () => {
            // new algorithm moves and scales the stage and keeps the image at x=0 y=0 and keeps the scale the same
            const widthInput = parseFloat(widthInputElement.value) || minWidth;
            const heightInput = parseFloat(heightInputElement.value) || minHeight;
            user_input_aspect_ratio = widthInput/heightInput;

            resizeStage(wrapper, stage, user_input_aspect_ratio);
            current_input_user_inch_height_scale = stage.height()/image.height();
            current_input_user_inch_width_scale = current_input_user_inch_height_scale;
            // center the image

            stage.scaleX(current_input_user_inch_width_scale);
            stage.scaleY(current_input_user_inch_height_scale);

            new_x = (stage.width() - (image.width()*current_input_user_inch_width_scale)) / 2;
            //console.log('new x is ' + new_x)
            stage.x(new_x);

            layer.draw();
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

        if (isNaN(height) || height < minHeight) {
            height = minHeight;
        } else if (height > maxHeight) {
            height = maxHeight;
        }

        if (isNaN(width) || width < minWidth) {
            width = minWidth;
        } else if (width > maxWidth) {
            width = maxWidth;
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
