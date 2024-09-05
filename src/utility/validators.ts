export function validateHealth(val: number): number {
    return Number.isNaN(val) ? 0 : val;
};
export function validateLevel(val: number): number {
    return Number.isNaN(val) ? 1 : (val + 9) / 10;
};
export function validateMastery(val: number): number {
    return Number.isNaN(val) ? 10 : val;
};