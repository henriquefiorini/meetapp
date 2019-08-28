import { Model } from 'sequelize';

class Subscription extends Model {
  static init(sequelize) {
    super.init({}, { sequelize });
    return this;
  }

  static associate(models) {
    this.belongsTo(models.User, {
      as: 'participant',
      foreignKey: 'user_id',
    });
    this.belongsTo(models.Meetup, {
      as: 'meetup',
      foreignKey: 'meetup_id',
    });
  }
}

export default Subscription;
