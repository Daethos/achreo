export default class NewText {
    public ctx: Phaser.Scene;
    public x: number;
    public y: number;
    public text: string;
    public code: string;
    public style: any;
    public origin: any;
    public obj: any;
    public width: number;
    public height: number;
    
    constructor(ctx: Phaser.Scene, x: number, y: number, string: string, style: string, origin: any, shadow: string | boolean) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.text = string;
        this.code = style;
        this.style = this.initStyle(style, shadow);
        this.origin = this.initOrigin(origin);
        this.obj = this.createText();
        this.width = this.obj.width;
        this.height = this.obj.height;
    };

    initStyle(key: string, shade: string | boolean) {
        if (shade === '') {
            const masteries = ['#fdf6d8', 'red', 'green', 'blue', 'purple', 'gold'];
            const index = Math.round(Math.random() * masteries.length);
            shade = masteries[index];
        };
        let shadow = {
            offsetX: 2,
            offsetY: 2,
            color: shade,
            blur: 5,
            stroke: true,
            fill: true
        };
        if (shade === false) {
            shadow = {
                offsetX: 0,
                offsetY: 0,
                blur: 0,
                color: '$fdf6d8',
                stroke: false,
                fill: false,
            };
        };
        let style = {
            fontFamily: 'Cinzel',
            fontSize: 24,
            color: '#fdf6d8',
            backgroundColor: '#000',
            stroke: '#000',
            strokeThickness: 2,
            shadow,
            align: 'center',
            padding: 5,
            wordWrap: {
                width: 840,
                useAdvancedWrap: true
            },
        };
        switch (key.toLowerCase()) {
            case 'supertitle':
                style.fontSize = 172;
                style.strokeThickness = 8;
                style.shadow.blur = 20;
                break;
            case 'title':
                style.fontSize = 112;
                style.strokeThickness = 6;
                style.shadow.blur = 15;
                break;
            case 'subtitle':
                style.fontSize = 72;
                style.strokeThickness = 2;
                style.shadow.blur = 2;
                break;
            case 'preload':
                style.fontSize = 48;
                style.strokeThickness = 1;
                style.shadow.blur = 1;
                break;
            case 'play':
                style.strokeThickness = 1;
                style.shadow.blur = 1;
                style.wordWrap.width = 640;
                break;
            case 'super':
                style.fontSize = 8;
                style.strokeThickness = 1;
                style.shadow.blur = 1;
                break;
            case 'clear':
                break;
        };
        return style;
    };

    initOrigin(origin: any) {
        if (typeof origin === 'number') {
            return {
                x: origin,
                y: origin
            };
        } else if (typeof origin === 'object') {
            return origin;
        };

        return {
            x: 0.5,
            y: 0.5
        };
    };

    createText () {
        let obj = this.ctx.add.text(
            this.x,
            this.y,
            this.text,
            this.style,
        );

        obj.setOrigin(this.origin.x, this.origin.y);
        return obj;
    };

    destroy () {
        this.obj.destroy(); 
        this.obj = false;
    };
      
    setText(string: string | string[]) {
        this.obj.text = string;
        this.obj.setText(string);
    };
    setX(x: number) {
        this.x = x;
        this.obj.setX(x);
    };
    setY(y: number) {
        this.y = y;
        this.obj.setY(y);
    };
    setOrigin(origin: number) {
        this.origin = this.initOrigin(origin);
        this.obj.setOrigin(origin);
    };
    setDepth(depth: number) {
        this.obj.setDepth(depth);
    };
    setScrollFactor(scrollX: number, scrollY: number) {
        this.obj.setScrollFactor(scrollX, scrollY);
    };

    getCenter() {
        return this.obj.getCenter();
    };
    getTopLeft() {
        return this.obj.getTopLeft();
    };
    getTopRight() {
        return this.obj.getTopRight();
    };
    getBottomLeft() {
        return this.obj.getBottomLeft();
    };
    getBottomRight() {
        return this.obj.getBottomRight();
    };
};