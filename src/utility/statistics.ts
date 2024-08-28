

export default class Statistics {
    _id: string;
    combat: { // Some combat things will be every duel, some will be every level
        losses: number;
        total: number;
        wins: number;
        actions: {
            attacks: number;
            parries: number;
            dodges: number;
            postures: number;
            rolls: number;
            invokes: number;
            consumes: number;
            prayers: number;
            thrusts: number;
            rushes: number;
            storms: number;
            leaps: number;
            arcs: number;
            achires: number;
            quors: number;
            writhes: number;
        };
        attacks: { 
            magical: number; 
            physical: number; 
            total: number;
            blunt: number;
            pierce: number;
            slash: number;
            earth: number;
            fire: number;
            frost: number;
            lightning: number;
            righteous: number;
            spooky: number;
            sorcery: number;
            wild: number;
            wind: number;
        };
        deities: {
            Daethos: number;
            Achreo: number;
            Ahnve: number;
            Astra: number;
            Cambire: number;
            Chiomyr: number;
            Fyer: number;
            Ilios: number;
            Kyngi: number;
            Kyrisos: number;
            Kyrna: number;
            Lilos: number;
            Maanre: number;
            Nyrolus: number;
            Quorei: number;
            Rahvre: number;
            Senari: number;
            Sedyro: number;
            Sevas: number;
            Shrygei: number;
            Tshaer: number;
        };
        prayers: { 
            buff: number; 
            damage: number; 
            debuff: number; 
            heal: number;
            avarice: number; 
            denial: number; 
            dispel: number; 
            silence: number; 
         };
    };
    luckout: {
        arbituous: { 
            failures: number;
            successes: number;
            total: number;
        }; 
        chiomic: { 
            failures: number;
            successes: number;
            total: number;
        }; 
        kyrnaic: { 
            failures: number;
            successes: number;
            total: number;
        }; 
        lilosian: { 
            failures: number;
            successes: number;
            total: number;
        }; 
        
    };
    mastery: { 
        constitution: number; 
        strength: number; 
        agility: number; 
        achre: number; 
        caeren: number; 
        kyosir: number 
    };
    persuasion: {
        arbituous: {
            failures: number;
            successes: number;
            total: number;
        }; 
        chiomic: {
            failures: number;
            successes: number;
            total: number;
        };
        fyeran: {
            failures: number;
            successes: number;
            total: number;
        };
        ilian: {
            failures: number;
            successes: number;
            total: number;
        };
        kyrnaic: {
            failures: number;
            successes: number;
            total: number;
        };
        lilosian: {
            failures: number;
            successes: number;
            total: number;
        };
        shaorahi: {
            failures: number;
            successes: number;
            total: number;
        };
    };
    thievery: {
        failures: number;
        successes: number;
        total: number;
        totalValue: number;
    };
    relationships: {
        deity: {
            name: string; // This occurs when you meet a deity a second time; you can reinforce you believe it's *that* deity and it'll name them then.
            behaviors: [];
            Compliant: { 
                occurrence: number;
                value: number;
             };
            Disobedient: { 
                occurrence: number;
                value: number;
             };
            Faithful: { 
                occurrence: number;
                value: number;
             };
            Unfaithful: { 
                occurrence: number;
                value: number;
             };
            value: number;
        };
    };

    constructor(id: string, mastery: string) {
        this._id = id;
        this.combat = { // Some combat things will be every duel, some will be every level
            losses: 0,
            total: 0,
            wins: 0,
            actions: {
                attacks: 0,
                parries: 0,
                dodges: 0,
                postures: 0,
                rolls: 0,
                thrusts: 0,
                arcs: 0,
                leaps: 0,
                rushes: 0,
                storms: 0,
                achires: 0,
                quors: 0,
                writhes: 0,
                invokes: 0,
                consumes: 0,
                prayers: 0,
            },
            attacks: { 
                magical: 0, 
                physical: 0, 
                total: 0,
                blunt: 0,
                pierce: 0,
                slash: 0,
                earth: 0,
                fire: 0,
                frost: 0,
                lightning: 0,
                righteous: 0,
                spooky: 0,
                sorcery: 0,
                wild: 0,
                wind: 0,
            },
            deities: {
                Daethos: 0,
                Achreo: 0,
                Ahnve: 0,
                Astra: 0,
                Cambire: 0,
                Chiomyr: 0,
                Fyer: 0,
                Ilios: 0,
                Kyngi: 0,
                Kyrisos: 0,
                Kyrna: 0,
                Lilos: 0,
                Maanre: 0,
                Nyrolus: 0,
                Quorei: 0,
                Rahvre: 0,
                Senari: 0,
                Sedyro: 0,
                Sevas: 0,
                Shrygei: 0,
                Tshaer: 0,
            },
            prayers: { 
                buff: 0, 
                damage: 0, 
                debuff: 0, 
                heal: 0,
                avarice: 0, 
                denial: 0, 
                dispel: 0, 
                silence: 0, 
             },
        };
        this.luckout = {
            arbituous: { 
                failures: 0,
                successes: 0,
                total: 0,
            }, 
            chiomic: { 
                failures: 0,
                successes: 0,
                total: 0,
            }, 
            kyrnaic: { 
                failures: 0,
                successes: 0,
                total: 0,
            }, 
            lilosian: { 
                failures: 0,
                successes: 0,
                total: 0,
            }, 
            
        };
        this.mastery = { 
            constitution: 0, 
            strength: 0, 
            agility: 0, 
            achre: 0, 
            caeren: 0, 
            kyosir: 0 
        };
        this.persuasion = {
            arbituous: {
                failures: 0,
                successes: 0,
                total: 0,
            }, 
            chiomic: {
                failures: 0,
                successes: 0,
                total: 0,
            },
            fyeran: {
                failures: 0,
                successes: 0,
                total: 0,
            },
            ilian: {
                failures: 0,
                successes: 0,
                total: 0,
            },
            kyrnaic: {
                failures: 0,
                successes: 0,
                total: 0,
            },
            lilosian: {
                failures: 0,
                successes: 0,
                total: 0,
            },
            shaorahi: {
                failures: 0,
                successes: 0,
                total: 0,
            },
        };
        this.thievery = {
            failures: 0,
            successes: 0,
            total: 0,
            totalValue: 0,
        };
        this.relationships = {
            deity: {
                name: '', // This occurs when you meet a deity a second time, you can reinforce you believe it's *that* deity and it'll name them then.
                behaviors: [],
                Compliant: { 
                    occurrence: 0,
                    value: 0,
                 },
                Disobedient: { 
                    occurrence: 0,
                    value: 0,
                 },
                Faithful: { 
                    occurrence: 0,
                    value: 0,
                 },
                Unfaithful: { 
                    occurrence: 0,
                    value: 0,
                 },
                value: 0,
            }
        };
        this.mastery[mastery as keyof typeof this.mastery] = 1;
        console.log(this.mastery, 'Mastery!');
    };
    [key: string]: any;
};

// export type Statistics = {
//     combat: { // Some combat things will be every duel, some will be every level
//         losses: number,
//         total: number,
//         wins: number,
//         actions: {
//             attacks: number,
//             parries: number,
//             dodges: number,
//             postures: number,
//             rolls: number,
//             invokes: number,
//             consumes: number,
//             prayers: number,
//             thrusts: number,
//             rushes: number,
//             storms: number,
//             leaps: number,
//             arcs: number,
//             achires: number,
//             quors: number,
//             writhes: number,
//         },
//         attacks: { 
//             magical: number, 
//             physical: number, 
//             total: number,
//             blunt: number,
//             pierce: number,
//             slash: number,
//             earth: number,
//             fire: number,
//             frost: number,
//             lightning: number,
//             righteous: number,
//             spooky: number,
//             sorcery: number,
//             wild: number,
//             wind: number,
//         },
//         deities: {
//             Daethos: number,
//             Achreo: number,
//             Ahnve: number,
//             Astra: number,
//             Cambire: number,
//             Chiomyr: number,
//             Fyer: number,
//             Ilios: number,
//             Kyngi: number,
//             Kyrisos: number,
//             Kyrna: number,
//             Lilos: number,
//             Maanre: number,
//             Nyrolus: number,
//             Quorei: number,
//             Rahvre: number,
//             Senari: number,
//             Sedyro: number,
//             Sevas: number,
//             Shrygei: number,
//             Tshaer: number,
//         },
//         prayers: { 
//             buff: number, 
//             damage: number, 
//             debuff: number, 
//             heal: number,
//             avarice: number, 
//             denial: number, 
//             dispel: number, 
//             silence: number, 
//          },
//     },
//     luckout: {
//         arbituous: { 
//             failures: number,
//             successes: number,
//             total: number,
//         }, 
//         chiomic: { 
//             failures: number,
//             successes: number,
//             total: number,
//         }, 
//         kyrnaic: { 
//             failures: number,
//             successes: number,
//             total: number,
//         }, 
//         lilosian: { 
//             failures: number,
//             successes: number,
//             total: number,
//         }, 
        
//     },
//     mastery: { 
//         constitution: number, 
//         strength: number, 
//         agility: number, 
//         achre: number, 
//         caeren: number, 
//         kyosir: number 
//     },
//     persuasion: {
//         arbituous: {
//             failures: number,
//             successes: number,
//             total: number,
//         }, 
//         chiomic: {
//             failures: number,
//             successes: number,
//             total: number,
//         },
//         fyeran: {
//             failures: number,
//             successes: number,
//             total: number,
//         },
//         ilian: {
//             failures: number,
//             successes: number,
//             total: number,
//         },
//         kyrnaic: {
//             failures: number,
//             successes: number,
//             total: number,
//         },
//         lilosian: {
//             failures: number,
//             successes: number,
//             total: number,
//         },
//         shaorahi: {
//             failures: number,
//             successes: number,
//             total: number,
//         },
//     },
//     thievery: {
//         failures: number,
//         successes: number,
//         total: number,
//         totalValue: number,
//     },
//     relationships: {
//         deity: {
//             name: string, // This occurs when you meet a deity a second time, you can reinforce you believe it's *that* deity and it'll name them then.
//             behaviors: [],
//             Compliant: { 
//                 occurrence: number,
//                 value: number,
//              },
//             Disobedient: { 
//                 occurrence: number,
//                 value: number,
//              },
//             Faithful: { 
//                 occurrence: number,
//                 value: number,
//              },
//             Unfaithful: { 
//                 occurrence: number,
//                 value: number,
//              },
//             value: number,
//         }
//     },
// };

export const initStatistics = new Statistics('statistics', 'constitution');

export const createStatistics = (id: string, mastery: string): Statistics => new Statistics(id, mastery);