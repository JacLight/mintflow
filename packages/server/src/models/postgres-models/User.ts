import { DataTypes, Model, Sequelize } from 'sequelize';
import { getSequelizeUserSchema } from '../schemas/UserSchema.js';

export class User extends Model {
    static initModel(sequelize: Sequelize) {
        User.init(getSequelizeUserSchema(), {
            sequelize,
            modelName: 'User',
            timestamps: true,
        });
    }
}
