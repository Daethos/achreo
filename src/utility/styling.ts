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
    return {
        textShadowColor: color,
        textShadowOffset: { width: intensity, height: intensity },
        textShadowRadius: intensity,
        elevation: 2,
    };
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

export { getRarityColor, getShadowColor, borderColor, itemStyle, masteryColor, border, font, shadow, sellRarity };