import * as mongoose from 'mongoose';

mongoose.connect(
    process.env.DATABASE_URL!
);

// const db = mongoose.connection;

// console.log(db, "Database?")

// db.on('connected', () => {
//     console.log(`Connected to MongoDB at ${db.host}:${db.port}`)
// });