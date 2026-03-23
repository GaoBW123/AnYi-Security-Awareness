import { UUID } from "crypto";
import { Model, InferAttributes, InferCreationAttributes, CreationOptional, DataTypes } from "sequelize";

import db from "../db";

export default class Template extends Model<InferAttributes<Template>, InferCreationAttributes<Template>> {
    declare id: CreationOptional<UUID>;
    declare name: string;
    declare createAt: CreationOptional<Date>;
    declare updateAt: CreationOptional<Date>;
}

Template.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    createAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updateAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize: db,
    tableName: "template",
    timestamps: false
});

(async () => {
    await db.sync();
})();