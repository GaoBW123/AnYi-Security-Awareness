import { Sequelize } from "sequelize";
import * as path from "path";

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, "db/db.sqlite"),
    logging: () => {}
});

(async () => {
    await sequelize.authenticate().then((val) => {
        console.log("Sqlite connect success!");
    }).catch((err) => {
        console.log("Sqlite connect faild!");
        console.log(err);
    });
})();


export default sequelize;