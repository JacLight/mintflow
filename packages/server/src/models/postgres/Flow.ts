import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../services/PostgresProvider.js';
import { getSequelizeFlowSchema } from '../schemas/FlowSchema.js';

class Flow extends Model { }

// ✅ Sequelize Model for Flows
Flow.init(getSequelizeFlowSchema(), {
    sequelize,
    modelName: 'Flow',
    timestamps: true
});

export { Flow };
