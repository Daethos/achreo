import { Accessor, JSX, createEffect, createSignal } from 'solid-js';
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
        // position: 'fixed',
        // width: '45vw',
        border: "none",
        'text-decoration': "none",
        'background-color': "transparent",
    },
    typewriterContainer: {
        'z-index': 9999,
        color: "gold",
        'text-align': "center",
        'text-shadow': "1.5px 1.5px 1.5px darkgoldenrod",
        margin: 'auto',
        'font-size': "16px",
        padding: "1em",
        'font-variant': "small-caps",
    },
    godBorderConstitution: {
        'margin-bottom': "5%",
        width: "25em",
        'margin-left': '-87.5%',
        // position: 'absolute',
        'margin-top': "5%",
        'border-radius': "50%",
        border: "2px solid #fdf6d8",
        'box-shadow': "0 0 3em #fdf6d8",
    },
    godBorderStrength: {
        'margin-bottom': "5%",
        width: "25em",
        'margin-left': '-87.5%',
        // position: 'absolute',
        'margin-top': "5%",
        'border-radius': "50%",
        border: "2px solid #ff0000",
        'box-shadow': "0 0 3em #ff0000",
    },
    godBorderAgility: {
        'margin-bottom': "5%",
        width: "25em",
        'margin-left': '-87.5%',
        // position: 'absolute',
        'margin-top': "5%",
        'border-radius': "50%",
        border: "2px solid #00ff00",
        'box-shadow': "0 0 3em #00ff00",
    },
    godBorderAchre: {
        'margin-bottom': "5%",
        width: "25em",
        'margin-left': '-87.5%',
        // position: 'absolute',
        'margin-top': "5%",
        'border-radius': "50%",
        border: "2px solid blue",
        'box-shadow': "0 0 3em blue",
    },
    godBorderCaeren: {
        'margin-bottom': "5%",
        width: "25em",
        'margin-left': '-87.5%',
        // position: 'absolute',
        'margin-top': "5%",
        'border-radius': "50%",
        border: "2px solid purple",
        'box-shadow': "0 0 3em purple",
    },
    godBorderKyosir: {
        'margin-bottom': "5%",
        width: "25em",
        'margin-left': '-87.5%',
        // position: 'absolute',
        'margin-top': "5%",
        'border-radius': "50%",
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
    const [el, setEl] = createSignal<HTMLDivElement | null>(null);
    let typed: Typed | null = null;

    (window as any).handleButton = (button: string) => {
        performAction(button);
    };

    const applyStyles = (element: any): void => {
        for (const [property, value] of Object.entries(styleMap[element?.attributes?.class?.value])) {
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
            if (element?.attributes?.class?.value) applyStyles(element);
            if (element?.tagName === "BUTTON" && element?.attributes?.["data-function-name"]?.value) applyEventListeners(element as HTMLElement);
            
            for (const child of element.children as any) traverseElement(child);
        };
        traverseElement(doc.body);
        return doc.body.innerHTML;
    };

    createEffect(() => {
        if (typed) {
            (typed as Typed).destroy();
        };

        if (el()) {
            typewriter(stringText);
        };
    });
    function typewriter(text: string | Accessor<string>) {
        const check = typeof text === 'function' ? text() : text;
        const clean = styleHTML(check);
        const interval = setInterval(() => scrollToBottom(), 750);
        const typedContent = {
            strings: [clean],
            typeSpeed: 25,
            backSpeed: 0,
            showCursor: false,
            onComplete: () => clearInterval(interval),
        };
        typed = new Typed(el(), typedContent);
        const scrollToBottom = () => {
            (el() as any).scrollTop = el()?.scrollHeight;
        };
        return () => {
            (typed as Typed).destroy();
            clearInterval(interval);    
        };
    };

    return (
        <div id="typewriter" ref={setEl} style={styling} />
    );
};

export default Typewriter;