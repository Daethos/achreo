import { For } from "solid-js";
import { useResizeListener } from "../utility/dimensions";
import { Menu } from "../utility/screens";

interface IProps {
    menu: Menu;
    viewAscean: (asc: string) => void;
};
export const MenuAscean = ({ menu, viewAscean }: IProps) => {
    const dimensions = useResizeListener();
    const shortDescription = (desc: string): string => {
        const newDesc = desc.split(' ').slice(0, 4).join(' ') + (desc.length > 4 ? '...' : '');
        return newDesc;
    };
    const shortName = (name: string): string => name.split(' ').slice(0, 2).join(' ');
    return (
        <div style={{
            display: 'flex',
            'flex-direction': dimensions().ORIENTATION === 'landscape' ? 'row' : 'column',
            'flex-wrap': 'wrap',
            'justify-content': 'center',
            'align-items': 'center',
        }}>
        <For each={menu?.asceans}> 
            {((asc, _idx) => (
                <div class={dimensions().ORIENTATION === 'landscape' ? 'border center' : 'border'} style={{ 
                    height: dimensions().ORIENTATION === 'landscape' ? 'auto' : '30vh',
                    width: dimensions().ORIENTATION === 'landscape' ? (menu?.asceans.length === 3 ?'30%' : '45%') : '100%', 
                    overflow: dimensions().ORIENTATION === 'landscape' ? '' : '',
                }}>
                <div class='border center creature-heading' style={{ width: '100%', height: '100%' }}>
                    <h1>{shortName(asc.name)}</h1>
                    <h2 class='mb-2'>{shortDescription(asc.description)}</h2>
                    <img src={`../assets/images/${asc.origin}-${asc.sex}.jpg`} id='origin-pic' />
                    <p class='gold mt-2'>Level: {asc.level}</p>
                    <button class='button' onClick={() => viewAscean(asc._id)}>Select {asc.name.split(' ')[0]}</button>
                    <br /><br />
                </div> 
                </div>
            ))} 
        </For>
        </div>
    );
};