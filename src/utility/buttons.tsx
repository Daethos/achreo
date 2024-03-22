import { font } from './styling';
import { SCREENS } from './screens';
import { Accessor, Setter } from 'solid-js';
import Equipment from '../models/equipment';


export function BackForth({ id, left, right, menu, setMenu, createCharacter, newAscean }: { id: string, left: { screen: string, text: string }, right: { screen: string, text: string }, menu: () => any, setMenu: (menu: any) => void, createCharacter: (newAscean: any) => void, newAscean: any }) {
    return (
        <>
        { (left?.screen !== 'undefined') && 
            <button class='button cornerBL' onClick={() => setMenu({ ...menu(), screen: left.screen})}>
                <div>Back ({left.text})</div>
            </button>
        }
        { right?.screen && 
            <button class='button cornerBR' onClick={() => setMenu({ ...menu(), screen: right.screen})}>
                <div>Next ({right.text})</div>
            </button>
        }
        { id === SCREENS.COMPLETE.KEY && 
            <button class='button cornerBR' onClick={() => createCharacter(newAscean)}>
                <div>Create {newAscean?.name?.split(' ')[0]}</div>
            </button>
        }
        </>
    );
};

export function StaticButton({ style, text, callback, textStyle, disabled = false, background = undefined }: { style: any, text: string, callback: () => void, textStyle: any, disabled?: boolean, background?: string }) {
    return (
        <button onClick={callback} disabled={disabled} class="button">
            <div style={textStyle}>{text}</div>
        </button>
    );
};


export function DynamicButton({ style, text, callback, opacity, setOpacity, left, right }: { style: any, text: string, callback: () => void, opacity: number, setOpacity: (opacity: number) => void, left: boolean, right: boolean }) {
    return (
        <button class={left === true ? 'button cornerBL' : 'button cornerBR'} onClick={callback} style={{ opacity: opacity }}>
            <div>{text}</div>
        </button>
    );
};

export function ActionButtonModal({ current, style, actions, index, handleAction, setShow }: { current: string, style: any, actions: string[], index: number, handleAction: (action: string, index: number) => void, setShow: Setter<boolean> }) {
    return (
        <div class='border creature-heading' style={{ width: '100%', height: '100%' }}>
        <h1>{current}</h1>
        <button class='button cornerBR' style={{ 'background-color': 'red', 'z-index': 1 }} onClick={() => setShow(false)}>
            <div> X </div>
        </button>
        <div class='center' style={{ overflow: 'scroll', width: '100%', height: '100%' }}>
        {actions.map((action) => {
            return (
                <button onClick={() => handleAction(action, index)} 
                    style={{ 'background-color': 'black', width: '50%' }}>
                    <div style={font('1.25em', '#fdf6d8')}>{action}</div>
                </button>
                );
            })} 
        </div>
        </div>
    );
}

export function Modal({ items, inventory, callback, show, setShow }: { items: Accessor<[{ item: Equipment | undefined; type: string; }]>, inventory: Equipment | undefined, callback: (type: string) => void, show: Accessor<boolean>, setShow: Setter<boolean> }) {
    return (
        <div class='border creature-heading' style={ { height: '100%', width: '100%' }}>
            <h1>{inventory?.name}</h1>
            <button class='button cornerBR' style={{ 'background-color': 'red', 'z-index': 1 }} onClick={() => setShow(false)}>
                <div> X </div>
            </button>
            <div class='center' style={{ overflow: 'scroll', width: '100%', height: '100%' }}>
            {items().map((item) => {
                return (
                    <button class='button center' style={{ 'background-color': 'black', width: '50%' }} onClick={() => callback(item.type)}>
                        <div style={{ color: 'gold', 'text-align': 'center', width: '100%' }}>
                            {item?.item?.name}    <img src={item?.item?.imgUrl} />
                        </div>
                    </button>
                )
            })}
            </div>
        </div>
    );
};