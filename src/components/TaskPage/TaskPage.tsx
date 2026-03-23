import * as React from "react";

import "./TaskPage.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faCircle, faCircleNotch, faLeftLong, faPlane, faPlay, faPlus, faStop } from "@fortawesome/free-solid-svg-icons";
import { faTrashCan } from "@fortawesome/free-regular-svg-icons";
import TaskItem from "../TaskItem/TaskItem";
import { fetch1 } from "../../tools/myfetch";

interface TaskPageState {
    tasks: {id: string, name: string, stra: string, statue: string, createAt: Date} [],
    page: number,
    stra: {id: string, name: string}[],
    editName: string,
    editStra: string,
    creaTeStatue: string,
    showHide: boolean,
    selectTask: string
};

interface TaskPageProps {
    
};

export default class TaskPage extends React.Component<TaskPageProps, TaskPageState> {
    static editHideAnim = "fade-down-out ease-in-out 0.16s forwards";
    static editShowAnim = "fade-up-in ease-in-out 0.16s forwards";

    constructor(props: TaskPageProps) {
        super(props);
        this.state = {
            tasks: [],
            page: 0,
            stra: [],
            editName: "",
            editStra: "",
            creaTeStatue: "fade-down-out ease-in-out 0s forwards",
            showHide: true,
            selectTask: ""
        };
    }

    render(): React.ReactNode {
        return (
            <>
            
            {
            this.state.showHide 
            ?<div className="task" style={{}}>
                    <table>
                        <thead>
                            <td>ID</td>
                            <td>名称</td>
                            <td>状态</td>
                            <td>创建时间</td>
                            <td>操作</td>
                        </thead>
                        <tbody>
                            {this.state.tasks.map((e, idx) => {
                                return <tr key={idx}>
                                    <td>{e.id}</td>
                                    <td>{e.name}</td>
                                    <td><span className="task-statue" style={{backgroundColor: 
                                        e.statue === "Stoped" ? "#e74c3c" : "#27ae60"}}></span>{e.statue}</td>
                                    <td>{e.createAt.toLocaleString()}</td>
                                    <td>
                                        { e.statue === "Stoped" 
                                        ? <FontAwesomeIcon icon={faPlay} color="#27ae60" onClick={() => this.handlePlay(idx)}/> 
                                        : e.statue === "Wait" 
                                        ? <FontAwesomeIcon icon={faCircleNotch} spin color="#6f6f6f"/> 
                                        : <FontAwesomeIcon icon={faStop} color="#c0392b" onClick={() => this.handleStop(idx)}/>}
                                        <FontAwesomeIcon icon={faTrashCan} color="#e74c3c" onClick={() => this.handleDel(idx)}/>
                                        <FontAwesomeIcon icon={faBars}color="#3498db" onClick={() => this.handleMore(idx)}/>
                                    </td>
                                </tr>;
                            })}
                        </tbody>
                    </table>

                    <FontAwesomeIcon icon={faPlus} className="task-add" onClick={() => this.handleAdd()}/>

                    <div className="task-edit" style={{animation: this.state.creaTeStatue}}>
                        <div className="task-edit-cont">
                            <div className="tec-name">
                                <input type="text" placeholder="Name" required onChange={(e) => this.setState({editName: e.target.value})} value={this.state.editName}/>
                            </div>
                            <div className="tec-stra">
                                <select required onChange={(e) => this.setState({editStra: e.target.value})}>
                                <option value={""}></option>
                                    {this.state.stra.map((e, idx) => {
                                        return <option key={idx} value={e.id}>{e.name} {e.id}</option>;
                                    })}
                                </select>
                            </div>
                            <div className="tec-btns">
                                <span className="tec-btn-cancel" onClick={() => this.handleCancel()}>取消</span>
                                <span className="tec-btn-sure" onClick={() => this.handleSure()}>确定</span>
                            </div>
                        </div>
                    </div>
                </div> 
                :<div className="task-item">
                    <div className="task-back" onClick={() => this.handleBack()}>
                        <FontAwesomeIcon icon={faLeftLong} />
                    </div>
                    <TaskItem taskId={this.state.selectTask}/>
                </div>
            }
            </>
        );
    }

    componentDidMount(): void {
        fetch1(`/admin/listTask?limit=99999&offset=0`, data => {
            let items = (data as []).map(e => {
                return {
                    id: e["id"],
                    name: e["name"], 
                    stra: e["strategyId"], 
                    statue: e["statue"], 
                    createAt: new Date(e["createAt"])
                }
            });

            this.setState({
                tasks: items
            });
        });
        fetch1(`/admin/listStra?limit=99999&offset=0`, data => {
            let items = (data as []).map(e => {
                return {
                    id: e["id"],
                    name: e["name"]
                }
            });

            this.setState({
                stra: items
            });
        });
    }

    handleBack(): void {
        this.setState({
            showHide: true
        });
    }
    handleDel(idx: number): void {
        let items = this.state.tasks;

        fetch1(`/admin/delTask?task=${items[idx].id}`, data => {
            items.splice(idx, 1);
            this.setState({
                tasks: items
            });
        });
    }

    handleSure(): void {
        let name = this.state.editName;
        let stra = this.state.editStra;

        if (stra !== "" && name !== "") {
            fetch1(`/admin/addTask?name=${name}&stra=${stra}`, data => {
                let item = {
                    id: data["id"],
                    name: data["name"],
                    statue: data["statue"],
                    stra: data["strategyId"], 
                    createAt: new Date(data["createAt"])
                };
                let olds = this.state.tasks;
                olds.push(item);

                this.setState({
                    tasks: olds,
                    creaTeStatue: TaskPage.editHideAnim
                });
            });
        } else {
            alert("输入不能为空");
        }
    }
    handleCancel(): void {
        this.setState({
            creaTeStatue: TaskPage.editHideAnim,
        });
    }
    handleAdd(): void {
        this.setState({
            creaTeStatue: TaskPage.editShowAnim,
            editName: ""
        });
    }
    handleMore(idx: number): void {
        let task = this.state.tasks[idx];

        this.setState({
            showHide: false,
            selectTask: task.id
        });
    }
    handleStop(idx: number): void {
        let items = this.state.tasks;
        items[idx].statue = "Wait";

        this.setState({
            tasks: items
        });

        fetch1(`/admin/switchTask?task=${items[idx].id}&statue=${"Stoped"}`, data => {
            items[idx].statue = "Stoped";
            this.setState({
                tasks: items
            });
        });
    }
    handlePlay(idx: number): void {
        let items = this.state.tasks;
        items[idx].statue = "Wait";

        this.setState({
            tasks: items
        });

        fetch1(`/admin/switchTask?task=${items[idx].id}&statue=${"Runing"}`, data => {
            items[idx].statue = "Runing";
            this.setState({
                tasks: items
            });
        });
    }
}