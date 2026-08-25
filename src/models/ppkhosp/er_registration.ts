import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "./index";

class ErRegistration extends Model<
  InferAttributes<ErRegistration>,
  InferCreationAttributes<ErRegistration>
> {
  declare patregid: CreationOptional<number>;
  declare patvisitid: number;
  declare hn: number;
  declare visitdatetime: CreationOptional<Date | null>;
  declare dischargdatetime: CreationOptional<Date | null>;
  declare patreceive: CreationOptional<number | null>;
  declare pattype: CreationOptional<number | null>;
  declare progno: CreationOptional<number | null>;
  declare pattrial: CreationOptional<number | null>;
  declare isno: CreationOptional<number | null>;
  declare accidentgroup: CreationOptional<number | null>;
  declare anounceplan: CreationOptional<number | null>;
  declare usedplan: CreationOptional<number | null>;
  declare accidenttype: CreationOptional<number | null>;
  declare accidentroad: CreationOptional<number | null>;
  declare courtpat: CreationOptional<number | null>;
  declare dead: CreationOptional<number | null>;
  declare referpat: CreationOptional<number | null>;
  declare usedalambus: CreationOptional<number | null>;
  declare cpr: CreationOptional<number | null>;
  declare accident: CreationOptional<number | null>;
  declare accidentpoint: CreationOptional<string | null>;
  declare coordinate_refer: CreationOptional<number | null>;
  declare prog_consult: CreationOptional<number | null>;
  declare airway: CreationOptional<number | null>;
  declare breathing: CreationOptional<number | null>;
  declare circulation: CreationOptional<number | null>;
  declare drug: CreationOptional<number | null>;
  declare cardiacmassage: CreationOptional<number | null>;
  declare textcomment: CreationOptional<string | null>;
  declare in_out_addr: CreationOptional<string | null>;
  declare send_by: CreationOptional<number | null>;
  declare ambulance: CreationOptional<number | null>;
  declare flag_revisit: CreationOptional<string | null>;
  declare trauma_regisno: CreationOptional<string | null>;
  declare physdatetime: CreationOptional<Date | null>;

  static associate(models: any) {
    // Relationships can be defined here
  }
}

ErRegistration.init(
  {
    patregid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    patvisitid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    hn: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    visitdatetime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    dischargdatetime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    patreceive: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    pattype: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    progno: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    pattrial: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    isno: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    accidentgroup: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    anounceplan: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    usedplan: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    accidenttype: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    accidentroad: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    courtpat: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    dead: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    referpat: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    usedalambus: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    cpr: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    accident: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    accidentpoint: {
      type: DataTypes.STRING(250),
      allowNull: true,
    },
    coordinate_refer: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    prog_consult: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    airway: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    breathing: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    circulation: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    drug: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    cardiacmassage: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    textcomment: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    in_out_addr: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    send_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    ambulance: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    flag_revisit: {
      type: DataTypes.CHAR(1),
      allowNull: true,
    },
    trauma_regisno: {
      type: DataTypes.CHAR(10),
      allowNull: true,
    },
    physdatetime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "er_registration",
    timestamps: false,
  }
);

export default ErRegistration;
