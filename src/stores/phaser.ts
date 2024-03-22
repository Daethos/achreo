import { indexEquipment } from "../assets/db/db";

export function sanitize(): { sprite: string; imgUrl: string;}[] {
    const index = indexEquipment();
    // const index = [ { imgUrl: '../assets/images/godHand.png' } ];
    const array: any = [];
    const image = (url: string): string => url.split('/')[3].split('.')[0];

    index.forEach((item: any) => {
        const sprite = image(item.imgUrl);
        array.push({ sprite, imgUrl: item.imgUrl });
    });

    return array;
};