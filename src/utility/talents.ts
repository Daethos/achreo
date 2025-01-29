export default class Talents {
    _id: string;
    points: {
        spent: number;
        total: number;
    };
    talents: {
        caerenic: boolean;
        stalwart: boolean;
        stealth: boolean;
        invoke: boolean;
        consume: boolean;
        absorb: boolean;
        achire: boolean;
        astrave: boolean;
        astrication: boolean;
        arc: boolean;
        berserk: boolean;
        blind: boolean;
        chiomic: boolean;
        caerenesis: boolean;
        confuse: boolean;
        conviction: boolean;
        desperation: boolean;
        devour: boolean;
        disease: boolean;
        dispel: boolean;
        endurance: boolean;
        envelop: boolean;
        fear: boolean;
        freeze: boolean;
        fyerus: boolean;
        healing: boolean;
        hook: boolean;
        howl: boolean;
        ilirech: boolean;
        impermanence: boolean;
        kynisos: boolean;
        kyrnaicism: boolean;
        leap: boolean;
        maiereth: boolean;
        malice: boolean;
        mark: boolean;
        menace: boolean;
        mend: boolean;
        moderate: boolean;
        multifarious: boolean;
        mystify: boolean;
        netherswap: boolean;
        paralyze: boolean;
        polymorph: boolean;
        protect: boolean;
        pursuit: boolean;
        recall: boolean;
        quor: boolean;
        reconstitute: boolean;
        recover: boolean;
        rein: boolean;
        renewal: boolean;
        root: boolean;
        rush: boolean;
        sacrifice: boolean;
        scream: boolean;
        seer: boolean;
        shadow: boolean;
        shield: boolean;
        shimmer: boolean;
        shirk: boolean;
        slow: boolean;
        snare: boolean;
        sprint: boolean;
        stimulate: boolean;
        storm: boolean;
        suture: boolean;
        tether: boolean;
        ward: boolean;
        writhe: boolean;    
    };

    constructor(id: string) {
        this._id = id;
        this.points = {
            spent: 0,
            total: 0
        };
        this.talents = {
            caerenic: false,
            stalwart: false,
            stealth: false,
            invoke: false,
            consume: false,
            absorb: false,
            achire: false,
            astrave: false,
            astrication: false,
            arc: false,
            berserk: false,
            blind: false,
            chiomic: false,
            caerenesis: false,
            confuse: false,
            conviction: false,
            desperation: false,
            devour: false,
            disease: false,
            dispel: false,
            endurance: false,
            envelop: false,
            fear: false,
            freeze: false,
            fyerus: false,
            healing: false,
            hook: false,
            howl: false,
            ilirech: false,
            impermanence: false,
            kynisos: false,
            kyrnaicism: false,
            leap: false,
            maiereth: false,
            malice: false,
            mark: false,
            menace: false,
            mend: false,
            moderate: false,
            multifarious: false,
            mystify: false,
            netherswap: false,
            paralyze: false,
            polymorph: false,
            protect: false,
            pursuit: false,
            recall: false,
            quor: false,
            reconstitute: false,
            recover: false,
            rein: false,
            renewal: false,
            root: false,
            rush: false,
            sacrifice: false,
            scream: false,
            seer: false,
            shadow: false,
            shield: false,
            shimmer: false,
            shirk: false,
            slow: false,
            snare: false,
            sprint: false,
            stimulate: false,
            storm: false,
            suture: false,
            tether: false,
            ward: false,
            writhe: false,    
        };
    
    };
    [key: string]: any;
};

export const initTalents = new Talents('talents');
export const createTalents = (id: string): Talents => new Talents(id);