import * as React from "react";

import "./TesterPage.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight, faLeftLong, faPlus } from "@fortawesome/free-solid-svg-icons";
import { faEdit, faTrashCan } from "@fortawesome/free-regular-svg-icons";
import TesterItem from "../TesterItem/TesterItem";
import { fetch1 } from "../../tools/myfetch";

interface TesterPageState {
    testerGroup: {id: string, name: string} [],
    page: number,

    createStatue: string,
    editName: string,
    editIdx: number,
    showIdx: number

    showItem: boolean
};

interface TesterPageProps {

};

export default class TesterPage extends React.Component<TesterPageProps, TesterPageState> {
    static editHideAnim = "fade-down-out ease-in-out 0.16s forwards";
    static editShowAnim = "fade-up-in ease-in-out 0.16s forwards";

    constructor(props: TesterPageProps) {
        super(props);
        this.state = {
            testerGroup: [],
            page: 0,
            createStatue: "fade-down-out ease-in-out 0s forwards",
            editName: "",
            editIdx: -1,
            showIdx: -1,
            showItem: false
        };
    }

    render(): React.ReactNode {
        return (<>
            <div hidden={this.state.showItem}>
                <div className="tester-header">
                    <span>用户组</span>
                    <span>1/{Math.ceil(this.state.testerGroup.length/100)}</span>
                    <span><FontAwesomeIcon icon={faPlus} onClick={() => this.handleAdd()}/></span>
                </div>
                <div className="tester-content">
                    {this.state.testerGroup.slice(this.state.page * 100, this.state.page * 100 + 100).map((e, idx) => {
                        return <div className="tester-card" key={idx} onClick={() => this.handleShow(idx)}>
                            <div className="tester-name">{e.name}</div>
                            <div className="tester-id">{e.id}</div>
                            <div className="tester-ops">
                                <FontAwesomeIcon icon={faTrashCan} onClick={(e) => {e.stopPropagation(); this.handleDel(idx)}}/>
                                <FontAwesomeIcon icon={faEdit} onClick={(e) => {e.stopPropagation();this.handleEdit(idx)}}/>
                            </div>
                        </div>;
                    })}
                </div>
                <div className="tester-btns">
                    <span className={"pre-btns-tester " + (this.state.page > 0 ?
                        "tester-page-btn-active" : 
                        "tester-page-btn-noactive")}  onClick={(e) => this.handlePre()}>
                        <FontAwesomeIcon icon={faAngleLeft}/></span>
                    <span className={"next-btns-tester " + (this.state.page < Math.ceil(this.state.testerGroup.length/100) - 1 ? 
                        "tester-page-btn-active" : 
                        "tester-page-btn-noactive")} onClick={(e) => this.handleNext()}><FontAwesomeIcon icon={faAngleRight} /></span>
                </div>
                <div className="tester-edit" style={{animation: this.state.createStatue}}>
                    <div className="tester-edit-cont">
                        <div className="tec-name">
                            <input type="text" value={this.state.editName} onChange={(e) => this.setState({editName: e.target.value})} placeholder="Name" required/>
                            <button className="tec-btn" onClick={() => this.handleCancel()}>取消</button>
                            <button className="tec-btn" onClick={() => this.handleSure()}>确定</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="tester-item" hidden={!this.state.showItem}>
                <div className="tester-back"><FontAwesomeIcon onClick={() => this.handleBack()} icon={faLeftLong}/></div>
                <TesterItem groupId={this.state.showIdx !== -1 
                ? this.state.testerGroup[this.state.showIdx].id
                : ""}/>
            </div>
            </>
        );
    }
    componentDidMount(): void {
        fetch1("/admin/listGroup?limit=99999&offset=0", data => {
            let items = (data as []).map(e => {
                return {
                    id: e["id"],
                    name: e["name"]
                };
            });

            this.setState({
                testerGroup: items,
                page: 0
            })
        });
    }

    handleBack(): void {
        this.setState({
            showIdx: -1,
            showItem: false
        });
    }
    handleShow(idx: number): void {
        this.setState({
            showIdx: idx,
            showItem: true
        })
    }
    handleSure(): void {
        let name = this.state.editName;
        let idx = this.state.editIdx;

        if (name !== "") {
            if (idx === -1) {
                fetch1(`/admin/addGroup?name=${name}`,  (data) => {
                    let item = {
                        id: data["id"],
                        name: data["name"]
                    };

                    let olds = this.state.testerGroup;
                    olds.push(item);

                    this.setState({
                        testerGroup: olds,
                        createStatue: TesterPage.editHideAnim
                    });
                });
            } else {
                fetch1(`/admin/modGroup?group=${this.state.testerGroup[idx].id}&name=${name}`, (data) => {
                    let olds = this.state.testerGroup;
                    olds[idx].name = name;

                    this.setState({
                        testerGroup: olds,
                        createStatue: TesterPage.editHideAnim
                    });
                });
            }
        } else {
            alert("输入不可为空");
        }
    }
    handleCancel(): void {
        this.setState({
            createStatue: TesterPage.editHideAnim
        });
    }
    handleEdit(idx: number): void {
        let item = this.state.testerGroup[idx];

        this.setState({
            createStatue: TesterPage.editShowAnim,
            editName: item.name,
            editIdx: idx
        });
    }
    handleDel(idx: number): void {
        let items = this.state.testerGroup;

        fetch(`/admin/delGroup?group=${items[idx].id}`, {method: "POST"})
        .then(res => res.json())
        .then(data => {if(data["status"] === 200) return data["data"]; else throw new Error(data["message"]);})
        .then(data => {
            items.splice(idx, 1);
            this.setState({
                testerGroup: items
            });
        })
        .catch(err => alert(err));
    }
    handleNext(): void {
        let page = this.state.page;
        let cnt = Math.ceil(this.state.testerGroup.length/100);
        
        if (cnt - 1 > page) {
            this.setState({
                page: page + 1
            })
        }
    }
    handlePre(): void {
        let page = this.state.page;

        if (page > 0) {
            this.setState({
                page: page-1
            });
        }
    }

    handleAdd(): void {
        this.setState({
            createStatue: TesterPage.editShowAnim,
            editName: "",
            editIdx: -1
        });
    }
}