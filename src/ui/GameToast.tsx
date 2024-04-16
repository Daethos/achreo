import { Toast } from 'solid-bootstrap'
import { Accessor, Setter } from 'solid-js'
import { font } from '../utility/styling';

interface Props {
    show: Accessor<boolean>;
    setShow: Setter<boolean>;
    alert: Accessor<{ header: string; body: string } | undefined>;
    setAlert: Setter<{ header: string; body: string }>;
};

export default function GameToast({ show, setShow, alert, setAlert }: Props) {
    function close(): void {
        setShow(!show());
        setAlert(undefined as unknown as { header: string; body: string })
    };
    const toast = {
        'background-color': '#000',
        padding: '0.5em',
        margin: '0.5em',
        border: '0.05em solid #ffc700',
        'border-radius': '0.5em',
        // transform: 'scale(0.65)',
        bottom: '0',
    };
    return (
        <Toast onClose={() => close()} show={show()} delay={3000} autohide style={toast}>
        <p style={{ 'font-size': '0.875em', margin: '0.25em', color: 'gold' }}>
            <strong class="me-auto">{alert()?.header}</strong>
        </p>
        <svg height="5" width="100%" class="tapered-rule mt-2">
            <polyline points="0,0 200,2.5 0,5"></polyline>
        </svg>
        <p class='center' style={{ 'font-size': '0.75em', margin: '0.75em', color: '#fdf6d8', 'font-weight': 600 }}>
            {alert()?.body}
        </p>
        </Toast>
    );
};