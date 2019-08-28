import Sequelize, { Model } from 'sequelize';

class Meetup extends Model {
  static init(sequelize) {
    super.init(
      {
        title: Sequelize.STRING,
        description: Sequelize.STRING,
        location: Sequelize.STRING,
        date: Sequelize.DATE,
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
  }
}

export default Meetup;
