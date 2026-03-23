import { UUID } from "crypto";
import { Model, InferAttributes, InferCreationAttributes, CreationOptional, DataTypes } from "sequelize";

import db from "../db";

export default class TesterGroup extends Model<InferAttributes<TesterGroup>, InferCreationAttributes<TesterGroup>> {
    declare id: CreationOptional<UUID>;
    declare name: string;
}

TesterGroup.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
   name: {
        type: DataTypes.STRING,
        allowNull: false
   } 
}, {
    timestamps: false,
    sequelize: db,
    tableName: "tester_group"
});

(async () => {
    await db.sync();
})();