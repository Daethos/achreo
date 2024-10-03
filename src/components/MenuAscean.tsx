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
            'height': length === 3 ?  '60vh' : '',
            'padding-top': length === 3 ? '1%' : '',
            'padding-bottom': length === 3 ? '1%' : '',
            'width': d().ORIENTATION === 'landscape' 
                ? (length === 3 ? '32vw' : length === 2 ? '45vw' : '55vw') 
                : length === 1 ? '100%' : '80vw',
            'margin-left': d()?.ORIENTATION === 'landscape' 
                ? (length === 3 ? '0%' : length === 2 ? '1%' : '0%') 
                : (length === 3 ? '1.25%' : length === 2 ? '2%' : '0%'),
            'margin-bottom': length > 1 ? '0%' : '0%',
            'margin-top': length === 3 ? '0%' : '0%',
        };
    };
    const shortName = (name: string): string => name.split(' ').slice(0, 2).join(' ');
    return <div class='menu' style={{ display: 'inline-flex', 'flex-direction': dimensions().ORIENTATION === 'landscape' ? 'row' : 'column', 'align-items': 'center', 'gap': '1%', 'justify-content': 'center' }}>
        <For each={menu()?.asceans}> 
            {((asc, _idx) => (
                <div class={dimensions().ORIENTATION === 'landscape' ? 'border center juice' : 'border center juice'} style={style(menu, dimensions)}>
                <div class='center creature-heading' style={{ width: '100%', height: '100%' }}>
                    <h1>{shortName(asc.name)}</h1>
                    <h2>{shortDescription(asc.description)}</h2>
                    <img src={`../assets/images/${asc.origin}-${asc.sex}.jpg`} id='origin-pic' style={{ transform: menu()?.asceans?.length === 3 ? 'scale(1.3)' : '', 'margin': menu()?.asceans?.length === 3 ? '7.5% auto' : '' }} />
                    <div class='gold' style={{ margin: '2%' }}>Level: {asc.level}</div>
                    <button class='highlight' style={{ 'margin-bottom': '5%' }} onClick={() => viewAscean(asc._id)}>View {asc.name.split(' ')[0]}</button>
                    <button class='highlight' style={{ 'margin-bottom': '5%' }} onClick={() => loadAscean(asc._id)}>Quick Load</button>
                </div> 
                </div>
            ))} 
        </For>
    </div>;
};