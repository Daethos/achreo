import { ACHREON_DRUID, ADHERENT, AHNARE_APOSTLE, ANASHTRE, ASTRAL_APOSTLE, CAMBIREN_DRUID, CHIOMIC_JESTER, DAETHIC_INQUISITOR, DAETHIC_KNIGHT, DEVOTED, FANG_DUELIST, FANG_MERCENARY, FIRESWORN, FYERS_OCCULTIST, ILIRE_OCCULTIST, KINGSMAN, KYNGIAN_SHAMAN, KYRISIAN_OCCULTIST, LIIVI_LEGIONNAIRE, MAIER_OCCULTIST, MARAUDER, MAVROSIN_OCCULTIST, NORTHREN_WANDERER, NYREN, OLD_LIIVI_OCCULTIST, QUOREITE_OCCULTIST, QUOREITE_STALKER, RAHVREHCUR, SEDYREAL_GUARD, SEDYRIST, SEVA_SHRIEKER, SHRYGEIAN_BARD, SOUTHRON_WANDERER, SOVERAIN_BLOOD_CLOAK, TSHAERAL_SHAMAN } from "../utility/player";

export const ENEMY_FRIENDLY = 35;
export const ENEMY_AGGRESSION = -25;
export const ENEMY_HOSTILE = -10;

export type FACTION = {
    name: string; // Name of FACTION type and functional key for factions[] array
    reputation: number; // 0 - 100. Higher reputation opens up dialog, quests, and trade
    named: boolean; // Unique enemies
    aggressive: boolean; // Attacks first if true
    betrayed: boolean; // Betrayed = went from aggressive = false to true, Permanent = always aggressive, no dialog
    hostile: boolean; // Will approach and force dialog
    friendly: boolean; // Will appear green, though still can be attacked
    faith: string; // Adherent || Devoted
    deity: string[];
    province: string[];
    [key: string]: boolean | number | string | string[];
};

export const initFaction: FACTION = {
    name: "", // Name of FACTION type and functional key for factions[] array
    reputation: 0, // 0 - 100. Higher reputation opens up dialog, quests, and trade
    named: false, // Unique enemies
    aggressive: false, // Attacks first if true
    betrayed: false, // Betrayed = went from aggressive = false to true, Permanent = always aggressive, no dialog
    hostile: false, // Will attempt to force a dialog if encountered in the wild
    friendly: false, // Will appear green
    faith: "", // Adherent || Devoted
    province: [""],
    deity: [""],
};

const initFactions: FACTION[] = [
    {
        ...initFaction,
        name: ACHREON_DRUID,
        faith: ADHERENT,
        deity: ["Achreo"],
        province: ["Kingdom", "Soverains"],
    }, {
        ...initFaction,
        name: AHNARE_APOSTLE,
        faith: ADHERENT,
        deity: ["Ahn've"],
        province: ["Astralands", "Firelands"],
    }, {
        ...initFaction,
        name: ANASHTRE,
        faith: ADHERENT,
        deity: ["Astra"],
        province: ["Astralands"],
    }, {
        ...initFaction,
        name: ASTRAL_APOSTLE,
        faith: ADHERENT,
        deity: ["Astra"],
        province: ["Astralands"],
    }, {
        ...initFaction,
        name: CAMBIREN_DRUID,
        faith: ADHERENT,
        deity: ["Cambire"],
        province: ["Kingdom", "Soverains"],
    }, {
        ...initFaction,
        name: CHIOMIC_JESTER,
        faith: ADHERENT,
        deity: ["Chiomyr", "Shrygei"],
        province: ["Firelands", "West Fangs"],
    }, {
        ...initFaction,
        name: DAETHIC_INQUISITOR,
        faith: DEVOTED,
        deity: ["Daethos"],
        province: ["Licivitas"],
    }, {
        ...initFaction,
        name: DAETHIC_KNIGHT,
        faith: DEVOTED,
        deity: ["Daethos"],
        province: ["Licivitas"],
    }, {
        ...initFaction,
        name: FANG_DUELIST,
        faith: ADHERENT,
        deity: ["Se'dyro", "Se'vas"],
        province: ["West Fangs"],
    }, {
        ...initFaction,
        name: FANG_MERCENARY,
        faith: ADHERENT,
        deity: ["Kyn'gi", "Tshaer"],
        province: ["West Fangs"],
    }, {
        ...initFaction,
        name: FIRESWORN,
        faith: ADHERENT,
        deity: ["Fyer", "Rahvre", "Se'dyro"],
        province: ["Firelands"],
    }, {
        ...initFaction,
        name: FYERS_OCCULTIST,
        faith: ADHERENT,
        deity: ["Fyer"],
        province: ["Firelands"],
    }, {
        ...initFaction,
        name: ILIRE_OCCULTIST,
        faith: ADHERENT,
        deity: ["Ilios"],
        province: ["Kingdom", "Soverains"],
    }, {
        ...initFaction,
        name: KINGSMAN,
        faith: DEVOTED,
        deity: ["Achreo", "Daethos"],
        province: ["Kingdom"],
    }, {
        ...initFaction,
        name: KYNGIAN_SHAMAN,
        faith: ADHERENT,
        deity: ["Kyn'gi"],
        province: ["Sedyrus"],
    }, {
        ...initFaction,
        name: KYRISIAN_OCCULTIST,
        faith: ADHERENT,
        deity: ["Kyrisos"],
        province: ["Licivitas"],
    }, {
        ...initFaction,
        name: LIIVI_LEGIONNAIRE,
        faith: DEVOTED,
        deity: ["Daethos"],
        province: ["Licivitas"],
    }, {
        ...initFaction,
        name: MAIER_OCCULTIST,
        faith: ADHERENT,
        deity: ["Ma'anre"],
        province: ["Firelands", "Sedyrus"],
    }, {
        ...initFaction,
        name: MARAUDER,
        faith: ADHERENT,
        deity: ["Kyn'gi", "Se'vas"],
        province: ["Firelands", "West Fangs"],
    }, {
        ...initFaction,
        name: MAVROSIN_OCCULTIST,
        faith: ADHERENT,
        deity: ["Ilios"],
        province: ["Kingdom", "Soverains"],
    }, {
        ...initFaction,
        name: NORTHREN_WANDERER,
        faith: ADHERENT,
        deity: ["Achreo", "Cambire"],
        province: ["Kingdom", "Soverains"],
    }, {
        ...initFaction,
        name: NYREN,
        faith: ADHERENT,
        deity: ["Nyrolus", "Senari"],
        province: ["Licivitas", "West Fangs"],
    }, {
        ...initFaction,
        name: OLD_LIIVI_OCCULTIST,
        faith: ADHERENT,
        deity: ["Kyr'na", "Lilos"],
        province: ["Licivitas"],
    }, {
        ...initFaction,
        name: QUOREITE_OCCULTIST,
        faith: ADHERENT,
        deity: ["Quor'ei"],
        province: ["Sedyrus"],
    }, {
        ...initFaction,
        name: QUOREITE_STALKER,
        faith: ADHERENT,
        deity: ["Quor'ei", "Se'vas"],
        province: ["Sedyrus"],
    }, {
        ...initFaction,
        name: RAHVREHCUR,
        faith: ADHERENT,
        deity: ["Rahvre"],
        province: ["West Fangs"],
    }, {
        ...initFaction,
        name: SEDYRIST,
        faith: ADHERENT,
        deity: ["Nyrolus", "Se'dyro", "Senari"],
        province: ["Firelands", "Licivitas"],
    }, {
        ...initFaction,
        name: SEDYREAL_GUARD,
        faith: ADHERENT,
        deity: ["Se'dyro", "Se'vas"],
        province: ["Sedyrus"],
    }, {
        ...initFaction,
        name: SEVA_SHRIEKER,
        faith: ADHERENT,
        deity: ["Se'vas"],
        province: ["Sedyrus"],
    }, {
        ...initFaction,
        name: SHRYGEIAN_BARD,
        faith: ADHERENT,
        deity: ["Chiomyr", "Shrygei"],
        province: ["Firelands", "West Fangs"],
    }, {
        ...initFaction,
        name: SOUTHRON_WANDERER,
        faith: ADHERENT,
        deity: ["Kyn'gi", "Quor'ei", "Se'dyro"],
        province: ["Sedyrus"],
    }, {
        ...initFaction,
        name: SOVERAIN_BLOOD_CLOAK,
        faith: ADHERENT,
        deity: ["Achreo", "Cambire"],
        province: ["Soverains"],
    }, {
        ...initFaction,
        name: TSHAERAL_SHAMAN,
        faith: ADHERENT,
        deity: ["Tshaer"],
        province: ["Sedyrus"],
    }, { // ===== Named Enemies ===== 
        ...initFaction,
        name: "Ah'gani",
        faith: ADHERENT,
        named: true,
        deity: ["Astra", "Se'dyro", "Se'vas"],
        province: ["Astralands"],
    }, {
        ...initFaction,
        name: "Ashreu'ul",
        faith: ADHERENT,
        named: true,
        deity: ["Astra", "Se'dyro", "Se'vas"],
        province: ["Astralands"],
    }, {
        ...initFaction,
        name: "Cyrian Shyne",
        faith: ADHERENT,
        named: true,
        deity: ["Se'dyro", "Se'vas"],
        province: ["Sedyrus"],
    }, {
        ...initFaction,
        name: "Daetheus",
        faith: ADHERENT,
        named: true,
        deity: ["Daethos", "Kyr'na", "Lilos"],
        province: ["Licivitas"],
    }, {
        ...initFaction,
        name: "Dorien Caderyn",
        faith: DEVOTED,
        named: true,
        deity: ["Achreo", "Cambire", "Daethos"],
        province: ["Kingdom"],
    }, {
        ...initFaction,
        name: "Eugenes",
        faith: ADHERENT,
        named: true,
        deity: ["Ma'anre"],
        province: ["Firelands"],
    }, {
        ...initFaction,
        name: "Evrio Lorian Peroumes",
        faith: DEVOTED,
        named: true,
        deity: ["Daethos"],
        province: ["Licivitas"],
    }, {
        ...initFaction,
        name: "Fierous Ashfyre",
        faith: ADHERENT,
        named: true,
        deity: ["Fyer"],
        province: ["Firelands"],
    }, {
        ...initFaction,
        name: "Garris Ashenus",
        faith: DEVOTED,
        named: true,
        deity: ["Ma'anre"],
        province: ["Firelands"],
    }, {
        ...initFaction,
        name: "King Mathyus Caderyn",
        faith: DEVOTED,
        named: true,
        deity: ["Daethos"],
        province: ["Kingdom"],
    }, {
        ...initFaction,
        name: "Kreceus",
        faith: ADHERENT,
        named: true,
        deity: ["Astra"],
        province: ["Astralands"],
    }, {
        ...initFaction,
        name: "Laetrois Ath'Shaorah",
        faith: DEVOTED,
        named: true,
        deity: ["Daethos"],
        province: [""],
    }, {
        ...initFaction,
        name: "Leaf",
        faith: ADHERENT,
        named: true,
        deity: ["Achreo"],
        province: ["Kingdom"],
    }, {
        ...initFaction,
        name: "Lorian",
        faith: DEVOTED,
        named: true,
        deity: ["Daethos", "Lilos"],
        province: [""],
    }, {
        ...initFaction,
        name: "Mavros Ilios",
        faith: ADHERENT,
        named: true,
        deity: ["Daethos", "Ilios"],
        province: [""],
    }, {
        ...initFaction,
        name: "Mirio",
        faith: DEVOTED,
        named: true,
        deity: ["Cambire", "Chiomyr", "Daethos", "Kyr'na"],
        province: ["Licivitas"],
    }, {
        ...initFaction,
        name: "Quor'estes",
        faith: ADHERENT,
        named: true,
        deity: ["Chiomyr", "Shrygei"],
        province: ["Sedyrus"],
    }, {
        ...initFaction,
        name: "Relien Myelle",
        faith: ADHERENT,
        named: true,
        deity: ["Cambire", "Ilios"],
        province: ["Soverains"],
    }, {
        ...initFaction,
        name: "Sera Lorian",
        faith: DEVOTED,
        named: true,
        deity: ["Daethos"],
        province: ["Licivitas"],
    }, {
        ...initFaction,
        name: "Sky",
        faith: ADHERENT,
        named: true,
        deity: ["Achreo", "Nyrolus"],
        province: ["Kingdom"],
    }, {
        ...initFaction,
        name: "Synaethi Spiras",
        faith: ADHERENT,
        named: true,
        deity: ["Ahn've"],
        province: ["Firelands"],
    }, {
        ...initFaction,
        name: "Torreous Ashfyre",
        faith: ADHERENT,
        named: true,
        deity: ["Fyer"],
        province: ["Firelands"],
    }, {
        ...initFaction,
        name: "Vincere",
        faith: ADHERENT,
        named: true,
        deity: ["Achreo"],
        province: ["Licivitas"],
    },
];

export class Reputation {
    public _id: string;
    public factions: FACTION[];
    public constructor(id: string) {
        this._id = id;
        this.factions = initFactions;
    };
};

export const initReputation: Reputation = new Reputation("reputation");