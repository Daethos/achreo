export type HitProfile = {
    key: string;
    rate: number;
    particles: boolean;
    screenShake: boolean;
    
    missKey: string;
    hitStop: number;

    screenFlash: boolean;
    flashColor: number;

    zoom: number;
};

export const HitProfiles = {
    Blunt: {
        key: "blunt",
        rate: 0.9,
        missKey: "",
        particles: true,

        screenShake: true,
        hitStop: 64,

        screenFlash: true,
        flashColor: 0xFFFFFF,

        zoom: 1.22
    },
    Pierce: {
        key: "pierce",
        rate: 1.1,
        missKey: "",
        particles: true,

        screenShake: true,
        hitStop: 24,

        screenFlash: true,
        flashColor: 0xFFFFFF,

        zoom: 1.22
    },
    Slash: {
        key: "slash",
        rate: 1,
        missKey: "",
        particles: true,

        screenShake: true,
        hitStop: 32,

        screenFlash: true,
        flashColor: 0xFFFFFF,

        zoom: 1.22
    },

    Earth: {
        key: "earth",
        rate: 0.9,
        missKey: "",
        particles: true,

        screenShake: true,
        hitStop: 40,

        screenFlash: true,
        flashColor: 0x000000,

        zoom: 1.15
    },
    Fire: {
        key: "fire",
        rate: 1,
        missKey: "",
        particles: true,

        screenShake: true,
        hitStop: 32,

        screenFlash: true,
        flashColor: 0xFF0000,

        zoom: 1.15
    },
    Frost: {
        key: "frost",
        rate: 1,
        missKey: "",
        particles: true,

        screenShake: true,
        hitStop: 32,

        screenFlash: true,
        flashColor: 0x0000FF,

        zoom: 1.15
    },
    Lightning: {
        key: "lightning",
        rate: 1.2,
        missKey: "",
        particles: true,

        screenShake: true,
        hitStop: 24,

        screenFlash: true,
        flashColor: 0xFFFF00,

        zoom: 1.15
    },
    Righteous: {
        key: "righteous",
        rate: 1,
        missKey: "",
        particles: true,

        screenShake: true,
        hitStop: 32,

        screenFlash: true,
        flashColor: 0xFFD700,

        zoom: 1.15
    },
    Sorcery: {
        key: "sorcery",
        rate: 1,
        missKey: "",
        particles: true,

        screenShake: true,
        hitStop: 24,

        screenFlash: true,
        flashColor: 0xA700FF,

        zoom: 1.15
    },
    Spooky: {
        key: "spooky",
        rate: 0.95,
        missKey: "",
        particles: true,

        screenShake: true,
        hitStop: 40,

        screenFlash: true,
        flashColor: 0x800080,

        zoom: 1.15
    },
    Wild: {
        key: "wild",
        rate: 1,
        missKey: "",
        particles: true,

        screenShake: true,
        hitStop: 32,

        screenFlash: true,
        flashColor: 0x50C878,

        zoom: 1.15
    },
    Wind: {
        key: "wind",
        rate: 1.2,
        missKey: "",
        particles: true,

        screenShake: true,
        hitStop: 24,

        screenFlash: true,
        flashColor: 0x00FFFF,

        zoom: 1.15
    },
};