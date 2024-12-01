'use strict'

import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';


const DOCUMENT_NAME = 'User';
const COLLECTION_NAME = 'Users';

interface IUser extends Document {
    usr_username: string;
    usr_fullname: string;
    usr_email: string;
    usr_password: string;
    usr_avatar: string;
    usr_status: 'active' | 'deactive';
    usr_last_password_reset_request?: Date;
}

const userSchema = new Schema<IUser>({
    usr_username: {
        type: String,
        unique: true,
        required: true,
        index: true
    },
    usr_fullname: {
        type: String,
        required: true
    },
    usr_email: {
        type: String,
        required: true
    },
    usr_password: {
        type: String,
        required: true
    },
    usr_avatar: {
        type: String,
        required: true
    },
    usr_status: {
        type: String,
        default: 'active',
        enum: ['active', 'deactive']
    },
    usr_last_password_reset_request: {
        type: Date
    }
}, {
    timestamps: true,
    collection: COLLECTION_NAME
})

userSchema.pre('save', async function(next) {
    try {
        if (!this.isModified('usr_password')) return next();
        
        const salt = await bcrypt.genSalt(10);
        this.usr_password = await bcrypt.hash(this.usr_password, salt);
        next();
    } catch (error: any) {
        return next(error);
    }
});

export default model<IUser>(DOCUMENT_NAME, userSchema)