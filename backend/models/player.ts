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
    const user = this;
    if (!user.isModified('password')) return next();
    const hash = await Bun.password.hash(user.password);
    user.password = hash;
    next();
});

playerSchema.methods.comparePassword = function(tryPassword: StringOrBuffer, cb: (arg0: null, arg1: Promise<boolean>) => void) {
    const isMatch = Bun.password.verify(tryPassword, this.password);
    console.log(isMatch, "isMatch")
    cb(null, isMatch);
};

export const Player = mongoose.model('Player', playerSchema);