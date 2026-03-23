import * as React from "react";

import "./TesterItem.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight, faCaretLeft, faCaretRight, faPlus } from "@fortawesome/free-solid-svg-icons";
import { faPenToSquare, faTrashCan } from "@fortawesome/free-regular-svg-icons";
import { fetch1 } from "../../tools/myfetch";

interface TesterItemState {
    testers: {id: string, name: string, mail: string, group: string, position: string}[],
    page: number,
    addWay: number,

    createStatue: string,
    
    editIdx: number,
    editName: string,
    editMail: string,
    editPosition: string,
    oldGroupId: string
};

interface TesterItemProps {
    groupId: string
};

export default class TesterItem extends React.Component<TesterItemProps, TesterItemState> {
    static editHideAnim = "fade-down-out ease-in-out 0s forwards";
    static editShowAnim = "fade-up-in ease-in-out 0.16s forwards";

    constructor(props: TesterItemProps) {
        super(props);
        this.state = {
            testers: [],
            page: 0,
            addWay: 0,
            createStatue: "fade-down-out ease-in-out 0s forwards",
            editIdx: -1,
            editName: "",
            editMail: "",
            editPosition: "",
            oldGroupId: ""
        };
    }


    render(): React.ReactNode {

        if (this.props.groupId !== this.state.oldGroupId) {
            fetch1(`/admin/listTester?group=${this.props.groupId}&limit=99999&offset=0`, (data) => {
                this.setState({
                    testers: data,
                    oldGroupId: this.props.groupId
                });
            });
        }

        return (
            <>
                <div className="testeritem-header">
                    <span>{this.state.testers.length} 测试者</span>
                    <span> {this.state.page  + 1}/{Math.ceil(this.state.testers.length/100)}</span>
                    <span>
                    <FontAwesomeIcon icon={faPlus} onClick={() => this.handleAdd()}/>
                    </span>
                </div>
                <div className="testeritem-cont">
                    {this.state.testers.slice(this.state.page * 100, this.state.page * 100 + 100).map((e, idx) => {
                        return <div className="testeritem-card" key={idx}>
                            <div className="testeritem-user">{e.name}</div>
                            <div className="testeritem-id">{e.id}</div>
                            <div className="testeritem-mail">邮箱: {e.mail}</div>
                            <div className="testeritem-postion">职位: {e.position}</div>
                            <div className="testeritem-op">
                                <FontAwesomeIcon icon={faTrashCan} onClick={() => this.handleDel(idx)} className="testeritem-del" />
                                <FontAwesomeIcon icon={faPenToSquare} onClick={() => this.handleEdit(idx)} className="testeritem-edit" />
                            </div>
                        </div>;
                    })}
                </div>
                <div className="testeritem-btns">
                    <div className={"testeritem-pre " + (this.state.page > 0 ? 
                    "testeritem-btn-active" : 
                    "testeritem-btn-noactive")} onClick={() => this.handlePre()}>
                        <FontAwesomeIcon icon={faAngleLeft}/></div>
                    <div className={"testeritem-next "+ (this.state.page < Math.ceil(this.state.testers.length/100) -1 ?
                     "testeritem-btn-active" :
                     "testeritem-btn-noactive")} onClick={() => this.handleNext()} >
                        <FontAwesomeIcon icon={faAngleRight}/></div>
                </div>
                <div className="testeritem-add" style={{animation: this.state.createStatue}}>
                    <div className="testeritem-add-page">
                        <div className="tiap-header">
                            <span onClick={() => this.setState({addWay: 0})}>表单</span>
                            <span onClick={() => this.setState({addWay: 1})}>文件</span>
                            <span style={{transform: `translateX(${this.state.addWay * 52}px)`}}></span>
                        </div>
                        <div>
                            {this.state.addWay === 0 && <>
                                <div className="tiap-name">
                                        <input type="text" value={this.state.editName} onChange={(e) => this.setState({editName: e.target.value})} name="" placeholder="名称" required/>
                                </div>
                                <div className="tiap-name">
                                    <input type="email" value={this.state.editMail} onChange={(e) => this.setState({editMail: e.target.value})} name="" placeholder="邮箱" required/>
                                </div>
                                <div className="tiap-name">
                                    <input type="text" value={this.state.editPosition} onChange={(e) => this.setState({editPosition: e.target.value})} name="" placeholder="职位"  required/>
                                </div> </> 
                            } {
                                this.state.addWay === 1 && <>
                                    <div className="tiap-file">
                                        <input type="file" />
                                    </div>
                                </>
                            }
                        </div>
                            
                        <div className="tiap-btns">
                            <div className="tiap-btn-cancel" onClick={() => this.handleCancel()}>取消</div>
                            <div className="tiap-btn-sure" onClick={() => this.handleSure()}>确定</div>
                        </div>
                    </div>
                </div>
            </>
        );
    }
    handleSure(): void {
        let name = this.state.editName;
        let mail = this.state.editMail;
        let posi = this.state.editPosition;
        let addWay = this.state.addWay;
        let idx = this.state.editIdx;

        if (name !== "" && mail !== "" && posi !== "") {
            if (idx === -1) {
                if (addWay === 0) {
                    fetch1("/admin/addTester", (data) => {
                        let olds = this.state.testers;
                        olds.push(data);
                        this.setState({
                            testers: olds,
                            createStatue: TesterItem.editHideAnim
                        })
                    }, {
                        method: "POST", 
                        headers: {'Content-Type': "application/json"}, 
                        body: JSON.stringify({
                            name: name,
                            mail: mail,
                            group: this.props.groupId,
                            position: posi
                        })});
                } else if (addWay === 1) {

                }
            } else {
                if (addWay === 0) {
                    fetch1(`/admin/modTester?tester=${this.state.testers[idx].id}`, (data) => {
                        let olds = this.state.testers;
                        olds[idx].name = name;
                        olds[idx].mail = mail;
                        olds[idx].position = posi;

                        this.setState({
                            testers: olds,
                            createStatue: TesterItem.editHideAnim
                        })
                    }, {
                        method: "POST", 
                        headers: {'Content-Type': "application/json"}, 
                        body: JSON.stringify({
                            name: name,
                            mail: mail,
                            position: posi
                        })});
                } else {
                    alert();
                }
            }
        } else {
            alert("输入不能为空");
        }
    }
    handleCancel(): void {
        this.setState({
            createStatue: TesterItem.editHideAnim
        })
    }
    handleNext(): void {
        let page = this.state.page;
        let cnt = Math.ceil(this.state.testers.length/100);

        if (page < cnt - 1) {
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
    handleEdit(idx: number): void {
        let item = this.state.testers[idx];

        this.setState({
            editName: item.name,
            editMail: item.mail,
            editIdx: idx,
            editPosition: item.position,
            createStatue: TesterItem.editShowAnim,
            addWay: 0
        });
    }
    handleDel(idx: number): void {
        let items = this.state.testers;

        fetch1(`/admin/delTester?tester=${items[idx].id}`, (data) => {
            items.splice(idx, 1);
            this.setState({
                testers: items
            });
        });
    }
    handleAdd(): void {
        this.setState({
            createStatue: TesterItem.editShowAnim,
            editIdx: -1,
            editName: "",
            editMail: "",
            editPosition: ""
        });
    }
}