'use strict'

import mongoose, { Schema, model, Document } from 'mongoose';

const DOCUMENT_NAME = 'Key';
const COLLECTION_NAME = 'Keys';

interface IKeyToken extends Document {
    _id: mongoose.Types.ObjectId; 
    user: Schema.Types.ObjectId;
    privateKey: string;
    publicKey: string;
    refreshTokensUsed: string[];
    refreshToken?: string;
    isActive: boolean
}

const keyTokenSchema = new Schema<IKeyToken>({
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    privateKey: {
      type: String,
      trim: true,
      required: true,
    },
    publicKey: {
      type: String,
      trim: true,
      required: true,
    },
    refreshTokensUsed: {
      type: [String],
      default: []
    },
    refreshToken: {
      type: String,
      trim: true,
      required: false
    },
    isActive: {
        type: Boolean,
        default: true
    }
  }, {
    timestamps: true,
    collection: COLLECTION_NAME
  });
  
  const KeyToken = mongoose.model<IKeyToken>('KeyToken', keyTokenSchema);
  export { KeyToken, IKeyToken };