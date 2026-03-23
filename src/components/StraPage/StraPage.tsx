import * as React from "react";

import "./StraPage.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrashCan } from "@fortawesome/free-regular-svg-icons";
import { faAngleLeft, faAngleRight, faPlus } from "@fortawesome/free-solid-svg-icons";
import { fetch1 } from "../../tools/myfetch";

interface StraPageState {
    stras: {id: string, name: string, group: string, mail: string, page: string, sender: string}[],
    testers: {id: string, name: string}[],
    mail: {id: string, name: string}[],
    pages: {id: string, name: string}[],
    sender: {id: string, name: string}[],
    page: number,

    editName: string,
    editTester: string,
    editMail: string,
    editPage: string,
    editSender: string,
    editIdx: number,
    createStatue: string
};

interface StraPageProps {

};

export default class StraPage extends React.Component<StraPageProps, StraPageState> {
    static editHideAnim = "fade-down-out ease-in-out 0.16s forwards";
    static editShowAnim = "fade-up-in ease-in-out 0.16s forwards";

    constructor(props: StraPageProps) {
        super(props);
        this.state = {
            stras: [],
            testers: [],
            mail: [],
            pages: [],
            sender: [],
            page: 0,
            editMail: "",
            editName: "",
            editPage: "",
            editSender: "",
            editTester: "",
            editIdx: -1,
            createStatue: "fade-down-out ease-in-out 0s forwards"
        };
    }

    render(): React.ReactNode {
        return (
            <>
                <div className="stra-header">
                    <span>用户组</span>
                    <span>{this.state.page + 1}/{Math.ceil(this.state.stras.length/100)}</span>
                    <span><FontAwesomeIcon icon={faPlus} onClick={() => this.handleAdd()}/></span>
                </div>
                <div className="stra-content">
                    {this.state.stras.slice(this.state.page * 100, this.state.page * 100 + 100).map((e, idx) => {
                        return <div className="stra-card" key={idx}>
                            <div className="stra-name">{e.name}</div>
                            <div className="stra-id">{e.id}</div>
                            <div className="stra-ops">
                                <FontAwesomeIcon icon={faTrashCan} onClick={e => this.handleDel(idx)}/>
                                <FontAwesomeIcon icon={faEdit} onClick={e => this.handleEdit(idx)}/>
                            </div>
                        </div>;
                    })}
                </div>
                <div className="stra-btns">
                    <span onClick={e => this.handlePre()} className={"pre-btns-stra " + (this.state.page > 0 
                    ? "stra-page-btn-active" 
                    : "stra-page-btn-noactive")}><FontAwesomeIcon icon={faAngleLeft} /></span>
                    <span onClick={e => this.handleNext()} className={ "next-btns-stra " + ( Math.ceil(this.state.stras.length/100) - 1 > this.state.page 
                    ?"stra-page-btn-active" 
                    :"stra-page-btn-noactive" )}><FontAwesomeIcon icon={faAngleRight} /></span>
                </div>
                <div className="stra-edit" style={{animation: this.state.createStatue}}>
                    <div className="stra-edit-cont">
                        <div className="sec-name">
                            <input type="text" value={this.state.editName} onChange={(e) => this.setState({editName: e.target.value})} placeholder="Name" required/>
                        </div>
                        <div className="sec-tester">
                            <select required onChange={(e) => this.setState({editTester: e.target.value})} defaultValue={""}>
                                <option value={""}></option>
                                {this.state.testers.map((e, idx) => {
                                    return <option key={idx} value={e.id}>{e.name} {e.id}</option>;
                                })}
                            </select>
                        </div>
                        <div className="sec-mail">
                            <select required onChange={(e) => this.setState({editMail: e.target.value})}>
                                <option value={""}></option>
                                {this.state.mail.map((e, idx) => {
                                    return <option key={idx} value={e.id}>{e.name} {e.id}</option>;
                                })}
                            </select>
                        </div>
                        <div className="sec-page">
                            <select required onChange={(e) => this.setState({editPage: e.target.value})}>
                                <option value={""}></option>
                                {this.state.pages.map((e, idx) => {
                                    return <option key={idx} value={e.id}>{e.name} {e.id}</option>;
                                })}
                            </select>
                        </div>
                        <div className="sec-sender">
                            <select required onChange={(e) => this.setState({editSender: e.target.value})}>
                                <option value={""}></option>
                                {this.state.sender.map((e, idx) => {
                                    return <option key={idx} value={e.id}>{e.name} {e.id}</option>;
                                })}
                            </select>
                        </div>
                        <div className="sec-btns">
                            <span className="sec-btn-cancel" onClick={() => this.handleCancel()}>取消</span>
                            <span className="sec-btn-sure" onClick={() => this.handleSure()}>确定</span>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    componentDidMount(): void {
        fetch1("/admin/listStra?limit=99999", data => {
            let items = (data as []).map(e => {
                return {
                    id: e["id"],
                    name: e["name"],
                    group: e["testerGroup"],
                    mail: e["mailTemplate"],
                    page: e["pageTemplate"],
                    sender: e["senderId"]
                }
            });
            this.setState({
                stras: items
            });
        });
        fetch1("/admin/listGroup?limit=99999", data => {
            let items = (data as []).map(e => {
                return {
                    id: e["id"],
                    name: e["name"]
                }
            });
            this.setState({
                testers: items
            });
        });
        fetch1("/admin/listMail?limit=99999", data => {
            let items = (data as []).map(e => {
                return {
                    id: e["id"],
                    name: e["name"]
                }
            });
            this.setState({
                mail: items
            });
        });
        fetch1("/admin/listPage?limit=99999", data => {
            let items = (data as []).map(e => {
                return {
                    id: e["id"],
                    name: e["name"]
                }
            });
            this.setState({
                pages: items
            });
        });
        fetch1("/admin/listSender?limit=99999", data => {
            let items = (data as []).map(e => {
                return {
                    id: e["id"],
                    name: e["user"]
                }
            });
            this.setState({
                sender: items
            });
        });
    }

    handleSure(): void {
        let name = this.state.editName;
        let mail = this.state.editMail;
        let send = this.state.editSender;
        let tester = this.state.editTester;
        let page = this.state.editPage;
        let idx = this.state.editIdx;

        if (name !== "" && mail !== "" && send !== "" && tester !== "" && page !== "") {
            if (idx === -1) {
                fetch1("/admin/addStra", data => {
                    let item = {
                        id: data["id"],
                        name: data["name"],
                        group: data["testerGroup"],
                        mail: data["mailTemplate"],
                        page: data["pageTemplate"],
                        sender: data["senderId"]
                    };

                    let olds = this.state.stras;
                    olds.push(item);
                    this.setState({
                        stras: olds,
                        createStatue: StraPage.editHideAnim
                    });
                }, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: name,
                        mail: mail,
                        group: tester,
                        page: page,
                        sender: send
                    })
                });
            } else {
                fetch1(`/admin/modStra?stra=${this.state.stras[idx].id}`, data => {
                    let olds = this.state.stras;
                    olds[idx].name = name;
                    olds[idx].group = tester;
                    olds[idx].mail = mail;
                    olds[idx].page = page;
                    olds[idx].sender = send;
                    
                    this.setState({
                        stras: olds,
                        createStatue: StraPage.editHideAnim
                    });
                }, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: name,
                        mail: mail,
                        group: tester,
                        page: page,
                        sender: send
                    })
                });
            }
        } else {
            alert("输入不能为空");
        }
    }

    

    handleEdit(idx: number): void {
        let item = this.state.stras[idx];

        this.setState({
            editIdx: idx,
            createStatue: StraPage.editShowAnim,
            editName: item.name
        });
    }
    handleNext(): void {
        let page = this.state.page;
        let cnt = Math.ceil(this.state.stras.length/100)-1;
        if (cnt - 1 > page) {
            this.setState({
                page: page + 1
            });
        }
    }
    handlePre(): void {
        let page = this.state.page;
        if (page > 0) {
            this.setState({
                page: page - 1
            });
        }
    }
    handleDel(idx: number): void {
        let items = this.state.stras;
        fetch1(`/admin/delStra?stra=${items[idx].id}`, data => {
            items.splice(idx, 1);
            this.setState({
                stras: items
            });
        });
    }
    handleCancel(): void {
        this.setState({
            createStatue: StraPage.editHideAnim
        });
    }
    handleAdd(): void {
        this.setState({
            createStatue: StraPage.editShowAnim,
            editName: "",
            editIdx: -1
        })
    }
}