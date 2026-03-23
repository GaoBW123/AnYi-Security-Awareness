import { UUID } from "crypto";
import { Model, InferAttributes, InferCreationAttributes, CreationOptional, DataTypes } from "sequelize";

import db from "../db";
import TesterGroup from "./TesterGroup";

export default class Tester extends Model<InferAttributes<Tester>, InferCreationAttributes<Tester>> {
    declare id: CreationOptional<UUID>;
    declare name: string;
    declare mail: string;
    declare group: UUID;
    declare position: string;
}

Tester.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    mail: {
        type: DataTypes.STRING,
        allowNull: false
    },
    group: {
        type: DataTypes.UUID, 
        allowNull: false
    },
    position: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize: db,
    timestamps: false,
    tableName: "tester"
});

Tester.belongsTo(TesterGroup, {
    onDelete: "CASCADE",
    foreignKey: "group"
});

(async () => {
    await db.sync();
})();