function l() {
    console.log(...arguments);
}

function clamp(a, l, h) {
    return Math.max(Math.min(a, h), l)
}

function put(id, x, y, r, g, b, a) {
    let offset = (id.width * y + x) * 4;
    id.data[offset] = r * 255;
    id.data[offset + 1] = g * 255;
    id.data[offset + 2] = b * 255;
    id.data[offset + 3] = a * 255;
}

function offset(id, x, y) {
    return (id.width * y + x) * 4;
}

function putColor(id, x, y, c) {
    let at = offset(id, x, y);
    id.data[at] = c[0] * 255;
    id.data[at + 1] = c[1] * 255;
    id.data[at + 2] = c[2] * 255;
    id.data[at + 3] = c[3] * 255;
}
//
// function at(id, x, y) {
//     let at = offset(id, x, y);
//     return [
//         id.data[at],
//         id.data[at + 1],
//         id.data[at + 2],
//         id.data[at + 3],
//     ];
// }