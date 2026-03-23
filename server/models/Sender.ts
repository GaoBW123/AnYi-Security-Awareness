import { UUID } from "crypto";
import { Model, InferAttributes, InferCreationAttributes, CreationOptional, DataTypes } from "sequelize";

import db from "../db";

export default class Sender extends Model<InferAttributes<Sender>, InferCreationAttributes<Model>> {
    declare id: CreationOptional<UUID>;
    declare host: string;
    declare port: number;
    declare secure: boolean;
    declare user: string;
    declare pass: string;
}

Sender.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    host: {
        type: DataTypes.STRING,
        allowNull: false
    },
    port: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    secure: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    user: {
        type:DataTypes.STRING,
        allowNull: false
    },
    pass: {
        type:DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize: db,
    tableName: "sender",
    timestamps: false
});

(async () => {
    await db.sync();
})();