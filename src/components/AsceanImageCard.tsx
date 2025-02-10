import { Accessor, Setter } from 'solid-js';
import Ascean from '../models/ascean';
import Equipment from '../models/equipment';
import { getRarityColor } from '../utility/styling';
interface Props {
    ascean: Accessor<Ascean>;
    setEquipment: Setter<Equipment | undefined>;
    show: Accessor<boolean>;
    setShow: Setter<boolean>;
};
export default function AsceanImageCard({ ascean, setEquipment, show, setShow }: Props) { 
    function item(rarity: string) {
        return { 
            'border': '0.2em solid ' + getRarityColor(rarity), 
            'transform': 'scale(1.1)',
            'background-color': 'black', 
            'padding-bottom': '-0.25em',
            margin: '0.25em',
        };
    };
    const div = (eqp: Equipment) => {
        return <div class='' onClick={() => info(eqp)} style={item(eqp.rarity as string)}>
            <img src={eqp.imgUrl} alt="item" class='juiceNB' style={image} />
        </div>;
    };
    const image = { width: '100%', height: '100%' };
    function info(item: Equipment) {
        setEquipment(item);
        setShow(!show());
    }; 
    return <div class='imageCardGrid' style={{ width: '80%', margin: 'auto' }}>
        <div class='imageCardLeft menu'>
            {div(ascean().weaponOne)}
            {div(ascean().weaponTwo)}
            {div(ascean().weaponThree)}
            {div(ascean().shield)}
        </div>
        <div class='imageCardMiddle menu'>
            {div(ascean().helmet)}
            {div(ascean().chest)}
            {div(ascean().legs)}
        </div>
        <div class='imageCardRight menu'>
            {div(ascean().amulet)}
            {div(ascean().ringOne)}
            {div(ascean().ringTwo)}
            {div(ascean().trinket)}
        </div>
    </div>;
};