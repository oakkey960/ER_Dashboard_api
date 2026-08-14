import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "./index";

class PatReg extends Model<
  InferAttributes<PatReg>,
  InferCreationAttributes<PatReg>
> {
  declare id: number;
  declare hn: number | null;
  declare an: number | null;
  declare patvisitid: number | null;
  declare regtypeid: number | null;
  declare regstatusid: number | null;
  declare departcode: string | null;
  declare locationid: number | null;
  declare roomno: string | null;
  declare los: number | null;
  declare patcoverageid: number | null;
  declare coveragecode: string | null;
  declare coveragemasterid: number | null;
  declare queueno: number | null;
  declare locationqueueno: number | null;
  declare startdatetime: Date | null;
  declare enddatetime: Date | null;
  declare dischargetypeid: number | null;
  declare flag_status: string | null;
  declare flag_reg: string | null;
  declare flag_service: string | null;
  declare flag_appoint: string | null;
  declare appointid: number | null;
  declare nextappointid: number | null;
  declare flag_refer: string | null;
  declare referid: number | null;
  declare referinid: number | null;
  declare referoutid: number | null;
  declare maindoctorid: number | null;
  declare userid: number | null;
  declare editdatetime: Date;
  declare projectid: number | null;
  declare flag_app: string | null;
  declare fromlocationid: number | null;
  declare visitdate: string | null;
  declare frompatregid: number | null;
  declare druglocationid: number | null;
  declare lablocationid: number | null;
  declare xraylocationid: number | null;
  declare cashierlocationid: number | null;
  declare flag_end: string | null;
  declare flag_opdcard: string | null;
  declare flag_oneself: string | null;
  declare nurseuserid: number | null;
  declare druguserid: number | null;
  declare drugcheckuserid: number | null;
  declare regdatetime: Date | null;
  declare drugdatetime: Date | null;
  declare cashdatetime: Date | null;
  declare docdatetime: Date | null;
  declare flag_new: string | null;
  declare flag_a: string | null;
  declare flag_b: string | null;
  declare flag_c: string | null;

  static associate(models: any) {
    PatReg.hasOne(models.PatUrgent, {
      foreignKey: "patregid",
      as: "pat_urgent",
    });
  }
}

PatReg.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    hn: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    an: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    patvisitid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    regtypeid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    regstatusid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    departcode: {
      type: DataTypes.CHAR(6),
      allowNull: true,
    },
    locationid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    roomno: {
      type: DataTypes.CHAR(4),
      allowNull: true,
    },
    los: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    patcoverageid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    coveragecode: {
      type: DataTypes.STRING(5),
      allowNull: true,
    },
    coveragemasterid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    queueno: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    locationqueueno: {
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
    dischargetypeid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    flag_status: {
      type: DataTypes.CHAR(1),
      allowNull: true,
    },
    flag_reg: {
      type: DataTypes.CHAR(1),
      allowNull: true,
    },
    flag_service: {
      type: DataTypes.CHAR(1),
      allowNull: true,
    },
    flag_appoint: {
      type: DataTypes.CHAR(1),
      allowNull: true,
    },
    appointid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    nextappointid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    flag_refer: {
      type: DataTypes.CHAR(1),
      allowNull: true,
    },
    referid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    referinid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    referoutid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    maindoctorid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    userid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    editdatetime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    projectid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    flag_app: {
      type: DataTypes.CHAR(1),
      allowNull: true,
    },
    fromlocationid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    visitdate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    frompatregid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    druglocationid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    lablocationid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    xraylocationid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    cashierlocationid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    flag_end: {
      type: DataTypes.CHAR(1),
      allowNull: true,
    },
    flag_opdcard: {
      type: DataTypes.CHAR(1),
      allowNull: true,
    },
    flag_oneself: {
      type: DataTypes.CHAR(1),
      allowNull: true,
    },
    nurseuserid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    druguserid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    drugcheckuserid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    regdatetime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    drugdatetime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    cashdatetime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    docdatetime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    flag_new: {
      type: DataTypes.CHAR(1),
      allowNull: true,
    },
    flag_a: {
      type: DataTypes.CHAR(1),
      allowNull: true,
    },
    flag_b: {
      type: DataTypes.CHAR(1),
      allowNull: true,
    },
    flag_c: {
      type: DataTypes.CHAR(1),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "pat_reg",
    timestamps: false,
  },
);

export default PatReg;
