import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import { sequelize } from "./index";

class PatUrgent extends Model<
  InferAttributes<PatUrgent>,
  InferCreationAttributes<PatUrgent>
> {
  declare patregid: number;
  declare locationid: number | null;
  declare hn: number | null;
  declare startdatetime: Date | null;
  declare enddatetime: Date | null;
  declare startlevel: number | null;
  declare endlevel: number | null;
  declare flag_status: string | null;
  declare flag_cancel: string | null;
  declare flag_show: string | null;
  declare note: string | null;
  declare edituserid: number | null;
  declare editdatetime: Date | null;
  declare seq: number | null;

  static associate(models: any) {
    PatUrgent.belongsTo(models.PatReg, {
      foreignKey: "patregid",
      as: "pat_reg",
    });
  }
}

PatUrgent.init(
  {
    patregid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    locationid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    hn: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    startdatetime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    enddatetime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    startlevel: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    endlevel: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    flag_status: {
      type: DataTypes.CHAR(1),
      allowNull: true,
    },
    flag_cancel: {
      type: DataTypes.CHAR(1),
      allowNull: true,
    },
    flag_show: {
      type: DataTypes.CHAR(1),
      allowNull: true,
    },
    note: {
      type: DataTypes.TEXT("medium"),
      allowNull: true,
    },
    edituserid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    editdatetime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    seq: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "pat_urgent",
    timestamps: false,
  },
);

export default PatUrgent;
