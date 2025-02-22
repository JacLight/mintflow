import { DataTypes, Model } from 'sequelize';
import { getSequelizeFlowRunSchema } from '../schemas/FlowRunSchema.js';
import { sequelize } from '../../services/PostgresProvider.js';

class FlowRun extends Model { }

// ✅ Sequelize Model for Flow Runs
FlowRun.init(getSequelizeFlowRunSchema(), {
    sequelize,
    modelName: 'FlowRun',
    timestamps: true
});

export { FlowRun };
