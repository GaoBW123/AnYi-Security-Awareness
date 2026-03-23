import { Router } from "express";
import Administrator from "../models/Administrator";
import { Response } from "../tools/Result";
import Cookie from "../models/Cookie";

const router = Router();

// 获取登录页面
router.get("", (req, res) => {
    res.redirect("/login.html");
});

// 提交账户密码
router.post("/submit", (req, res) => {
    let name = req.query["name"] ?? "name";
    let pass = req.query["pass"] ?? "pass";
    
    Administrator.findAll({
        where: {
            name: name as string,
            password: pass as string
        }
    }).then((val) => {
        if (val.length === 1) {
            let user = val[0];
            Cookie.create({
                userId: user.id
            }).then((val) => {
                res.cookie("adminId", val.id, {
                    maxAge: 7 * 3600 * 24 * 1000,
                    httpOnly: true,
                    path: "/",
                    sameSite: "none",
                    secure: true
                });
                res.send(Response(val));
            }).catch((err) => {
                res.send(Response(null, 500, "SQL Err"));
                console.log(err);
            });
        } else {
            res.send(Response(null, 500, "User Repeat"));
        }
    }).catch((err) => {
        res.send(Response(null, 500, "SQL Err"));
        console.log(err);
    });
});

//退出登录
router.post("/logout", (req, res) => {
    Cookie.destroy({
        where: {
            id: req.cookies["adminId"]
        }
    }).then(v => {
        res.send(Response(v));
    }).catch(err => {
        res.send(Response(null, 500, "SQL Err"));
    })
});

export default router;