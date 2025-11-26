import level from "./level";
import reset from "./reset";
import subset from "./subset";

export default function get(options = { keys: false }) {
    this.getCollection = () => {
        let name = this.name;
        let property = this.property;
        let direction = this.direction;
        let limitBy = this.limitBy;
        let collection = [];

        return this.lf[name].iterate((value, key) => {
            let collectionItem = {};
            if (!options.keys) {
                collectionItem = value;
            } else {
                collectionItem = {
                    key: key,
                    data: value
                };
            };
            collection.push(collectionItem);
        }).then(() => {
            let logMessage = `Got "${name}" collection`;
            if (property) {
                logMessage += `, ordered by "${property}"`;
                if (!options.keys) {
                    collection.sort((a, b) => {
                        return a[property].toString().localeCompare(b[property].toString());
                    });
                } else {
                    collection.sort((a, b) => {
                        return a.data[property].toString().localeCompare(b.data[property].toString());
                    });
                }
            }
            if (direction == "desc") {
                logMessage += ` (descending)`;
                collection.reverse();
            }
            if (limitBy) {
                logMessage += `, limited to ${limitBy}`;
                collection = collection.splice(0, limitBy);
            }
            logMessage += `:`;
            console.log(logMessage);
            reset.call(this);
            return collection;
        });
    };
    this.getDocument = () => {
        let name = this.name;
        let criteria = this.criteria;
        
        let collection = [];
        let document = {};

        this.getDocumentByCriteria = () => {
            return this.lf[name].iterate((value, _key) => {
                if (subset(value, criteria)) {
                    collection.push(value);
                };
            }).then(() => {
                if (!collection.length) {
                    console.log("No document found.");
                } else {
                    document = collection[0];
                    reset.call(this);    
                    return document;
                };
            });
        };

        this.getDocumentByKey = () => {
            return this.lf[name].getItem(criteria).then((value) => {
                if (value == null) {
                    console.log("No document found.");
                } else {
                    document = value;
                    reset.call(this);
                    return document;
                };
            }).catch(err => {
                console.log("Could not get document.");
                reset.call(this);
            })
        };

        if (typeof criteria == "object") {
            return this.getDocumentByCriteria();
        } else {
            return this.getDocumentByKey();
        };
    };

    if (!(typeof options == "object" && options instanceof Array == false)) {
        console.log("Data must be an object.")
    } else {
        if (!options.hasOwnProperty("keys")) {
            console.log("Data must be an object with a key.")
        } else {
            if (typeof options.keys !== "boolean") console.log("Data must be an object with a boolean key.");
        };
    };
    let currentSelectionLevel = level.call(this);
    if (currentSelectionLevel == "collection") {
        return this.getCollection();
    } else if (currentSelectionLevel == "doc") {
        return this.getDocument();
    } else {
        console.log("No collection or document selected.")
    };
};