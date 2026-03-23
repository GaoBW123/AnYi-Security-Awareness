import { UUID } from "crypto";
import { Model, InferAttributes, InferCreationAttributes, CreationOptional, DataTypes } from "sequelize";
import db from "../db";
import Administrator from "./Administrator";

export default class Cookie extends Model<InferAttributes<Cookie>, InferCreationAttributes<Cookie>> {
    declare id: CreationOptional<UUID>;
    declare userId: UUID;
    declare createdAt: CreationOptional<Date>;
    declare vaildAt: CreationOptional<Date>;
}

Cookie.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: Date.now()
    },
    vaildAt: {
        type: DataTypes.DATE,
        defaultValue: Date.now() + 1000 * 60 * 60 * 24 * 7
    }
}, {
    sequelize: db,
    timestamps: false,
    tableName: "cookie"
});

Cookie.belongsTo(Administrator, {
    onDelete: "CASCADE",
    foreignKey: {
        name: "userId"
    }
});

(async () => {
    await db.sync();
})();