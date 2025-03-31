import mongoose from 'mongoose';
import { getMongooseWorkspaceSchema } from '../schemas/WorkspaceSchema.js';

// Mongoose Model for Workspace
const modelName = 'workspace';
if (!mongoose.models[modelName]) {
    mongoose.model(modelName, getMongooseWorkspaceSchema());
}
export const WorkspaceModel = mongoose.models[modelName];
