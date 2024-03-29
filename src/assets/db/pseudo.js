"use strict"

import collection from "./collection";
import doc from "./doc";
import { limit, order } from "./filters";
import add from "./add";
import deleteIt from "./delete";
import get from "./get";
import set from "./set";
import update from "./update";

export default class PseudoBase {
    constructor(db) {
        this.db = db;
        this.lf = {};
        this.name = null;
        this.direction = null;
        this.property = null;
        this.limit = null;
        this.criteria = null;

        this.deleteCollectionQueue = {
            queue: [],
            running: false
        };

        this.config = {
            debug: true
        };

        this.userErrors = [];

        this.collection = collection.bind(this);
        this.doc = doc.bind(this);

        this.order = order.bind(this);
        this.limit = limit.bind(this);
        
        this.get = get.bind(this);
        this.add = add.bind(this);
        this.update = update.bind(this);    
        this.set = set.bind(this);
        this.delete = deleteIt.bind(this);
    };
};