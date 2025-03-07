type Dialog = {
    conditions: {};
    challenge: {};
    entities: {};
    farewell: {};
    institutions: {};
    localLore: {};
    persuasion: {}; 
    phenomena: {};
    provinces: {};
    whispers: {}; 
    worldLore: {};
};

const createDialog = (): Dialog => {
    return {
        conditions: {},
        challenge: {}, 
        entities: {},
        farewell: {},
        institutions: {}, 
        localLore: {},
        persuasion: {}, 
        phenomena: {},
        provinces: {},
        whispers: {}, 
        worldLore: {},
    };
};

export function getNpcDialog(): Dialog {
    return createDialog();
};

type MerchantDialog = { farewell: {}; services: {}; };

const NPC: Record<string, MerchantDialog> = {
    "Traveling General Merchant" : { farewell: {}, services: {} },
};

export function getMerchantDialog(merchant: string): MerchantDialog {
    if (!(merchant in NPC)) {
        throw new Error(`Merchant '${merchant}' not found in NPC object.`);
    };
    return NPC[merchant];
};