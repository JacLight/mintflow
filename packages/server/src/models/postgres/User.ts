import { DataTypes, Model } from 'sequelize';
import { getSequelizeUserSchema } from '../schemas/UserSchema.js';
import { sequelize } from '../../services/PostgresProvider.js';

class User extends Model { }

// ✅ Sequelize Model for Users
User.init(getSequelizeUserSchema(), {
    sequelize,
    modelName: 'User',
    timestamps: true
});

export { User };
