import subset from "./subset";
import { error, success } from "./add";
import level from "./level";

export default function set(newDoc, options = { keys: false }) {
    let name = this.name;
    let criteria = this.criteria;
    let level = level.call(this);

    return new Promise((res, rej) => {
        this.setCollection = () => {
            this.lf[name].clear().then(() => {
                if (!options.keys) {
                    newDoc.forEach(doc => {
                        this.add(doc);
                    });
                    res(success.call(
                        this,
                        `Collection "${name}" set with ${newDoc.length} Documents.`,
                        newDoc
                    ));
                } else {
                    console.log('Keys Provided');
                    let docsWithoutKey = 0;
                    newDoc.forEach(doc => {
                        if (!doc.hasOwnProperty('_key')) {
                            docsWithoutKey++;
                        };
                    });
                    if (docsWithoutKey) {
                        rej(error.call(
                            this,
                            `Documents provided to .set() in an array must each have a _key property set to a string.`
                        ));
                    } else {
                        newDoc.forEach(doc => {
                            let key = doc._key;
                            delete doc._key;
                            this.add(doc, key);
                        });
                        res(success.call(
                            this,
                            `Collection "${name}" set with ${newDoc.length} Documents.`,
                            newDoc
                        ));
                    };
                };
            }).catch(_err => {
                rej(error.call(
                    this,
                    `Could not set collection "${name}".`
                ));
            });
        };

        this.setDocument = () => {
            this.byCriteria = () => {
                let docsToSet = [];
                this.lf[name].iterate((value, key) => {
                    if (subset(value, criteria)) {
                        docsToSet.push({ key, newDoc });
                    };
                }).then(() => {
                    if (!docsToSet.length) {
                        rej(error.call(
                            this,
                            `No Docs found in ${name} with criteria ${JSON.stringify(criteria)}.`
                        ));
                    };
                    if (docsToSet.length > 1) {
                        console.warn(`Multiple documents (${docsToSet.length}) with ${JSON.stringify(criteria)} found for setting.`);
                    };
                }).then(() => {
                    docsToSet.forEach((docToSet, index) => {
                        this.lf[name].setItem(docToSet.key, docToSet.newDoc).then(_value => {
                            if (index === (docsToSet.length - 1)) {
                                res(success.call(
                                    this,
                                    `${docsToSet.length} Doc${docsToSet.length > 1 ? 's' : ''} in ${name} set.`,
                                    newDoc
                                ));
                            };
                        }).catch(_err => {
                            rej(error.call(
                                this,
                                `Could not set ${docsToSet.length} Docs in ${name}.`
                            ));
                        });
                    });
                });
            };

            this.byKey = () => {
                this.lf[name].getItem(criteria).then(_value => {
                    this.lf[name].setItem(criteria, newDoc);
                    res(success.call(
                        this,
                        `Doc in ${name} set.`,
                        newDoc
                    ));
                }).catch(_err => {
                    rej(error.call(
                        this,
                        `Could not set Doc in ${name}.`
                    ));
                });
            };
        
            if (typeof criteria == 'object') {
                return this.setDocument.byCriteria();
            } else {
                return this.setDocument.byKey();
            };
        };

        if (!newDoc) {
            console.log('No Doc Provided');
        } else if (level === 'doc') {
            if (!(typeof newDoc == 'object' && newDoc instanceof Array == false)) {
                console.log('Doc must be an object.');
            };
        } else if (level === 'collection') {
            if (!(typeof newDoc == 'object' && newDoc instanceof Array)) {
                console.log('Collection must be an array.');
            };
        };

        if (level === 'collection') {
            return this.setCollection();
        } else {
            return this.setDocument();
        };
    });
};