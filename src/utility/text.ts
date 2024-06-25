import { Combat } from "../stores/combat";

// Colors: Bone (#fdf6d8), Green, Gold, Purple, Teal, Red, Blue, Light Blue 
// const MAX_ACTIONS = 30;

const COLORS = {
    BONE: '#fdf6d8',
    GREEN: 'green',
    HEAL: '#0BDA51',
    GOLD: 'gold',
    PURPLE: 'purple',
    TEAL: 'teal',
    RED: 'red',
    BLUE: 'blue',
    LIGHT_BLUE: 'lightblue',
    FUCHSIA: 'fuchsia',
};
const DAMAGE = [
    'Blunt',
    'Pierce', 
    'Slash', 
    'Earth', 
    'Fire', 
    'Frost', 
    'Lightning',
    'Righteous',
    'Sorcery',
    'Spooky', 
    'Wild',
    'Wind', 
];

const NUMBERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const ATTACKS = ['Attack', 'Posture', 'Roll', 'Parry', 'attack', 'posture', 'roll', 'parry', 'attacks', 'rolls', 'postures', 'parries', 'parried', 'rolled', 'attacked', 'defend', 'postured', 'tshaer', 'tshaers', 'tshaering'];
const CAST = ['confuse', 'confusing', 'fear', 'fearing', 'polymorph', 'polymorphs', 'polymorphing', 'slow', 'slowing', 'snare', 'snaring'];
// const specials = ['Invocation', 'Tendrils', 'Hush', 'Tendril', 'hush', 'tshaer', 'sacrifice', 'suture'];
const HUSH = ['Invocation', 'Hush', 'hush', 'sacrifice', 'shimmer', 'shimmers', 'protect', 'protects'];
const TENDRIL = ['Tendril', 'tendril', 'tshaer', 'suture', 'shield', 'shields', 'mend'];

// function addCombatAction(actions: string[], newAction: string): string {
//     let updatedActions = [...actions, newAction];
//     while (updatedActions.length > MAX_ACTIONS) {
//         updatedActions.shift();
//     };
//     const newActions = updatedActions.toString().split(',').join(' ');
//     console.log(newActions, 'New Actions ???');
//     return newActions;
// };

export const text = (prev: string, data: Combat) => {
    let oldText: any = prev !== undefined ? prev  : "";
    // const byteSize = (str: string) => new Blob([str]).size;
    // const result = byteSize(oldText);
    // console.log(result, 'Resulting Current Byte Size');
    let newText: any = '';
    if (data.playerStartDescription !== '') newText += data.playerStartDescription + '\n';
    if (data.computerStartDescription !== '') newText += data.computerStartDescription + '\n';
    if (data.playerSpecialDescription !== '') newText += data.playerSpecialDescription + '\n';
    if (data.computerSpecialDescription !== '') newText += data.computerSpecialDescription + '\n';
    if (data.playerActionDescription !== '') newText += data.playerActionDescription + '\n';
    if (data.computerActionDescription !== '') newText += data.computerActionDescription + '\n';
    if (data.playerInfluenceDescription !== '') newText += data.playerInfluenceDescription + '\n';
    if (data.playerInfluenceDescriptionTwo !== '') newText += data.playerInfluenceDescriptionTwo + '\n';
    if (data.computerInfluenceDescription !== '') newText += data.computerInfluenceDescription + '\n';
    if (data.computerInfluenceDescriptionTwo !== '') newText += data.computerInfluenceDescriptionTwo + '\n';
    if (data.playerDeathDescription !== '') newText += data.playerDeathDescription + '\n';
    if (data.computerDeathDescription !== '') newText += data.computerDeathDescription + '\n';
    newText = styleText(newText);
    // return addCombatAction(oldText, newText);

    oldText += newText;
    return oldText;
};

function styleText(text: string) {
    const style = (t: string) => { 
        const numCheck = t.split('').find((c: string) => NUMBERS.includes(parseInt(c)));
        const isNumber = numCheck !== undefined;

        const isAttack = ATTACKS.includes(t);
        const isCast = CAST.includes(t);
        const isDamage = DAMAGE.includes(t);
        const isHeal = t.includes('heal');
        const isHush = HUSH.includes(t);
        const isTendril = TENDRIL.includes(t);
        // const isSpecial = specials.includes(t);
        const isCritical = t.includes('Critical');
        const isGlancing = t.includes('Glancing');
        const color = 
            isCast === true ? COLORS.BLUE :
            isDamage === true ? COLORS.TEAL :
            isNumber === true ? COLORS.GOLD : 
            isHeal === true ? COLORS.HEAL :
            isGlancing ? COLORS.LIGHT_BLUE : 
            isTendril === true ? COLORS.FUCHSIA : 
            (isAttack === true || isCritical === true) ? COLORS.RED : 
            isHush === true ? COLORS.FUCHSIA :
            COLORS.BONE; // bone
            
        const lush = (isCast === true || isNumber === true || isHush === true || isTendril === true);
        const fontWeight = lush ? 500 : 'normal';
        const textShadow = lush ? `#fdf6d8 0 0 0` : 'none';
        const fontSize = lush ? '0.75em' : '0.65em';
        const newLine = t === '\n' ? '<br>' : t;
        const style = (isGlancing || isCritical || isAttack || isNumber) ? 'italic' : 'normal';

        return `<span style="color: ${color}; font-style: ${style}; font-weight: ${fontWeight}; text-shadow: ${textShadow}; font-size: ${fontSize}; margin: 0;">${newLine}</span>`;
    };

    return text.split(' ').map((t, _i) => style(t)).join(' ');
};