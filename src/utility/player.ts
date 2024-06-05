export const PLAYER = {
    COLLIDER: {
        DISPLACEMENT: 16,
        HEIGHT: 36,
        WIDTH: 20,
    },
    SPEED: {
        INITIAL: 1.5, // 1.75
        ACCELERATION: 0.1,
        DECELERATION: 0.05,
        CAERENIC: 0.5,
        SLOW: 1,
        SNARE: 1.5,
        SPRINT: 1.5,
        STEALTH: 0.5,
        LEAP: 300,
        BLINK: 250,
        RUSH: 300,
    },  
    SCALE: {
        SELF: 0.8,
        SHIELD: 0.6,
        WEAPON_ONE: 0.5,
        WEAPON_TWO: 0.65,
    },
    SENSOR: {
        COMBAT: 48,
        DEFAULT: 36,
        DISPLACEMENT: 12,
        EVADE: 21,
    },
    STAMINA: {
        // Physical
        ATTACK: 25,
        DODGE: 10, // 25
        PARRY: 10,
        POSTURE: 15,
        ROLL: 10, // 25
        // Magical
        ARC: 25,
        BLINK: 10,
        CHIOMIC: 25,  
        CONFUSE: 10,
        CONSUME: 10,
        DESPERATION: 40,
        FEAR: 10,
        HEALING: 25,
        INVOKE: -25,
        KYRNAICISM: 25,
        LEAP: 25,
        POLYMORPH: 10,
        PURSUIT: 25,
        ROOT: 10,
        RUSH: 25,
        SACRIFICE: 25,
        SLOW: 10,
        SNARE: 10,
        SUTURE: 25,
        TSHAERAL: 40,
        
        DISEASE: 25,
        ENVELOP: 10,
        FREEZE: 25,
        HOWL: 25,
        MALICE: 25,
        MEND: 25,
        PROTECT: 40,
        RECOVER: 10,
        RENEWAL: 25,
        SCREAM: 25,
        SHIELD: 25,
        SHIMMER: 10,
        SPRINT: 10,
        STORM: 25,
        WARD: 25,
        WRITHE: 25,
    },
    COOLDOWNS: {
        SHORT: 6000,
        MODERATE: 10000,
        LONG: 15000,
    },
    DURATIONS: {
        ARCING: 3000,
        CHIOMIC: 1000,
        CONFUSE: 1000,
        DISEASE: 6000,
        ENVELOP: 10000,
        FEAR: 1500,
        FREEZE: 750,
        HEALING: 1500,
        KYRNAICISM: 3000,
        LEAP: 750,
        MALICE: 10000,
        MEND: 10000,
        PROTECT: 6000,
        POLYMORPH: 1500,
        PURSUIT: 750,
        RECOVER: 10000,
        RENEWAL: 6000,
        ROOTING: 1000,
        RUSH: 750,
        SACRIFICE: 750,
        SCREAM: 1000,
        SHIELD: 10000,
        SHIMMER: 10000,
        SNARE: 1000,
        SPRINT: 6000,
        STORM: 3000,
        STUNNED: 2500,
        TEXT: 1500,
        TSHAERAL: 2000,
        WARD: 10000,
        WRITHE: 1000,
    },
    RANGE: {
        SHORT: 200,
        MODERATE: 350,
        LONG: 500,
    },
};

export const staminaCheck = (input: string, stamina: number): { success: boolean; cost: number } => {
    switch (input) {
        case 'attack':
            const attackSucess = stamina >= PLAYER.STAMINA.ATTACK;
            return {
                success: attackSucess,
                cost: PLAYER.STAMINA.ATTACK,
            };
        case 'posture':
            const postureSuccess = stamina >= PLAYER.STAMINA.POSTURE;
            return {
                success: postureSuccess,
                cost: PLAYER.STAMINA.POSTURE,
            };
        case 'roll':
            const rollSuccess = stamina >= PLAYER.STAMINA.ROLL;
            return { 
                success: rollSuccess,
                cost: PLAYER.STAMINA.ROLL,
            };
        case 'dodge':
            const dodgeSuccess = stamina >= PLAYER.STAMINA.DODGE;
            return {
                success: dodgeSuccess,
                cost: PLAYER.STAMINA.DODGE,        
            };
        case 'parry':
            const parrySuccess = stamina >= PLAYER.STAMINA.PARRY;
            return {
                success: parrySuccess,
                cost: PLAYER.STAMINA.PARRY,
            };
        case 'arc': 
            const arcSuccess = stamina >= PLAYER.STAMINA.ARC;
            return {
                success: arcSuccess,
                cost: PLAYER.STAMINA.ARC,
            };    
        case 'blink':
            const blinkSuccess = stamina >= PLAYER.STAMINA.BLINK;
            return {
                success: blinkSuccess,
                cost: PLAYER.STAMINA.BLINK,
            };
        case 'chiomic':
            const chiomicSuccess = stamina >= PLAYER.STAMINA.CHIOMIC;
            return {
                success: chiomicSuccess,
                cost: PLAYER.STAMINA.CHIOMIC,
            };
        case 'confuse':
            const confuseSuccess = stamina >= PLAYER.STAMINA.CONFUSE;
            return {
                success: confuseSuccess,
                cost: PLAYER.STAMINA.CONFUSE,
            };
        case 'consume':
            const consumeSuccess = stamina >= PLAYER.STAMINA.CONSUME;
            return {
                success: consumeSuccess,
                cost: PLAYER.STAMINA.CONSUME,
            };
        case 'desperation': 
            const desperationSuccess = stamina >= PLAYER.STAMINA.DESPERATION;
            return {
                success: desperationSuccess,
                cost: PLAYER.STAMINA.DESPERATION,
            };
        case 'disease':
            const diseaseSuccess = stamina >= PLAYER.STAMINA.DISEASE;
            return {
                success: diseaseSuccess,
                cost: PLAYER.STAMINA.DISEASE,
            };
        case 'envelop':
            const envelopSuccess = stamina >= PLAYER.STAMINA.ENVELOP;
            return {
                success: envelopSuccess,
                cost: PLAYER.STAMINA.ENVELOP,
            };
        case 'fear':
            const fearingSuccess = stamina >= PLAYER.STAMINA.FEAR;
            return {
                success: fearingSuccess,
                cost: PLAYER.STAMINA.FEAR,
            };
        case 'freeze':
            const freezingSuccess = stamina >= PLAYER.STAMINA.FREEZE;
            return {
                success: freezingSuccess,
                cost: PLAYER.STAMINA.FREEZE,
            };
        case 'healing':
            const healingSuccess = stamina >= PLAYER.STAMINA.HEALING;
            return {
                success: healingSuccess,
                cost: PLAYER.STAMINA.HEALING,
            };
        case 'howl':
            const howlSuccess = stamina >= PLAYER.STAMINA.HOWL;
            return {
                success: howlSuccess,
                cost: PLAYER.STAMINA.HOWL,
            };
        case 'invoke':
            const invokeSuccess = stamina >= PLAYER.STAMINA.INVOKE;
            return { 
                success: invokeSuccess,
                cost: PLAYER.STAMINA.INVOKE,
            };
        case 'kyrnaicism':
            const kyrnaicismSuccess = stamina >= PLAYER.STAMINA.KYRNAICISM;
            return {
                success: kyrnaicismSuccess,
                cost: PLAYER.STAMINA.KYRNAICISM,
            };
        case 'leap':
            const leapSuccess = stamina >= PLAYER.STAMINA.LEAP;
            return {
                success: leapSuccess,
                cost: PLAYER.STAMINA.LEAP,
            };
        case 'malice':
            const maliceSuccess = stamina >= PLAYER.STAMINA.MALICE;
            return {
                success: maliceSuccess,
                cost: PLAYER.STAMINA.MALICE,
            };
        case 'mend':
            const mendSuccess = stamina >= PLAYER.STAMINA.MEND;
            return {
                success: mendSuccess,
                cost: PLAYER.STAMINA.MEND,
            };
        case 'polymorph':
            const polymorphSuccess = stamina >= PLAYER.STAMINA.POLYMORPH;
            return {
                success: polymorphSuccess,
                cost: PLAYER.STAMINA.POLYMORPH,
            };
        case 'protect':
            const protectSuccess = stamina >= PLAYER.STAMINA.PROTECT;
            return {
                success: protectSuccess,
                cost: PLAYER.STAMINA.PROTECT,
            };
        case 'pursuit':
            const pursuitSuccess = stamina >= PLAYER.STAMINA.PURSUIT;
            return {
                success: pursuitSuccess,
                cost: PLAYER.STAMINA.PURSUIT,
            };
        case 'recover':
            const recoverSuccess = stamina >= PLAYER.STAMINA.RECOVER;
            return {
                success: recoverSuccess,
                cost: PLAYER.STAMINA.RECOVER,
            };
        case 'renewal':
            const renewalSuccess = stamina >= PLAYER.STAMINA.RENEWAL;
            return {
                success: renewalSuccess,
                cost: PLAYER.STAMINA.RENEWAL,
            };
        case 'root':
            const rootSuccess = stamina >= PLAYER.STAMINA.ROOT;
            return {
                success: rootSuccess,
                cost: PLAYER.STAMINA.ROOT,
            };
        case 'rush':
            const rushSuccess = stamina >= PLAYER.STAMINA.RUSH;
            return {
                success: rushSuccess,
                cost: PLAYER.STAMINA.RUSH,
            };
        case 'sacrifice':
            const sacrificeSuccess = stamina >= PLAYER.STAMINA.SACRIFICE;
            return {
                success: sacrificeSuccess,
                cost: PLAYER.STAMINA.SACRIFICE,
            };
        case 'scream':
            const screamSuccess = stamina >= PLAYER.STAMINA.SCREAM;
            return {
                success: screamSuccess,
                cost: PLAYER.STAMINA.SCREAM,
            };
        case 'shield':
            const shieldSuccess = stamina >= PLAYER.STAMINA.SHIELD;
            return {
                success: shieldSuccess,
                cost: PLAYER.STAMINA.SHIELD,
            };
        case 'shimmer':
            const shimmerSuccess = stamina >= PLAYER.STAMINA.SHIMMER;
            return {
                success: shimmerSuccess,
                cost: PLAYER.STAMINA.SHIMMER,
            };
        case 'slow':
            const slowSuccess = stamina >= PLAYER.STAMINA.SLOW;
            return {
                success: slowSuccess,
                cost: PLAYER.STAMINA.SLOW,
            };
        case 'snare':
            const snareSuccess = stamina >= PLAYER.STAMINA.SNARE;
            return {
                success: snareSuccess,
                cost: PLAYER.STAMINA.SNARE,
            };
        case 'sprint':
            const sprintSuccess = stamina >= PLAYER.STAMINA.SPRINT;
            return {
                success: sprintSuccess,
                cost: PLAYER.STAMINA.SPRINT,
            };
        case 'storm':
            const stormSuccess = stamina >= PLAYER.STAMINA.STORM;
            return {
                success: stormSuccess,
                cost: PLAYER.STAMINA.STORM,
            };
        case 'suture':
            const sutureSuccess = stamina >= PLAYER.STAMINA.SUTURE;
            return {
                success: sutureSuccess,
                cost: PLAYER.STAMINA.SUTURE,
            };
        case 'tshaeral':
            const tshaerSuccess = stamina >= PLAYER.STAMINA.TSHAERAL;
            return {
                success: tshaerSuccess,
                cost: PLAYER.STAMINA.TSHAERAL,
            };
        case 'ward':
             const wardSuccess = stamina >= PLAYER.STAMINA.WARD;
             return {
                success: wardSuccess,
                cost: PLAYER.STAMINA.WARD,  
            };
        case 'writhe':
            const writheSuccess = stamina >= PLAYER.STAMINA.WRITHE;
            return {
                success: writheSuccess,
                cost: PLAYER.STAMINA.WRITHE,
            };
        default:
            return { 
                success: false,
                cost: 0,
            };
    };
};

export type faction = {
    name: string; // Name of faction type and functional key for factions[] array
    reputation: number; // 0 - 100. Higher reputation opens up dialog, quests, and trade
    named: boolean; // Unique enemies
    aggressive: boolean; // Attacks first if true
    betrayed: boolean; // Betrayed = went from aggressive = false to true, Permanent = always aggressive, no dialog
    faith: string; // Adherent || Devoted
    dialog: number; // Reputation threshold to enable dialog option
};

export const ENEMY_ENEMIES = {
    "Achreon Druid": ["Kyn'gian Shaman", "Tshaeral Shaman", "Kingsman", "Northren Wanderer"],
    "Ahn'are Apostle": ["Astral Apostle", "Licivitan Soldier", "Daethic Inquisitor", "Daethic Knight"],
    "Anashtre": ["Daethic Knight", "Soverain Blood Cloak", "Licivitan Soldier", "Daethic Inquisitor"],
    "Astral Apostle": ["Ahn'are Apostle", "Licivitan Soldier", "Daethic Inquisitor", "Daethic Knight"],
    "Cambiren Druid": ["Kyn'gian Shaman", "Tshaeral Shaman", "Kingsman", "Northren Wanderer"],
    "Chiomic Jester": ["Fang Duelist", "Fang Mercenary", "Marauder", "Shrygeian Bard"],
    "Daethic Inquisitor": ["Ilire Occultist", "Fyers Occultist", "Ma'ier Occultist", "Quor'eite Occultist", "Old Li'ivi Occultist"],
    "Daethic Knight": ["Anashtre", "Soverain Blood Cloak", "Firesworn", "Se'va Shrieker", "Quor'eite Stalker"],
    "Fang Duelist": ["Chiomic Jester", "Fang Mercenary", "Marauder", "Shrygeian Bard"],
    "Fang Mercenary": ["Chiomic Jester", "Fang Duelist", "Marauder", "Shrygeian Bard"],
    "Firesworn": ["Daethic Knight", "Fang Mercenary", "Se'va Shrieker", "Quor'eite Stalker", "Southron Wanderer"],
    "Fyers Occultist": ["Daethic Inquisitor", "Ilire Occultist", "Ma'ier Occultist", "Quor'eite Occultist", "Old Li'ivi Occultist"],
    "Ilire Occultist": ["Daethic Inquisitor", "Fyers Occultist", "Ma'ier Occultist", "Quor'eite Occultist", "Old Li'ivi Occultist"],
    "Kingsman": ["Achreon Druid", "Cambiren Druid", "Northren Wanderer", "Soverain Blood Cloak"],
    "Kyn'gian Shaman": ["Achreon Druid", "Cambiren Druid", "Southron Wanderer", "Sedyreal Guard", "Quor'eite Stalker"],
    "Licivitan Soldier": ["Old Li'ivi Occultist", "Firesworn", "Soverain Blood Cloak", "Kingsman", "Se'va Shrieker"],
    "Ma'ier Occultist": ["Daethic Inquisitor", "Fyers Occultist", "Ilire Occultist", "Quor'eite Occultist", "Old Li'ivi Occultist"],
    "Marauder": ["Fang Duelist", "Fang Mercenary", "Chiomic Jester", "Shrygeian Bard"],
    "Mavrosin Occultist": [],
    "Northren Wanderer": ["Achreon Druid", "Cambiren Druid", "Kingsman", "Soverain Blood Cloak"],
    "Nyren": ["Rahvrecur", "Se'va Shrieker", "Marauder", "Fang Mercenary"],
    "Old Li'ivi Occultist": ["Daethic Inquisitor", "Fyers Occultist", "Ilire Occultist", "Ma'ier Occultist", "Quor'eite Occultist"],
    "Quor'eite Occultist": ["Daethic Inquisitor", "Fyers Occultist", "Ilire Occultist", "Ma'ier Occultist", "Old Li'ivi Occultist"],
    "Quor'eite Stalker": ["Daethic Knight", "Firesworn", "Se'va Shrieker", "Sedyreal Guard", "Southron Wanderer"],
    "Rahvrecur": ["Nyren", "Se'va Shrieker", "Marauder", "Fang Mercenary"],
    "Se'dyrist": ["Se'va Shrieker", "Fang Mercenary", "Sedyreal Guard", "Firesworn"],
    "Sedyreal Guard": ["Se'dyrist", "Se'va Shrieker", "Firesworn", "Quor'eite Stalker", "Southron Wanderer"],
    "Se'va Shrieker": ["Se'dyrist", "Sedyreal Guard", "Firesworn", "Quor'eite Stalker", "Southron Wanderer"],
    "Shrygeian Bard": ["Chiomic Jester", "Fang Duelist", "Fang Mercenary", "Marauder"],
    "Southron Wanderer": ["Firesworn", "Quor'eite Stalker", "Sedyreal Guard", "Se'va Shrieker"],
    "Soverain Blood Cloak": ["Anashtre", "Licivitan Soldier", "Kingsman", "Northren Wanderer"],
    "Tshaeral Shaman": ["Achreon Druid", "Cambiren Druid", "Daethic Knight", "Daethic Inquisitor"],

    "Cyrian Shyne": ["King Mathyus Caderyn"],
    "Dorien Caderyn": ["Garris Ashenus"],
    "Eugenes": [""],
    "Evrio Lorian Peroumes": ["Mirio"],
    "Fierous Ashfyre": ["Synaethi Spiras"],
    "Garris Ashenus": ["Dorien Caderyn"],
    "King Mathyus Caderyn": ["Cyrian Shyne"],
    "Kreceus": ["Ahn'are Apostle", "Licivitan Soldier", "Evrio Lorian Peroumes", "Mirio"],
    "Laetrois Ath'Shaorah": ["Mavrios Ilios"],
    "Leaf": ["Kingsman", "Northren Wanderer"],
    "Lorian": ["Mavrios Ilios"],
    "Mavrios Ilios": ["Laetrois Ath'Shaorah", "Lorian"],
    "Mirio": ["Evrio Lorian Peroumes"],
    "Sera Lorian": ["Evrio Lorian Peroumes", "Dorien Caderyn"],
    "Synaethi Spiras": ["Fierous Ashfyre", "Torreous Ashfyre"],
    "Torreous Ashfyre": ["Synaethi Spiras"],
    "Tshios Ash'air": [],
    "Vincere": ["King Mathyus Caderyn", "Dorien Caderyn", "Sera Lorian", "Evrio Lorian Peroumes"]
};
export const NAMED_ENEMY = [
    "Achreus", 
    "Ah'gani",
    "Ashreu'ul", 
    "Caelan Greyne", 
    "Chios Dachreon", 
    "Cyrian Shyne", 
    "Daetheus", 
    "Dorien Caderyn", 
    "Eugenes", 
    "Evrio Lorian Peroumes", 
    "Fierous Ashfyre", 
    "Garris Ashenus", 
    "King Mathyus Caderyn", 
    "Kreceus", 
    "Laetrois Ath'Shaorah", 
    "Leaf", 
    "Lorian", 
    "Mavros Ilios", 
    "Mirio Lorian Kyr'na", 
    "Quir'ilynis",
    "Quor'estes", 
    "Relien Myelle", 
    "Sedeysus", 
    "Sera Lorian", 
    "Se'teyo Nati",
    "Synaethi Spiras", 
    "Torreous Ashfyre", 
    "Tshios Ash'air", 
    "Vincere"
];

export const namedNameCheck = (name: string) => {
    if (NAMED_ENEMY.includes(name)) {
        return true;
    } else {
        return false;
    };
};

const initFactions: faction[] = [
    {
        name: "Achreon Druid",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Ahn'are Apostle",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Anashtre",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Astral Apostle",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Cambiren Druid",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Chiomic Jester",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Daethic Inquisitor",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Devoted',
        dialog: 25,
    }, {
        name: "Daethic Knight",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Devoted',
        dialog: 25,
    }, {
        name: "Fang Duelist",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Fang Mercenary",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Firesworn",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Fyers Occultist",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Ilire Occultist",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Kingsman",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Devoted',
        dialog: 25,
    }, {
        name: "Kyn'gian Shaman",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Kyrisian Occultist",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Licivitan Soldier",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Devoted',
        dialog: 25,
    }, {
        name: "Ma'ier Occultist",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Marauder",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Northren Wanderer",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Nyren",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Old Li'ivi Occultist",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Quor'eite Occultist",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Quor'eite Stalker",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Rahvrecur",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Se'dyrist",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Sedreal Guard",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Se'va Shrieker",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Shrygeian Bard",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Southron Wanderer",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Soverain Blood Cloak",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Tshaeral Shaman",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, { // ===== Named Enemies ===== 
        name: "Ah'gani",
        reputation: 0,
        named: true,
        aggressive: false,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Ashreu'ul",
        reputation: 0,
        named: true,
        aggressive: false,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Cyrian Shyne",
        reputation: 0,
        named: true,
        aggressive: false,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Daetheus",
        reputation: 0,
        named: true,
        aggressive: false,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Dorien Caderyn",
        reputation: 0,
        named: true,
        aggressive: false,
        betrayed: false,
        faith: 'Devoted',
        dialog: 25,
    }, {
        name: "Eugenes",
        reputation: 0,
        named: true,
        aggressive: false,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Evrio Lorian Peroumes",
        reputation: 0,
        named: true,
        aggressive: false,
        betrayed: false,
        faith: 'Devoted',
        dialog: 25,
    }, {
        name: "Fierous Ashfyre",
        reputation: 0,
        named: true,
        aggressive: false,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Garris Ashenus",
        reputation: 0,
        named: true,
        aggressive: false,
        betrayed: false,
        faith: 'Devoted',
        dialog: 25,
    }, {
        name: "King Mathyus Caderyn",
        reputation: 0,
        named: true,
        aggressive: false,
        betrayed: false,
        faith: 'Devoted',
        dialog: 25,
    }, {
        name: "Kreceus",
        reputation: 0,
        named: true,
        aggressive: false,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Laetrois Ath'Shaorah",
        reputation: 0,
        named: true,
        aggressive: false,
        betrayed: false,
        faith: 'Devoted',
        dialog: 25,
    }, {
        name: "Leaf",
        reputation: 0,
        named: true,
        aggressive: false,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Lorian",
        reputation: 0,
        named: true,
        aggressive: false,
        betrayed: false,
        faith: 'Devoted',
        dialog: 25,
    }, {
        name: "Mavros Ilios",
        reputation: 0,
        named: true,
        aggressive: false,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Mirio",
        reputation: 0,
        named: true,
        aggressive: false,
        betrayed: false,
        faith: 'Devoted',
        dialog: 25,
    }, {
        name: "Quor'estes",
        reputation: 0,
        named: true,
        aggressive: false,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Relien Myelle",
        reputation: 0,
        named: true,
        aggressive: false,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Sera Lorian",
        reputation: 0,
        named: true,
        aggressive: false,
        betrayed: false,
        faith: 'Devoted',
        dialog: 25,
    }, {
        name: "Sky",
        reputation: 0,
        named: true,
        aggressive: false,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Synaethi Spiras",
        reputation: 0,
        named: true,
        aggressive: false,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Torreous Ashfyre",
        reputation: 0,
        named: true,
        aggressive: false,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Vincere",
        reputation: 0,
        named: true,
        aggressive: false,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    },
];

export class Reputation {
    public _id: string;
    public factions: faction[];
    public constructor(id: string,) {
        this._id = id;
        this.factions = initFactions;
    };
};

export const initReputation: Reputation = new Reputation('reputation');