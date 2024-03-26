export const styles = {
    container: {
        flex: 1,
        color: '#fdf6d8',
        backgroundColor: '#000000',
        alignItems: 'center',
        justifyContent: 'center',
        // borderColor: '#fdf6d8',
        // borderWidth: 1.5, // 0.15em
    },
    cinzelRegular: {
        fontFamily: 'Cinzel-Regular',
    },
    game: {
        flex: 1,
        width: '100%',
        height: '100%',
    }, 
    diamondShieldTop: {
        width: 0,
        height: 0,
        borderTopWidth: 50,
        borderTopColor: "transparent",
        borderLeftColor: "transparent",
        borderLeftWidth: 50,
        borderRightColor: "transparent",
        borderRightWidth: 50,
        borderBottomColor: "black",
        borderBottomWidth: 20,
    },
    diamondShieldBottom: {
        width: 0,
        height: 0,
        borderTopWidth: 70,
        borderTopColor: "black",
        borderLeftColor: "transparent",
        borderLeftWidth: 50,
        borderRightColor: "transparent",
        borderRightWidth: 50,
        borderBottomColor: "transparent",
        borderBottomWidth: 50,
    },
    
    enemyCombatUi: {
        position: 'absolute',
        top: 0,
        right: 0,
    },
    enemyName: {
        position: 'absolute',
        flex: 1,
        top: 1,
        left: '97.5vw',
        // left: '65%',
        fontFamily: 'Cinzel-Regular',
        textAlign: 'center', 
        fontSize: 16, // 1em
        color: 'gold',
        width: 150,
        // boxShadow: `${15} ${15} ${15} black`,
        // elevation: 2,
    },
    enemyPortrait: {
        marginTop: '-1%',
        boxShadow: `${15} ${15} ${15} black`,
        elevation: 2,
        zIndex: 1,
    },
    enemyPreview: {
        position: 'absolute',
        color: '#fdf6d8', 
        borderColor: '#fdf6d8', 
        textAlign: 'center', 
        // justifyContent: 'center',
        // alignItems: 'center',
        width: '25vw',
        // height: 50,
        borderRadius: 25,
        marginTop: '20%', // 35%
        marginLeft: '101.5vw', // 110vw
    },
    enemyHealthBar: {
        flex: 1,
        top: '6.5vh',
        left: '97vw', 
        width: 170, 
        height: 25, 
        borderRadius: 25, 
        overflow: 'hidden', 
        borderBlockColor: 'purple', 
        borderBlockWidth: 1.5, // 0.15em
        borderBlockStyle: 'solid'    
    },
    enemyHealthbarBorder: {
        position: 'absolute',
        top: 20,
        left: '97.5vw',
        width: 165,
        transform: [{ scale: 1.25 }],
        zIndex: 1,
    },
    enemyUiWeapon: {
        position: 'absolute',
        top: 12.5,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 50,
        transform: [{ scale: 1.25 }]
    },
    enemyItem: {
        position: "absolute", 
        left: '90vw', 
        top: 0
    },
    enemyCombatEffects: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        width: '100%',
        transform: 'scale(0.9)',
        top: 35,
        left: '90vw',
        zIndex: 1,
    },
    enemyStatusEffects: {
        position: 'absolute',
        textAlign: 'center',
    },
    playerStatusEffects: {
        position: 'absolute',
        textAlign: 'center',
    },
    smallHudButtons: {
        position: 'absolute',
        bottom: '1%',
        zIndex: 1,
        backgroundColor: 'black',
        // width: '3.5%',
        // height: '7.5%'
    },
    playerMenuHeading: {
        position: 'absolute',
        top: 10,
        left: '1%',
        fontFamily: 'Cinzel-Regular',
        fontSize: 16, // 1em
        textAlign: 'center',
        color: '#fdf6d8',
        backgroundColor: 'black',
        padding: 3,
        borderRightWidth: 1.5, // 0.15em
        borderLeftWidth: 1.5, // 0.15em
        borderBottomWidth: 1.5, // 0.15em
        borderTopWidth: 1.5, // 0.15em
        borderColor: '#fdf6d8',
    }, 
    healthbar: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        left: '15%',
        width: '70%',
        borderRadius: 25, 
        overflow: 'hidden', 
        borderColor: '#fdf6d8',
        borderWidth: 1.25,
        borderBlockColor: '#fdf6d8', 
        borderBlockWidth: 2, // 0.2em 
        borderBlockStyle: 'solid',
        // marginTop: 5,
        marginBottom: 10,
        
    },
    healthbarBorder: {
        margin: 5,
        borderTopColor: '#fdf6d8', 
        borderTopWidth: '#fdf6d8',
        borderBottomColor: '#fdf6d8', 
        borderBottomWidth: 1.5, // 0.15em 
        borderLeftColor: '#fdf6d8', 
        borderLeftWidth: 1.5, // 0.15em 
        borderRightColor: '#fdf6d8', 
        borderRightWidth: 1.5, // 0.15em
    },
    healthbarText: {
        fontFamily: 'Cinzel-Regular',
        textAlign: 'center',
        color: '#fdf6d8',
    },
    playerSetting: {
        top: 10,
        backgroundColor: "black", 
        color: "#fdf6d8", 
        borderColor: "#fdf6d8",
        borderWidth: 1, 
        textAlign: "center",
        padding: 5 
    },
    playerInventory: {
        padding: 5,
        zIndex: 1
    },
    playerSaveInventoryOuter: {
        fontFamily: 'Cinzel-Regular',
        textAlign: 'center',
        position: 'absolute',
        color: '#fdf6d8',
        right: 40,
    },    
    playerSettingSelect: {
        fontFamily: 'Cinzel-Regular',
        textAlign: 'center',
        position: 'absolute',
        color: '#fdf6d8',
        right: 40,
    },    
    storyBlock: {
        position: 'fixed',
        left: 50,
        top: 25,
        backgroundColor: '#000000',
        height: '90%',
        width: '27%',
        overflow: 'scroll',
        borderColor: 'gold',
        borderRightWidth: 1.5, // 0.15em
        borderBottomWidth: 1.5, // 0.15em
        borderTopWidth: 1.5, // 0.15em
        borderLeftWidth: 1.5, // 0.15em
        zIndex: 1,
    },
    playerInventoryBag: {
        height: '100%',
        width: '100%',
        zIndex: 1,
    },
    storyWindows: {
        position: "fixed", 
        transform: 'scale(0.9, 0.7)', 
        top: '-25%',
        left: '-7.5%', 
    },
    playerWindow: {
        flex: 1,
        position: 'absolute',
        top: 40,
        color: '#fdf6d8',
        textAlign: 'center',
        backgroundColor: '#000000',
        height: '80vh',
        width: '32%',
        borderColor: 'gold',
        borderRightWidth: 1.5, // 0.15em
        borderBottomWidth: 1.5, // 0.15em
        borderTopWidth: 1.5, // 0.15em
        borderLeftWidth: 1.5, // 0.15em
        overflow: 'scroll',
    },
    cardBorder: {
        marginLeft: 'auto',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardButton: {
        color: '#fdf6d8',
        textAlign: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 'auto',
    },
    dialogButtonsInner: {
        fontSize: 12, // 0.75em
        fontVariant: 'small-caps',
        color: 'green'
    },
    imageCardGrid: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',        
    },
    imageCardLeft: {
        borderLeftColor: '#fdf6d8',
        borderLeftWidth: 1,
    },
    imageCardMiddle: {

        borderLeftColor: '#fdf6d8',
        borderLeftWidth: 1,
        borderRightColor: '#fdf6d8',
        borderRightWidth: 1,
    },
    imageCardRight: {
        borderRightColor: '#fdf6d8',
        borderRightWidth: 1,
    }, 
    lootDropWindow: {
        position: 'absolute',
        top: '65%',
        left: '12.5%',
    },
    inlineText: {
        textAlign: 'center',
        fontSize: 18, // 1.25em
    },
    buttonPic: {
        width: 25,
        height: 25,

    },
    deityPic: {
        width: 75,
        height: 75,
        borderRadius: 50,
        borderWidth: 1.5,
        borderColor: '#fdf6d8',
        margin: 'auto',
    },
    originPic: {
        width: 50,
        height: 50,
        borderWidth: 1.5,
        borderRadius: 50,
        borderColor: '#fdf6d8',
        margin: 'auto',
    },
    originBonus: {
        color: 'gold',
    },
    builder: {
        borderColor: '#fdf6d8',
        borderTopWidth: 1.5, // 0.15em
        borderBottomWidth: 1.5, // 0.15em
        borderLeftWidth: 1.5, // 0.15em
        borderRightWidth: 1.5, // 0.15em
        width: '90%',
        margin: 'auto',
    },
    asceanName: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        margin: 'auto',
        width: '100%',
        height: '100%',
    },
    center: {
        flex: 1,
        textAlign: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        // margin: 'auto',
    },
    border: {
        borderColor: '#fdf6d8',
        borderTopWidth: 1.5, // 0.15em
        borderBottomWidth: 1.5, // 0.15em
        borderLeftWidth: 1.5, // 0.15em
        borderRightWidth: 1.5, // 0.15em
        borderRadius: 5,
        padding: 2.5,
    },
    grid: {
        gap: 5,
        display: 'flex',
        flexDirection: 'row',  
        overflow: 'scroll',      
        // width: '80%',
        margin: 'auto',
    },
    table: {
        flex: -1,
        // borderColor: 'red',
        // borderWidth: 2,
        // marginBottom: 10,
     },
     row: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
     },
     cell: {
        flex: 1,
        padding: 5,
        borderWidth: 1,
        height: '100%',
        maxWidth: '50%',
        fontFamily: 'Cinzel-Regular',
        textAlign: "center",
        justifyContent: "center",
        alignItems: "center",
        fontSize: 16,
        fontWeight: '600',
        color: "#fdf6d8",
        borderColor: "#fdf6d8",
     },
    // flexible: {
    //     display: 'flex',
    //     justifyContent: 'center',
    //     alignItems: 'center',
    // },
    basicText: {
        color: '#fdf6d8',
        fontSize: 12, // 0.75em
        margin: 'auto',
        textAlign: 'center',
    }, 
    gold: {
        color: '#ffd700'
    },
    // highlight: {
    //     backgroundColor: '#000000',
    //     borderRadius: 5,
    //     margin: 5
    // },
    headline: {
        width: '100%',
        borderColor: '#5a0043',
        borderBottomWidth: 1.5, // 0.15em
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: 5,
        marginBottom: 5,
        color: '#fdf6d8',
        fontFamily: 'Cinzel-Regular',
        fontSize: 18, // 1.15em
        borderBottomColor: '#fdf6d8',
        borderBottomWidth: 2,
    },
    headerH1: {
        fontFamily: 'Cinzel-Bold',
        fontSize: 32, // 1.5em
        color: 'gold',
        margin: 'auto',
        borderBottomColor: '#5a0043',
        borderBottomWidth: 3, // 0.15e
    },
    modal: {
        position: 'absolute',
        backgroundColor: '#000',
        height: '100%',
        width: '100%',
        zIndex: 2,
    }, 
    popover: {
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        overflow: 'scroll',
        backgroundColor: '#000000',
        borderColor: '#fdf6d8',
        borderTopWidth: 1.5, // 0.15em
        borderBottomWidth: 1.5, // 0.15em
        borderLeftWidth: 1.5, // 0.15em
        borderRightWidth: 1.5, // 0.15em
        borderRadius: 10, // 0.5em
        boxShadow: `${15} ${15} ${15} #fdf6d8`,
        elevation: 2,
    },
    right: {
        // position: 'absolute',
        // right: 0,
        // textAlign: 'right',
        // width: '50%',
    },
    scrollView: {
        flex: 1,
        width: '100%',
        // height: '100%',
        margin: 'auto',
        overflow: 'scroll',
    },
    select: {
        backgroundColor: '#000000',
        color: '#fdf6d8',
        borderTopColor: '#fdf6d8',
        borderTopWidth: 1.5, // 0.15em
        borderBottomColor: '#fdf6d8',
        borderBottomWidth: 1.5, // 0.15em
        borderLeftColor: '#fdf6d8',
        borderLeftWidth: 1.5, // 0.15em
        borderRightColor: '#fdf6d8',
        borderRightWidth: 1.5, // 0.15em
        borderRadius: 5,
        padding: 5,
        fontSize: 16, // 1em
        margin: 5,
    },
    // slider: {
    //     width: '100%',
    //     margin: 'auto',
    //     backgroundColor: '0x000000',
    //     color: 'gold',
    // },
    // superscript: {
    //     fontSize: 6, // 0.35em
    //     verticalAlign: 'super',
    //     border: 'none'
    // },
    // taper: {
    //     width: '90%',
    //     textAlign: 'center',
    //     margin: 'auto',
    // },
    title: {
        fontFamily: 'Cinzel-Bold',
        fontSize: 16, // 1em
        color: '#fdf6d8',
        backgroundColor: 'black',
        borderBottomColor: '#fdf6d8',
        borderBottomWidth: 1,
        borderEndEndRadius: 5,
        top: 2,
        left: 4,
    },
    wrap: {
        display: 'flex',
        flexWrap: 'wrap',
        width: '90%',
        maxWidth: '90%',
        marginLeft: '5%',
        textAlign: 'center',
        margin: 'auto',
    },
    ph4: {
        fontSize: 18, // 1.25em
    },
    statBlock: { 
        height: '95%',
        width: '95%',
        // minWidth: 280, 
        borderRadius: 10, // 1em
        margin: 0,
        paddingTop: '0.5em',
        paddingBottom: 10,
        flexGrow: 1,
        textAlign: 'center',
    },
    statBlockWide: { 
        width: '95%',
        // minWidth: 280, 
        margin: 0, 
        textAlign: 'center',
    },
    // sectionLeft: { display: 'inline-block', verticalAlign: 'top', width: '48%', textAlign: 'left', marginRight: 1.5, },
    // sectionRight: { display: 'inline-block', verticalAlign: 'top', width: '48%', textAlign: 'left', marginRight: 1.5, },
    // orangeBorderBottom: { width: '95%', borderRadius: 25 },
    // taperedRule: {
    //     width: '100%',
    //     height: '0.5em',
    //     border: 'none',
    //     color: '#5a0043',
    //     fill: '#5a0043',
    //     stroke: '#5a0043',
    // },
    creatureHeadingH1: {
        fontFamily: 'Cinzel-Bold',
        fontSize: 24, // 1.35em
        color: 'gold',
        margin: 'auto',
        fontVariant: 'small-caps',
    },
    creatureHeadingH2: {
        color: '#fdf6d8',
        fontStyle: 'italic',
        fontSize: 16, // 1em
        marginBottom: 2,
        margin: 'auto',
    },
    // abilitiesDiv: {
    //     display: 'inline-block',
    //     verticalAlign: 'middle',
    //     width: '30%',
    //     minWidth: 50, 
    //     fontSize: 12, // 0.75em
    // },
    // abilitiesH4: {
    //     color: '#5a0043',
    //     marginTop: 1,
    //     marginBottom: 1,
    //     fontSize: 18, // 1.25em
    //     textTransform: 'uppercase',
    // },
    // abilitiesP: {
    //     color: '#fdf6d8',
    //     marginBottom: 1,
    // },
    // propertyBlock: {
    //     fontStyle: 'italic',
    //     padding: 3,
    // },
    // actionsH3: {
    //     borderBottomColor: '#5a0043',
    //     borderBottomWidth: 1,
    //     color: '#5a0043',
    //     fontSize: 18, // 1.25em
    //     fontVariant: 'small-caps',
    //     marginTop: 3,
    //     paddingBottom: 1.5,
    //     textIndent: 1,
    // },
    // actions: {
    //     marginBottom: 3,
    // },
    stdInput: {
        fontFamily: 'Cinzel-Regular',
        backgroundColor: '#000000',
        color: '#fdf6d8',
        borderColor: '#fdf6d8',
        borderTopWidth: 1, // 0.15em
        borderBottomWidth: 1, // 0.15em
        borderLeftWidth: 1, // 0.15em
        borderRightWidth: 1, // 0.15em
        borderRadius: 5,
        padding: 5,
        fontSize: 16, // 1em
        margin: 5,
    },
    borderless: {
        borderColor: 'transparent',
    },
    bottomLeftCorner: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        backgroundColor: 'black', // '#5a0043',
        color: '#fdf6d8',
        fontSize: 16, // 1em
        borderRadius: 5,
    },
    bottomRightCorner: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: 'black', // '#5a0043',
        color: '#fdf6d8',
        fontSize: 16, // 1em
        borderRadius: 5,
    },
    corner: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: 'black', // '#5a0043',
        color: '#fdf6d8',
        fontSize: 16, // 1em
        borderRadius: 5,
    },
    topLeftCorner: {
        position: 'absolute',
        backgroundColor: 'black', // '#5a0043',
        top: 0,
        left: 0,
        fontSize: 16, // 1em
        borderRadius: 5,
    },    
    stdLabel: {
        position: 'absolute',
        display: 'inline-block',
        color: '#fdf6d8',
        fontSize: 16, // 1em
        margin: 10,
    },
};