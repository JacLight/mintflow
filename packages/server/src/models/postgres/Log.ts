import { DataTypes, Model } from 'sequelize';
import { getSequelizeFlowSchema } from '../schemas/FlowSchema.js';
import { sequelize } from '../../services/PostgresProvider.js';

class Log extends Model { }

// ✅ Sequelize Model for Logs
Log.init(getSequelizeFlowSchema(), {
    sequelize,
    modelName: 'Log',
    timestamps: true
});

export { Log };
