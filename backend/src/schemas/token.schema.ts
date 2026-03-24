import mongoose, { Types } from "mongoose";
export interface IToken {
    userId: Types.ObjectId;
    token: string;
    expiresAt: Date;

}
const TokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    token: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
    },
}, {
    timestamps: true
});

export const TokenModel = mongoose.model<IToken>('Token', TokenSchema)