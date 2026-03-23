import * as React from "react";

import "./SenderPage.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight, faCheck, faCheckCircle, faPenToSquare, faPlus, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { number } from "echarts";

interface SenderPageState {
    senders: {id: string , host: string, port: number, secure: boolean, user: string, pass: string} [],
    host: string,
    port: number,
    isTLS: boolean,
    mailBox: string,
    pass: string,
    page: number,
    createStatue: string,
    editType: "C" | "M" ,
    modIdx: number
};

interface SenderPageProps {

};

export default class SenderPage extends React.Component<SenderPageProps, SenderPageState> {
    static editHideAnim = "fade-down-out ease-in-out 0.16s forwards";
    static editShowAnim = "fade-up-in ease-in-out 0.16s forwards";

    host = React.createRef<HTMLInputElement>();
    port = React.createRef<HTMLInputElement>();
    user = React.createRef<HTMLInputElement>();
    pass = React.createRef<HTMLInputElement>();

    constructor(props: SenderPageProps) {
        super(props);
        this.state = {
            host: "",
            port: -1,
            isTLS: true,
            mailBox: "",
            pass: "",

            page: 0,
            senders: [],

            createStatue: "fade-down-out ease-in-out 0s forwards",
            editType: "C",
            modIdx: -1
        }
    }

    render(): React.ReactNode {
        return (
            <>
                <div className="send-header">
                    <span>{this.state.senders.length} 邮箱</span>
                    <span> {this.state.page  + 1}/{Math.ceil(this.state.senders.length/100)}</span>
                    <span>
                    <FontAwesomeIcon icon={faPlus} onClick={() => this.handleAdd()}/>
                    </span>
                </div>
                <div className="send-cont">
                    {this.state.senders.slice(this.state.page * 100, this.state.page * 100 + 100).map((e, idx) => {
                        return <div className="sender-card" key={idx}>
                            <div title="安全连接" className="sender-secure" hidden={!e.secure}>
                                <FontAwesomeIcon icon={faCheckCircle} />
                            </div>
                            <div className="sender-user">{e.user}</div>
                            <div className="sender-id">{e.id}</div>
                            <div className="sender-host">Host: {e.host}</div>
                            <div className="sender-port">Port: {e.port}</div>
                            <div className="sender-op">
                                <FontAwesomeIcon icon={faTrashCan} onClick={() => this.handleDel(idx)} className="sender-del" />
                                <FontAwesomeIcon icon={faPenToSquare} onClick={() => this.handleEdit(idx)} className="sender-edit" />
                            </div>
                        </div>;
                    })}
                </div>
                <div className="send-btns">
                    <div className={"send-pre " + (Math.ceil(this.state.page) > 0 ? "send-btn-active" : "send-btn-noactive")} onClick={() => this.handlePre()}><FontAwesomeIcon icon={faAngleLeft} /></div>
                    <div className={"send-next " + (Math.ceil(this.state.senders.length/100) - 1 > this.state.page ? "send-btn-active" : "send-btn-noactive" )} onClick={() => this.handleNext()} ><FontAwesomeIcon icon={faAngleRight} /></div>
                </div>
                <div className="sender-add" style={{animation: this.state.createStatue}}>
                    <div className="sender-add-page">
                        <div className="sap-host">
                            <input ref={this.host} type="text" onChange={(e) => this.setState({host: e.currentTarget.value})} placeholder="Host" required/>:
                            <input ref={this.port} type="number" onChange={(e) => this.setState({port: Number.parseInt(e.currentTarget.value)})} placeholder="Port" required />
                        </div>
                        <div className="sap-secu">
                            <input type="radio" name="sap-sec" onChange={(e) => e.target.checked ? this.setState({isTLS: true}) : ""} defaultChecked/>
                            <label >使用TLS</label>
                            <input type="radio" name="sap-sec" onChange={(e) => e.target.checked ? this.setState({isTLS: false}) : ""}/>
                            <label >不使用TLS</label>
                        </div>
                        <div className="sap-name">
                            <input ref={this.user} type="email" name="" placeholder="邮箱" onChange={(e) => this.setState({mailBox: e.target.value})} required/>
                        </div>
                        <div className="sap-pass">
                            <input ref={this.pass} type="password" name="" placeholder="验证密码" onChange={(e) => this.setState({pass: e.target.value})} required/>
                        </div>
                        <div className="sap-btns">
                            <div className="sap-btn-cancel" onClick={() => this.handleCancel()}>取消</div>
                            <div className="sap-btn-sure" onClick={() => this.handleSure()}>确定</div>
                        </div>
                    </div>
                </div>
            </> 
        );
    }

    componentDidMount(): void {
        fetch("/admin/listSender?offset=0&limit=99999", {method: "POST"})
        .then(res => res.json())
        .then(data => {
            if (data["status"] === 200) {
                return data["data"];
            } else {
                throw new Error(data["message"]);
            }
        }).then(data => {
            this.setState({
                page: 0,
                senders: data
            });
        }).catch(err => alert(err));
    }

    handleSure(): void {
        let host = this.state.host;
        let port = this.state.port;
        let secure = this.state.isTLS;
        let user = this.state.mailBox;
        let pass = this.state.pass;
        let olds = this.state.senders;
        let idx = this.state.modIdx;

        if (host !== "" && user !== "" && pass !== "") {
            if (this.state.editType === "C") 
                fetch("/admin/addSender", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        host: host,
                        port: port,
                        secure: secure,
                        user: user,
                        pass: pass
                    })
                }).then(res => res.json())
                .then(data => {
                    if (data["status"] === 200) {
                        return data["data"];
                    } else {
                        throw new Error(data["message"]);
                    }
                }).then(data => {
                    let items = this.state.senders;
                    items.push({
                        id: data["id"],
                        host: data["host"],
                        port: data["port"],
                        secure: data["secure"],
                        user: data["user"],
                        pass: data["pass"]
                    });

                    this.setState({
                        senders: items,
                        createStatue: SenderPage.editHideAnim
                    })
                }).catch(err => {
                    alert(err);
                });
            else if (this.state.editType === "M") 
                fetch(`/admin/modSender?sender=${olds[idx].id}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        host: host,
                        port: port,
                        secure: secure,
                        user: user,
                        pass: pass
                    })
                }).then(res => res.json())
                .then(data => {
                    if (data["status"] === 200) {
                    } else {    
                        throw new Error(data["message"]);
                    }
                }).then(() => {
                    olds[idx].host = host;
                    olds[idx].port = port;
                    olds[idx].secure = secure;
                    olds[idx].user = user;
                    olds[idx].pass = pass;

                    this.setState({
                        senders: olds,
                        createStatue: SenderPage.editHideAnim
                    });
                }).catch(err => alert(err));
        } else {
            alert("输入不能为空");
        }
    }

    handleCancel(): void {
        this.setState({
            createStatue: SenderPage.editHideAnim,
        });
    }
    handleNext(): void {
        let cnt = this.state.senders.length;
        let page = this.state.page;

        if (Math.ceil(cnt/100)-1 > page) {
            this.setState({
                page: page+1
            });
        }
    }
    handlePre(): void {
        let cnt = this.state.senders.length;
        let page = this.state.page;

        if (page > 0) {
            this.setState({
                page: page-1
            });
        }
    }
    handleEdit(idx: number): void {
        let item = this.state.senders[idx];
        this.host.current.value = item.host;
        this.port.current.value = item.port.toString();
        this.pass.current.value = item.pass;
        this.user.current.value = item.user;

        this.setState({
            modIdx: idx,
            createStatue: SenderPage.editShowAnim,
            host: item.host,
            port: item.port,
            pass: item.pass,
            mailBox: item.user,
            editType: "M"
        })
    }
    handleDel(idx: number): void {
        let item = this.state.senders[idx];

        fetch(`/admin/delSender?sender=${item.id}`, {method: "POST"})
        .then(res => res.json())
        .then(data => {
            if (data["status"] === 200) {
            } else {
                throw new Error(data["message"]);
            }
        }).then(() => {
            let olds = this.state.senders;
            olds.splice(idx, 1);
            this.setState({
                senders: olds
            });
        }).catch(err => alert(err));

    }
    handleAdd(): void {
        this.host.current.value = "";
        this.port.current.value = "0";
        this.pass.current.value = "";
        this.user.current.value = "";

        this.setState({
            createStatue: SenderPage.editShowAnim,
            host: "",
            port: 0,
            pass: "",
            mailBox: "",
            editType: "C",
        });
    }
}