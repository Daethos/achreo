import { error, success } from "./add";
import level from "./level";
import subset from "./subset";

export default function deleteIt() {
    return new Promise((res, rej) => {
        this.deleteDb = () => {
            let db = this.db;
            indexedDB.deleteDatabase(db);
            res(success.call(
                this,
                `Database "${db}" deleted.`,
                { database: db }
            ));
        };

        this.deleteCollection = () => {
            let db = this.db;
            let name = this.name;
            this.addToDeleteCollectionQueue = (name) => {
                this.deleteCollectionQueue.queue.push(name);
                this.runDeleteCollectionQueue();
            };
            this.runDeleteCollectionQueue = () => {
                if (this.deleteCollectionQueue.running == false) {
                    this.deleteCollectionQueue.running = true;
                    this.deleteNextCollectionFromQueue();
                };
            };    
            this.deleteNextCollectionFromQueue = () => {
                if(this.deleteCollectionQueue.queue.length) {
                    let collectionToDelete = this.deleteCollectionQueue.queue.shift();
                    this.lf[collectionToDelete].dropInstance({
                        name: db,
                        storeName: collectionToDelete
                    }).then(() => {
                        this.deleteNextCollectionFromQueue();
                        res(success.call(
                            this,
                            `Collection "${collectionToDelete}" deleted.`,
                            { collection: collectionToDelete }
                        ));
                    }).catch(_err => {
                        rej(error.call(
                            this,
                            `Collection "${collectionToDelete}" could not be deleted.`
                        ));
                    });
                } else {
                    this.deleteCollectionQueue.running = false;
                };
            };
            this.addToDeleteCollectionQueue(name);
        };

        this.deleteDocument = () => {
            let name = this.name;
            let criteria = this.criteria;

            this.deleteDocumentByCriteria = () => {
                let keys = [];
                this.lf[name].iterate((val, key) => {
                    if (subset(val, criteria)) {
                        keys.push(key);
                    };
                }).then(() => {
                    if (!keys.length) {
                        rej(error.call(
                            this,
                            `No Docs found in ${name} with criteria ${JSON.stringify(criteria)}.`
                        ));
                    };
                    if (keys.length > 1) {
                        console.warn(`Multiple documents (${keys.length}) with ${JSON.stringify(criteria)} found for deleting.`);
                    };
                }).then(() => {
                    keys.forEach((key, idx) => {
                        this.lf[name].removeItem(key).then(() => {
                            if (idx === (keys.length - 1)) {
                                res(success.call(
                                    this,
                                    `${keys.length} Doc${keys.length > 1 ? 's' : ''} in ${name} deleted.`,
                                    { criteria }
                                ));
                            };
                        }).catch(_err => {
                            rej(error.call(
                                this,
                                `Could not delete ${keys.length} Docs in ${name}.`
                            ));
                        });
                    });
                })
            };
            this.deleteDocumentByKey = () => {
    
                this.lf[name].getItem(criteria).then(val => {
                    if (val){
                        this.lf[name].removeItem(criteria).then(() => {
                            res(success.call(
                                this,
                                `Doc in ${name} deleated.`,
                                { criteria }
                            ));
                        }).catch(_err => {
                            rej(error.call(
                                this,
                                `Could not delete Doc in ${name}.`
                            ));
                        });
                    };
                });
            };
            
            if (typeof criteria == 'object') {
                return this.deleteDocumentByCriteria();
            } else {
                return this.deleteDocumentByKey();
            };
        };

        let documentLevel = level.call(this);
        if (documentLevel === 'db') {
            return this.deleteDatabase();
        } else if (documentLevel === 'collection') {
            return this.deleteCollection();
        } else if (documentLevel === 'doc') {
            return this.deleteDocument();
        };
    });
};