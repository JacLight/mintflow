import { DataTypes, Model, Sequelize } from 'sequelize';
import { getSequelizeFlowSchema } from '../schemas/FlowSchema.js';

export class Flow extends Model {
    static initModel(sequelize: Sequelize) {
        Flow.init(getSequelizeFlowSchema(), {
            sequelize,
            modelName: 'Flow',
            timestamps: true,
        });
    }
}
