import reset from "./reset";
import { v4 as uuidv4 } from 'uuid';

export default function add(data, keyProvided) {
    if (!data) {
        console.log('No data specified. Provide keyProvided-value pair ala { name: "John" }');
    } else if (typeof data !== 'string' && typeof data !== 'object') {
        console.log('Data must be a string or an object.');
    };

    let name = this.name;

    return new Promise((res, rej) => {
        let key = null;
        if (!keyProvided) {
            key = uuidv4();
        } else {
            key = keyProvided;
        };

        return this.lf[name].setItem(key, data).then(() => {
            res(success.call(this, `Document added to "${name}" collection.`, { key, data }));
        }).catch(_err => {
            rej(error.call(this, `Could not add document to "${name}" collection.`));
        });
    });
};

export function success(message, data) {
    reset.call(this);
    return {
        success: true,
        message,
        data
    };
};

export function error(message) {
    reset.call(this);
    return {
        success: false,
        message
    };
};