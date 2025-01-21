'use strict';
const bcrypt = require('bcryptjs');

const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init({
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Please provide a value for "firstName"',
        },
        notEmpty: {
          msg: 'Please provide a value for "firstName"',
        }
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Please provide a value for "lastName"',
        },
        notEmpty: {
          msg: 'Please provide a value for "lastName"',
        }
      }
    },
    emailAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Please provide a value for "email"',
        },
        notEmpty: {
          msg: 'Please provide a value for "email"',
        },
        isEmail: {
          msg: 'Please provide a valid email address',
        }
      },
      unique: {
        msg: 'The email you entered already exists',
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Please provide a value for "password"',
        },
        notEmpty: {
          msg: 'Please provide a value for "password"',
        },
        len: {
          args: [8, 20],
          msg: 'The password should be between 8 and 20 characters in length'
        }
      }
    },
  }, {
    hooks: {
      afterValidate: (user) => {
        user.password = bcrypt.hashSync(user.password, 10);
      },
    },
    sequelize,
    modelName: 'User',
  });

  User.associate = (models) => {
    User.hasMany(models.Course, {
      as: 'user',
      foreignKey: {
        fieldName: 'userId',
        allowNull: false,
      },
    });
  };

  return User;
};