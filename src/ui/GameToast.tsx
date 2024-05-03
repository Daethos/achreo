import { Toast } from 'solid-bootstrap';
import { Accessor, JSX, Setter, Show, createEffect, createSignal } from 'solid-js';

interface Props {
    actions: any;
    show: Accessor<boolean>;
    setShow: Setter<boolean>;
    alert: Accessor<{ header: string; body: string, delay: number, key?: string } | undefined>;
    setAlert: Setter<{ header: string; body: string, delay: number, key?: string }>;
};

export default function GameToast({ actions, show, setShow, alert, setAlert }: Props) {
    function performAction(actionName: string) {
        const actionFunction = actions[actionName as keyof typeof actions];
        if (actionFunction) {
            actionFunction();
        };
    };
    function close(): void {
        setShow(!show());
        setAlert(undefined as unknown as { header: string; body: string, delay: number })
    };
    const toast: any = {
        'background-color': '#000',
        padding: '0.5em',
        margin: '0.5em',
        border: '0.1em solid #ffc700',
        'border-radius': '0.5em',
        'box-shadow': '0 0 1em #ffc700',
        // transform: 'scale(0.65)',
        position: alert()?.key !== '' ? 'absolute' : '', 
        bottom: alert()?.key !== '' ? '45vh' : '0',
    };
    return (
        <Toast onClose={() => close()} show={show()} delay={alert()?.delay} autohide style={toast}>
        <p style={{ 'font-size': '0.875em', margin: '0.25em', color: 'gold', 'font-weight': 600 }}>
            {alert()?.header}
        </p>
        <svg height="5" width="100%" class="tapered-rule mt-2">
            <polyline points="0,0 200,2.5 0,5"></polyline>
        </svg>
        <p class='center' style={{ 'font-size': '0.75em', margin: '0.75em', color: '#fdf6d8', 'font-weight': 500 }}>
            {alert()?.body}
        </p>
        <Show when={alert()?.key}>
            <button class='highlight' onClick={() => performAction(alert()?.key as string)} style={{ 'margin-left': '50%', transform: 'translateX(-50%)', 'font-size': '0.75em' }}>
                {alert()?.key}
            </button>
        </Show>
        </Toast>
    );
};