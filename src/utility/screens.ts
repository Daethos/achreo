import Ascean from "../models/ascean";

export type Screen = {
    KEY: string,
    TEXT: string,
    PREV: string,
    NEXT: string
};

export const SCREENS = {
    'CHARACTER': {
        KEY: 'CHARACTER',
        TEXT: 'Name',
        PREV: 'COMPLETE',
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
        NEXT: 'CHARACTER'
    }
};

export const LANDSCAPE_SCREENS = {
    'CHARACTER': {
        KEY: 'CHARACTER',
        TEXT: 'Name',
        PREV: 'COMPLETE',
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
        NEXT: 'CHARACTER'
    }
};

export type Menu = {
    asceans: Ascean[] | [],
    characterCreated: boolean,
    choosingCharacter: boolean,
    creatingCharacter: boolean,
    gameRunning: boolean,
    loaded: boolean,
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
    loaded: false,
    loading: true,
    screen: SCREENS.CHARACTER.KEY,
    deleteModal: false,
    playModal: false
};