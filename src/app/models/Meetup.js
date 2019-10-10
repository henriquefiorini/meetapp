import Sequelize, { Model } from 'sequelize';
import { isBefore } from 'date-fns';

class Meetup extends Model {
  static init(sequelize) {
    super.init(
      {
        title: Sequelize.STRING,
        description: Sequelize.TEXT,
        location: Sequelize.STRING,
        date: Sequelize.DATE,
        has_passed: {
          type: Sequelize.VIRTUAL,
          get() {
            return isBefore(this.date, new Date());
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
      as: 'organizer',
      foreignKey: 'organizer_id',
    });
    this.belongsTo(models.File, {
      as: 'banner',
      foreignKey: 'banner_id',
    });
    this.hasMany(models.Subscription, {
      as: 'meetup',
      foreignKey: 'meetup_id',
    });
  }
}

export default Meetup;
