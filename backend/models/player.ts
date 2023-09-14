import * as mongoose from 'mongoose';
import Bun from 'bun'; 

const playerSchema = new mongoose.Schema({
    username: { type: String, required: true, lowercase: true, unique: true },
    password: { type: String, required: true, minlength: 8, lowercase: true, unique: true },
}, { timestamps: true });

playerSchema.set('toJSON', {
    transform: function(_doc, ret) {
        delete ret.password;
        return ret;
    }
});

playerSchema.set('toObject', {
    transform: function(_doc, ret) {
        delete ret.password;
        return ret;
    }
});

playerSchema.pre('save', async function(next) {
    // 'this' will be set to the current document
    const user = this;
    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();
    // password has been changed - salt and hash it
    const hash = await Bun.password.hash(user.password);
    // override the cleartext password with the hashed one
    user.password = hash;
    next();
});

playerSchema.methods.comparePassword = function(tryPassword: StringOrBuffer, cb: (arg0: null, arg1: Promise<boolean>) => void) {
    const isMatch = Bun.password.verify(tryPassword, this.password);
    cb(null, isMatch);
};

export const Player = mongoose.model('Player', playerSchema);