import { UUID } from "crypto";
import { Model, InferAttributes, InferCreationAttributes, CreationOptional, DataTypes } from "sequelize";

import db from "../db";
import Strategy from "./Strategy";

export default class Task extends Model<InferAttributes<Task>, InferCreationAttributes<Task>> {
    declare id: CreationOptional<UUID>;
    declare name: string;
    declare strategyId: UUID;
    declare statue: CreationOptional<"Runing" | "Pausing" | "Stoped">;
    declare createAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

Task.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    strategyId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    statue: {
        type: DataTypes.STRING(16),
        allowNull: false,
        defaultValue: "Stoped"
    },
    createAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize: db,
    tableName: "task",
    timestamps: false
});

Task.belongsTo(Strategy, {
    onDelete: "CASCADE",
    foreignKey: "strategyId"
});

(async () => {
    await db.sync();
})();