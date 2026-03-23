import { UUID } from "crypto";
import { Model, InferAttributes, InferCreationAttributes, CreationOptional, DataTypes } from "sequelize";
import db from "../db";

export default class MailTemplate extends Model<InferAttributes<MailTemplate>, InferCreationAttributes<MailTemplate>> {
    declare id: CreationOptional<UUID>;
    declare name: string;
    declare createdAt: CreationOptional<Date>;
    declare updateAt: CreationOptional<Date>;
}

MailTemplate.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updateAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize: db,
    tableName: "mail_template",
    timestamps: false
});

(async () => {
    await db.sync();
})();