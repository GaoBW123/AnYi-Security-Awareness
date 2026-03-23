import * as React from "react";

import "./Test.scss";
import { fetch1 } from "../../tools/myfetch";

interface TestState {
       tasks: {id: string, name: string, stra: string, createdAt: Date}[],
       hidden: boolean,
       actions: {pos: number, action: number[], userId: string, load: boolean} [],
       users: {[id: string]: {id: string, position: string }},
       posToIdx: {[pos: string]: number},
       res: {user: string, dkt: number[], dkt_url: string, level: number} []
};

interface TestProps {

};

enum ACTIONS {    
    OPEN_MAI = "OpenMail",
    OPEN_ATT = "OpenAttachment",
    CLIC_URL = "ClickURL",
    DISA_LOC = "UnLocation",
    SCAN_QRC = "ScanQRCode",
    SUBM_PAS = "SubmitPasswd",
    FORG_PAS = "ForgottenPasswd",
    REDI_TON = "RedirectTo"
};

let ACTION_TO_IDX = {
    OpenMail: 0,
    OpenAttachment: 1,
    ClickURL: 2,
    UnLocation: 3,
    ScanQRCode: 4,
    SubmitPasswd: 5,
    ForgottenPasswd: 6,
    RedirectTo: 7
};

let msg = [
    "打开陌生邮件时，保持警惕",
    "随意打开陌生文件，可能存在安全风险",
    "随意点击陌生链接，可能存在安全风险",
    "对网站权限信息控制较好",
    "随意扫描陌生二维码",
    "高危，容易提交私密关键信息",
    "高危，容易提供私密信息",
    "警告，没有结束关闭意识"
];

let level = [
    "A","B","C","D"
]
export default class Test extends React.Component<TestProps, TestState> {
    

    constructor(props: TestProps) {
        super(props);
        this.state = {
            tasks: [],
            hidden: false,
            actions: [],
            users: {},
            posToIdx: {},
            res: []
        }
    }



    render(): React.ReactNode {
        return (
            <>
                <div className="card-grid" hidden={this.state.hidden} style={{display: this.state.hidden ? "none" : "grid"}}>
                    {
                        this.state.tasks.map((v, i) => {
                            return <div key={i} className="card-eval" onClick={() => this.handleClick(i)}>
                                <h4 style={{ margin: "10px 0px 0px 10px" }}>{v.name}</h4>
                                <p style={{ marginLeft: "10px" }}><small>创建与：{v.createdAt.toLocaleString()}</small></p>
                            </div>;
                        })
                    }
                </div>
                <div className="eval" hidden={!this.state.hidden}>
                    {
                        this.state.res.map((val, idx) => {
                            return <div key={idx} className="eval-card">
                                <div className="eval-level">安全意识等级：{level[val.level]}</div>
                                <div className="eval-name">
                                    <h5>用户：{val.user}</h5>
                                </div>
                                <div className="eval-mat" title="用户行为追踪轨迹">
                                    <img src={`http://localhost:5000/static/${val.dkt_url}`} alt="" />
                                </div>
                                <div className="eval-advice">
                                    <h3>安全问题与建议：</h3>
                                    {
                                        val.dkt.filter((it, idinx) => val.dkt.indexOf(it) == idinx)
                                        .map((v) => {
                                            return <div>{msg[v]}</div>
                                        })
                                    }
                                </div>
                            </div>;
                        })
                    }
                </div>
            </>
        );
    }

    componentDidMount(): void {
        fetch1("/admin/listTask?limit=1000", data => {
            let res = (data as []).map((val, idx) => {
                return {
                    id: val["id"] as string,
                    name: val["name"] as string,
                    stra: val["strategyId"] as string,
                    createdAt: val["createAt"] as Date
                };
            });
            this.setState({tasks: res});
        })
    }

    handleClick(i: number) {
        this.setState({hidden: true});
        fetch(`/admin/seachUsers?straId=${this.state.tasks[i].stra}`, {method: "POST"})
        .then(res => res.json())
        .then(data => {
            if(data["status"] == 200) return data["data"];
            else throw new Error(data["message"]);
        })
        .then(val => {
            let posToIdx: {[pos:string] : number} = {};
            let users: {[idx: string]: {id: string, position: string }} = {};
            (val as []).forEach((v ,idx) => {
                users[v["id"]] = {id: "", position: ""};
                users[v["id"]].id = v["id"] as string;
                users[v["id"]].position = v["position"] as string;
                if (!(v["positon"] in posToIdx)) {
                    posToIdx[v["position"]] = Object.keys(posToIdx).length;
                }
            });
            this.setState({users: users, posToIdx: posToIdx});
            return {users: users, posToidx: posToIdx};
        })
        .then(val => {
            return fetch(`/admin/getRes?task=${this.state.tasks[i].id}`, {method: "POST"});
        })
        .then(res => res.json())
        .then(data => {
            if (data["status"] == 200) return data["data"];
            else throw new Error(data["message"]);
        })
        .then(val => {
            let actions:{[userId: string]: {pos: number, action: number[], userId: string, load: boolean}} = {};
            let users = this.state.users;
            Object.keys(users).forEach((v, id) => {
                actions[users[v].id] = {
                    pos: this.state.posToIdx[users[v].position],
                    action: new Array<number>(8).fill(0, 0, 8),
                    userId: users[v].id as string,
                    load: true
                }
            });


            (val as []).forEach((val, idx) => {
                if (val["testerId"] in actions) {
                    actions[val["testerId"]].action[ACTION_TO_IDX[val["actionType"]]] = 1;
                } else {
                    actions[val["testerId"]] = {
                        pos: this.state.posToIdx[this.state.users[val["testerId"]].position],
                        action: new Array<number>(8).fill(0, 0, 8),
                        userId: val["testerId"] as string,
                        load: true
                    }
                }
            });

            let actionArr: {pos: number, action: number[], userId: string, load: boolean}[]= [];
            Object.keys(actions).forEach(val => {
                actionArr.push(actions[val]);
            });

            this.setState({actions: actionArr});
            return actionArr;
        })
        .then(val => {
            let arr: {user: string, dkt: number[], dkt_url: string, level: number} [] = [];
            
            val.forEach((v, idx)=> {
                fetch("http://localhost:5000/dkt",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        atten: v.action,
                        pos: v.pos
                    })
                })
                .then(res => res.json())
                .then(val => {
                    arr.push({
                        user: v.userId,
                        dkt: val['res'][0].filter((v: number, i: number) => val['res'][1][i] > 0.9) as number[],
                        dkt_url: val['url'] as string,
                        level: 0
                    });

                    return fetch("http://localhost:5000/class",
                    {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            atten: v.action,
                            pos: v.pos
                        })
                    })
                   
                }) 
                .then(res => res.json())
                .then(val => {
                    arr[idx].level = val['res']
                    this.setState({res: arr});
                })
                .catch(err => console.log(err));
            });
        })
        .catch(err => alert(err));
    }

}