import * as React from "react";

import "./MailPage.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrashCan } from "@fortawesome/free-regular-svg-icons";
import { faAngleLeft, faAngleRight, faArrowLeft, faLeftLong, faPlus, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import Editor from "react-simple-code-editor";
import hljs from "highlight.js";
import "highlight.js/styles/a11y-light.css";

const test = "";

interface MailPageState {
    mails: {id: string, name: string, createAt: Date} [],
    
    isHasPre: boolean,
    isHasNext: boolean,
    
    editType: "C" | "M",

    page: number,
    
    mailCode: string,
    mailName: string,
    mailCnt: number,

    createStatu: string,
    editIdx: number,
};

interface MailPageProps {

};

export default class MailPage extends React.Component<MailPageProps, MailPageState> {
    static editHideAnim = "fade-down-out ease-in-out 0.16s forwards";
    static editShowAnim = "fade-up-in ease-in-out 0.16s forwards";

    mailName = React.createRef<HTMLInputElement>();

    constructor(props: MailPageProps) {
        super(props);
        this.state = {
            mails: [],
            isHasNext: false,
            isHasPre: false,
            page: 0,
            mailCode: "",
            mailName: "",
            createStatu: "fade-down-out ease-in-out 0s forwards",
            editType: "C",
            editIdx: -1,
            mailCnt: 0
        };
    }

    test = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 , 13, 14];

    render(): React.ReactNode {
        return (
            <>
                <div className="mail-head">
                    <span>{this.state.mailCnt} 封邮件</span>
                    <span className="mail-head-add">
                        <FontAwesomeIcon icon={faPlus} fontSize={20} onClick={() => this.handleAddMail()}/>
                    </span>
                </div>
                <div className="mail-cont">
                    {this.state.mails.map((e, idx) => {
                        return <div className="card" key={idx} style={{gridColumn: `${idx % 4 + 1}`, gridRow: `${Math.floor(idx/4) + 1}`}}>
                            <div className="mail-image"></div>
                            <div className="mail-op">
                                <FontAwesomeIcon icon={faTrashCan} className="mail-del" onClick={() => this.handleDle(idx)}/>
                                <FontAwesomeIcon icon={faPenToSquare} className="mail-edit" onClick={() => this.handleEdit(idx)}/>
                            </div>
                            <div className="mail-info">
                                <div className="mail-name">{e.name}</div>
                                <div className="mail-id">ID: {e.id}</div>
                                <div className="mail-create">创建时间: {e.createAt.toLocaleString()}</div>
                            </div>
                        </div>
                    })}
                </div>
                <div className="mail-page">
                    <div className={`mail-pre-page ${this.state.isHasPre ? "page-active" : "page-noactive"}`}
                    onClick={() => this.handlePre()}>
                        <FontAwesomeIcon icon={faAngleLeft} className=""/>
                    </div>
                    <div className={`mail-next-page ${this.state.isHasNext ? "page-active" : "page-noactive"}`}
                    onClick={() => this.handleNext()}>
                        <FontAwesomeIcon icon={faAngleRight} className=""/>
                    </div>
                </div>
                <div className="mail-edit-cont" style={{animation: this.state.createStatu}}>
                    <div className="mail-detail">
                        <div className="md-name">
                            <input type="text" ref={this.mailName} required placeholder="邮件名称" onChange={(e) => this.setState({mailName: e.target.value})}/>
                        </div>
                        <div className="md-edit">
                            <div className="md-input-file">
                                <input type="file" accept="text/html" onChange={(e) => this.handleFileChange(e)}/>
                            </div>
                            <div className="md-editor">
                            <Editor 
                                value={this.state.mailCode}
                                onValueChange={code => this.setState({mailCode: code})}
                                highlight={code => hljs.highlight(code, {language: "html"}).value}
                                style={{
                                    width: "1000px",
                                    outline: "none",
                                    fontFamily: '"Fira code", "Fira Mono", monospace',
                                    fontSize: "16px",
                                    minHeight: "540px"
                                }}
                                tabSize={4}
                                padding={"10px"}
                                preClassName="editor-pre"
                                textareaClassName="editor-text"
                                />
                            </div>
                        </div>
                        <div className="md-btns">
                            <div className="md-btn-cancel" onClick={() => this.handleCancle()}>取消</div>
                            <div className="md-btn-sure" onClick={() => this.handleSure()}>确定</div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    componentDidMount(): void {
        fetch(`${test}/admin/listMail?limit=999999&offset=0`, {method: "POST"})
        .then(res => res.json())
        .then(data => {
            if (data["status"] === 200) {
                return (data["data"] as []).map(e => {
                    console.log(e);
                    return {
                        id: e["id"],
                        name: e["name"],
                        createAt: new Date(e["createdAt"])
                    }
                });
            } else {
                throw new Error(data["message"]);
            }
        }).then(es => {
            this.setState({
                mails: es,
                mailCnt: es.length,
                page: 0,
                isHasPre: false,
                isHasNext: es.length > 100
            });
        }).catch(err => {
            alert(err);
        })
    }

    handleSure(): void {
        let name = this.state.mailName;
        let code = this.state.mailCode;
        let type = this.state.editType;
        let cnt = this.state.mailCnt;

        if (name === "") {
            alert("邮件名不能为空");
        } else {
            if (type === "C") {
                fetch(`${test}/admin/addMail?meth=${"DATA"}&name=${name}`, {
                    method: "POST",
                    body: JSON.stringify({data: code}),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(res => res.json())
                .then(data => {
                    if (data["status"] === 200) {
                        let mail = data["data"];
                        let mailObj = {
                            id: mail["id"],
                            name: mail["name"],
                            createAt: mail["createdAt"]    
                        };
                        
                        let newMails = this.state.mails;
                        newMails.push(mailObj);

                        this.setState({
                            mails: newMails,
                            mailCode: "",
                            mailName: "",
                            createStatu: MailPage.editHideAnim,
                            mailCnt: cnt+1
                        });

                    } else {
                        alert(data["message"]);
                    }
                }).catch(err => {
                    alert("传输错误");
                });
            } else if (type === "M") {
                let idx = this.state.editIdx;
                let item = this.state.mails[idx];
                let name = this.state.mailName;
                let code = this.state.mailCode;

                fetch(`${test}/admin/modMail?mail=${item.id}&name=${name}`, {
                    method: "POST",
                    body: JSON.stringify({data: code}),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(res => res.json())
                .then(data => {
                    if (data["status"] === 200) {
                        let mails = this.state.mails;
                        mails[idx].name = name;
                        this.setState({
                            mails: mails,
                            editIdx: -1,
                            createStatu: MailPage.editHideAnim,
                            mailName: "",
                            mailCode: ""
                        });
                    } else {
                        alert(data["message"]);
                    }
                }).catch(err => {
                    alert(err);
                });
            }
        }
    }
    handleCancle(): void {
        this.setState({
            createStatu: MailPage.editHideAnim
        })
    }
    handleFileChange(e: React.ChangeEvent<HTMLInputElement>): void {
        if (e.target.files["length"] === 1) {
            let file = e.target.files[0];
            let reader = new FileReader();
            
            reader.readAsText(file, "UTF-8");
            reader.onloadend = (e) => {
                this.setState({mailCode: e.target.result as string});
            };

        } else {
            this.setState({mailCode: ""});
        }
    }
    handleNext(): void {
        let page = this.state.page;
        let cnt = this.state.mailCnt;
        let isHasNext = this.state.isHasNext;

        if (isHasNext && Math.ceil(cnt/100) > page) {
            page++;
            this.setState({
                isHasNext: page >= Math.ceil(cnt/100),
                isHasPre: true,
                page: page
            });
        }
    }
    handlePre(): void {
        let page = this.state.page;
        let cnt = this.state.mailCnt;
        let isHasPre = this.state.isHasPre;
    
        if (isHasPre && page > 0) {
            page--;
            this.setState({
                isHasNext: true,
                isHasPre: page > 0,
                page: page
            });
        }
    }
    handleEdit(idx: number): void {
        let item = this.state.mails[idx];
        this.mailName.current.value = item.name;

        this.setState({
            createStatu: MailPage.editShowAnim,
            editType: "M",
            editIdx: idx,
            mailName: item.name
        });

        fetch(`${test}/admin/getMail?mail=${item.id}`, {method: "POST"})
        .then(res => res.json())
        .then(data => {
            if (data["status"] == 200) {
                this.setState({
                    mailCode: data["data"]["data"]
                })
            } else {
                alert(data["message"]);
            }
        }).catch(err => alert(err));
    }
    handleDle(idx: number): void {
        let item = this.state.mails[idx];
        let page = this.state.page;
        let cnt = this.state.mailCnt;

        fetch(`${test}/admin/delMail?mail=${item.id}`, {method: "POST"})
        .then(res => res.json())
        .then(data => {
            if (data["status"] === 200) {
                cnt--;
                if (Math.ceil(cnt/100) <= page) {
                    page--;
                }
                let newMails = this.state.mails;
                newMails.splice(idx, 1);

                this.setState({
                    mails: newMails,
                    page: page,
                    mailCnt: cnt
                });
            } else {
                alert(data["message"]);
            }
        }).catch(err => {
            alert(err);
        });

    }
    handleAddMail() {
        this.mailName.current.value = "";
        this.setState({
            createStatu: MailPage.editShowAnim,
            editType: "C",
            mailName: ""
        });
    }
}