export default function subset(superObj, subObj) {
    return Object.keys(subObj).every(ele => {
        if (typeof subObj[ele] == 'object') {
            return subset(superObj[ele], subObj[ele]);
        }
        return subObj[ele] === superObj[ele]
    });
};