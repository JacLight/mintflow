import { DataTypes, Model, Sequelize } from 'sequelize';
import { getSequelizeLogSchema } from '../schemas/LogSchema.js';

export class Log extends Model {
    static initModel(sequelize: Sequelize) {
        Log.init(getSequelizeLogSchema(), {
            sequelize,
            modelName: 'Log',
            timestamps: true,
        });
    }
}
