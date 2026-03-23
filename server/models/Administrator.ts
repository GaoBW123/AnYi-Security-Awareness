import { UUID } from "crypto";
import { Model, InferAttributes, InferCreationAttributes, CreationOptional, DataTypes } from "sequelize";
import db from "../db";
import md5 from "../tools/md5";

export default class Administrator extends Model<InferAttributes<Administrator>, InferCreationAttributes<Administrator>> {
    declare id: CreationOptional<UUID>;
    declare name: string;
    declare password: string;
    declare level: number;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

Administrator.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true 
    },
    name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING(32),
        allowNull: false
    },
    level: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 3
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
}, {
    sequelize: db,
    tableName: "administrator"
});

(async () => {
    await db.sync();
    let res = await Administrator.findAll({
        where: {
            name: "root"
        }
    })
    if (res.length === 0) {
        await Administrator.create({
            name: "root",
            password: md5("123456"),
            level: 0
        });    
    }
})();