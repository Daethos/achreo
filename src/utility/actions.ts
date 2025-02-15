import { PLAYER } from "./player";

export const ACTION_ORIGIN = {
    ATTACK: {
        name: 'Attack',
        description: "A slower, focused strike. Capable of dual wielding.",
        cooldown: `1.25s`,
        cost: `${PLAYER.STAMINA.ATTACK} Stamina`,
        time: 'Instant',
        special: '(Physical)',
        svg: 'ATTACK',
        talent: '',
    },
    DODGE: {
        name: 'Dodge',
        description: "A pure and quick(est) evasive maneuver.",
        cooldown: `0.75s`,
        cost: `${PLAYER.STAMINA.DODGE} Stamina`,
        time: 'Instant',
        special: '(Physical)',
        svg: 'DODGE',
        talent: '',
    },
    PARRY: {
        name: 'Parry',
        description: "If melee, can parry enemy strikes and projectiles. If ranged, can counterspell the casting and channeling of enemies.",
        cooldown: `0.75s`,
        cost: `${PLAYER.STAMINA.PARRY} Stamina`,
        time: 'Instant',
        special: '(Physical)',
        svg: 'PARRY',
        talent: '',
    },
    POSTURE: {
        name: 'Posture',
        description: "A defensive strike. Raises your shield and adds to your defense.",
        cooldown: `1.25s`,
        cost: `${PLAYER.STAMINA.POSTURE} Stamina`,
        time: 'Instant',
        special: '(Physical)',
        svg: 'POSTURE',
        talent: '',
    },
    ROLL: {
        name: 'Roll',
        description: "An evasive maneuever. Can strike enemies when melee.",
        cooldown: `0.75s`,
        cost: `${PLAYER.STAMINA.ROLL} Stamina`,
        time: 'Instant',
        special: '(Physical)',
        svg: 'ROLL',
        talent: '',
    },
    THRUST: {
        name: 'Thrust',
        description: "A quick strike that is difficult to evade or parry. Deals reduced damage.",
        cooldown: `1.25s`,
        cost: `${PLAYER.STAMINA.THRUST} Stamina`,
        time: 'Instant',
        special: '(Physical)',
        svg: 'THRUST',
        talent: '',
    },


    INVOKE: {
        name: 'Invoke',
        description: "Your mastery and adherence or devotion dictate what you can pray for in an instant, calling it from your weapon's influence regardless of given favor.",
        cooldown: `${PLAYER.COOLDOWNS.LONG / 1000}s`,
        cost: `${PLAYER.STAMINA.INVOKE} Grace`,
        time: 'Prayer',
        special: '(Targeted)',
        svg: 'INVOKE',
        talent: '',
    },
    CONSUME: {
        name: 'Consume',
        description: "Consume a prayer during combat to get receive steps into the land of hush and tendril tendril of its essence.",
        cooldown: `${PLAYER.COOLDOWNS.SHORT / 1000}s`,
        cost: `${PLAYER.STAMINA.CONSUME} Grace`,
        time: 'Instant',
        special: '(Targeted)',
        svg: 'SHIELD',
        talent: '',
    },
    ABSORB: {
        name: 'Absorb',
        description: "A warped tendril wrapped round you that protects the player from melee and ranged attacks at the cost of grace.",
        cooldown: `${PLAYER.COOLDOWNS.MODERATE / 1000}s`,
        cost: `${PLAYER.STAMINA.ABSORB} Grace`,
        time: 'Instant',
        special: 'Negation Bubble',
        svg: 'CONSUME',
        talent: '',
    },
    ACHIRE: {
        name: 'Achire',
        description: "Entwine your achre and caer through your weapon to release a powerful projectile.",
        cooldown: `${PLAYER.COOLDOWNS.SHORT / 1000}s`,
        cost: `${PLAYER.STAMINA.ACHIRE} Grace`,
        time: '1.5s',
        special: 'Cast. Projectile',
        svg: 'CAST',
        talent: 'Stuns enemy on hit.',
    },
    ARC: {
        name: 'Arc',
        description: "Power up into an attack, hitting with four times the potential.",
        cooldown: `${PLAYER.COOLDOWNS.SHORT / 1000}s`,
        cost: `${PLAYER.STAMINA.ARC} Grace`,
        time: '3s',
        special: 'Channel. Attack',
        svg: 'WEAPONS',
        talent: 'Creates Shockwave. Larger Radius.',
    },
    ASTRAVE: {
        name: 'Astrave',
        description: "Uproot tendrils, damaging and stunning all caught in its grasp.",
        cooldown: `${PLAYER.COOLDOWNS.SHORT / 1000}s`,
        cost: `${PLAYER.STAMINA.ASTRAVE} Grace`,
        time: '1.5s',
        special: 'Cast. AoE (Manual)',
        svg: 'AOE',
        talent: '',
    },
    ASTRICATION: {
        name: 'Astrication',
        description: "Strikes cannot be evaded.",
        cooldown: `${PLAYER.COOLDOWNS.LONG / 1000}s`,
        cost: `${PLAYER.STAMINA.ASTRICATION} Grace`,
        time: 'Instant',
        special: '(Buff)',
        svg: 'CAST',
        talent: '',
    },
    BERSERK: {
        name: 'Berserk',
        description: "Strikes grow stronger the more you are attacked.",
        cooldown: `${PLAYER.COOLDOWNS.LONG / 1000}s`,
        cost: `${PLAYER.STAMINA.BERSERK} Grace`,
        time: 'Instant',
        special: '(Buff)',
        svg: 'CONSUME',
        talent: '',
    },
    BLIND: {
        name: 'Blind',
        description: "Your brilliance blinds all who are impure.",
        cooldown: `${PLAYER.COOLDOWNS.SHORT / 1000}s`,
        cost: `${PLAYER.STAMINA.INVOKE} Grace`,
        time: 'Instant',
        special: 'AoE (Self)',
        svg: 'CAST',
        talent: '',
    },
    BLINK: {
        name: 'Blink',
        description: "Use your caeren to teleport a short distance forward, if you are moving.",
        cooldown: `${PLAYER.COOLDOWNS.SHORT / 1000}s`,
        cost: `${PLAYER.STAMINA.BLINK} Grace`,
        time: 'Instant',
        special: 'Movement',
        svg: 'INVOKE',
        talent: 'Increases Speed for 3 Seconds.',
    },
    CAERENESIS: {
        name: 'Caerenesis',
        description: "Uproot tendrils, damaging and fearing all caught in its grasp.",
        cooldown: `${PLAYER.COOLDOWNS.SHORT / 1000}s`,
        cost: `${PLAYER.STAMINA.CAERENESIS} Grace`,
        time: 'Instant',
        special: 'AoE (Target)',
        svg: 'AOE',
        talent: '',
    },
    CHIOMIC: {
        name: 'Chiomic',
        description: "A hush steps into the land of hush and tendril proliferates, confusing enemies caught in its mocking blast.",
        cooldown: `${PLAYER.COOLDOWNS.MODERATE / 1000}s`,
        cost: `${PLAYER.STAMINA.CHIOMIC} Grace`,
        time: 'Instant',
        special: 'AoE (Self)',
        svg: 'CONSUME',
        talent: 'Increased Radius.',
    },
    CONFUSE: {
        name: 'Confuse',
        description: "Inspire confusion in your opponent for several seconds. Damage may break this effect.",
        cooldown: `${PLAYER.COOLDOWNS.SHORT / 1000}s`,
        cost: `${PLAYER.STAMINA.CONFUSE} Grace`,
        time: '1.5s',
        special: 'Cast. Targeted',
        svg: 'CAST',
        talent: 'May not break from damage.',
    },
    CONVICTION: {
        name: 'Conviction',
        description: "Strikes grow stronger in succession.",
        cooldown: `${PLAYER.COOLDOWNS.LONG / 1000}s`,
        cost: `${PLAYER.STAMINA.CONVICTION} Grace`,
        time: 'Instant',
        special: '(Buff)',
        svg: 'CAST',
        talent: 'Costs 0 Grace.',
    },
    DESPERATION: {
        name: 'Desperation',
        description: "Heals you for a dramatic amount (50%).",
        cooldown: `${PLAYER.COOLDOWNS.LONG / 1000}s`,
        cost: `${PLAYER.STAMINA.DESPERATION} Grace`,
        time: 'Instant',
        special: '(Self)',
        svg: 'INVOKE',
        talent: 'Increases healing to 75%.',
    },
    DEVOUR: {
        name: 'Devour',
        description: "Lifedrain your opponent of their caer, restoring your own.",
        cooldown: `${PLAYER.COOLDOWNS.LONG / 1000}s`,
        cost: `${PLAYER.STAMINA.DEVOUR} Grace`,
        time: 'Instant',
        special: 'Physical',
        svg: 'VOICE',
        talent: '',
    },
    DISEASE: {
        name: 'Disease',
        description: "A hush that proliferates, damaging enemies caught in its malice every second.",
        cooldown: `${PLAYER.COOLDOWNS.MODERATE / 1000}s`,
        cost: `${PLAYER.STAMINA.DISEASE} Grace`,
        time: 'Instant',
        special: 'AoE (Self)',
        svg: 'AOE',
        talent: '',
    },
    DISPEL: {
        name: 'Dispel',
        description: "Removes the enemies defensive shields.",
        cooldown: `${PLAYER.COOLDOWNS.MODERATE / 1000}s`,
        cost: `${PLAYER.STAMINA.DISPEL} Grace`,
        time: 'Instant',
        special: '(Targeted)',
        svg: 'CAST',
        talent: '',
    },
    ENDURANCE: {
        name: 'Endurance',
        description: "Pour your caeren back into your physical form, dramatically recovering stamina.",
        cooldown: `${PLAYER.COOLDOWNS.LONG / 1000}s`,
        cost: `${PLAYER.STAMINA.ENDURANCE} Grace`,
        time: 'Instant',
        special: '(Buff)',
        svg: 'BEAM',
        talent: '',
    },
    ENVELOP: {
        name: 'Envelop',
        description: "A warped tendril wrapped round you that protects the player from melee and ranged attacks at the cost of stamina.",
        cooldown: `${PLAYER.COOLDOWNS.MODERATE / 1000}s`,
        cost: `${PLAYER.STAMINA.ENVELOP} Grace`,
        time: 'Instant',
        special: 'Negation Bubble',
        svg: 'SHIELD',
        talent: '',
    },
    FEAR: {
        name: 'Fear',
        description: "Inspire fear in your opponent, causing them to run in terror for several seconds. Damage may break this effect.",
        cooldown: `${PLAYER.COOLDOWNS.MODERATE / 1000}s`,
        cost: `${PLAYER.STAMINA.FEAR} Grace`,
        time: '1.5s',
        special: 'Cast. Targeted',
        svg: 'CAST',
        talent: '',
    },
    FREEZE: {
        name: 'Freeze',
        description: "A hush that proliferates, freezing enemies caught in its grasp for several seconds.",
        cooldown: `${PLAYER.COOLDOWNS.SHORT / 1000}s`,
        cost: `${PLAYER.STAMINA.FREEZE} Grace`,
        time: 'Instant',
        special: 'AoE (Self)',
        svg: 'AOE',
        talent: '',
    },
    FROST: {
        name: 'Frost',
        description: "You seize into this world with Nyrolean tendrils, slowing them.",
        cooldown: `${PLAYER.COOLDOWNS.SHORT / 1000}s`,
        cost: `${PLAYER.STAMINA.FROST} Grace`,
        time: '1.5s',
        special: 'Cast. Targeted',
        svg: 'CAST',
        talent: '',
    },
    FYERUS: {
        name: 'Fyerus',
        description: "Uprooted tendrils, damaging enemies and snaring enemies caught in their grasp.",
        cooldown: `${PLAYER.COOLDOWNS.SHORT / 1000}s`,
        cost: `${PLAYER.STAMINA.FYERUS} Grace`,
        time: '6s',
        special: 'Channel. AoE (Manual)',
        svg: 'BEAM',
        talent: '',
    },
    HEALING: {
        name: 'Healing',
        description: "Heals for a moderate amount (25%).",
        cooldown: `${PLAYER.COOLDOWNS.SHORT / 1000}s`,
        cost: `${PLAYER.STAMINA.HEALING} Grace`,
        time: '1.5s',
        special: 'Cast',
        svg: 'CAST',
        talent: '',
    },
    HOOK: {
        name: 'Hook',
        description: "You rip a tendril through this world, hungry for caer and the flesh.",
        cooldown: `${PLAYER.COOLDOWNS.SHORT / 1000}s`,
        cost: `${PLAYER.STAMINA.HOOK} Grace`,
        time: 'Instant',
        special: 'Physical',
        svg: 'CAST',
        talent: '',
    },
    HOWL: {
        name: 'Howl',
        description: "A hush that proliferates, stunning enemies caught in its piercing blast for several seconds.",
        cooldown: `${PLAYER.COOLDOWNS.MODERATE / 1000}s`,
        cost: `${PLAYER.STAMINA.HOWL} Grace`,
        time: 'Instant',
        special: 'AoE (Self)',
        svg: 'VOICE',
        talent: '',
    },
    ILIRECH: {
        name: 'Ilirech',
        description: "You rip into this world with Ilian tendrils.",
        cooldown: `${PLAYER.COOLDOWNS.SHORT / 1000}s`,
        cost: `${PLAYER.STAMINA.ILIRECH} Grace`,
        time: '1.5s',
        special: 'Cast. Targeted',
        svg: 'CAST',
        talent: '',
    },
    IMPERMANENCE: {
        name: 'Impermanence',
        description: "Your evasion becomes ethereal.",
        cooldown: `${PLAYER.COOLDOWNS.SHORT / 1000}s`,
        cost: `${PLAYER.STAMINA.IMPERMANENCE} Grace`,
        time: 'Instant',
        special: '(Buff)',
        svg: 'BEAM',
        talent: '',
    },
    KYNISOS: {
        name: 'Kynisos',
        description: "Uprooted tendrils, rooting enemies caught in their grasp for several seconds.",
        cooldown: `${PLAYER.COOLDOWNS.SHORT / 1000}s`,
        cost: `${PLAYER.STAMINA.KYNISOS} Grace`,
        time: '1s Cast',
        special: 'AoE (Manual)',
        svg: 'AOE',
        talent: '',
    },
    KYRNAICISM: {
        name: 'Kyrnaicism',
        description: "Belittle and mock your opponent of their caer, damaging and slowing them.",
        cooldown: `${PLAYER.COOLDOWNS.MODERATE / 1000}s`,
        cost: `${PLAYER.STAMINA.KYRNAICISM} Grace`,
        time: '3s',
        special: 'Channel. Targeted',
        svg: 'BEAM',
        talent: '',
    },
    LEAP: {
        name: 'Leap',
        description: "Use your strength to leap a short distance, damaging enemies on impact.",
        cooldown: `${PLAYER.COOLDOWNS.SHORT / 1000}s`,
        cost: `${PLAYER.STAMINA.LEAP} Grace`,
        time: 'Instant',
        special: 'Combat Movement',
        svg: 'WEAPONS',
        talent: '',
    },
    LIKYR: {
        name: 'Likyr',
        description: "Blend caeren from the enemy and absorb it into you, healing for a portion of damage done.",
        cooldown: `${PLAYER.COOLDOWNS.MODERATE / 1000}s`,
        cost: `${PLAYER.STAMINA.LIKYR} Grace`,
        time: '1.5s',
        special: 'Cast. Targeted',
        svg: 'CAST',
        talent: '',
    },
    MAIERETH: {
        name: 'Maiereth',
        description: "You bleed and strike with tendrils of Ma'anre.",
        cooldown: `${PLAYER.COOLDOWNS.SHORT / 1000}s`,
        cost: `${PLAYER.STAMINA.MAIERETH} Grace`,
        time: '1s',
        special: 'Cast. (Targeted)',
        svg: 'CAST',
        talent: '',
    },
    MALICE: {
        name: 'Malice',
        description: "A warped tendril wrapped round you that damages the enemy through 6 successful attacks from them.",
        cooldown: `${PLAYER.COOLDOWNS.MODERATE / 1000}s`,
        cost: `${PLAYER.STAMINA.MALICE} Grace`,
        time: 'Instant',
        special: 'Reactive Bubble',
        svg: 'SHIELD',
        talent: '',
    },
    MARK: {
        name: 'Mark',
        description: "A sliver of a tendril wraps round the ground at your feet, awaiting your return.",
        cooldown: `${PLAYER.COOLDOWNS.SHORT / 1000}s`,
        cost: `${PLAYER.STAMINA.MARK} Grace`,
        time: 'Prayer',
        special: 'Physical',
        svg: 'CAST',
        talent: '',
    },
    MENACE: {
        name: 'Menace',
        description: "A warped tendril wrapped round you that protects the player through 3 melee and ranged attacks, fearing the enemy.",
        cooldown: `${PLAYER.COOLDOWNS.LONG / 1000}s`,
        cost: `${PLAYER.STAMINA.MENACE} Grace`,
        time: 'Instant',
        special: 'Reactive Bubble',
        svg: 'SHIELD',
        talent: '',
    },
    MEND: {
        name: 'Mend',
        description: "A warped tendril wrapped round you that heals through 6 successful attacks from the enemy.",
        cooldown: `${PLAYER.COOLDOWNS.LONG / 1000}s`,
        cost: `${PLAYER.STAMINA.MEND} Grace`,
        time: 'Instant',
        special: 'Reactive Bubble',
        svg: 'SHIELD',
        talent: '',
    },
    MODERATE: {
        name: 'Moderate',
        description: "A warped tendril wrapped round you that protects through 6 successful melee and ranged attacks, slowing the enemy.",
        cooldown: `${PLAYER.COOLDOWNS.LONG / 1000}s`,
        cost: `${PLAYER.STAMINA.MODERATE} Grace`,
        time: 'Instant',
        special: 'Reactive Bubble',
        svg: 'SHIELD',
        talent: '',
    },
    MULTIFARIOUS: {
        name: 'Multifarious',
        description: "A warped tendril wrapped round you that protects through 3 successful melee and ranged attacks, polymorphing the enemy.",
        cooldown: `${PLAYER.COOLDOWNS.LONG / 1000}s`,
        cost: `${PLAYER.STAMINA.MULTIFARIOUS} Grace`,
        time: 'Instant',
        special: 'Reactive Bubble',
        svg: 'SHIELD',
        talent: '',
    },
    MYSTIFY: {
        name: 'Mystify',
        description: "A warped tendril wrapped round you that protects through 3 successful melee and ranged attacks, confusing the enemy.",
        cooldown: `${PLAYER.COOLDOWNS.LONG / 1000}s`,
        cost: `${PLAYER.STAMINA.MYSTIFY} Grace`,
        time: 'Instant',
        special: 'Reactive Bubble',
        svg: 'SHIELD',
        talent: '',
    },
    NETHERSWAP: {
        name: 'Netherswap',
        description: "Say a little prayer to swap places with your target.",
        cooldown: `${PLAYER.COOLDOWNS.SHORT / 1000}s`,
        cost: `${PLAYER.STAMINA.NETHERSWAP} Grace`,
        time: 'Prayer',
        special: 'Physical',
        svg: 'CAST',
        talent: '',
    },
    PARALYZE: {
        name: 'Paralyze',
        description: "Paralyze your opponent for several seconds, causing them to be disabled for the duration.",
        cooldown: `${PLAYER.COOLDOWNS.MODERATE / 1000}s`,
        cost: `${PLAYER.STAMINA.PARALYZE} Grace`,
        time: '1.5s',
        special: 'Cast. Targeted',
        svg: 'CAST',
        talent: '',
    },
    POLYMORPH: {
        name: 'Polymorph',
        description: "Turn your opponent into a fluffy bunny for several seconds. Damage may break this effect.",
        cooldown: `${PLAYER.COOLDOWNS.SHORT / 1000}s`,
        cost: `${PLAYER.STAMINA.POLYMORPH} Grace`,
        time: '1.5s',
        special: 'Cast. Targeted',
        svg: 'CAST',
        talent: '',
    },
    PROTECT: {
        name: 'Protect',
        description: "A warped tendril wrapped round you that protects the player from melee and ranged attacks for several seconds.",
        cooldown: `${PLAYER.COOLDOWNS.LONG / 1000}s`,
        cost: `${PLAYER.STAMINA.PROTECT} Grace`,
        time: 'Instant',
        special: 'Negation Bubble',
        svg: 'SHIELD',
        talent: '',
    },
    PURSUIT: {
        name: 'Pursuit',
        description: "Step into the land of hush and tendril, reentering this world at the foot of your foe.",
        cooldown: `${PLAYER.COOLDOWNS.MODERATE / 1000}s`,
        cost: `${PLAYER.STAMINA.PURSUIT} Grace`,
        time: 'Instant',
        special: 'Physical',
        svg: 'CONSUME',
        talent: '',
    },
    QUOR: {
        name: 'Quor',
        description: "Entwine your achre and caer through your weapon to release an immensely powerful projectile.",
        cooldown: `${PLAYER.COOLDOWNS.SHORT / 1000}s`,
        cost: `${PLAYER.STAMINA.QUOR} Grace`,
        time: '3s',
        special: 'Cast. Projectile',
        svg: 'CAST',
        talent: '',
    },
    RECALL: {
        name: 'Recall',
        description: "Say a little prayer to recall toward that sliver of tendril you left behind.",
        cooldown: `${PLAYER.COOLDOWNS.SHORT / 1000}s`,
        cost: `${PLAYER.STAMINA.RECALL} Grace`,
        time: 'Prayer',
        special: 'Physical',
        svg: 'CAST',
        talent: '',
    },
    RECONSTITUTE: {
        name: 'Reconstitute',
        description: "Heals for a light amount (15%) every tick.",
        cooldown: `${PLAYER.COOLDOWNS.MODERATE / 1000}s`,
        cost: `${PLAYER.STAMINA.RECONSTITUTE} Grace`,
        time: '5s',
        special: 'Channel',
        svg: 'BEAM',
        talent: '',
    },
    RECOVER: {
        name: 'Recover',
        description: "A warped tendril wrapped round you that recovers stamina from melee and ranged attacks.",
        cooldown: `${PLAYER.COOLDOWNS.MODERATE / 1000}s`,
        cost: `${PLAYER.STAMINA.RECOVER} Grace`,
        time: 'Instant',
        special: 'Reactive Bubble',
        svg: 'SHIELD',
        talent: '',
    },
    REIN: {
        name: 'Rein',
        description: "A warped tendril wrapped round you that recovers grace from melee and ranged attacks.",
        cooldown: `${PLAYER.COOLDOWNS.MODERATE / 1000}s`,
        cost: `${PLAYER.STAMINA.REIN} Grace`,
        time: 'Instant',
        special: 'Reactive Bubble',
        svg: 'SHIELD',
        talent: '',
    },
    RENEWAL: {
        name: 'Renewal',
        description: "A hush that proliferates, healing you every second.",
        cooldown: `${PLAYER.COOLDOWNS.MODERATE / 1000}s`,
        cost: `${PLAYER.STAMINA.RENEWAL} Grace`,
        time: 'Instant',
        special: 'AoE (Self)',
        svg: 'AOE',
        talent: '',
    },
    ROOT: {
        name: 'Root',
        description: "Ensorcel your opponent in a magic root, preventing them from moving for several seconds.",
        cooldown: `${PLAYER.COOLDOWNS.SHORT / 1000}s`,
        cost: `${PLAYER.STAMINA.ROOT} Grace`,
        time: 'Prayer',
        special: '(Targeted)',
        svg: 'AOE',
        talent: '',
    },
    RUSH: {
        name: 'Rush',
        description: "Use your agility to rush a short distance toward your cursor, if you are moving, damaging enemies in the path.",
        cooldown: `${PLAYER.COOLDOWNS.SHORT / 1000}s`,
        cost: `${PLAYER.STAMINA.RUSH} Grace`,
        time: 'Instant',
        special: 'Combat Movement',
        svg: 'WEAPONS',
        talent: '',
    },
    SACRIFICE: {
        name: 'Sacrifice',
        description: "Rip the caeren from yourself and blend it into your enemy, damaging them for twice the portion of damage done to you.",
        cooldown: `${PLAYER.COOLDOWNS.MODERATE / 1000}s`,
        cost: `${PLAYER.STAMINA.SACRIFICE} Grace`,
        time: 'Instant',
        special: '(Targeted)',
        svg: 'SACRIFICE',
        talent: '',
    },
    SCREAM: {
        name: 'Scream',
        description: "A hush that proliferates, fearing enemies caught in its piercing shriek for several seconds.",
        cooldown: `${PLAYER.COOLDOWNS.SHORT / 1000}s`,
        cost: `${PLAYER.STAMINA.SCREAM} Grace`,
        time: 'Instant',
        special: 'AoE (Self)',
        svg: 'VOICE',
        talent: '',
    },
    SEER: {
        name: 'Seer',
        description: "Your next strike is critical.",
        cooldown: `${PLAYER.COOLDOWNS.MODERATE / 1000}s`,
        cost: `${PLAYER.STAMINA.SEER} Grace`,
        time: 'Instant',
        special: '(Buff)',
        svg: 'INVOKE',
        talent: '',
    },
    SHADOW: {
        name: 'Shadow',
        description: "When hit with worldy devises, your caeren pursues the enemy.",
        cooldown: `${PLAYER.COOLDOWNS.MODERATE / 1000}s`,
        cost: `${PLAYER.STAMINA.SHADOW} Grace`,
        time: 'Instant',
        special: 'Physical',
        svg: 'CONSUME',
        talent: '',
    },
    SHIELD: {
        name: 'Shield',
        description: "A warped tendril wrapped round you that absorbs 6 successful attacks from the enemy.",
        cooldown: `${PLAYER.COOLDOWNS.LONG / 1000}s`,
        cost: `${PLAYER.STAMINA.SHIELD} Grace`,
        time: 'Instant',
        special: 'Negation Bubble',
        svg: 'SHIELD',
        talent: '',
    },
    SHIMMER: {
        name: 'Shimmer',
        description: "You step into the land of hush and tendril, attemping to evade the enemy attacks.",
        cooldown: `${PLAYER.COOLDOWNS.MODERATE / 1000}s`,
        cost: `${PLAYER.STAMINA.SHIMMER} Grace`,
        time: 'Instant',
        special: '(Buff)',
        svg: 'SHIELD',
        talent: '',
    },
    SHIRK: {
        name: 'Shirk',
        description: "Your caeren wraps round your physical body harmonize it from burdens.",
        cooldown: `${PLAYER.COOLDOWNS.SHORT / 1000}s`,
        cost: `${PLAYER.STAMINA.SHIRK} Grace`,
        time: 'Instant',
        special: 'Negation (Self)',
        svg: 'INVOKE',
        talent: '',
    },
    SLOW: {
        name: 'Slow',
        description: "Weigh down your opponent's caer, slowing their movement speed moderately for several seconds.",
        cooldown: `${PLAYER.COOLDOWNS.SHORT / 1000}s`,
        cost: `${PLAYER.STAMINA.SLOW} Grace`,
        time: 'Instant',
        special: '(Targeted)',
        svg: 'INVOKE',
        talent: '',
    },
    SNARE: {
        name: 'Snare',
        description: "Weigh down your opponent's caer, slowing their movement speed dramatically for several seconds.",
        cooldown: `${PLAYER.COOLDOWNS.SHORT / 1000}s`,
        cost: `${PLAYER.STAMINA.SNARE} Grace`,
        time: '1.5s',
        special: 'Cast. Targeted',
        svg: 'CAST',
        talent: '',
    },
    SPRINT: {
        name: 'Sprint',
        description: "Step into the land of hush and tendril, dramatically increasing your movement for several seconds.",
        cooldown: `${PLAYER.COOLDOWNS.MODERATE / 1000}s`,
        cost: `${PLAYER.STAMINA.SPRINT} Grace`,
        time: 'Instant',
        special: 'Movement',
        svg: 'INVOKE',
        talent: '',
    },
    STIMULATE: {
        name: 'Stimulate',
        description: "Your caeren taps into your physical form, refreshing its ability to host its othernature.",
        cooldown: `${PLAYER.COOLDOWNS.LONG / 1000}s`,
        cost: `${PLAYER.STAMINA.STIMULATE} Grace`,
        time: 'Instant',
        special: '(Refresh)',
        svg: 'INVOKE',
        talent: '',
    },
    STORM: {
        name: 'Storm',
        description: "Storm through enemies caught in your contortions with your weapon every second.",
        cooldown: `${PLAYER.COOLDOWNS.SHORT / 1000}s`,
        cost: `${PLAYER.STAMINA.STORM} Grace`,
        time: '3s',
        special: 'Channel',
        svg: 'SACRIFICE',
        talent: '',
    },
    SUTURE: {
        name: 'Suture',
        description: "Rip the caeren from the enemy and blend it into you, healing for a portion of damage done.",
        cooldown: `${PLAYER.COOLDOWNS.MODERATE / 1000}s`,
        cost: `${PLAYER.STAMINA.SUTURE} Grace`,
        time: 'Instant',
        special: '(Targeted)',
        svg: 'CONSUME',
        talent: '',
    },
    TETHER: {
        name: 'Tether',
        description: "When hit with worldly devises, your caeren rips and hooks the enemy.",
        cooldown: `${PLAYER.COOLDOWNS.MODERATE / 1000}s`,
        cost: `${PLAYER.STAMINA.TETHER} Grace`,
        time: 'Instant',
        special: 'Physical',
        svg: 'CAST',
        talent: '',
    },
    WARD: {
        name: 'Ward',
        description: "A warped tendril wrapped round you that protects the player from melee and ranged attacks, stunning the enemy.",
        cooldown: `${PLAYER.COOLDOWNS.LONG / 1000}s`,
        cost: `${PLAYER.STAMINA.WARD} Grace`,
        time: 'Instant',
        special: 'Negation Bubble',
        svg: 'SHIELD',
        talent: '',
    },
    WRITHE: {
        name: 'Writhe',
        description: "A hush that proliferates, damaging enemies caught in your contortions with your weapon.",
        cooldown: `${PLAYER.COOLDOWNS.SHORT / 1000}s`,
        cost: `${PLAYER.STAMINA.WRITHE} Grace`,
        time: 'Instant',
        special: 'AoE (Self)',
        svg: 'WEAPONS',
        talent: '',
    },
};