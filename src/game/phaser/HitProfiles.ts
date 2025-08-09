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
        hitStop: 32,

        screenFlash: true,
        flashColor: 0xFF0000,

        zoom: 1.2
    },
    Pierce: {
        key: "pierce",
        rate: 1.1,
        missKey: "",
        particles: true,

        screenShake: true,
        hitStop: 32,

        screenFlash: true,
        flashColor: 0xFF0000,

        zoom: 1.2
    },
    Slash: {
        key: "slash",
        rate: 1,
        missKey: "",
        particles: true,

        screenShake: true,
        hitStop: 32,

        screenFlash: true,
        flashColor: 0xFF0000,

        zoom: 1.2
    },

    Earth: {
        key: "earth",
        rate: 0.9,
        missKey: "",
        particles: true,

        screenShake: true,
        hitStop: 32,

        screenFlash: true,
        flashColor: 0x000000,

        zoom: 1.25
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

        zoom: 1.25
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

        zoom: 1.25
    },
    Lightning: {
        key: "lightning",
        rate: 1.2,
        missKey: "",
        particles: true,

        screenShake: true,
        hitStop: 32,

        screenFlash: true,
        flashColor: 0xFFFF00,

        zoom: 1.25
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

        zoom: 1.25
    },
    Sorcery: {
        key: "sorcery",
        rate: 1,
        missKey: "",
        particles: true,

        screenShake: true,
        hitStop: 32,

        screenFlash: true,
        flashColor: 0xA700FF,

        zoom: 1.25
    },
    Spooky: {
        key: "spooky",
        rate: 0.95,
        missKey: "",
        particles: true,

        screenShake: true,
        hitStop: 32,

        screenFlash: true,
        flashColor: 0x800080,

        zoom: 1.25
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

        zoom: 1.25
    },
    Wind: {
        key: "wind",
        rate: 1.2,
        missKey: "",
        particles: true,

        screenShake: true,
        hitStop: 32,

        screenFlash: true,
        flashColor: 0x00FFFF,

        zoom: 1.25
    },
};