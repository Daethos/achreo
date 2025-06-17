import { Accessor, JSX, createEffect, createSignal, onCleanup, onMount } from "solid-js";
import Typed from "typed.js";
import { EventBus } from "../game/EventBus";
type StyleMap = { [key: string]: JSX.CSSProperties };
const styleMap: StyleMap = {
    rebukeButton: {
        float: "right",
        "font-size": "24px",
        "z-index": 9999,
        "margin-left": "90vw",
        "margin-top": "5vh",
        color: "red",
        border: "none",
        "text-decoration": "none",
        "background-color": "transparent",
    },
    journeyText: {
        "margin-top": "5vh",
        color: "#fdf6d8",
        "font-size": "0.9em",
    },
    whisperText: {
        "font-size": "2em",
    },
    otherText: {
        "font-size": "1.1em",
        color: "red",
        "text-shadow": "1.5px 1.5px 1.5px darkred",
    },
    devotedText: {
        "font-size": "1.1em",
        color: "darkmagenta",
        "text-shadow": "1.5px 1.5px 1.5px purple",
    },
    adherentText: {
        "font-size": "1.1em",
        color: "orangered",
        "text-shadow": "1.5px 1.5px 1.5px red",
    },
    button: {
        "z-index": 9999,
        border: "none",
        "text-decoration": "none",
        "background-color": "transparent",
    },
    typewriterContainer: {
        "z-index": 9999,
        color: "gold",
        "text-align": "center",
        "text-shadow": "1.5px 1.5px 1.5px darkgoldenrod",
        margin: "auto",
        "font-size": "16px",
        padding: "1em",
        "font-variant": "small-caps",
    },
    godBorderConstitution: {
        "margin-bottom": "5%",
        "width": "25em",
        "margin-left": "-87.5%",
        "margin-top": "5%",
        "border-radius": "50%",
        border: "2px solid #fdf6d8",
        "box-shadow": "0 0 3em #fdf6d8",
    },
    godBorderStrength: {
        "margin-bottom": "5%",
        "width": "25em",
        "margin-left": "-87.5%",
        "margin-top": "5%",
        "border-radius": "50%",
        border: "2px solid #ff0000",
        "box-shadow": "0 0 3em #ff0000",
    },
    godBorderAgility: {
        "margin-bottom": "5%",
        "width": "25em",
        "margin-left": "-87.5%",
        "margin-top": "5%",
        "border-radius": "50%",
        border: "2px solid #00ff00",
        "box-shadow": "0 0 3em #00ff00",
    },
    godBorderAchre: {
        "margin-bottom": "5%",
        "width": "25em",
        "margin-left": "-87.5%",
        "margin-top": "5%",
        "border-radius": "50%",
        border: "2px solid blue",
        "box-shadow": "0 0 3em blue",
    },
    godBorderCaeren: {
        "margin-bottom": "5%",
        "width": "25em",
        "margin-left": "-87.5%",
        "margin-top": "5%",
        "border-radius": "50%",
        border: "2px solid purple",
        "box-shadow": "0 0 3em purple",
    },
    godBorderKyosir: {
        "margin-bottom": "5%",
        "width": "25em",
        "margin-left": "-87.5%",
        "margin-top": "5%",
        "border-radius": "50%",
        border: "2px solid gold",
        "box-shadow": "0 0 3em gold",
    },
    greenMarkup: {
        color: "#fdf6d8",
        "margin-right":"0.5em",
        "text-shadow": "1.5px 1.5px 1.5px green",
        "font-size": "16px",
        "font-weight": 700,
        display: "inline-block"
    },
    blueMarkup: {
        color: "#fdf6d8",
        "margin-right":"0.5em",
        "text-shadow": "1.5px 1.5px 1.5px blue",
        "font-size": "16px",
        "font-weight": 700,
        display: "inline-block"
    },
    purpleMarkup: {
        color: "#fdf6d8",
        "margin-right":"0.5em",
        "text-shadow": "1.5px 1.5px 1.5px purple",
        "font-size": "16px",
        "font-weight": 700,
        display: "inline-block"
    },
    darkorangeMarkup: {
        color: "#fdf6d8",
        // "margin-right":"1em",
        "text-shadow": "1.5px 1.5px 1.5px darkorange",
        "font-size": "16px",
        "font-weight": 700,
        display: "inline-block"
    },
    redMarkup: {
        color: "red",
        "text-shadow": "1.5px 1.5px 1.5px #fdf6d8",
        "font-size": "20px",
        "font-weight": 700,
        display: "inline-block"
    },
    goldMarkup: {
        color: "gold",
        "text-shadow": "1.5px 1.5px 1.5px #fdf6d8",
        "font-size": "20px",
        "font-weight": 700,
        display: "inline-block"
    },
    highlight: {
        color: "#fdf6d8", 
        background: "#000", 
        "border-radius": "0.25rem", 
        padding: "0.25rem 1rem", 
        margin: "0.5rem",
    },
    gold: {
        color: "gold"
    }
};
interface TypewriterProps {
    stringText: string | Accessor<any>;
    styling?: JSX.CSSProperties;
    performAction: (action: string) => void;
    main?: boolean;
};

export default function Typewriter({ stringText, styling, performAction, main }: TypewriterProps) {
    const [el, setEl] = createSignal<HTMLDivElement | null>(null);
    const [scrolling, setScrolling] = createSignal<boolean>(false);
    let observer: MutationObserver | undefined = undefined;
    let scrollTimeout: NodeJS.Timeout;
    let typed: Typed | null = null;
    let isTyping = false; // Flag to track typing status
    (window as any).handleButton = (button: string) => performAction(button);
    const applyStyles = (element: any): void => {
        for (const [property, value] of Object.entries(styleMap[element?.attributes?.class?.value])) {
            element.style[property as any] = value;
        };
    };
    const applyEventListeners = (element: HTMLElement): void => {
        const functionName = element?.attributes?.["data-function-name" as any]?.value;
        element.setAttribute("onclick", `handleButton("${functionName}")`);
    };
    function setupScrollObserver(containerSelector: any) {
        let container = document.querySelector(containerSelector);

        if (!container) {
            container = document.querySelector(".deity-type");
        };

        const observer = new MutationObserver(() => {
            if (scrolling()) return;
            container.scrollTo({
                top: container.scrollHeight,
                behavior: 'smooth'
            });
        });
        
        observer.observe(container, {
            childList: true,
            subtree: true,
            characterData: true
        });
        
        return observer;
    };
    
    const styleHTML = (html: string) => {
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
        if (typed) (typed as Typed).destroy();
        if (el()) {
            observer?.disconnect();
            observer = setupScrollObserver(".dialog-window");
            typewriter(stringText);
        };

        onCleanup(() => {
            observer?.disconnect();
        });
    });
    function typewriter(text: string | Accessor<string>) {
        const check = typeof text === "function" ? text() : text;
        const clean = styleHTML(check);
        const typedContent = {
            strings: [clean],
            typeSpeed: 30,
            backSpeed: 0,
            showCursor: false,
            onBegin: () => (isTyping = true), // Set flag when typing starts
            onComplete: () => {
                if (main) EventBus.emit("typing-complete");
                isTyping = false;
            }, // Clear flag when typing completes
        };
        typed = new Typed(el(), typedContent);
        return () => (typed as Typed).destroy();
    };

    const skipTyping = () => {
        if (isTyping && typed) {
            typed.destroy();
            isTyping = false;
            const check = typeof stringText === "function" ? stringText() : stringText;
            el()!.innerHTML = styleHTML(check);
            EventBus.emit("typing-complete");
        };
    }; // "white-space": "pre-wrap", 

    onMount(() => {
        const container = document.querySelector(".dialog-window");
        container?.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            setScrolling(true);
            scrollTimeout = setTimeout(() => {
                setScrolling(false);
            }, 500);
        });

        onCleanup(() => {
            container?.removeEventListener("scroll", () => {
                clearTimeout(scrollTimeout);
            });
        });
    });

    return (
        <div id="typewriter" onClick={skipTyping} ref={setEl} style={{"text-align": "left", ...styling}}></div>
    );
};