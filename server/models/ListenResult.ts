import { UUID } from "crypto";
import { Model, InferAttributes, InferCreationAttributes, CreationOptional, DataTypes } from "sequelize";

import db from "../db";
import Task from "./Task";
import Tester from "./Tester";

export enum ActionType {
    OPEN_MAI = "OpenMail",
    OPEN_ATT = "OpenAttachment",
    CLIC_URL = "ClickURL",
    DISA_LOC = "UnLocation",
    SCAN_QRC = "ScanQRCode",
    SUBM_PAS = "SubmitPasswd",
    FORG_PAS = "ForgottenPasswd",
    REDI_TON = "RedirectTo"
};

export default class ListenResult extends Model<InferAttributes<ListenResult>, InferCreationAttributes<ListenResult>> {
    declare id: CreationOptional<number>;
    declare taskId: UUID;
    declare testerId: UUID;
    declare actionType: ActionType;
    declare createdAt: CreationOptional<Date>;
}

ListenResult.init({
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    taskId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    testerId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    actionType: {
        type: DataTypes.STRING(32),
        allowNull: false
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize: db,
    timestamps: false,
    tableName: "listen_result"
});

ListenResult.belongsTo(Task, {
    onDelete: "CASCADE",
    foreignKey: "taskId"
});

ListenResult.belongsTo(Tester, {
    onDelete: "CASCADE",
    foreignKey: "testerId"
});

(async () => {
    await db.sync();
})();