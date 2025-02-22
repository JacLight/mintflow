import { DataTypes, Model } from 'sequelize';
import { getSequelizeTenantSchema } from '../schemas/TenantSchema.js';
import { sequelize } from '../../services/PostgresProvider.js';

class Tenant extends Model { }

// ✅ Sequelize Model for Tenants
Tenant.init(getSequelizeTenantSchema(), {
    sequelize,
    modelName: 'Tenant',
    timestamps: true
});

export { Tenant };
