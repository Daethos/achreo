import { Accessor, Setter } from 'solid-js';
import Ascean from '../models/ascean';
import Equipment from '../models/equipment';
import { getRarityColor } from '../utility/styling';

interface Props {
    ascean: Accessor<Ascean>;
    weaponOne: Equipment;
    weaponTwo: Equipment;
    weaponThree: Equipment;
    setEquipment: Setter<Equipment | undefined>;
    show: () => boolean;
    setShow: (arg: boolean) => void;
};

export default function AsceanImageCard({ ascean, weaponOne, weaponTwo, weaponThree, setEquipment, show, setShow }: Props) { 
    function itemStyle(rarity: string) {
        return {
            border: '0.15em solid ' + getRarityColor(rarity),
            transform: 'scale(1.1)',
            'background-color': 'black',
            'margin-top': '0.25em',
            'margin-bottom': '0.25em',

        };
    };

    function info(item: Equipment) {
        setEquipment(item);
        setShow(!show());
    }; 
    return (
        <div style={{ width: '100%' }}>
        <div class='imageCardGrid center' style={{ width: '70%' }}>
            <div class='imageCardLeft'>
                <button onClick={() =>info(weaponOne)} style={itemStyle(weaponOne.rarity as string)}>
                    <img alt='item' src={weaponOne.imgUrl} />
                </button>
                <button onClick={() =>info(weaponTwo)} style={itemStyle(weaponTwo.rarity as string)}>
                    <img alt='item' src={weaponTwo.imgUrl} />
                </button>
                <button onClick={() =>info(weaponThree)} style={itemStyle(weaponThree.rarity as string)}>
                    <img alt='item' src={weaponThree.imgUrl} />
                </button>
                <button onClick={() =>info(ascean().shield)} style={itemStyle(ascean().shield.rarity as string)}>
                    <img alt='item' src={ascean().shield.imgUrl} />
                </button>
            </div>
            <div class='imageCardMiddle'>
                <button onClick={() =>info(ascean().helmet)} style={itemStyle(ascean().helmet.rarity as string)}>
                    <img alt='item' src={ascean().helmet.imgUrl} />
                </button>
                <button onClick={() =>info(ascean().chest)} style={itemStyle(ascean().chest.rarity as string)}>
                    <img alt='item' src={ascean().chest.imgUrl} />
                </button>
                <button onClick={() =>info(ascean().legs)} style={itemStyle(ascean().legs.rarity as string)}>
                    <img alt='item' src={ascean().legs.imgUrl} />
                </button>
            </div>
            <div class='imageCardRight'>
                <button onClick={() =>info(ascean().amulet)} style={itemStyle(ascean().amulet.rarity as string)}>
                    <img alt='item' src={ascean().amulet.imgUrl} />
                </button>
                <button onClick={() =>info(ascean().ringOne)} style={itemStyle(ascean().ringOne.rarity as string)}>
                    <img alt='item' src={ascean().ringOne.imgUrl} />
                </button>
                <button onClick={() =>info(ascean().ringTwo)} style={itemStyle(ascean().ringTwo.rarity as string)}>
                    <img alt='item' src={ascean().ringTwo.imgUrl} />
                </button>
                <button onClick={() =>info(ascean().trinket)} style={itemStyle(ascean().trinket.rarity as string)}>
                    <img alt='item' src={ascean().trinket.imgUrl} />
                </button>
            </div>
        </div> 
        </div>
    );
};