import subset from "./subset";
import updateObject from "./updateObject";
import { error, success } from "./add";

export default function update(doc) {
    let name = this.name;
    let criteria = this.criteria;

    return new Promise((res, rej) => {
        this.updateDocumentByCriteria = () => {
            let docsToUpdate = [];
            this.lf[name].iterate((value, key) => {
                if (subset(value, criteria)) {
                    let newDoc = updateObject(value, doc);
                    docsToUpdate.push({ key, newDoc });
                }
            }).then(() => {
                if (!docsToUpdate.length) {
                    rej(error.call(
                        this,
                        `No Docs found in ${name} with criteria ${JSON.stringify(criteria)}.`
                    ))
                };
                if (docsToUpdate.length > 1) {
                    console.warn(`Multiple documents (${docsToUpdate.length}) with ${JSON.stringify(criteria)} found for updating.`);
                };
            }).then(() => {
                docsToUpdate.forEach((docToUpdate, index) => {
                    this.lf[name].setItem(docToUpdate.key, docToUpdate.newDoc).then(value => {
                        if (index === (docsToUpdate.length - 1)) {
                            res(success.call(
                                this,
                                `${docsToUpdate.length} Doc${docsToUpdate.length > 1 ? 's' : ''} in ${name} updated.`,
                                doc
                            ))
                        };
                    }).catch(err => {
                        rej(error.call(
                            this,
                            `Could not update ${docsToUpdate.length} Docs in ${name}.`
                        ))
                    })
                });
            });
        };

        this.updateDocumentByKey = () => {
            let newDoc = {};
            this.lf[name].getItem(criteria).then(value => {
                newDoc = updateObject(value, doc);
                this.lf[name].setItem(criteria, newDoc);
                res(success.call(
                    this,
                    `Doc in ${name} updated.`,
                    doc
                ))
            }).catch(_err => {
                rej(error.call(
                    this,
                    `Could not update Doc in ${name}.`
                ))
            });
        };

        if (!doc) {
            console.log('No doc specified. Provide doc-value pair ala { name: "Elijiah" }');
        } else if (!(typeof doc == 'object' && doc instanceof Array == false)) {
            console.log('Doc must be an object.');
        };

        if (typeof criteria == 'object') {
            this.updateDocumentByCriteria();
        } else {
            this.updateDocumentByKey();
        };
    });
};