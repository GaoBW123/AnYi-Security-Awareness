import { Router, query } from "express";
import Cookie from "../models/Cookie";
import { UUID } from "crypto";
import { Response } from "../tools/Result";
import Administrator from "../models/Administrator";
import MailTemplate from "../models/MailTemplate";
import * as fs from "fs";
import * as path from "path";
import * as multiparty from "multiparty";
import Template from "../models/Template";
import Sender from "../models/Sender";
import TesterGroup from "../models/TesterGroup";
import Tester from "../models/Tester";
import Strategy from "../models/Strategy";
import Task from "../models/Task";
import ListenResult from "../models/ListenResult";
import RegisterRouter from "../models/RegisterRouter";
import db from "../db";
import sendMail from "../tools/mailSender";

const router = Router();
const mailPath = path.join(__dirname, "../files/mail");
const pagePath = path.join(__dirname, "../files/page");

// 获取界面
// 
router.get("/admin", (req, res) => {
    res.send("Main");
});

/********************用户*********************/

// 退出登录
router.post("/exit", (req, res) => {
    Cookie.destroy({
        where: {
            id: req.cookies["adminId"] as UUID
        }
    }).then((val) => {
        res.send("Login");
    }).catch((err) => {
        res.send(Response(null, 500, "Exit Err"));
    });
});

// 添加管理员
// 管理员名称、密码
// 管理员信息
// 需验证是否为 root 用户
router.post("/addAdmin", (req, res) => {
    let adminId = (req.query["adminId"]) as UUID;
    let adminName = (req.query["name"]) as string;
    let adminPass = (req.query["pass"]) as string;

    if (adminName === "" || adminPass === "") {
        res.send(Response(null, 400, "Admin Add Null"));
    } else {
        Administrator.findOne({
            where: {
                id: adminId
            }
        }).then((val) => {
            if (val.name !== "root") {
                res.send(Response(null, 400, "You Not Root"));
            } else {
                return Administrator.create({
                    name: adminName,
                    password: adminPass
                });
            }
        }).then((val) => {
            if (val !== undefined) {
                res.send(Response(val));
            }
        }).catch((err) => {
            res.send(Response(null, 500, "SQL Err"));
        });
    }
});

// 删除管理员
// 管理员 Id
// 删除是否成功
// 需验证是否为 root 用户
router.post("/delAdmin", (req, res) => {
    let adminId = (req.query["adminId"]) as UUID;
    let delId = (req.query["delId"] ?? "") as string;

    if (delId === "") {
        res.send(Response(null, 400, "AdminId Is Null"));
    } else if(delId === adminId) {
        res.send(Response(null, 400, "You Can't Delete Youself"));
    } else {
        Administrator.findOne({
            where: {
                id: adminId
            }
        }).then((val) => {
            if (val.name !== "root") {
                res.send(Response(null, 400, "You Not Root"));
            } else {
                return Administrator.destroy({
                    where: {
                        id: delId
                    }
                });
            }
        }).then((val) => {
            if (val !== undefined) {
                res.send(Response(val));
            }
        }).catch((err) => {
            res.send(Response(null, 500, "SQL Err"));
        });
    }
});

// 修改密码
// 管理员 Id、新密码
// 修改是否成功
router.post("/modPasswd", (req, res) => {
    let adminId = (req.query["adminId"]) as UUID;
    let newPass = (req.query["pass"] ?? "") as string;

    if (newPass === "") {
        res.send(Response(null, 400, "Pass Is Null"));
    } else {
        Administrator.update({
            password: newPass,
            updatedAt: new Date(Date.now())
        } ,{
            where: {
                id: adminId,
            }
        }).then(() => {
            res.send(Response(null));
        }).catch((err) => {
            res.send(Response(null, 500, "SQL Err"));
        });
    }
});

// 获取管理员列表
// 偏移 offset, 数量 limt
// 返回 Admin 列表
// root
router.post("/listAdmin", (req, res) => {
    let adminId = req.query["adminId"] as UUID;
    let offset = Number.parseInt((req.query["offset"] ?? "0") as string);
    let limt = Number.parseInt((req.query["limt"] ?? "100") as string);

    Administrator.findOne({
        where: {
            id: adminId
        }
    }).then((val) => {
        if (val.name !== "root") {
            res.send(Response(null, 400, "You Are Not Root"));
        } else {
            return Administrator.findAll({
                offset: offset,
                limit: limt
            });
        }
    }).then((val) => {
        if (val !== undefined && val !== null) {
            res.send(Response(val));
        }
    }).catch((err) => {
        res.send(Response(null, 500, "SQL Err"));
    });
});

/********************邮件模板*********************/

// 添加邮件模板
// 邮件模板名、模板数据、创建方法
router.post("/addMail", (req, res) => {
    let adminId = req.query["adminId"];
    let mailName = (req.query["name"]) as string;
    let mailMeth = (req.query["meth"]) as string;

    if (mailMeth === "FILE") {
        let form = new multiparty.Form();
        MailTemplate.create({
            name: mailName
        }).then((val) => {
            form.parse(req, (err, fields, files) => {
                let pathS = files["file"];
                if (pathS === null || pathS === undefined) {
                    res.send(Response(null, 400, "Format Err"));
                } else {
                    pathS = pathS[0]["path"];
                    fs.copyFile(pathS, path.join(mailPath, `${val.id}.html`), (err) => {
                        if (err !== null && err !== undefined) {
                            res.send(Response(null, 500, "Save File Err"));
                        } else {
                            fs.rm(pathS, (err) => {
                                if (err !== null) {
                                    console.log(err);
                                }
                            });
                            res.send(Response(val));
                        }
                    });
                }
            });
        }).catch((err) => {
            res.send(Response(null, 500, "SQL Err"));
        });
    } else if (mailMeth === "DATA") {
        let data = req.body["data"];
        MailTemplate.create({
            name: mailName
        }).then((val) => {
            fs.writeFile(path.join(mailPath, `${val.id}.html`), data, (err) => {
                if (err !== null && err !== undefined) {
                    res.send(Response(null, 500, "Save File Err"));
                } else {
                    res.send(Response(val));
                }
            });
        }).catch((err) => {
            res.send(Response(null, 500, "SQL Err"));
        });
    } else {
        res.send(Response(null, 400, "Not Supported Method"));
    }
});

// 修改邮件模板
// 要修改的邮件 Id、名字、内容
// mailId 找不到时有问题
router.post("/modMail", (req, res) => {
    let mailId = (req.query["mail"] ?? "") as string;
    let mailName = (req.query["name"] ?? "") as string;
    let data = req.body["data"];

    MailTemplate.update({
        name: mailName,
        updateAt: new Date(Date.now())
    }, {
        where: {
            id: mailId
        }
    }).then(() => {
        fs.writeFile(path.join(mailPath, `${mailId}.html`), data, (err) => {
            if (err !== null && err !== undefined) {
                res.send(Response(null, 500, "Save File Err"));
            } else {
                res.send(Response(null));
            }
        });
    }).catch((err) => {
        res.send(Response(null, 500, "SQL Err"));
    });
});

// 获取邮件总数
// 
router.post("/cntMail", (req, res) => {
    db.query("SELECT COUNT(*) cnt FROM mail_template").then(v => {
        res.send(Response(v[0][0]));
    }).catch(err => {
        res.send(Response("SQL Err"));
    });
});

// 删除邮件模板
// 邮件Id
router.post("/delMail", (req, res) => {
    let mailId = (req.query["mail"] ?? "") as string;

    MailTemplate.destroy({
        where: {
            id: mailId
        }
    }).then((val) => {
        fs.rm(path.join(mailPath, mailId + ".html"), (err) => {
            if(err !== null && err !== undefined)
                res.send(Response(null, 500, "No File"));
            else
                res.send(Response(val));
        });
    }).catch((err) => {
        res.send(Response(null, 500, "SQL Err"));
    });
});

// 获取邮件模板
// 邮件的Id
router.post("/getMail", (req, res) => {
    let mailId = (req.query["mail"] ?? "") as string;

    MailTemplate.findOne({
        where: {
            id: mailId
        }
    }).then((val) => {
        if (val === null || val === undefined) {
            res.send(Response(null, 400, "No Mail"));
        } else {
            let data = fs.readFileSync(path.join(mailPath, val.id + ".html")).toString();
            res.send(Response({info: val, data: data}));
        }
    }).catch((err) => {
        res.send(Response(null, 500, "SQL Err"));
    });
});

// 获取邮件模板列表
// offset, limit 
router.post("/listMail", (req, res) => {
    let offset = (Number.parseInt((req.query["offset"] ?? "0") as string));
    let limit = (Number.parseInt((req.query["limit"] ?? "100") as string));

    MailTemplate.findAll({
        offset: offset,
        limit: limit
    }).then((val) => {
        res.send(Response(val));
    }).catch((err) => {
        res.send(Response(null, 500, "SQL Err"));
    });
});

/********************网页模板*********************/

// 添加网页模板
// 网页名、方法、数据
router.post("/addPage", (req, res) => {
    let adminId = req.query["adminId"];
    let pageName = (req.query["name"]) as string;
    let pageMeth = (req.query["meth"]) as string;

    if (pageMeth === "FILE") {
        let form = new multiparty.Form();
        Template.create({
            name: pageName
        }).then((val) => {
            form.parse(req, (err, fields, files) => {
                let pathS = files["file"];
                if (pathS === null || pathS === undefined) {
                    res.send(Response(null, 400, "Format Err"));
                } else {
                    pathS = pathS[0]["path"];
                    fs.copyFile(pathS, path.join(pagePath, `${val.id}.html`), (err) => {
                        if (err !== null && err !== undefined) {
                            res.send(Response(null, 500, "Save File Err"));
                        } else {
                            fs.rm(pathS, (err) => {
                                if (err !== null) {
                                    console.log(err);
                                }
                            });
                            res.send(Response(val));
                        }
                    });
                }
            });
        }).catch((err) => {
            res.send(Response(null, 500, "SQL Err"));
        });
    } else if (pageMeth === "DATA") {
        let data = req.body["data"];
        Template.create({
            name: pageName
        }).then((val) => {
            fs.writeFile(path.join(pagePath, `${val.id}.html`), data, (err) => {
                if (err !== null && err !== undefined) {
                    res.send(Response(null, 500, "Save File Err"));
                } else {
                    res.send(Response(val));
                }
            });
        }).catch((err) => {
            res.send(Response(null, 500, "SQL Err"));
        });
    } else {
        res.send(Response(null, 400, "Not Supported Method"));
    }
});

// 修改网页模板
// 网页Id、修改的名称、数据
router.post("/modPage", (req, res) => {
    let pageId = (req.query["page"] ?? "") as string;
    let name = (req.query["name"] ?? "") as string;
    let data = req.body["data"];

    Template.update({
        name: name,
        updateAt: new Date(Date.now())
    }, {
        where: {
            id: pageId
        }
    }).then(() => {
        fs.writeFile(path.join(pagePath, pageId + ".html"), data, (err) => {
            if (err !== null && err !== undefined) {
                res.send(Response(null, 500, "Save File Err"));
            } else {
                res.send(Response(null));
            }
        });
    }).catch((err) => {
        res.send(Response(null, 500, "SQL Err"));
    });
});

// 删除网页模板
// 网页 Id
router.post("/delPage", (req, res) => {
    let pageId = (req.query["page"] ?? "") as string;

    Template.destroy({
        where: {
            id: pageId
        }    
    }).then((val) =>  {
        if (val > 0) {
            fs.rm(path.join(pagePath, pageId + ".html"), (err) => {
                res.send(Response(val));
            });
        } else {
            res.send(Response(val));
        }
    }).catch((err) => {
        res.send(Response(null, 500, "SQL Err"));
    });
});

// 获取网页模板
// pageId
router.post("/getPage", (req, res) => {
    let pageId = (req.query["page"] ?? "") as string;

    Template.findOne({
        where: {
            id: pageId
        }
    }).then((arr) => {
        if (arr === null) {
            res.send(Response(null, 400, "Not Found"));
        } else {
            fs.readFile(path.join(pagePath, arr.id + ".html"), (err, data) => {
                if (err === null) {
                    res.send(Response({info: arr, data: data.toString()}));
                } else {
                    res.send(Response(null, 500, "File Err"));
                }
            });
        }
    }).catch((err) => {
        res.send(Response(null, 500, "SQL Err"));
    });
});

// 获取网页模板列表
// offset. limit
router.post("/listPage", (req, res) => {
    let offset = Number.parseInt(req.query["offset"] as string ?? "0");
    let limit = Number.parseInt(req.query["limit"] as string ?? "100");

    Template.findAll({
        offset: offset,
        limit: limit
    }).then((arr) => {
        res.send(Response(arr));
    }).catch((err) => {
        res.send(Response(null, 500, "SQL Err"));
    });
});

/********************发送者*********************/

// 列出发送者
// offset、limit
router.post("/listSender", (req, res) => {
    let offset = Number.parseInt(req.query["offset"] as string ?? "0");
    let limit = Number.parseInt(req.query["limit"] as string ?? "100");

    Sender.findAll({
        offset: offset,
        limit: limit
    }).then((arr) => {
        res.send(Response(arr));
    }).catch((err) => {
        res.send(Response(null, 500, "SQL Err"));
    });
});

// 获取发送者
// senderId
router.post("/getSender", (req, res) => {
    let senderId = req.query["sender"] as string ?? "";
    
    Sender.findAll({
        where: {
            id: senderId
        }
    }).then((val) => {
        res.send(Response(val));
    }).catch((err) => {
        res.send(Response(null, 500, "SQL Err"));
    });
});

// 添加发送者
// host、port、secure、user、pass
router.post("/addSender", (req, res) => {
    Sender.create(req.body).then((val) => {
        res.send(Response(val));
    }).catch((err) => {
        res.send(Response(null, 500, "SQL Err"));
    });
});

// 删除发送者
// senderId
router.post("/delSender", (req, res) => {
    let senderId = req.query["sender"] as string ?? "";

    Sender.destroy({
        where: {
            id: senderId
        }
    }).then((val) => {
        res.send(Response(val));
    }).catch((err) => {
        res.send(Response(null, 500, "SQL Err"));
    });
});

// 修改发送者
// senderId, host, port, secure, user, pass
router.post("/modSender", (req, res) => {
    let senderId = req.query["sender"] as string ?? "";

    Sender.update(req.body, {
        where: {
            id: senderId
        }
    }).then(() => {
        res.send(Response(null));
    }).catch((err) => {
        res.send(Response(null, 500, "SQL Err"));
    }); 
});

/********************测试者和组*********************/

// 添加组
// name
router.post("/addGroup", (req, res) => {
    let name = req.query["name"] as string;

    TesterGroup.create({
        name: name
    }).then((val) => {
        res.send(Response(val));
    }).catch((err) => {
        res.send(Response(null, 500, "SQL Err"));
    });
});

// 删除组
// groupId
router.post("/delGroup", (req, res) => {
    let groupId = req.query["group"] as string ?? "";

    TesterGroup.destroy({
        where: {
            id: groupId
        }
    }).then((val) => {
        res.send(Response(val));
    }).catch((err) => {
        console.log(err);
        res.send(Response(null, 500, "SQL Err"));
    });
});

// 修改组
// groupId, name
router.post("/modGroup", (req, res) => {
    let groupId = req.query["group"] as string ?? "";
    let name = req.query["name"] as string ?? "";

    TesterGroup.update({
        name: name
    }, {
        where: {
            id: groupId
        }
    }).then(() => {
        res.send(Response(null));
    }).catch((err) => {
        res.send(Response(null, 500, "SQL Err"));
    });
});

// 列出所有组
// offset, limit 
router.post("/listGroup", (req, res) => {
    let offset = Number.parseInt(req.query["offset"] as string ?? "0");
    let limit = Number.parseInt(req.query["limit"] as string ?? "100");

    TesterGroup.findAll({
        offset: offset,
        limit: limit
    }).then((val) => {
        res.send(Response(val));
    }).catch((err) => {
        res.send(Response(null, 500, "SQL Err"));
    });
});

// 列出组成员
// groupId, offset, limit
router.post("/listTester", (req, res) => {
    let groupId = req.query["group"] as string ?? "";
    let limit = Number.parseInt(req.query["limit"] as string ?? "100");
    let offset = Number.parseInt(req.query["offset"] as string ?? "0");

    Tester.findAll({
        where: {
            group: groupId
        },
        offset: offset,
        limit: limit
    }).then((arr) => {
        res.send(Response(arr));
    }).catch((err) => {
        res.send(Response(null, 500, "SQL Err"));
    });
});

// 添加组成员
// name, mail, group, position
router.post("/addTester", (req, res) => {
    Tester.create(req.body).then((val) => {
        res.send(Response(val));
    }).catch((err) => {
        console.log(err);
        res.send(Response(null, 500, "SQL Err"));
    });
});

// 删除组成员
// testerId
router.post("/delTester", (req, res) => {
    let testerId = req.query["tester"] as string ?? "";

    Tester.destroy({
        where: {
            id: testerId
        }
    }).then((val) => {
        res.send(Response(val));
    }).catch((err) => {
        res.send(Response(null, 500, "SQL Err"));
    });
});

// 修改组成员
// testerId, name, mail, group, position
router.post("/modTester", (req, res) => {
    let testerId = req.query["tester"] as string ?? "";

    Tester.update(req.body, {
        where: {
            id: testerId
        }
    }).then(() => {
        res.send(Response(null));
    }).catch((err) => {
        res.send(Response(null, 500, "SQL Err"));
    })
});

/********************策略*********************/

// 列出所有策略
// offset, limit
router.post("/listStra", (req, res) => {
    let offset =  Number.parseInt(req.query["offset"] as string ?? "0");
    let limit = Number.parseInt(req.query["limit"] as string ?? "100");

    Strategy.findAll({
        offset: offset,
        limit: limit
    }).then((arr) => {
        res.send(Response(arr));
    }).catch((err) => {
        res.send(Response(null, 500, "SQL Err"));
    })
});

// 获得策略详细信息
// straId
router.post("/getStra", (req, res) => {
    let straId = req.query["stra"] as string ?? "";

    Strategy.findOne({
        where: {
            id: straId
        }
    }).then((val) => {
        res.send(Response(val));
    }).catch((err) => {
        res.send(Response(null, 500, "SQL Err"));
    });
});

// 添加策略
// name, testerGroup, mailTem, pageTem, senderId
router.post("/addStra", (req, res) => {
    let name = req.body["name"] as string;
    let group = req.body["group"] as UUID;
    let mail = req.body["mail"] as UUID;
    let page = req.body["page"] as UUID;
    let sender = req.body["sender"] as UUID;

    Strategy.create(
        {
            name: name,
            testerGroup: group,
            mailTemplate: mail,
            pageTemplate: page,
            senderId: sender
        }
    ).then((val) => {
        res.send(Response(val));
    }).catch((err) => {
        res.send(Response(null, 500, "SQL Err"));
    });
});

// 删除策略
// straId
router.post("/delStra", (req, res) => {
    let straId = req.query["stra"] as string ?? "";

    Strategy.destroy({
        where: {
            id: straId
        }
    }).then((val) => {
        res.send(Response(val));
    }).catch((err) => {
        res.send(Response(null, 500, "SQL Err"));
    });
});

// 修改策略
// straId, 
router.post("/modStra", (req, res) => {
    let name = req.body["name"] as string;
    let group = req.body["group"] as UUID;
    let mail = req.body["mail"] as UUID;
    let page = req.body["page"] as UUID;
    let sender = req.body["sender"] as UUID;
    let straId = req.query["stra"] as string;

    Strategy.update({
            name: name,
            testerGroup: group,
            mailTemplate: mail,
            pageTemplate: page,
            senderId: sender
        }, {
            where: {
                id: straId
            }
        }
    ).then(() => {
        res.send(Response(null));
    }).catch((err) => {
        res.send(Response(null, 500, "SQL Err"));
    });
});

/********************任务*********************/

// 列出任务
// offset, limit
router.post("/listTask", (req, res) => {
    let offset =  Number.parseInt(req.query["offset"] as string ?? "0");
    let limit = Number.parseInt(req.query["limit"] as string ?? "100");

    Task.findAll({
        offset: offset,
        limit: limit
    }).then((arr) => {
        res.send(Response(arr));
    }).catch((err) => {
        res.send(Response(null, 500, "SQL Err"));
    })
});

// 任务详细信息
// taskId
router.post("/getTask", (req, res) => {
    let taskId = req.query["task"] as string;

    Task.findOne({
        where: {
            id: taskId
        }
    }).then((val) => {
        res.send(Response(val));
    }).catch((err) => {
        res.send(Response(null, 500, "SQL Err"));
    });
});

// 添加任务
// straId, name
router.post("/addTask", (req, res) => {
    let straId = req.query["stra"] as UUID;
    let name = req.query["name"] as string;
    
    Task.create({
        strategyId: straId,
        name: name
    }).then((val) => {
        res.send(Response(val));
    }).catch((err) => {
        console.log(err);
        res.send(Response(null, 500, "SQL Err"));
    });
});

// 删除任务
// taskId
router.post("/delTask", (req, res) => {
    let taskId = req.query["task"] as UUID;

    Task.findOne({
        where: {
            id: taskId
        }
    }).then((val) => {
        if (val === null) {
            res.send(Response(null, 400, "Already Del"));
        } else {
            if(val.statue === "Stoped") {
                return Task.destroy({where: {id: taskId}});
            } else {
                res.send(Response(null, 400, "Stop It First"));
            }
        }
    }).then((val) => {
        if (val !== null && val !== undefined) {
            res.send(Response(val));
        }
    }).catch((err) => {
        res.send(Response(null, 500, "SQL Err"));
    });
});

// 切换任务
// statue
router.post("/switchTask", (req, res) => {
    let taskId = req.query["task"] as UUID;
    let statue = req.query["statue"] as string;

    Task.findOne({
        where: {
            id: taskId
        }
    }).then((val) => {
        if (val === null) {
            res.send(Response(null, 500, "Not Found"));
        } else {
            return val;
        }
    }).then((val) => {
        if (val === null || val === undefined) {
            return 1;
        }
        if (val.statue === "Stoped") {
            if (statue === "Runing") {
                (async () => {
                    try {
                        let stra = await Strategy.findOne({where: {id: val.strategyId}});
                        let testers = await Tester.findAll({where: {group: stra.testerGroup}});
                        let mailTemplate = fs.readFileSync(path.join(mailPath, stra.mailTemplate + ".html"));
                        let sender = await Sender.findOne({where: {id: stra.senderId}});
                        let pageId = stra.pageTemplate;
                        let register = await RegisterRouter.create({pageId: pageId, taskId: val.id, isActive: true});
                        await Task.update({statue: "Runing"}, {where: {id: val.id}});

                        // 发送邮件
                        return sendMail(testers, sender, stra.mailTemplate, taskId);
                    } catch(err) {
                        throw err;                        
                    }
                })().then(() => {
                    res.send(Response(null));
                }).catch((err) => {
                    res.send(Response(null, 500, "Inner Err"));
                });
            } else {
                return 1;
            }
        } else if (val.statue === "Runing") {
            if (statue === "Stoped") {
                // 注销路由
                RegisterRouter.destroy({where: {taskId: val.id}}).then((val) => {
                    return Task.update({statue: "Stoped"}, {where: {id: taskId}});
                }).then(() => {
                    res.send(Response(null));
                }).catch((err) => {
                    res.send(Response(null, 500, "Inner Err"));
                });
            } else {
                return 1;
            }
        } else {
            return 1;
        }
    }).then((val) => {
        if (val !== null && val !== undefined) {
            res.send(Response(null, 500, "Err"));
        }
    }).catch((err) => {
        res.send(Response(null, 500, "SQL Err"));
    });
});

// 获取监听数据
// taskId
router.post("/getRes", (req, res) => {
    let taskId = req.query["task"] as UUID;

    ListenResult.findAll({
        where: {
            taskId: taskId
        }
    }).then((arr) => {
        res.send(Response(arr));
    }).catch((err) => {
        res.send(Response(null, 500, "SQL Err"));
    });
});

router.post("/seachUsers", (req, res) => {
    let straId = req.query["straId"] as UUID;
    Strategy.findOne({
        where: {
            id: straId
        }
    }).then(val => {
        return Tester.findAll({
            where: {
                group: val.testerGroup
            }
        });
    }).then(arr => {
        res.send(Response(arr));
    }).catch(err => {
        res.send(Response(null, 500, "SQL Err"));
    });
});

export default router;