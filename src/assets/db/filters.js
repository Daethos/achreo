export function limit(ceiling) {
    if (!ceiling) {
        console.log('Limitless');
    } else if (!Number(isInteger(ceiling))) {
        console.log('Ceiling must be an integer');
    } else {
        this.limit = ceiling;
    };
    return this;
};

export function order(property,direction) {
    if (!property) {
        console.log('No property specified');
    } else if (typeof property !== 'string') {
        console.log('Property must be a string');
    } else {
        this.property = property;
    };
    if (direction) {
        if (direction !== 'asc' && direction !== 'desc') {
            console.log('Direction must be asc or desc');
        } else {
            this.direction = direction;
        };
    };
    return this;
}