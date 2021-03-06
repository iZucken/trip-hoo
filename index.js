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
    {title: 'Flow 1', path: 'flow-1.png', valueFunction: rgbValue},
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
        ],
        function(source, x, y, level) {
        }
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
let scale = 2;
let speedSlider = document.getElementById('speedSlider');
speedSlider.oninput = () => speed = parseFloat(speedSlider.value);
let sourceCanvas = document.createElement('canvas');
sourceCanvas.width = 512;
sourceCanvas.height = 512;
let sourceCanvasContext = sourceCanvas.getContext("2d");
let bufferCanvas = document.createElement('canvas');
bufferCanvas.width = 512;
bufferCanvas.height = 512;
let bufferCanvasContext = bufferCanvas.getContext("2d");
let destinationCanvas = document.getElementById("displayCanvas");
let destinationCanvasContext = null;
let imageDataSource = null;
if (destinationCanvas) {
    destinationCanvasContext = destinationCanvas.getContext("2d");
    imageDataBuffer = destinationCanvasContext.createImageData(512, 512);
}
function valueIndex(v, s) {
    return ((v % 1) * s) | 0;
}
function rgbValue(imageDataSource, x, y) {
    let at = (imageDataSource.width * y + x) * 4;
    return (imageDataSource.data[at] +
        imageDataSource.data[at + 1] +
        imageDataSource.data[at + 2]) / 768;
}
function rgbaValue(imageDataSource, x, y) {
    let at = (imageDataSource.width * y + x) * 4;
    return (imageDataSource.data[at] +
        imageDataSource.data[at + 1] +
        imageDataSource.data[at + 2] +
        imageDataSource.data[at + 3]) / 1024;
}
let cLevelFunction = levelFunctions[0].function;
let cMapFunction = function (source, x, y, level) {
    return cMap[
        valueIndex(cValueFunction(source, x, y) + level, cMap.length)
    ];
}
let line = function (s, x, y, x2, y2) {
    s.beginPath();
    s.moveTo(x, y);
    s.lineTo(x2, y2);
    s.stroke();
}
let normalAt = function (s, x, y) {
    let l = cValueFunction(s, x, y);
    return [0,0];
}
let cValueFunction = rgbValue;
let cMap = colorMaps[2].map;
let at = [0, 0];
let mat = [0, 0];
let atWrap = [0, 0];
let wrapSize = [512, 512];
function shit(now) {
    if (imageDataSource) {
        let cLevel = cLevelFunction(now * speed);
        for (let x = 0; x < 512; x++) {
            for (let y = 0; y < 512; y++) {
                putColor(imageDataBuffer, x, y, cMapFunction(imageDataSource, x, y, cLevel));
            }
        }
        destinationCanvasContext.putImageData(imageDataBuffer, atWrap[0] - wrapSize[0], atWrap[1] - wrapSize[1]);
        destinationCanvasContext.putImageData(imageDataBuffer, atWrap[0], atWrap[1] - wrapSize[1]);
        destinationCanvasContext.putImageData(imageDataBuffer, atWrap[0] - wrapSize[0], atWrap[1]);
        destinationCanvasContext.putImageData(imageDataBuffer, atWrap[0], atWrap[1]);
        let norm = normalAt(imageDataSource, mat[0] / scale, mat[1] / scale);
        line(destinationCanvasContext, mat[0] / scale, mat[1] / scale, mat[0] / scale + norm[0] * 10, mat[1] / scale + norm[1] * 10);
    }
    requestAnimationFrame(shit);
}
function reloadColorMap() {
    cMap = colorMaps[selectColorPattern.value].map;
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
    mat[0] = [event.clientX];
    mat[1] = [event.clientY];
    if (drags) {
        at[0] = atOrigin[0] + (event.clientX - dragOrigin[0]);
        at[1] = atOrigin[1] + (event.clientY - dragOrigin[1]);
        atWrap[0] = at[0] % wrapSize[0];
        atWrap[0] = atWrap[0] < 0 ? atWrap[0] + 512 : atWrap[0];
        atWrap[1] = at[1] % wrapSize[1];
        atWrap[1] = atWrap[1] < 0 ? atWrap[1] + 512 : atWrap[1];
    }
};
// region threejs
/*
let WIDTH = window.innerWidth;
let HEIGHT = window.innerHeight;

let renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(WIDTH, HEIGHT);
renderer.setClearColor(0xDDDDDD, 1);
document.body.appendChild(renderer.domElement);

let scene = new THREE.Scene();

let camera = new THREE.PerspectiveCamera(70, WIDTH/HEIGHT);
camera.position.z = 50;
scene.add(camera);

let boxGeometry = new THREE.BoxGeometry(10, 10, 10);

let shaderMaterial = new THREE.ShaderMaterial( {
    vertexShader: `
    void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x+10.0, position.y, position.z+5.0, 1.0);
    }
    `,
    fragmentShader: `
    void main() {
        gl_FragColor = vec4(0.0, 0.58, 0.86, 1.0);
    }
    `
});

let cube = new THREE.Mesh(boxGeometry, shaderMaterial);
scene.add(cube);
cube.rotation.set(0.4, 0.2, 0);

function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}
render();
*/
// endregion