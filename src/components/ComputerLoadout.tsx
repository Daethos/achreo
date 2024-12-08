import { createSignal, For, Accessor } from "solid-js";
import { InputGroup } from 'solid-bootstrap';
import { useResizeListener } from "../utility/dimensions";
import Settings from "../models/settings";
import { EventBus } from "../game/EventBus";

const actions = ['attack','posture','roll','parry','thrust','special'];
const validateNumber = (num: number) => Number.isInteger(num) ? num : 0;

export default function ComputerLoadout({ settings }: { settings: Accessor<Settings> }) {
    const [computerLoadout, setComputerLoadout] = createSignal({ attack: validateNumber(settings()?.computerLoadout?.attack), posture: validateNumber(settings()?.computerLoadout?.posture), roll: validateNumber(settings()?.computerLoadout?.roll), parry: validateNumber(settings()?.computerLoadout?.parry), thrust: validateNumber(settings()?.computerLoadout?.thrust), special: validateNumber(settings()?.computerLoadout?.special) })
    const [pool, setPool] = createSignal((validateNumber(settings()?.computerLoadout?.attack) + validateNumber(settings()?.computerLoadout?.posture) + validateNumber(settings()?.computerLoadout?.roll) + validateNumber(settings()?.computerLoadout?.parry) + validateNumber(settings()?.computerLoadout?.thrust) + validateNumber(settings()?.computerLoadout?.special)) || 0);
    const dimensions = useResizeListener();
    const handleChange = (event: any, name: string, value: number): void => {
        event.preventDefault();
        setComputerLoadout({
            ...computerLoadout(),
            [name]: computerLoadout()[name as keyof typeof computerLoadout] + value
        });
        // FIXME:TODO: Figure out what to do, save setting every manipulation, or have a specific 'save' button ?
        setPool(pool() + value);
    };
    function saveLoadout() {
        const newSettings = {
            ...settings(),
            computerLoadout: {
                ...computerLoadout()
            }
        };
        EventBus.emit('save-settings', newSettings);
    };
    console.log(computerLoadout(), settings().computerLoadout, pool(), 'Current Loadout Being Saved');
    const ceiling = (): boolean => pool() < 100;
    const floor = (name: string): boolean => computerLoadout()?.[name as keyof typeof computerLoadout] as number > 0;

    return <div class='center creature-heading fadeIn' style={{ 'margin': '10% auto 5%', width: '100%' }}>
        <h1 class='gold' style={{ 'margin-bottom' : '5%' }}>Pool: {pool()} / 100</h1>
        <For each={actions}>
            {(action) => (
                <InputGroup style={{ width: dimensions().ORIENTATION === 'landscape' ? `33%` : `40%`, display: 'inline-block' }}>
                    <p class='tighten'>{action.charAt(0).toUpperCase() + action.slice(1)} {computerLoadout()[action as keyof typeof computerLoadout]}</p>
                    <br />
                    <button class='highlight' onClick={(e) => handleChange(e, action, -1)} style={{ display: floor(action) ? 'inline-block' : 'none', width: 'auto', height: 'auto' }}>-</button>
                    <button class='highlight' onClick={(e) => handleChange(e, action, 1)} style={{ display: ceiling() ? 'inline-block' : 'none', width: 'auto', height: 'auto' }}>+</button>
                </InputGroup>
            )}
        </For>
        <button class='highlight' onClick={saveLoadout}>Save</button>
    </div>;
};