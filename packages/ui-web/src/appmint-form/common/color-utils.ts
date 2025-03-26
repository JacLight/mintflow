

const hexToRgb = (hex) => {
    // Remove # if present
    hex = hex.replace('#', '');

    // Handle shorthand hex
    if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('');
    }

    // Handle hex with alpha
    if (hex.length === 8) {
        hex = hex.slice(0, 6);
    }

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return { r, g, b };
};

// Convert RGB to hex
const rgbToHex = (r, g, b, a = 'ff') => {
    return '#' +
        [r, g, b].map(x => {
            const hex = Math.round(x).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('') + a;
};

// Get inverse color with alpha
const getInverseColor = (color) => {
    // Handle different color formats
    let rgb;
    if (color.startsWith('#')) {
        rgb = hexToRgb(color);
    } else if (color.startsWith('rgb')) {
        const matches = color.match(/\d+/g);
        rgb = {
            r: parseInt(matches[0]),
            g: parseInt(matches[1]),
            b: parseInt(matches[2])
        };
    } else {
        throw new Error('Unsupported color format');
    }

    // Calculate inverse
    const inverse = {
        r: 255 - rgb.r,
        g: 255 - rgb.g,
        b: 255 - rgb.b
    };

    // Return hex with alpha
    return rgbToHex(inverse.r, inverse.g, inverse.b);
};

export const getRandomColor = () => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return rgbToHex(r, g, b);
};

export const colorUtils = {
    hexToRgb,
    rgbToHex,
    getInverseColor,
    getRandomColor
};