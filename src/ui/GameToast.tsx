import { Toast } from 'solid-bootstrap';
import { Accessor, Setter, Show } from 'solid-js';
import { Toast as Toaster } from '../App';
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
    const toast: any = {'position': alert()?.key !== '' ? 'absolute' : '', 'bottom': alert()?.extra ? '25vh' : alert()?.key !== '' ? '45vh' : '0' };
    return <div class='cornerBL realize' style={{ width: '30%', 'z-index': 1 }}>
        <Toast class='toast' onClose={() => close()} show={show()} delay={alert()?.delay} autohide style={toast}>
            <p class='toastHeader'>{alert()?.header}</p>
            <svg height="5" width="100%" class="tapered-rule mt-2"><polyline points="0,0 200,2.5 0,5"></polyline></svg>
            <p class='center toastBody' style={{ 'white-space': 'pre-wrap' }}>{alert()?.body}</p>
            <Show when={alert()?.extra}>
                <button class='highlight toastButton' onClick={() => performAction(alert()?.extra as string)}>{alert()?.extra}</button>
            </Show>
            <Show when={alert()?.key}>
                <button class='highlight toastButton' onClick={() => performAction(alert()?.key as string)}>{alert()?.key}</button>
            </Show>
        </Toast>
    </div>;
};