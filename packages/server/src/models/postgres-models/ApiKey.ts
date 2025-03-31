import { DataTypes, Model, Sequelize } from 'sequelize';
import { getSequelizeApiKeySchema } from '../schemas/ApiKeySchema.js';

export class ApiKey extends Model {
    static initModel(sequelize: Sequelize) {
        ApiKey.init(getSequelizeApiKeySchema(), {
            sequelize,
            modelName: 'ApiKey',
            tableName: 'api_keys',
            timestamps: true,
        });
    }
}
