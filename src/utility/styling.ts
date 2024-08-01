const COLORS = {
    'Aqua': 0x00FFFF,
    'Black': 0x000000,
    'Blue': 0x0000FF,
    'Bone': 0xFDF6D8,
    'Brown': 0x8B4513,
    'Burned': 0xCC5500,
    'Cerise': 0xDE3163,
    'Charcoal': 0x36454F,
    'Chartreuse': 0xDFFF00,
    'Coral': 0xFF7F50,
    'Dusty': 0xC9A9A6,
    'Fuschia': 0xFF00FF,
    'Green': 0x00FF00,
    'Gold': 0xFFD700,
    'Icterine': 0xFCF55F,
    'Lavender': 0xC3B1E1,
    'Malachite': 0x0BDA51,
    'Pink': 0xFFC0CB,
    'Purple': 0x800080,
    'Red': 0xFF0000,
    'Ruby': 0xE0115F,
    'Sapphire': 0x0F52BA,
    'Seafoam': 0x9FE2BF,
    'Tangerine': 0xF08000,
    'Teal': 0x008080,
    'Violet': 0x7F00FF,
    'Ultramarine': 0x0437F2,
    'Vanilla': 0xF3E5AB,
    'White': 0xFFFFFF,
    'Wine': 0x722F37,
};
const NUMBERS = {
    0x00FFFF: 'Aqua',
    0xFDF6D8: 'Bone',
    0x000000: 'Black',
    0x0000FF: 'Blue',
    0x8B4513: 'Brown',
    0xCC5500: 'Burned',
    0xDE3163: 'Cerise',
    0x36454F: 'Charcoal',
    0xDFFF00: 'Chartreuse',
    0xFF7F50: 'Coral',
    0xC9A9A6: 'Dusty',
    0xFF00FF: 'Fuschia',
    0x00FF00: 'Green',
    0xFFD700: 'Gold',
    0xFCF55F: 'Icterine',
    0xC3B1E1: 'Lavender',
    0x0BDA51: 'Malachite',
    0xFFC0CB: 'Pink',
    0x800080: 'Purple',
    0xFF0000: 'Red',
    0xE0115F: 'Ruby',
    0x0F52BA: 'Sapphire',
    0x9FE2BF: 'Seafoam',
    0xF08000: 'Tangerine',
    0x008080: 'Teal',
    0x7F00FF: 'Violet',
    0x0437F2: 'Ultramarine',
    0xF3E5AB: 'Vanilla',
    0xFFFFFF: 'White',
    0x722F37: 'Wine',
};

const getRarityColor = (rarity: string): string => {
    switch (rarity) {
        case 'Common':
            return 'white';
        case 'Uncommon':
            return 'green';
        case 'Rare':
            return 'blue';
        case 'Epic':
            return 'purple';
        case 'Legendary':
            return 'darkorange';
        default:
            return 'grey';
    };
};

const getShadowColor = (prayer: string): string => {
    switch (prayer) {
        case 'Buff':
            return 'gold';
        case 'Damage':
            return 'red';
        case 'Debuff':
            return 'purple';
        case 'Heal':
            return 'green';
        default:
            return 'white';
    };
};

const masteryNumber = (mastery: string): number => {
    switch (mastery) {
        case 'constitution':
            return 0xfdf6d8;
        case 'strength':
            return 0xff0000;
        case 'agility':
            return 0x00ff00;
        case 'achre':
            return 0x0000ff;
        case 'caeren':
            return 0x800080;
        case 'kyosir':
            return 0xffd700;
        default:
            return 0xfdf6d8;
    };
};

const masteryColor = (mastery: string): string => {
    switch (mastery) {
        case 'constitution':
            return '#fdf6d8';
        case 'strength':
            return '#ff0000'
        case 'agility':
            return '#00ff00';
        case 'achre':
            return '#0000ff';
        case 'caeren':
            return '#800080';
        case 'kyosir':
            return '#ffd700';
        default:
            return '#fdf6d8';
    };
};

const border = (color: string, width: number): string => `${width}em solid ${color}`;

const borderColor = (prayer: string): string => {
    switch (prayer) {
        case 'Buff': return 'gold';
        case 'Debuff': return 'purple';
        case 'Heal': return 'green';
        case 'Damage': return 'red';
        case 'Avarice' : return 'greenyellow';
        case 'Denial' : return '#0cf';
        case 'Silence' : return 'black';
        default: return 'white';
    };
};

const font = (fontSize: string = '1em', color?: string) => {
    if (!color || !fontSize) return { 'font-size': fontSize };
    return { 'font-size': fontSize, color };
};

const itemStyle = (rarity: string) => {
    return {
        border: `0.15em solid ${getRarityColor(rarity)}`,
        'background-color': 'black',
    };
};

const shadow = (color: string, intensity: number): Object => {
    return { 'text-shadow': `${intensity} ${intensity} ${intensity} ${color}` };
};

const sellRarity = (rarity: string): string => {
    switch (rarity) {
        case 'Common': return '10s';
        case 'Uncommon': return '1g';
        case 'Rare': return '3g';
        case 'Epic': return '12g';
        case 'Legendary': return '50g';
        default: return '10s';
    };
};

export { COLORS, NUMBERS, getRarityColor, getShadowColor, borderColor, itemStyle, masteryColor, masteryNumber, border, font, shadow, sellRarity };