export default function level() {
    let level;
    if (!this.name && !this.criteria) level = 'db';
    else if (this.name && !this.criteria) level = 'collection';
    else if (this.name && this.criteria) level = 'doc';
    return level;
};