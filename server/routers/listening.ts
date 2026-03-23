import { Router } from "express";
import ListenResult, {ActionType} from "../models/ListenResult";
import { UUID } from "crypto";
import Task from "../models/Task";
import RegisterRouter from "../models/RegisterRouter";
import { genPage } from "../tools/templateGen";

const router = Router();

// 点击链接动作
router.get("/" + ActionType.CLIC_URL, (req, res) => {
    let taskId = (req.query["taskId"] ?? "") as UUID;
    let testerId = (req.query["testerId"] ?? "") as UUID;

    ListenResult.create({
        taskId: taskId,
        testerId: testerId,
        actionType: ActionType.CLIC_URL
    }).then((val) => {
        return RegisterRouter.findOne({
            where: {
                taskId: taskId
            }
        });
    }).then(val => {
        if (val === null || val ===undefined) {
            throw new Error("Null Router");
        } 
        let str = genPage(taskId, testerId, val.pageId);
        // res.setHeader("Content-Type", "application/html");
        res.send(str);
    }).catch((err) => {
        res.end();
    });
});

// 禁用定位动作
router.post("/" + ActionType.DISA_LOC, (req, res) => {
    let taskId = (req.query["taskId"] ?? "") as UUID;
    let testerId = (req.query["testerId"] ?? "") as UUID;

    ListenResult.create({
        taskId: taskId,
        testerId: testerId,
        actionType: ActionType.DISA_LOC
    }).catch((err) => {
    });

    res.end();
});

// 忘记密码动作
router.post("/" + ActionType.FORG_PAS, (req, res) => {
    let taskId = (req.query["taskId"] ?? "") as UUID;
    let testerId = (req.query["testerId"] ?? "") as UUID;

    ListenResult.create({
        taskId: taskId,
        testerId: testerId,
        actionType: ActionType.FORG_PAS
    }).catch((err) => {
    });

    res.end();
});

// 打开附件动作
router.get("/" + ActionType.OPEN_ATT, (req, res) => {
    let taskId = (req.query["taskId"] ?? "") as UUID;
    let testerId = (req.query["testerId"] ?? "") as UUID;

    ListenResult.create({
        taskId: taskId,
        testerId: testerId,
        actionType: ActionType.OPEN_ATT
    }).catch((err) => {
    });

    res.end();
});

// 打开邮件动作
router.get("/" + ActionType.OPEN_MAI, (req, res) => {
    let taskId = (req.query["taskId"] ?? "") as UUID;
    let testerId = (req.query["testerId"] ?? "") as UUID;

    ListenResult.create({
        taskId: taskId,
        testerId: testerId,
        actionType: ActionType.OPEN_MAI
    }).catch((err) => {
    });

    res.end();
});

// 重定向动作
router.post("/" + ActionType.REDI_TON, (req, res) => {
    let taskId = (req.query["taskId"] ?? "") as UUID;
    let testerId = (req.query["testerId"] ?? "") as UUID;

    ListenResult.create({
        taskId: taskId,
        testerId: testerId,
        actionType: ActionType.REDI_TON
    }).catch((err) => {
    });

    res.end();
});

// 扫描二维码动作
router.get("/" + ActionType.SCAN_QRC, (req, res) => {
    let taskId = (req.query["taskId"] ?? "") as UUID;
    let testerId = (req.query["testerId"] ?? "") as UUID;

    ListenResult.create({
        taskId: taskId,
        testerId: testerId,
        actionType: ActionType.SCAN_QRC
    }).catch((err) => {
    });

    res.end();
});

// 提交密码动作
router.post("/" + ActionType.SUBM_PAS, (req, res) => {
    let taskId = (req.query["taskId"] ?? "") as UUID;
    let testerId = (req.query["testerId"] ?? "") as UUID;

    ListenResult.create({
        taskId: taskId,
        testerId: testerId,
        actionType: ActionType.SUBM_PAS
    }).then((val) => {
        
    }).catch((err) => {
        
    });

    res.end();
});

export default router;