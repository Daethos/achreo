export default function updateObject(object/*, …*/) {
    for (let i = 1; i< arguments.length; i++) {
        for (let key in arguments[i]) {
            let value = arguments[i][key];
            object[key] = value;
        };
    };
    return object;
};