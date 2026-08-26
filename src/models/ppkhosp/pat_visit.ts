import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import { sequelize } from "./index";

class PatVisit extends Model<
  InferAttributes<PatVisit>,
  InferCreationAttributes<PatVisit>
> {
  declare id: number;
  declare ageday: number | null;

  static associate(models: any) {
    //
  }
}

PatVisit.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    ageday: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "pat_visit",
    timestamps: false,
  },
);

export default PatVisit;
