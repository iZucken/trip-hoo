let patterns = [
    {title: 'Basic grad', path: 'e-linear.png', valueFunction: rgbValue},
    {title: 'Grad 32', path: 'e-linear-32.png', valueFunction: rgbaValue},
    {title: 'Radial', path: 'e-radial.png', valueFunction: rgbValue},
    {title: 'Circular', path: 'e-c-1.png', valueFunction: rgbValue},
    {title: 'Circulars', path: 'e-c-2.png', valueFunction: rgbValue},
    {title: 'Piece 0', path: 'p-0.png', valueFunction: rgbValue},
    {title: 'Piece 1', path: 'p-1.png', valueFunction: rgbValue},
    {title: 'Piece 3', path: 'p-3.png', valueFunction: rgbValue},
    {title: 'Piece 3-1', path: 'p-3-1.png', valueFunction: rgbValue},
    {title: 'Level 1', path: 'l-1.png', valueFunction: rgbValue},
    {title: 'Depth', path: 'e1.png', valueFunction: rgbValue},
    {title: 'Ripples', path: 'e2.png', valueFunction: rgbValue},
    {title: 'Leafs', path: 'e3.png', valueFunction: rgbValue},
    {title: 'Grid', path: 'e4.png', valueFunction: rgbValue},
    {title: 'Mansion', path: 'e5.png', valueFunction: rgbValue},
    {title: 'Liquid', path: 'e6.png', valueFunction: rgbValue},
    {title: 'Vortex', path: 'e7.png', valueFunction: rgbValue},
    {title: 'Smudge', path: 'e8.png', valueFunction: rgbValue},
];
let colorMaps = [
    {
        title: 'bw 2/8',
        map: [
            [1, 1, 1, 1],
            [0, 0, 0, 1],
            [1, 1, 1, 1],
            [1, 1, 1, 1],
            [1, 1, 1, 1],
            [0, 0, 0, 1],
            [1, 1, 1, 1],
            [1, 1, 1, 1],
        ]
    },
    {
        title: 'b-w 1-4',
        map: [
            [0, 0, 0, 1],
            [0.33, 0.33, 0.33, 1],
            [.77, .77, .77, 1],
            [1, 1, 1, 1],
        ]
    },
    {
        title: 'rainbow',
        map: [
            [1, 0, 0, 1],
            [1, .5, 0, 1],
            [1, 1, 0, 1],
            [.5, 1, 0, 1],
            [0, 1, 0, 1],
            [0, 1, .5, 1],
            [0, 1, 1, 1],
            [0, .5, 1, 1],
            [0, 0, 1, 1],
            [.5, 0, 1, 1],
            [1, 0, 1, 1],
            [1, 0, .5, 1],
        ]
    },
];
let levelFunctions = [
    {
        title: "Static",
        function: now => {
            return 0;
        }
    },
    {
        title: "Linear time",
        function: now => {
            return now / 2048;
        }
    },
    {
        title: "Sine of time",
        function: now => {
            return (
                (10 + Math.sin(now / 1024) * 10)
                % 20
            ) / 20;
        }
    },
];
let characterSprite = 'res/c.png';

function loadSelector(id, options, selectCallback) {
    let selector = document.getElementById(id);
    for (let option in options) {
        let node = document.createElement("option");
        node.setAttribute('value', option);
        node.textContent = options[option].title;
        selector.append(node);
    }
    selector.childNodes[0].selected = true;
    selector.onchange = function () {
        selectCallback();
    };
    return selector;
}

let selectPattern = loadSelector("selectPattern", patterns, reloadImage);
let selectColorPattern = loadSelector("selectColorPattern", colorMaps, reloadColorMap);
let selectLevelFunction = loadSelector("selectLevelFunction", levelFunctions, reloadLevelFunction);

let speed = 1;
let speedSlider = document.getElementById('speedSlider');
speedSlider.oninput = () => speed = speedSlider.value;

let sourceCanvas = document.createElement('canvas');
sourceCanvas.width = 512;
sourceCanvas.height = 512;

let sourceCanvasContext = sourceCanvas.getContext("2d");
let bufferCanvas = document.createElement('canvas');
bufferCanvas.width = 512;
bufferCanvas.height = 512;

let bufferCanvasContext = bufferCanvas.getContext("2d");

let destinationCanvas = document.getElementById("displayCanvas");
let destinationCanvasContext = destinationCanvas.getContext("2d");

let imageDataSource = null;
let imageDataBuffer = destinationCanvasContext.createImageData(512, 512);

function valueIndex(v, s) {
    return ((v % 1) * s) | 0;
}

// function rgbValue(c) {
//     return (c[0] + c[1] + c[2]) / 768;
// }
//
// function rgbaValue(c) {
//     return (c[0] + c[1] + c[2] + c[3]) / 1024;
// }

function rgbValue(imageDataSource, x, y) {
    let at = offset(imageDataSource, x, y);
    return (imageDataSource.data[at] +
        imageDataSource.data[at + 1] +
        imageDataSource.data[at + 2]) / 768;
}

function rgbaValue(imageDataSource, x, y) {
    let at = offset(imageDataSource, x, y);
    return (imageDataSource.data[at] +
        imageDataSource.data[at + 1] +
        imageDataSource.data[at + 2] +
        imageDataSource.data[at + 3]) / 1024;
}

// let cMapSize = 1;
let cLevelFunction = () => {
    return 0;
};
let cValueFunction = rgbValue;
let cMap = [
    [0, 0, 0, 0],
];

let at = [0, 0];
let atWrap = [0, 0];
let wrapSize = [512, 512];

function shit(now) {
    if (imageDataSource) {
        for (let x = 0; x < 512; x++) {
            for (let y = 0; y < 512; y++) {
                putColor(imageDataBuffer, x, y, cMap[
                    valueIndex(cValueFunction(imageDataSource, x, y) + cLevelFunction(now * speed), cMap.length)
                ]);
            }
        }
        // bufferCanvasContext.putImageData(imageDataBuffer, 0, 0);
        // destinationCanvasContext.drawImage(bufferCanvas, 0, 0);
        destinationCanvasContext.putImageData(imageDataBuffer, atWrap[0] - wrapSize[0], atWrap[1] - wrapSize[1]);
        destinationCanvasContext.putImageData(imageDataBuffer, atWrap[0], atWrap[1] - wrapSize[1]);
        destinationCanvasContext.putImageData(imageDataBuffer, atWrap[0] - wrapSize[0], atWrap[1]);
        destinationCanvasContext.putImageData(imageDataBuffer, atWrap[0], atWrap[1]);
    }
    requestAnimationFrame(shit);
}

function reloadColorMap() {
    cMap = colorMaps[selectColorPattern.value].map;
    // cMapSize = cMap.length;
}

function reloadLevelFunction() {
    cLevelFunction = levelFunctions[selectLevelFunction.value].function;
}

function reloadImage() {
    let image = new Image();
    image.onload = function () {
        sourceCanvasContext.clearRect(0, 0, 512, 512);
        sourceCanvasContext.drawImage(image, 0, 0);
        imageDataSource = sourceCanvasContext.getImageData(0, 0, 512, 512);
        cValueFunction = patterns[selectPattern.value].valueFunction;
    };
    image.src = 'res/pattern/' + patterns[selectPattern.value].path;
}


reloadColorMap();
reloadImage();
reloadLevelFunction();
requestAnimationFrame(shit);

let dragOrigin = [0, 0];
let atOrigin = [0, 0];
let drags = false;

document.onmousedown = event => {
    dragOrigin[0] = event.clientX;
    dragOrigin[1] = event.clientY;
    atOrigin[0] = at[0];
    atOrigin[1] = at[1];
    drags = true;
};

document.onmouseup = event => {
    drags = false;
};

document.onmousemove = event => {
    if (drags) {
        at[0] = atOrigin[0] + (event.clientX - dragOrigin[0]);
        at[1] = atOrigin[1] + (event.clientY - dragOrigin[1]);
        atWrap[0] = at[0] % wrapSize[0];
        atWrap[0] = atWrap[0] < 0 ? atWrap[0] + 512 : atWrap[0];
        // atWrap[0] = Math.abs(at[0] % wrapSize[0]);
        atWrap[1] = at[1] % wrapSize[1];
        atWrap[1] = atWrap[1] < 0 ? atWrap[1] + 512 : atWrap[1];
        // atWrap[1] = Math.abs(at[1] % wrapSize[1]);
        l(at,atWrap);
    }
};