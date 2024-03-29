export default function doc(criteria) {
    if (!criteria) {
        console.log('No criteria data specified. Provide key-value pair ala { _id: "001" }');
    } else if (typeof criteria !== 'string' && typeof criteria !== 'object') {
        console.log('Criteria data must be a string or an object.');
    } else {
        this.criteria = criteria
    };
    return this;
};