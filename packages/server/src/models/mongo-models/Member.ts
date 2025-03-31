import mongoose from 'mongoose';
import { getMongooseMemberSchema } from '../schemas/MemberSchema.js';

// Mongoose Model for Member
const modelName = 'member';
if (!mongoose.models[modelName]) {
    mongoose.model(modelName, getMongooseMemberSchema());
}
export const MemberModel = mongoose.models[modelName];
