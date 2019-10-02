import Sequelize, { Model } from 'sequelize';
import { isBefore } from 'date-fns';

class Token extends Model {
  static init(sequelize) {
    super.init(
      {
        token: Sequelize.STRING,
        expires_in: Sequelize.DATE,
        used_at: Sequelize.DATE,
        is_expired: {
          type: Sequelize.VIRTUAL,
          get() {
            return isBefore(this.expires_in, new Date());
          },
        },
        is_used: {
          type: Sequelize.VIRTUAL,
          get() {
            return !!this.used_at;
          },
        },
        is_revoked: {
          type: Sequelize.VIRTUAL,
          get() {
            return !!this.revoked_at;
          },
        },
      },
      {
        sequelize,
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.User, {
      as: 'user',
      foreignKey: 'user_id',
    });
  }
}

export default Token;
