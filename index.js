let patterns = [
    {title: 'Basic grad', path: 'e-linear.png', valueFunction: rgbValue},
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
    {title: 'Grad 32', path: 'e-linear-32.png', valueFunction: rgbaValue},
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
        title: 'b-w 1/2/3/4',
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

function c2i(c) {
    return ~~(((c[0] + c[1] + c[2]) / cmapdepth) * cmapsize);
}

function v2i(v, s) {
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

let cmapsize = 1;
let cmapdepth = 768;
let cValueFunction = rgbValue;
let cmap = [
    [0, 0, 0, 0],
];

function cat(i) {
    return cmap[i];
}

function levelFunction(now) {
    return (
        (10 + Math.sin(now / 1024) * 10)
        % 20
    ) / 20;
}

function shit(now) {
    if (imageDataSource) {
        for (let x = 0; x < 512; x++) {
            for (let y = 0; y < 512; y++) {
                putc(imageDataBuffer, x, y, cat(
                    v2i(cValueFunction(imageDataSource, x, y) + levelFunction(now), cmapsize)
                ));
            }
        }
        // bufferCanvasContext.putImageData(imageDataBuffer, 0, 0);
        // destinationCanvasContext.drawImage(bufferCanvas, 0, 0);
        destinationCanvasContext.putImageData(imageDataBuffer, 0, 0);
    }
    requestAnimationFrame(shit);
}

function reloadColorMap() {
    let index = selectColorPattern.value;
    cmap = colorMaps[index].map;
    cmapsize = cmap.length;
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
requestAnimationFrame(shit);