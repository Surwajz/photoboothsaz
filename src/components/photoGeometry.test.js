import { getCoverGeometry, getFrameSlots } from "./photoGeometry";

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
});
