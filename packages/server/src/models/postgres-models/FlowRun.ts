import { DataTypes, Model, Sequelize } from 'sequelize';
import { getSequelizeFlowRunSchema } from '../schemas/FlowRunSchema.js';

export class FlowRun extends Model {
    static initModel(sequelize: Sequelize) {
        FlowRun.init(getSequelizeFlowRunSchema(), {
            sequelize,
            modelName: 'FlowRun',
            timestamps: true,
        });
    }
}
