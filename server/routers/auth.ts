import { Router } from "express";
import Cookie from "../models/Cookie";
import Administrator from "../models/Administrator";
import { Op } from "sequelize";

const router = Router();

router.use((req, res, next) => {
    let cookie = (req.cookies["adminId"] ?? "none") as string;
    console.log(cookie);

    if (cookie == "none") {
        res.redirect("/login.html");
    } else {
        Cookie.findOne({
            where: {
                id: cookie,
                vaildAt: {
                    [Op.gte]: Date.now()
                }
            }
        }).then((val) => {
            req.query["adminId"] = val.userId;
            next();
        }).catch((err) => {
            res.redirect("/login.html");
        });
    }
});

export default router;