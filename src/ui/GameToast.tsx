import { Toast } from 'solid-bootstrap';
import { Accessor, Setter, Show } from 'solid-js';
interface Props { 
    actions: any;
    show: Accessor<boolean>;
    setShow: Setter<boolean>;
    alert: Accessor<{ header: string; body: string, delay: number, key?: string, arg: any } | undefined>;
    setAlert: Setter<{ header: string; body: string, delay: number, key?: string, arg: any }>;
};
export default function GameToast({ actions, show, setShow, alert, setAlert }: Props) {
    function performAction(actionName: string) {
        const actionFunction = actions[actionName as keyof typeof actions];
        // console.log(alert(), 'Alert', actionFunction);
        if (actionFunction) actionFunction(alert()?.arg);
    };
    function close(): void {
        setShow(!show());
        setAlert(undefined as unknown as { header: string; body: string, delay: number, arg: any });
    };
    const toast: any = {'position': alert()?.key !== '' ? 'absolute' : '', 'bottom': alert()?.key !== '' ? '45vh' : '0'};
    return <div class='cornerBL realize' style={{ width: '30%', 'z-index': 1 }}>
        <Toast class='toast' onClose={() => close()} show={show()} delay={alert()?.delay} autohide style={toast}>
            <p class='toastHeader'>{alert()?.header}</p>
            <svg height="5" width="100%" class="tapered-rule mt-2"><polyline points="0,0 200,2.5 0,5"></polyline></svg>
            <p class='center toastBody'>{alert()?.body}</p>
            <Show when={alert()?.key}>
            <button class='highlight toastButton' onClick={() => performAction(alert()?.key as string)}>{alert()?.key}</button>
            </Show>
        </Toast>
    </div>;
};