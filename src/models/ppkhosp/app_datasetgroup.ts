import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "./index";

class AppDatasetGroup extends Model<
  InferAttributes<AppDatasetGroup>,
  InferCreationAttributes<AppDatasetGroup>
> {
  declare groupid: number;
  declare referencename: string;
  declare referenceid: number;
  declare rightflag: CreationOptional<string | null>;

  static associate(models: any) {
    // Relationships can be defined here
  }
}

AppDatasetGroup.init(
  {
    groupid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    referencename: {
      type: DataTypes.STRING(30),
      primaryKey: true,
      allowNull: false,
    },
    referenceid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    rightflag: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "app_datasetgroup",
    timestamps: false,
  }
);

export default AppDatasetGroup;
