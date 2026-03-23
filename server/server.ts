import * as http from "http"; // 改为 http
import * as ws from 'ws';
import * as Express from "express";
import * as path from "path";
import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as fs from "fs";
import * as cors from "cors";

import "./models/sync";
import loginRouter from "./routers/login";
import authRouter from "./routers/auth";
import listenRouter from "./routers/listening";
import adminRouter from "./routers/admin";

const app = Express();
const port = 8081; // 改为 8081，避免与前端冲突

// 全局 CORS 配置
app.use(cors({
  origin: 'http://localhost:8080', // 前端地址
  credentials: true
}));

app.use(cookieParser());
app.use(bodyParser.text());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(Express.static(path.join(__dirname, "public")));

// 路由
app.use("/listen", listenRouter);
app.use("/login", loginRouter);
app.use(authRouter);
app.use("/admin", adminRouter);

// 使用 HTTP 而不是 HTTPS
const server = http.createServer(app);

const wss = new ws.Server({server});

wss.on("connection", (ws: ws) => {
    ws.on("message", (mes: string) => {
        console.log(ws);
    });
    ws.send("Connected");
});

server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// 修复 /app 路由，只处理 GET 请求
app.get("/app", (req, res) => {
    const appHtmlPath = path.join(__dirname, "./public/app.html");
    
    // 检查文件是否存在
    if (!fs.existsSync(appHtmlPath)) {
        console.error("app.html not found at:", appHtmlPath);
        return res.status(404).send("App page not found");
    }
    
    fs.readFile(appHtmlPath, (err, data) => {
        if (err) {
            console.error("Error reading app.html:", err);
            return res.status(500).send("Server error");
        }
        res.setHeader("Content-Type", "text/html");
        res.send(data.toString());
    });
});

// 添加根路径路由，可能登录后重定向到这里
app.get("/", (req, res) => {
    const loginHtmlPath = path.join(__dirname, "./public/login.html");
    
    if (!fs.existsSync(loginHtmlPath)) {
        return res.status(404).send("Login page not found");
    }
    
    fs.readFile(loginHtmlPath, (err, data) => {
        if (err) {
            console.error("Error reading login.html:", err);
            return res.status(500).send("Server error");
        }
        res.setHeader("Content-Type", "text/html");
        res.send(data.toString());
    });
});