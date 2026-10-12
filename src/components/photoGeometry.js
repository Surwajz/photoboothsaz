export const FRAME_WIDTH = 1200;
export const FRAME_HEIGHT = 3000;
export const SLOT_WIDTH = 953;
export const SLOT_HEIGHT = 599;

const baseSlots = [
    { x: 123, y: 78 },
    { x: 123, y: 697 },
    { x: 123, y: 1286 },
    { x: 123, y: 1885 }
];

const frameSlots = {
    "heart-frame-4.png": [
        { x: 116, y: 220, width: 561, height: 370 },
        { x: 116, y: 612, width: 561, height: 390 },
        { x: 116, y: 1032, width: 561, height: 378 },
        { x: 116, y: 1437, width: 561, height: 390 }
    ],
    "heart-frame-6.png": [
        { x: 145, y: 145, width: 910, height: 525 },
        { x: 145, y: 735, width: 910, height: 525 },
        { x: 145, y: 1325, width: 910, height: 525 },
        { x: 145, y: 1925, width: 910, height: 525 }
    ]
};

const frameDimensions = {
    "heart-frame-4.png": { width: 793, height: 1984 },
    "heart-frame-6.png": { width: FRAME_WIDTH, height: FRAME_HEIGHT }
};

export function usesAlphaCutoutMask(frameSrc) {
    return Object.keys(frameSlots).some(filename => frameSrc.endsWith(filename));
}

export function getFrameSlots(frameWidth, frameHeight, frameSrc) {
    const filename = frameSrc && Object.keys(frameSlots).find(name => frameSrc.endsWith(name));
    const sourceSlots = filename ? frameSlots[filename] : baseSlots.map(({ x, y }) => ({
        x,
        y,
        width: SLOT_WIDTH,
        height: SLOT_HEIGHT
    }));
    const sourceDimensions = filename ? frameDimensions[filename] : {
        width: FRAME_WIDTH,
        height: FRAME_HEIGHT
    };
    const scaleX = frameWidth / sourceDimensions.width;
    const scaleY = frameHeight / sourceDimensions.height;

    return sourceSlots.map(({ x, y, width, height }) => ({
        x: x * scaleX,
        y: y * scaleY,
        width: width * scaleX,
        height: height * scaleY
    }));
}

export function getCoverGeometry(imageWidth, imageHeight, slotWidth, slotHeight) {
    const scale = Math.max(slotWidth / imageWidth, slotHeight / imageHeight);
    const width = imageWidth * scale;
    const height = imageHeight * scale;

    return {
        scale,
        width,
        height,
        offsetX: (slotWidth - width) / 2,
        offsetY: (slotHeight - height) / 2
    };
}
