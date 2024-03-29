import localforage from "localforage";

export default function collection(name) {
    if (!name) {
        console.log('No collection name specified. Provide a string value.');
        return this;
    } else if (typeof name !== 'string') {
        console.log('Collection name must be a string.');
        return this;
    } else {
        this.name = name;

        let db = this.db;

        if (!(name in this.lf)) {
            this.lf[name] = localforage.createInstance({
                driver: localforage.INDEXEDDB,
                name: db,
                storeName: name
            });
        };
        return this;    
    };
};
