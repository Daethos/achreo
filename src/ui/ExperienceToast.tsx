import { Toast } from 'solid-bootstrap'
import { Accessor, Setter } from 'solid-js'
interface Props {
    show: Accessor<boolean>;
    setShow: Setter<boolean>;
    alert: Accessor<{ header: string; body: string } | undefined>;
    setAlert: Setter<{ header: string; body: string } | undefined>;
};
export default function ExperienceToast({ show, setShow, alert, setAlert }: Props) {
    function close(): void {
        setShow(!show());
        setAlert(undefined)
    };
    const toast = {
        'border': '0.05em solid #0f0',
        'box-shadow': '0 0 1em #0f0',
        'bottom': '0',
    };
    return <Toast class='toast' onClose={() => close()} show={show()} delay={3000} autohide style={toast}>
        <p style={{ 'font-size': '0.875em', margin: '0.25em' }}>
            <strong class="me-auto">{alert()?.header}</strong>
        </p>
        <svg height="5" width="100%" class="tapered-rule mt-2">
            <polyline points="0,0 200,2.5 0,5"></polyline>
        </svg>
        <p class='center' style={{ 'font-size': '0.75em', margin: '0.75em', color: 'green', 'font-weight': 600 }}>
            {alert()?.body}
        </p>
    </Toast>;
};