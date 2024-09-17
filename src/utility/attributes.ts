export const Attributes = [{
    name: 'constitution',
    title: "Of Lilos and Kyr'na, forever twined.",
    description: "Your greatest foundation to continue breathing in this world, a worthy ambition. \n\n What bore this nature from unnatural twins questions its creation, yet such blooming fruit begs to be eaten.",
    gameplay: "Governs Health, Defenses, Posturing, Crit Damage, and Stamina--its Mastery Pervasive"
}, {
    name: 'strength',
    title: "Of Tshaer and Se'vas.",
    description: "The physical power you possess, weighing heavily into your abliity to deal and receive physical damage with brutality. \n\n Many an Ancient and their apparition embodied beautiful displays of this, and a reverence all its own is given to those who possess it.",
    gameplay: "Governs Crit Damage, Physical Damage, Defense, and all Posturing. Affects Dual-Wielding Two-Hand Weapons"
}, {
    name: 'agility',
    title: "Of Kyn'gi and Se'dyro",
    description: "The physical clarity you possess, weighing heavily into your abliity to mitigate and perform physical damage with finesse. \n\n While an understood quality, there are many of an othernature who have been known to admire and reward this trait.",
    gameplay: "Governs Phys Crit Chance, Phys Damage, Dodge, Roll, and Stamina. Affects Dual-Wielding One-Hand Weapons"
}, {
    name: 'achre',
    title: "Of Achreo, the Wild Ancient.",
    description: `(/ɑːkər/): Discernment, poise, sagacity, and existence above error. \n\n Achreus (Formal, Descriptive) Representation of such traits. Synonymous with being an Arbiter, nomadic judges of the Ley.`,
    gameplay: "Governs Magi Crit Chance, Magi Damage, Dodge, Critical Posture, and Roll. Affects Dual-Wielding One-Hand Spells"
}, {
    name: 'caeren',
    title: "Of Cambire, the Ancient of Potential, lingering essence and manifestation.",
    description: "(/'sɛərən/): An idealized person or thing. A specter or phantom. Eidolon. Some have seen things of themselves acting with verve and disregard of this world. \n\n The Caer (Informal, Colloquial): Synonymous to 'the will.'",
    gameplay: "Governs Crit Damage, Defense, Health, Magi Damage, and Stamina. Affects Dual-Wielding Two-Hand Spells"
}, {
    name: 'kyosir',
    title: "Of Ancients Otherwise.",
    description: "(/kaɪəsɪə(ɹ)/): Compulsion concocted through the veins of Kyrisos and bile and phlegm of Chiomyr. \n\n A charisma that warps those regardless of their caer; shearing shields and quelling quality strikes.",
    gameplay: "Governs Myriad Defense and Penetration--its Mastery Pervasive"
}];

export const LOADOUT = {
    'constitution': {
        constitution: 16,
        strength: 12,
        agility: 10,
        achre: 10,
        caeren: 12,
        kyosir: 13
    },
    'strength': {
        constitution: 12,
        strength: 15,
        agility: 12,
        achre: 10,
        caeren: 14,
        kyosir: 10
    },
    'agility': {
        constitution: 12,
        strength: 12,
        agility: 16,
        achre: 13,
        caeren: 10,
        kyosir: 10
    },
    'achre': {
        constitution: 12,
        strength: 10,
        agility: 13,
        achre: 16,
        caeren: 12,
        kyosir: 10
    },
    'caeren': {
        constitution: 12,
        strength: 14,
        agility: 10,
        achre: 12,
        caeren: 15,
        kyosir: 10
    },
    'kyosir': {
        constitution: 13,
        strength: 10,
        agility: 12,
        achre: 12,
        caeren: 10,
        kyosir: 16
    }
};