import { Player } from "../models/player";
// @ts-ignore
import jwt from 'jsonwebtoken';
const SECRET = process.env.SECRET;

async function signup(req: any, res: any): Promise<void> {
    try {
        const player = await Player.create(req.body);
        await player.save();
        const token = createJWT(player);
        res.json({ token });
    } catch (err: any) {
        res.status(400).json({ err: err.message });
    };
};

function createJWT(player: any): string {
    return jwt.sign(
        { player },
        SECRET,
        { expiresIn: '7d' }
    );
};