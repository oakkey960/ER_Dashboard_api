import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "./index";

class AppUserGroup extends Model<
  InferAttributes<AppUserGroup>,
  InferCreationAttributes<AppUserGroup>
> {
  declare groupid: number;
  declare userid: number;
  declare active: CreationOptional<string | null>;
  declare createdatetime: CreationOptional<Date | null>;

  static associate(models: any) {
    // Relationships can be defined here
  }
}

AppUserGroup.init(
  {
    groupid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    userid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    active: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    createdatetime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "app_usergroup",
    timestamps: false,
  }
);

export default AppUserGroup;
