var Fullscreen = {
    available: false,
    cancel: '',
    keyboard: false,
    request: '',
    target: document.getElementById('base-ui')
};

export function fullScreen() {
    // @ts-ignore
    if (typeof importScripts === 'function') {
        console.log('returning fullscreen')
        return Fullscreen;
    };
    var i;
    var suffix1 = 'Fullscreen';
    var suffix2 = 'FullScreen';

    var fs = [
        'request' + suffix1,
        'request' + suffix2,
        'webkitRequest' + suffix1,
        'webkitRequest' + suffix2,
        'msRequest' + suffix1,
        'msRequest' + suffix2,
        'mozRequest' + suffix2,
        'mozRequest' + suffix1
    ];
    for (i = 0; i < fs.length; i++) {
        // @ts-ignore
        if (document.documentElement[fs[i]]) {
            Fullscreen.available = true;
            Fullscreen.request = fs[i];
            break;
        };
    };

    var cfs = [
        'cancel' + suffix2,
        'exit' + suffix1,
        'webkitCancel' + suffix2,
        'webkitExit' + suffix1,
        'msCancel' + suffix2,
        'msExit' + suffix1,
        'mozCancel' + suffix2,
        'mozExit' + suffix1
    ];

    if (Fullscreen.available) {
        for (i = 0; i < cfs.length; i++) {
            // @ts-ignore
            if (document[cfs[i]]) {
                Fullscreen.cancel = cfs[i];
                break;
            };
        };
    };
    
    // @ts-ignore
    if (window['Element'] && Element['ALLOW_KEYBOARD_INPUT'] && !(/ Version\/5\.1(?:\.\d+)? Safari\//).test(navigator.userAgent)) {
        Fullscreen.keyboard = true;
    };

    // @ts-ignore
    Object.defineProperty(Fullscreen, 'active', { get: function () { return !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement); } });
    return Fullscreen;
};