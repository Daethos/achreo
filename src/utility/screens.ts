import Ascean from "../models/ascean";

export type Screen = {
    KEY: string,
    TEXT: string,
    PREV: string,
    NEXT: string
};

export const SCREENS = {
    'PREMADE': {
        KEY: 'PREMADE',
        TEXT: 'Name',
        PREV: 'COMPLETE',
        NEXT: 'CHARACTER'
    },
    'CHARACTER': {
        KEY: 'CHARACTER',
        TEXT: 'Name',
        PREV: 'PREMADE',
        NEXT: 'ORIGIN'
    },
    'ORIGIN': {
        KEY: 'ORIGIN',
        TEXT: 'Origin',
        PREV: 'CHARACTER',
        NEXT: 'PREFERENCE'
    }, 
    'PREFERENCE': {
        KEY: 'PREFERENCE',
        TEXT: 'Mastery',
        PREV: 'ORIGIN',
        NEXT: 'ATTRIBUTES'
    },
    'ATTRIBUTES': {
        KEY: 'ATTRIBUTES',
        TEXT: 'Stats',
        PREV: 'PREFERENCE',
        NEXT: 'COMPLETE'
    },
    'COMPLETE': {
        KEY: 'COMPLETE',
        TEXT: 'Create',
        PREV: 'ATTRIBUTES',
        NEXT: 'PREMADE'
    }
};

export const LANDSCAPE_SCREENS = {
    'PREMADE': {
        KEY: 'PREMADE',
        TEXT: 'Premade',
        PREV: 'COMPLETE',
        NEXT: 'CHARACTER'
    },
    'CHARACTER': {
        KEY: 'CHARACTER',
        TEXT: 'Name',
        PREV: 'PREMADE',
        NEXT: 'ATTRIBUTES'
    },
    'ATTRIBUTES': {
        KEY: 'ATTRIBUTES',
        TEXT: 'Stats',
        PREV: 'CHARACTER',
        NEXT: 'COMPLETE'
    },
    'COMPLETE': {
        KEY: 'COMPLETE',
        TEXT: 'Create',
        PREV: 'ATTRIBUTES',
        NEXT: 'PREMADE'
    }
};

export type Menu = {
    asceans: Ascean[] | [],
    characterCreated: boolean,
    choosingCharacter: boolean,
    creatingCharacter: boolean,
    gameRunning: boolean,
    loading: boolean,
    screen: string,
    deleteModal: boolean,
    playModal: boolean,
}; 

export const initMenu: Menu = {
    asceans: [] as Ascean[] | [],  
    characterCreated: false, 
    choosingCharacter: false,   
    creatingCharacter: false,
    gameRunning: false,
    loading: true, // true
    screen: SCREENS.CHARACTER.KEY,
    deleteModal: false,
    playModal: false
};