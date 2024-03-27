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
            border: '0.2em solid ' + getRarityColor(rarity),
            transform: 'scale(1.1)',
            'background-color': 'black',
            'margin-top': '0.25em',
            'margin-bottom': '0.25em',
            'padding-bottom': '-0.25em'
        };
    };

    const image = {
        width: '100%',
        height: '100%',
    };

    function info(item: Equipment) {
        setEquipment(item);
        setShow(!show());
    }; 
    return (
        <div class='imageCardGrid' style={{ width: '70%', margin: 'auto' }}>
            <div class='imageCardLeft'>
                <div onClick={() =>info(ascean().weaponOne)} style={item(ascean().weaponOne.rarity as string)}>
                    <img alt='item' style={image} src={ascean().weaponOne.imgUrl} />
                </div>
                <div onClick={() =>info(ascean().weaponTwo)} style={item(ascean().weaponTwo.rarity as string)}>
                    <img alt='item' style={image} src={ascean().weaponTwo.imgUrl} />
                </div>
                <div onClick={() =>info(ascean().weaponThree)} style={item(ascean().weaponThree.rarity as string)}>
                    <img alt='item' style={image} src={ascean().weaponThree.imgUrl} />
                </div>
                <div onClick={() =>info(ascean().shield)} style={item(ascean().shield.rarity as string)}>
                    <img alt='item' style={image} src={ascean().shield.imgUrl} />
                </div>
            </div>
            <div class='imageCardMiddle'>
                <div onClick={() =>info(ascean().helmet)} style={item(ascean().helmet.rarity as string)}>
                    <img alt='item' style={image} src={ascean().helmet.imgUrl} />
                </div>
                <div onClick={() =>info(ascean().chest)} style={item(ascean().chest.rarity as string)}>
                    <img alt='item' style={image} src={ascean().chest.imgUrl} />
                </div>
                <div onClick={() =>info(ascean().legs)} style={item(ascean().legs.rarity as string)}>
                    <img alt='item' style={image} src={ascean().legs.imgUrl} />
                </div>
            </div>
            <div class='imageCardRight'>
                <div onClick={() =>info(ascean().amulet)} style={item(ascean().amulet.rarity as string)}>
                    <img alt='item' style={image} src={ascean().amulet.imgUrl} />
                </div>
                <div onClick={() =>info(ascean().ringOne)} style={item(ascean().ringOne.rarity as string)}>
                    <img alt='item' style={image} src={ascean().ringOne.imgUrl} />
                </div>
                <div onClick={() =>info(ascean().ringTwo)} style={item(ascean().ringTwo.rarity as string)}>
                    <img alt='item' style={image} src={ascean().ringTwo.imgUrl} />
                </div>
                <div onClick={() =>info(ascean().trinket)} style={item(ascean().trinket.rarity as string)}>
                    <img alt='item' style={image} src={ascean().trinket.imgUrl} />
                </div>
            </div>
        </div> 
    );
};