import { UUID } from "crypto";
import { Model, InferAttributes, InferCreationAttributes, CreationOptional, DataTypes } from "sequelize";

import db from "../db";
import TesterGroup from "./TesterGroup";
import MailTemplate from "./MailTemplate";
import Template from "./Template";
import Sender from "./Sender";

export default class Strategy extends Model<InferAttributes<Strategy>, InferCreationAttributes<Strategy>> {
    declare id: CreationOptional<UUID>;
    declare name: string;
    declare testerGroup: UUID;
    declare mailTemplate: UUID;
    declare pageTemplate: UUID;
    declare senderId: UUID;
}

Strategy.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    testerGroup: {
        type: DataTypes.UUID,
        allowNull: false
    },
    mailTemplate: {
        type: DataTypes.UUID,
        allowNull: false
    },
    pageTemplate: {
        type: DataTypes.UUID,
        allowNull: false
    },
    senderId: {
        type: DataTypes.UUID,
        allowNull: false
    }
}, {
    sequelize: db,
    tableName: "strategy",
    timestamps: false
});

Strategy.belongsTo(TesterGroup, {
    onDelete: "CASCADE",
    foreignKey: "testerGroup"
});

Strategy.belongsTo(MailTemplate, {
    onDelete: "CASCADE",
    foreignKey: "mailTemplate"
});

Strategy.belongsTo(Template, {
    onDelete: "CASCADE",
    foreignKey: "pageTemplate"
});

Strategy.belongsTo(Sender, {
    onDelete: "CASCADE",
    foreignKey: "senderId"
});

(async () => {
    await db.sync();
})();