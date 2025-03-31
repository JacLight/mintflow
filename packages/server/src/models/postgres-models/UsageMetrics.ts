import { DataTypes, Model, Sequelize } from 'sequelize';
import { getSequelizeUsageMetricsSchema } from '../schemas/UsageMetricsSchema.js';

export class UsageMetrics extends Model {
    static initModel(sequelize: Sequelize) {
        UsageMetrics.init(getSequelizeUsageMetricsSchema(), {
            sequelize,
            modelName: 'UsageMetrics',
            tableName: 'usage_metrics',
            timestamps: true,
        });
    }
}
