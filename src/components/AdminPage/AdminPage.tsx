import * as React from "react";

import "./AdminPage.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrashCan } from "@fortawesome/free-regular-svg-icons";
import { faCheck, faEllipsis, faPlus, faXmark } from "@fortawesome/free-solid-svg-icons";

interface AdminPageState {
    isLoading: boolean,
    createAnim: string,
    isShowCreate: boolean,
    users: {id: string, name: string, level: number, createAt: Date}[],
    editText: string,
    passWord: string
};

interface AdminPageProps {
    style: React.CSSProperties,
    self: {id: string, name: string, level: number, createAt: Date}
};

export default class AdminPage extends React.Component<AdminPageProps, AdminPageState> {
    editInput = React.createRef<HTMLInputElement>();
    passInput = React.createRef<HTMLInputElement>();

    constructor(props: AdminPageProps) {
        super(props);
        this.state = {
                isLoading: false, 
                createAnim: "fade-out 0s ease-in forwards",
                isShowCreate: false,
                users: [],
                editText: "",
                passWord: ""
            };``
    }

    render(): React.ReactNode {
        return (
            <div className="admin-page" style={this.props.style}>
                <div className="ap-header">
                    <span className="ap-id">ID</span><span className="ap-name">用户名</span>
                    <span className="ap-level">等级</span><span className="ap-time">创立时间</span>
                    <span className="ap-setting">设置</span>
                </div>
                    {
                        this.state.users.map((val, idx, arr) => {
                            return <div className="ap-item" key={idx}>
                                        <span className="ap-id ap-iid">{val.id}</span>
                                        <span className="ap-name ap-iname">{val.name}</span>
                                        <span className="ap-level ap-ilevel">{val.level}</span>
                                        <span className="ap-time ap-itime">{val.createAt.toLocaleString()}</span>
                                        <span className="ap-setting ap-isetting">
                                            {/* <FontAwesomeIcon icon={faPenToSquare} fontSize={18} color="#2980b9" onClick={(e) => {this.handleEdit(idx)}}/> */}
                                            <FontAwesomeIcon icon={faTrashCan} fontSize={18} color="#c0392b" onClick={(e) => {this.handleDel(idx)}}/>
                                        </span>
                                    </div>
                        })
                    }
                <div className="ap-item last-ap">
                    {
                        this.state.isLoading ?
                        <FontAwesomeIcon icon={faEllipsis} fade fontSize={30}/> : 
                        <FontAwesomeIcon icon={faPlus} fontSize={25} color="#7f8c8d" className="ap-plus"
                        onClick={(e) => {this.handleCreate()}}/>
                    }
                </div>
                <div className="ap-create" style={{animation: this.state.createAnim}}>
                    <div>
                        <input type="text" placeholder="用户名" 
                        ref={this.editInput}
                        onChange={(e) => this.setState({editText: e.currentTarget.value})}/>
                        <input type="password" placeholder="密码" 
                        ref={this.passInput}
                        onChange={(e) => this.setState({passWord: e.currentTarget.value})}/>
                        <span className="cross"onClick={(e) => {this.handleCancel()}}>
                            <FontAwesomeIcon icon={faXmark} fontSize={20} color="#c0392b"/>
                        </span>
                        <span className="check"  onClick={(e) => {this.handleCheck()}}>
                            <FontAwesomeIcon icon={faCheck} fontSize={20} color="#27ae60"/>
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    fetchAddUser(text: string, pass: string): void {
        fetch(`/admin/addAdmin?name=${text}&pass=${pass}`, {method: "POST"}).then(e => {
            return e.json()
        }).then(data => {
            if ((data["status"] as number) === 200) {
                let newUsers = this.state.users;
                let newUser = {
                    id: data["data"]["id"],
                    name: data["data"]["name"],
                    level: data["data"]["level"] as number,
                    createAt: new Date(data["data"]["createdAt"])
                };
                
                newUsers.push(newUser);

                this.setState({
                    users: newUsers,
                    createAnim: "fade-out 0.2s ease-in forwards",
                    isShowCreate: false
                })
            } else {
                alert(data["messgae"]);
            }
        });
    
    }

    fetchUsers(limit: number, offset: number): void {
        this.setState({isLoading: true});
        fetch(`/admin/listAdmin?offset= ${offset}&limit=${limit}`, {
            method: "POST"
        }).then(res => res.json())
        .then(data => {
            if (data["status"] === 200) {
                let newUsers = this.state.users;
                let items = (data["data"] as []).map((e) => {
                    return {
                        id: e["id"] as string,
                        name: e["name"] as string, 
                        level: e["level"] as number, 
                        createAt: new Date(e["createdAt"] as string)
                    };
                });
                
                this.setState({
                    users: newUsers.concat(items),
                    isLoading: false
                })
            } else {
                alert(data["message"])
            }
        }).catch(data => {
            alert("传输错误！");
        });
    }

    componentDidMount(): void {
        this.fetchUsers(99999, 0);
    }

    handleCancel() {
        let anim = this.state.isShowCreate ? 
        "fade-out 0.2s ease-in forwards" :
        "fade-in 0.2s ease-in forwards";
        this.setState({
            isShowCreate: !this.state.isShowCreate,
            createAnim: anim
        });
    }
    handleCheck() {
        let anim = this.state.isShowCreate ? 
        "fade-out 0.2s ease-in forwards" :
        "fade-in 0.2s ease-in forwards";
        this.setState({
            isShowCreate: !this.state.isShowCreate,
            createAnim: anim
        });

        let text = this.state.editText;
        let pass = this.state.passWord;
        if (text !== "" && pass !== "") {  
            this.fetchAddUser(text, pass);
        } else {
            alert("用户名或密码不能为空");
        }
    }
    handleCreate() {
        let anim = this.state.isShowCreate ? 
        "fade-out 0.2s ease-in forwards" :
        "fade-in 0.2s ease-in forwards";
        this.setState({
            isShowCreate: !this.state.isShowCreate,
            createAnim: anim
        });
    }
    handleDel(idx: number) {
        let id = this.state.users[idx].id ?? "";
        if (id !== "") {
            this.fetchDel(id, idx);
        } else {
            alert("用户不存在");
        }
    }
    fetchDel(id: string, idx: number) {
        fetch(`/admin/delAdmin?delId=${id}`,{method: "POST"}).then(res => 
            res.json()).then(data => {
                if (data["status"] === 200) {
                    let newUsers = this.state.users;
                    newUsers.splice(idx, 1);

                    this.setState({
                        users: newUsers
                    });                    
                } else {
                    alert(data["message"]);
                }
            }).catch(e => {
                alert("传输错误");
            });
    }
    handleEdit(idx: number) {
        this.editInput.current.value = this.state.users[idx].name;
        let anim = this.state.isShowCreate ? 
        "fade-out 0.2s ease-in forwards" :
        "fade-in 0.2s ease-in forwards";
        this.setState({
            isShowCreate: !this.state.isShowCreate,
            createAnim: anim,
            editText:this.state.users[idx].name
        });
    }
}


