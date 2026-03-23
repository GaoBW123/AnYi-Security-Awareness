import { UUID } from "crypto";
import { Model, InferAttributes, InferCreationAttributes, CreationOptional, DataTypes } from "sequelize";

import db from "../db";
import Task from "./Task";
import Template from "./Template";

export default class RegisterRouter extends Model<InferAttributes<RegisterRouter>, InferCreationAttributes<RegisterRouter>> {
    declare id: CreationOptional<UUID>;
    declare pageId: UUID;
    declare taskId: UUID;
    declare isActive: CreationOptional<boolean>;
}

RegisterRouter.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    pageId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    taskId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    sequelize: db,
    tableName: "register_router",
    timestamps: false
});

RegisterRouter.belongsTo(Task, {
    onDelete: "CASCADE",
    foreignKey: "taskId"
});

RegisterRouter.belongsTo(Template, {
    onDelete: "CASCADE",
    foreignKey: "pageId"
});

(async () => {
    await db.sync();
})();