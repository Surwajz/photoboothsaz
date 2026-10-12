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

export function getFrameSlots(frameWidth, frameHeight) {
    const scaleX = frameWidth / FRAME_WIDTH;
    const scaleY = frameHeight / FRAME_HEIGHT;

    return baseSlots.map(({ x, y }) => ({
        x: x * scaleX,
        y: y * scaleY,
        width: SLOT_WIDTH * scaleX,
        height: SLOT_HEIGHT * scaleY
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
