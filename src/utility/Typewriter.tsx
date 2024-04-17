import { Accessor, JSX, createEffect, createMemo, createSignal, onMount } from 'solid-js';
import Typed from "typed.js";

type StyleMap = { [key: string]: JSX.CSSProperties };

const styleMap: StyleMap = {
    rebukeButton: {
        float: "right",
        'font-size': "24px",
        'z-index': 9999,
        'margin-left': "90vw",
        'margin-top': "5vh",
        color: "red",
        border: "none",
        'text-decoration': "none",
        'background-color': "transparent",
    },
    journeyText: {
        'margin-top': "5vh",
        color: "#fdf6d8",
        'font-size': "0.9em",
    },
    whisperText: {
        'font-size': "2em",
    },
    otherText: {
        'font-size': "1.1em",
        color: "red",
        'text-shadow': "1.5px 1.5px 1.5px darkred",
    },
    devotedText: {
        'font-size': "1.1em",
        color: "darkmagenta",
        'text-shadow': "1.5px 1.5px 1.5px purple",
    },
    adherentText: {
        'font-size': "1.1em",
        color: "orangered",
        'text-shadow': "1.5px 1.5px 1.5px red",
    },
    button: {
        'z-index': 9999,
        border: "none",
        'text-decoration': "none",
        'background-color': "transparent",
    },
    typewriterContainer: {
        'z-index': 9999,
        color: "gold",
        display: "inline-block",
        'text-align': "center",
        'text-shadow': "1.5px 1.5px 1.5px darkgoldenrod",
        // maxHeight: '300px',
        // overflowY: "auto",
        // scrollbarWidth: 'none',
        width: "100%",
        'font-size': "16px",
        padding: "10px",
        'font-variant': "small-caps",
    },
    godBorderConstitution: {
        'margin-bottom': "15%",
        'margin-top': "5%",
        'border-radius': "50%",
        'max-width': "50%",
        border: "2px solid #fdf6d8",
        'box-shadow': "0 0 3em #fdf6d8",
    },
    godBorderStrength: {
        'margin-bottom': "15%",
        'margin-top': "5%",
        'border-radius': "50%",
        'max-width': "50%",
        border: "2px solid #ff0000",
        'box-shadow': "0 0 3em #ff0000",
    },
    godBorderAgility: {
        'margin-bottom': "15%",
        'margin-top': "5%",
        'border-radius': "50%",
        'max-width': "50%",
        border: "2px solid #00ff00",
        'box-shadow': "0 0 3em #00ff00",
    },
    godBorderAchre: {
        'margin-bottom': "15%",
        'margin-top': "5%",
        'border-radius': "50%",
        'max-width': "50%",
        border: "2px solid blue",
        'box-shadow': "0 0 3em blue",
    },
    godBorderCaeren: {
        'margin-bottom': "15%",
        'margin-top': "5%",
        'border-radius': "50%",
        'max-width': "50%",
        border: "2px solid purple",
        'box-shadow': "0 0 3em purple",
    },
    godBorderKyosir: {
        'margin-bottom': "15%",
        'margin-top': "5%",
        'border-radius': "50%",
        'max-width': "50%",
        border: "2px solid gold",
        'box-shadow': "0 0 3em gold",
    },
    greenMarkup: {
        color: "#fdf6d8",
        'text-shadow': "1.5px 1.5px 1.5px green",
        'font-size': "20px",
        'font-weight': 700,
        display: 'inline-block'
    },
    blueMarkup: {
        color: "#fdf6d8",
        'text-shadow': "1.5px 1.5px 1.5px blue",
        'font-size': "20px",
        'font-weight': 700,
        display: 'inline-block'
    },
    purpleMarkup: {
        color: "#fdf6d8",
        'text-shadow': "1.5px 1.5px 1.5px purple",
        'font-size': "20px",
        'font-weight': 700,
        display: 'inline-block'
    },
    darkorangeMarkup: {
        color: "#fdf6d8",
        'text-shadow': "1.5px 1.5px 1.5px darkorange",
        'font-size': "20px",
        'font-weight': 700,
        display: 'inline-block'
    },
    redMarkup: {
        color: "red",
        'text-shadow': "1.5px 1.5px 1.5px #fdf6d8",
        'font-size': "20px",
        'font-weight': 700,
        display: 'inline-block'
    },
    goldMarkup: {
        color: "gold",
        'text-shadow': "1.5px 1.5px 1.5px #fdf6d8",
        'font-size': "20px",
        'font-weight': 700,
        display: 'inline-block'
    },
};

interface TypewriterProps {
    stringText: string | Accessor<any>;
    styling?: JSX.CSSProperties;
    performAction: (action: string) => void;
};

const Typewriter = ({ stringText, styling, performAction }: TypewriterProps) => {
    // let el: any | undefined = undefined;
    const [el, setEl] = createSignal<HTMLDivElement | null>(null);
    const [count, setCount] = createSignal(0);
    const [update, setUpdate] = createSignal(0);

    (window as any).handleButton = (button: string) => {
        console.log(button, "Button Clicked");
        performAction(button);
    };

    const applyStyles = (element: HTMLElement, styles: JSX.CSSProperties): void => {
        for (const [property, value] of Object.entries(styles)) {
            element.style[property as any] = value;
        };
    };

    const applyEventListeners = (element: HTMLElement): void => {
        const functionName = element?.attributes?.["data-function-name" as any]?.value;
        element.setAttribute('onclick', `handleButton('${functionName}')`);
    };

    const styleHTML = ( html: string) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        const traverseElement = (element: any): void => {
            if (element?.attributes?.classname?.value) applyStyles(element as HTMLElement, styleMap[element?.attributes?.classname?.value]);
            if (element?.tagName === "BUTTON" && element?.attributes?.["data-function-name"]?.value) applyEventListeners(element as HTMLElement);
            
            for (const child of element.children as any) traverseElement(child);
        };
        traverseElement(doc.body);
        return doc.body.innerHTML;
    };

    createEffect(() => {
        // const check = typeof stringText === 'function' ? stringText() : stringText;
        // const clean = styleHTML(check);
        // const typedContent = {
        //     strings: [clean],
        //     typeSpeed: 25,
        //     backSpeed: 0,
        //     showCursor: false,
        //     onComplete: () => {
        //         clearInterval(scrollInterval);
        //         return;
        //     }
        // };
        
        // function scrollToBottom() {
        //     if (el) {
        //         el.scrollTop = el.scrollHeight;
        //     };
        // };

        // const typed = new Typed(el, typedContent);
        // const scrollInterval = setInterval(scrollToBottom, 1000); 
        // return () => {
        //     typed.destroy();
        //     clearInterval(scrollInterval);
        // };
        // el = undefined;
        typewriter(stringText);
        // if (update() !== count()) {
        //     console.log(update(), count(), 'Update');
        //     console.log('Update - Tear it up!');
        //     el = undefined;
        // };
    }); //  [stringText]

    function typewriter(text: string | Accessor<string>) {
        // need to wipe out the old typed instance
        // el = HTMLDivElement;
        // if (el() !== undefined) {
            // el.innerHTML = '';
            // console.log(el, 'Element')
            // el = undefined;
            // console.log(el, 'Element')
            // el = document.getElementById('typewriter');
        // };
        const check = typeof text === 'function' ? text() : text;
        const clean = styleHTML(check);
        const typedContent = {
            strings: [clean],
            typeSpeed: 20,
            backSpeed: 0,
            showCursor: false,
            onComplete: () => {
                // clearInterval(scrollInterval);
                return;
            }
        };
        
        // function scrollToBottom() {
        //     const element = el();
        //     if (element) {
        //         element.scrollTop = element.scrollHeight;
        //     };
        // };

        const typed = new Typed(el(), typedContent);
        // const scrollInterval = setInterval(scrollToBottom, 1000); 
        setCount((prev) => prev + 1);
        return () => {
            typed.destroy();
            // clearInterval(scrollInterval);
        };
    };

    return (
        <div id="typewriter" ref={setEl} style={styling} />
    );
};

export default Typewriter;