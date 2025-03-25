type Talent = {
    efficient: boolean;
    enhanced: boolean;
    [key: string]: boolean;
};
const initTalent: Talent = {
    efficient: false,
    enhanced: false
};
export default class Talents {
    _id: string;
    points: {
        spent: number;
        total: number;
    };
    talents: {
        caerenic: Talent;
        stalwart: Talent;
        stealth: Talent;
        invoke: Talent;
        consume: Talent;
        absorb: Talent;
        achire: Talent;
        astrave: Talent;
        astrication: Talent;
        arc: Talent;
        berserk: Talent;
        blind: Talent;
        blink: Talent;
        chiomic: Talent;
        caerenesis: Talent;
        chiomism: Talent;
        confuse: Talent;
        conviction: Talent;
        desperation: Talent;
        devour: Talent;
        disease: Talent;
        dispel: Talent;
        endurance: Talent;
        envelop: Talent;
        fear: Talent;
        freeze: Talent;
        frost: Talent;
        fyerus: Talent;
        healing: Talent;
        hook: Talent;
        howl: Talent;
        ilirech: Talent;
        impermanence: Talent;
        kynisos: Talent;
        kyrisian: Talent;
        kyrnaicism: Talent;
        leap: Talent;
        likyr: Talent;
        maiereth: Talent;
        malice: Talent;
        mark: Talent;
        menace: Talent;
        mend: Talent;
        moderate: Talent;
        multifarious: Talent;
        mystify: Talent;
        netherswap: Talent;
        paralyze: Talent;
        polymorph: Talent;
        protect: Talent;
        pursuit: Talent;
        recall: Talent;
        quor: Talent;
        reconstitute: Talent;
        recover: Talent;
        rein: Talent;
        renewal: Talent;
        root: Talent;
        rush: Talent;
        sacrifice: Talent;
        scream: Talent;
        seer: Talent;
        shadow: Talent;
        shield: Talent;
        shimmer: Talent;
        shirk: Talent;
        slow: Talent;
        snare: Talent;
        sprint: Talent;
        stimulate: Talent;
        storm: Talent;
        suture: Talent;
        tether: Talent;
        ward: Talent;
        writhe: Talent;
    };

    constructor(id: string) {
        this._id = id;
        this.points = {
            spent: 0,
            total: 0
        };
        this.talents = {
            caerenic: initTalent,
            stalwart: initTalent,
            stealth: initTalent,
            invoke: initTalent,
            consume: initTalent,
            absorb: initTalent,
            achire: initTalent,
            astrave: initTalent,
            astrication: initTalent,
            arc: initTalent,
            berserk: initTalent,
            blind: initTalent,
            blink: initTalent,
            chiomic: initTalent,
            caerenesis: initTalent,
            chiomism: initTalent,
            confuse: initTalent,
            conviction: initTalent,
            desperation: initTalent,
            devour: initTalent,
            disease: initTalent,
            dispel: initTalent,
            endurance: initTalent,
            envelop: initTalent,
            fear: initTalent,
            freeze: initTalent,
            frost: initTalent,
            fyerus: initTalent,
            healing: initTalent,
            hook: initTalent,
            howl: initTalent,
            ilirech: initTalent,
            impermanence: initTalent,
            kynisos: initTalent,
            kyrisian: initTalent,
            kyrnaicism: initTalent,
            leap: initTalent,
            likyr: initTalent,
            maiereth: initTalent,
            malice: initTalent,
            mark: initTalent,
            menace: initTalent,
            mend: initTalent,
            moderate: initTalent,
            multifarious: initTalent,
            mystify: initTalent,
            netherswap: initTalent,
            paralyze: initTalent,
            polymorph: initTalent,
            protect: initTalent,
            pursuit: initTalent,
            recall: initTalent,
            quor: initTalent,
            reconstitute: initTalent,
            recover: initTalent,
            rein: initTalent,
            renewal: initTalent,
            root: initTalent,
            rush: initTalent,
            sacrifice: initTalent,
            scream: initTalent,
            seer: initTalent,
            shadow: initTalent,
            shield: initTalent,
            shimmer: initTalent,
            shirk: initTalent,
            slow: initTalent,
            snare: initTalent,
            sprint: initTalent,
            stimulate: initTalent,
            storm: initTalent,
            suture: initTalent,
            tether: initTalent,
            ward: initTalent,
            writhe: initTalent,
        };
    
    };
    [key: string]: any;
};

export const initTalents = new Talents("talents");
export const createTalents = (id: string): Talents => new Talents(id);