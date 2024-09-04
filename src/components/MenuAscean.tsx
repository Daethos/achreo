import { Accessor, For } from "solid-js";
import { useResizeListener, DIMS } from "../utility/dimensions";
import { Menu } from "../utility/screens";
interface IProps {
    menu: Accessor<Menu>;
    viewAscean: (asc: string) => void;
    loadAscean: (id: string) => Promise<void>;
};
export default function MenuAscean({ menu, viewAscean, loadAscean }: IProps) {
    const dimensions = useResizeListener();
    const shortDescription = (desc: string): string => desc.split(' ').slice(0, 3).join(' ') + (desc.length > 4 ? '...' : '');
    const style = (m: Accessor<Menu>, d: Accessor<DIMS>) => {
        const length = m()?.asceans.length;
        return {
            'height': d().ORIENTATION === 'landscape' ? 'auto' 
                : length === 3 ? `${(d().HEIGHT / 3) - (25)}px` 
                : length === 2 ? `${(d().HEIGHT / 3) - (25)}px` 
                : `${(d().HEIGHT / 3) - (25)}px`,
            'width': d().ORIENTATION === 'landscape' 
                ? (length === 3 ? '30%' : length === 2 ? '45%' : '50vw') 
                : length === 1 ? '100%' : '80vw',
            'transform': d()?.ORIENTATION === 'landscape' 
                ? '' : (length === 3 ? 'scale(1)' 
                : length === 2 ?  'scale(1)' : 'scale(1.2)'),
            'margin-left': d()?.ORIENTATION === 'landscape' 
                ? (length === 3 ? '0.5%' : length === 2 ? '1.5%' : '0%') 
                : (length === 3 ? '1.25%' : length === 2 ? '2%' : '0%'),
            'overflow': d().ORIENTATION === 'landscape' ? '' : '',
            'margin-bottom': length > 1 ? '2.5%' : '0%',
            'margin-top': length > 1 ? '2.5%' : '0%',
            'border-width': '0.25em',
        };
    };
    const shortName = (name: string): string => name.split(' ').slice(0, 2).join(' ');
    return <div style={{ display: 'flex', 'flex-direction': dimensions().ORIENTATION === 'landscape' ? 'row' : 'column', 'flex-wrap': 'wrap', 'justify-content': 'center', 'align-items': 'center', 'gap': '2%' }}>
        <For each={menu()?.asceans}> 
            {((asc, _idx) => (
                <div class={dimensions().ORIENTATION === 'landscape' ? 'border center' : 'border center'} style={style(menu, dimensions)}>
                <div class='center creature-heading' style={{ width: '100%', height: '100%' }}>
                    <h1>{shortName(asc.name)}</h1>
                    <h2>{shortDescription(asc.description)}</h2>
                    <img src={`../assets/images/${asc.origin}-${asc.sex}.jpg`} id='origin-pic' />
                    <div class='gold' style={{ margin: '2%' }}>Level: {asc.level}</div>
                    <button class='highlight' style={{ 'margin-bottom': '5%' }} onClick={() => viewAscean(asc._id)}>View {asc.name.split(' ')[0]}</button>
                    <button class='highlight' style={{ 'margin-bottom': '5%' }} onClick={() => loadAscean(asc._id)}>Quick Load</button>
                </div> 
                </div>
            ))} 
        </For>
    </div>;
};