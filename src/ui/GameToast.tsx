import { Toast } from "solid-bootstrap";
import { Accessor, Setter, Show } from "solid-js";
import { Toast as Toaster } from "../App";
interface Props { 
    actions: any;
    show: Accessor<boolean>;
    setShow: Setter<boolean>;
    alert: Accessor<Toaster | undefined>;
    setAlert: Setter<Toaster>;
};
export default function GameToast({ actions, show, setShow, alert, setAlert }: Props) {
    function performAction(actionName: string) {
        const actionFunction = actions[actionName as keyof typeof actions];
        if (actionFunction) actionFunction(alert()?.arg);
    };
    function close(): void {
        setShow(!show());
        setAlert(undefined as unknown as { header: string; body: string, delay: number, arg: any });
    };
    const poly = innerWidth * 0.35;
    return <div class={`${alert()?.key ? "cornerTR" : "cornerBL"} realize`} style={{ width: "35%", "z-index": 1001 }}>
        <Toast class="toast" onClose={() => close()} show={show()} delay={alert()?.delay} autohide>
            <p class="toastHeader" style={{ "font-size": "1rem" }}>{alert()?.header}</p>
            <svg height="5" width="100%" class="tapered-rule mt-2"><polyline points={`0,0 ${poly},2.5 0,5`}></polyline></svg>
            <p class="center toastBody" style={{ "font-size": "0.75rem", "white-space": "pre-wrap" }}>{alert()?.body}</p>
            <Show when={alert()?.extra || alert()?.key}>
            <div style={{ "margin": "25% auto 0" }}>
                <Show when={alert()?.extra}>
                    <button class="highlight toastButton animate" style={{ position: "absolute", "font-size": "0.85rem", left: "7.5%", bottom: "10%" }} onClick={() => performAction(alert()?.extra as string)}>{alert()?.extra}</button>
                </Show>
                <Show when={alert()?.key}>
                    <button class="highlight toastButton" style={{ position: "absolute", "font-size": "0.85rem", right: alert()?.extra ? "7.5%" : "50%", bottom: "10%", transform: alert()?.extra ? "" : "translateX(50%)" }} onClick={() => performAction(alert()?.key as string)}>{alert()?.key}</button>
                </Show>
            </div>
            </Show>
        </Toast>
    </div>;
};