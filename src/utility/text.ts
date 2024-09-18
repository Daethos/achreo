import { Combat } from "../stores/combat";
const ATTACKS = ['Attack', 'Posture', 'Roll', 'Parry', 'attack', 'posture', 'roll', 'parry', 'attacks', 'rolls', 'postures', 'parries', 'parried', 'rolled', 'attacked', 'defend', 'postured', 
    'tshaer', 'tshaers', 'tshaering', 'leap', 'leaps', 'rush', 'rushes', 'writhe', 'writhes', 'devour', 'devours', 'suture', 'sutures', 'sacrifice', 'sacrifices',
    'flay', 'flays'];
const CAST = ['confuse', 'confusing', 'fear', 'fearing', 'paralyze', 'polymorph', 'polymorphs', 'polymorphing', 'slow', 'slowing', 'snare', 'snaring'];
const COLORS = { BONE: '#fdf6d8', GREEN: 'green', HEAL: '#0BDA51', GOLD: 'gold', PURPLE: 'purple', TEAL: 'teal', RED: 'red', BLUE: 'blue', LIGHT_BLUE: 'lightblue', FUCHSIA: 'fuchsia' };
const DAMAGE = ['Blunt', 'Pierce',  'Slash',  'Earth',  'Fire',  'Frost',  'Lightning', 'Righteous', 'Sorcery', 'Spooky',  'Wild', 'Wind' ];
const HUSH = ['Invocation', 'Hush', 'hush', 'tendril', 'sacrifice', 'shimmer', 'shimmers', 'protect', 'protects', 'astrave', 'fyerus'];
const NUMBERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const TENDRIL = ['Tendril', 'tendril', 'tendrils', 'suture', 'sutures', 'sutured', 'shield', 'shields', 'mend', 'achire', 'kynisos'];
const CONSOLE = 'Console';
const ERROR = 'Error';
const WARNING = 'Warning';
export const text = (prev: string, data: Combat) => {
    let oldText: any = prev !== undefined ? prev : undefined;
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
    if (newText !== '') {
        newText = styleText(newText);
        oldText += newText;
    };
    return oldText;
};
function checkNumber(line: string[]) {
    for (let i = 0; i < line.length; i++) {
        if (line[i].includes('heal')) { 
            return 'GREEN';
        } else if (ATTACKS.includes(line[i])) { 
            return 'RED';
        };
    };
    return 'GOLD';
};
function checkAlignment(line: string[]) {
    let count = 0;
    for (let i = 0; i < line.length; i++) {
        if (line[i].includes('You')) { 
            count++;
        } else if (line[i].includes('defeated') || line[i].includes('Resetting') || line[i].includes('Console') || line[i].includes('Warning') || line[i].includes('Error') || line[i].includes('Initial')) {
            return 'center';
        };
    };
    if (count > 0) return 'right';
    return 'left';
};
function styleText(text: string) {
    var numberCheck: string[] = [];
    const style = (t: string) => { 
        const numCheck = t.split('').find((c: string) => NUMBERS.includes(parseInt(c)));
        const isNumber = numCheck !== undefined;
        const isAttack = ATTACKS.includes(t);
        const isCast = CAST.includes(t);
        const isDamage = DAMAGE.includes(t);
        const isHeal = t.includes('heal') && t !== 'health';
        const isHush = HUSH.includes(t);
        const isTendril = TENDRIL.includes(t);
        const isCritical = t.includes('Critical');
        const isPartial = t.includes('Partial');
        const isGlancing = t.includes('Glancing');
        const isConsole = t.includes(CONSOLE);
        const isError = t.includes(ERROR);
        const isWarning = t.includes(WARNING);
        const lush = isAttack === true || isCast === true || isNumber === true || isHush === true || isTendril === true;
        const fontWeight = isNumber ? '700' : 'normal';
        const fontSize = lush ? '0.7em' : '0.6em';
        const newLine = t === '\n' ? '<br>' : t;
        const style = (isGlancing || isCritical || lush || isPartial) ? 'italic' : 'normal';
        numberCheck.push(newLine);
        const numType = checkNumber(numberCheck);
        const color = 
            (isCast || isConsole) ? COLORS.BLUE :
            isDamage ? COLORS.TEAL :
            isNumber ? COLORS[numType as keyof typeof COLORS] : 
            isHeal ? COLORS.HEAL :
            isGlancing ? COLORS.LIGHT_BLUE : 
            isTendril ? COLORS.PURPLE : 
            (isAttack || isCritical || isPartial || isError) ? COLORS.RED : 
            isHush ? COLORS.FUCHSIA :
            isWarning ? COLORS.GOLD :
            COLORS.BONE;
        const line = `<span style="color: ${color}; font-style: ${style}; font-weight: ${fontWeight}; font-size: ${fontSize}; margin: 0;">${newLine}</span>`;
        return line;
    };
    const lines = text.split('\n').map(line => {
        const styledLine = line.split(' ').map(t => style(t)).join(' ');
        const alignment = checkAlignment(line.split(' '));
        return `<div style="text-align: ${alignment};">${styledLine}</div>`;
    }).join('');
    return lines;
};