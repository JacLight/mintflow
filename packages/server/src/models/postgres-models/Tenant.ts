import { DataTypes, Model, Sequelize } from 'sequelize';
import { getSequelizeTenantSchema } from '../schemas/TenantSchema.js';

export class Tenant extends Model {
    static initModel(sequelize: Sequelize) {
        Tenant.init(getSequelizeTenantSchema(), {
            sequelize,
            modelName: 'Tenant',
            timestamps: true,
        });
    }
}
