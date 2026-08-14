import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import { sequelize } from "./index";

class PatFlag extends Model<
  InferAttributes<PatFlag>,
  InferCreationAttributes<PatFlag>
> {
  declare tablename: string;
  declare columnname: string;
  declare columnvalue: string;
  declare descvalue: string | null;
  declare note: string | null;

  static associate(models: any) {
    // define associations here if needed
  }
}

PatFlag.init(
  {
    tablename: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      allowNull: false,
    },
    columnname: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      allowNull: false,
    },
    columnvalue: {
      type: DataTypes.STRING(6),
      primaryKey: true,
      allowNull: false,
    },
    descvalue: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    note: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "pat_flag",
    timestamps: false,
  },
);

export default PatFlag;
