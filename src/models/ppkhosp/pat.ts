import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "./index";

class Pat extends Model<
  InferAttributes<Pat>,
  InferCreationAttributes<Pat>
> {
  declare hn: number;
  declare soundex: string | null;
  declare salutation: number | null;
  declare prename: string | null;
  declare firstname: string | null;
  declare lastname: string | null;
  declare prename_en: string | null;
  declare firstname_en: string | null;
  declare lastname_en: string | null;
  declare birthflag: string | null;
  declare sex: number | null;
  declare marriage: number | null;
  declare religious: number | null;
  declare race: number | null;
  declare citizenship: number | null;
  declare occupation: number | null;
  declare abogroup: number | null;
  declare hnofmother: number | null;
  declare firstnameofmother: string | null;
  declare lastnameofmother: string | null;
  declare firstnameoffather: string | null;
  declare lastnameoffather: string | null;
  declare firstnameofcouple: string | null;
  declare lastnameofcouple: string | null;
  declare citizencardno: string | null;
  declare othercardtype: number | null;
  declare othercardno: string | null;
  declare flag_status: string | null;
  declare adduserid: number | null;
  declare adddatetime: Date | null;
  declare edituserid: number | null;
  declare editdatetime: Date | null;
  declare timestart: Date | null;
  declare timefinish: Date | null;
  declare birthdatetime: Date | null;
  declare onhand: string | null;
  declare lastlocationid: number | null;
  declare bloodgroup: string | null;

  static associate(models: any) {
    // define associations here if needed
  }
}

Pat.init(
  {
    hn: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    soundex: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    salutation: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    prename: {
      type: DataTypes.STRING(25),
      allowNull: true,
    },
    firstname: {
      type: DataTypes.STRING(25),
      allowNull: true,
    },
    lastname: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    prename_en: {
      type: DataTypes.STRING(25),
      allowNull: true,
    },
    firstname_en: {
      type: DataTypes.STRING(25),
      allowNull: true,
    },
    lastname_en: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    birthflag: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    sex: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    marriage: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    religious: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    race: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    citizenship: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    occupation: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    abogroup: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    hnofmother: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    firstnameofmother: {
      type: DataTypes.STRING(25),
      allowNull: true,
    },
    lastnameofmother: {
      type: DataTypes.STRING(25),
      allowNull: true,
    },
    firstnameoffather: {
      type: DataTypes.STRING(25),
      allowNull: true,
    },
    lastnameoffather: {
      type: DataTypes.STRING(25),
      allowNull: true,
    },
    firstnameofcouple: {
      type: DataTypes.STRING(25),
      allowNull: true,
    },
    lastnameofcouple: {
      type: DataTypes.STRING(25),
      allowNull: true,
    },
    citizencardno: {
      type: DataTypes.STRING(13),
      allowNull: true,
    },
    othercardtype: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    othercardno: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    flag_status: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    adduserid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    adddatetime: {
      type: DataTypes.DATE,
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
    timestart: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    timefinish: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    birthdatetime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    onhand: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    lastlocationid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    bloodgroup: {
      type: DataTypes.CHAR(2),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "pat",
    timestamps: false,
  },
);

export default Pat;
