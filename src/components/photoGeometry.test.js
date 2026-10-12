import {
    getCoverGeometry,
    getFrameSlots,
    usesAlphaCutoutMask
} from "./photoGeometry";

describe("photo frame geometry", () => {
    test("fits portrait images proportionally into horizontal slots", () => {
        const geometry = getCoverGeometry(600, 1000, 953, 599);

        expect(geometry.width).toBeCloseTo(953);
        expect(geometry.height).toBeGreaterThan(599);
        expect(geometry.offsetX).toBeCloseTo(0);
        expect(geometry.offsetY).toBeLessThan(0);
        expect(geometry.width / geometry.height).toBeCloseTo(600 / 1000);
    });

    test("keeps all four horizontal slots within every frame asset", () => {
        const frameSizes = [
            [1200, 3000],
            [1200, 3000],
            [1200, 3000],
            [793, 1984],
            [793, 1983],
            [1200, 3000]
        ];

        frameSizes.forEach(([frameWidth, frameHeight]) => {
            const slots = getFrameSlots(frameWidth, frameHeight);

            expect(slots).toHaveLength(4);
            slots.forEach(slot => {
                expect(slot.width).toBeGreaterThan(slot.height);
                expect(slot.x + slot.width).toBeLessThanOrEqual(frameWidth);
                expect(slot.y + slot.height).toBeLessThanOrEqual(frameHeight);
            });
        });
    });

    test("uses centered frame-specific cutout slots and masks for frames 4 and 6", () => {
        [4, 6].forEach(frameNumber => {
            const src = `/assets/frames/heart-frame-${frameNumber}.png`;
            const [firstSlot, ...otherSlots] = getFrameSlots(
                frameNumber === 4 ? 793 : 1200,
                frameNumber === 4 ? 1984 : 3000,
                src
            );

            expect(usesAlphaCutoutMask(src)).toBe(true);
            expect(firstSlot.x).toBeGreaterThan(100);
            expect(firstSlot.x + firstSlot.width).toBeLessThan(1100);
            expect(firstSlot.y).toBeGreaterThan(100);
            expect(otherSlots).toHaveLength(3);
            expect(firstSlot.width).toBeGreaterThan(firstSlot.height);
            otherSlots.forEach(slot => {
                expect(slot.y).toBeGreaterThan(firstSlot.y + firstSlot.height);
                expect(slot.x + slot.width).toBeLessThanOrEqual(frameNumber === 4 ? 793 : 1200);
                expect(slot.y + slot.height).toBeLessThanOrEqual(frameNumber === 4 ? 1984 : 3000);
            });
        });
        expect(usesAlphaCutoutMask("/assets/frames/heart-frame.png")).toBe(false);
    });
});
