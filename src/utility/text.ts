import { Combat } from "../stores/combat";
const ATTACKS = ['Attack', 'Posture', 'Roll', 'Parry', 'attack', 'posture', 'roll', 'parry', 'attacks', 'rolls', 'postures', 'parries', 'parried', 'rolled', 'attacked', 'defend', 'postured', 'tshaer', 'tshaers', 'tshaering', 'leap', 'leaps', 'rush', 'rushes', 'writhe', 'writhes'];
const CAST = ['confuse', 'confusing', 'fear', 'fearing', 'paralyze', 'polymorph', 'polymorphs', 'polymorphing', 'slow', 'slowing', 'snare', 'snaring'];
const COLORS = { BONE: '#fdf6d8', GREEN: 'green', HEAL: '#0BDA51', GOLD: 'gold', PURPLE: 'purple', TEAL: 'teal', RED: 'red', BLUE: 'blue', LIGHT_BLUE: 'lightblue', FUCHSIA: 'fuchsia' };
const DAMAGE = [ 'Blunt', 'Pierce',  'Slash',  'Earth',  'Fire',  'Frost',  'Lightning', 'Righteous', 'Sorcery', 'Spooky',  'Wild', 'Wind' ];
const HUSH = ['Invocation', 'Hush', 'hush', 'sacrifice', 'shimmer', 'shimmers', 'protect', 'protects', 'astrave', 'fyerus'];
const NUMBERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const TENDRIL = ['Tendril', 'tendril', 'tshaer', 'suture', 'shield', 'shields', 'mend', 'achire', 'kynisos'];

export const text = (prev: string, data: Combat) => {
    let oldText: any = prev !== undefined ? prev  : "";
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
        const isCritical = t.includes('Critical');
        const isPartial = t.includes('Partial');
        const isGlancing = t.includes('Glancing');
        const color = 
            isCast === true ? COLORS.BLUE :
            isDamage === true ? COLORS.TEAL :
            isNumber === true ? COLORS.GOLD : 
            isHeal === true ? COLORS.HEAL :
            isGlancing ? COLORS.LIGHT_BLUE : 
            isTendril === true ? COLORS.FUCHSIA : 
            (isAttack === true || isCritical === true || isPartial === true) ? COLORS.RED : 
            isHush === true ? COLORS.FUCHSIA :
            COLORS.BONE;
            
        const lush = (isCast === true || isNumber === true || isHush === true || isTendril === true);
        const fontWeight = lush ? 500 : 'normal';
        const textShadow = lush ? `#fdf6d8 0 0 0` : 'none';
        const fontSize = lush ? '0.75em' : '0.65em';
        const newLine = t === '\n' ? '<br>' : t;
        const style = (isGlancing || isCritical || isAttack || isNumber || isPartial) ? 'italic' : 'normal';
        return `<span style="color: ${color}; font-style: ${style}; font-weight: ${fontWeight}; text-shadow: ${textShadow}; font-size: ${fontSize}; margin: 0;">${newLine}</span>`;
    };

    return text.split(' ').map((t, _i) => style(t)).join(' ');
};