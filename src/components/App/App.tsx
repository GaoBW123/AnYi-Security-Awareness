import * as React from "react";

import "./App.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBrain, faCubes, faEnvelope, faListCheck, faNewspaper, faPaperPlane, faUser, faUsersGear } from "@fortawesome/free-solid-svg-icons";
import TaskItem from "../TaskItem/TaskItem";
import AdminPage from "../AdminPage/AdminPage";
import MailPage from "../MailPage/MailPage";
import SenderPage from "../SenderPage/SenderPage";
import PagePage from "../PagePage/PagePage";
import TesterPage from "../TesterPage/TesterPage";
import StraPage from "../StraPage/StraPage";
import TaskPage from "../TaskPage/TaskPage";
import { fetch1 } from "../../tools/myfetch";
import Test from "../Test/Test";

interface AppState {
    selectId: number,
    titles: string[],
};

interface AppProps {

};

export default class App extends React.Component<AppProps, AppState> {
    constructor(props: AppProps) {
        super(props);
        this.state = {
            selectId: 0, 
            titles: ["管理员", "邮件", "邮箱", "网页", "测试组", "策略", "任务", "评估"],
        };
    }

    render(): React.ReactNode {
        return (
            <div className="admin">
                <div className="nav">
                    <div className="nav-icon" title="管理员" onClick={(e) => {this.setState({selectId: 0})}}>
                        <FontAwesomeIcon icon={faUser} color="#fff"/>
                    </div>
                    <div className="nav-icon" title="邮件" onClick={(e) => {this.setState({selectId: 1})}}>
                        <FontAwesomeIcon icon={faEnvelope} color="#fff"/>
                    </div>
                    <div className="nav-icon" title="邮箱" onClick={(e) => {this.setState({selectId: 2})}}>
                        <FontAwesomeIcon icon={faPaperPlane} color="#fff"/>
                    </div>
                    <div className="nav-icon" title="网页" onClick={(e) => {this.setState({selectId: 3})}}>
                        <FontAwesomeIcon icon={faNewspaper} color="#fff"/>
                    </div>
                    <div className="nav-icon" title="测试组" onClick={(e) => {this.setState({selectId: 4})}}>
                        <FontAwesomeIcon icon={faUsersGear} color="#fff"/>
                    </div>
                    <div className="nav-icon" title="策略" onClick={(e) => {this.setState({selectId: 5})}}>
                        <FontAwesomeIcon icon={faCubes} color="#fff"/>
                    </div>
                    <div className="nav-icon" title="任务" onClick={(e) => {this.setState({selectId: 6})}}>
                        <FontAwesomeIcon icon={faListCheck} color="#fff"/>
                    </div>
                    <div className="nav-icon" title="任务" onClick={(e) => {this.setState({selectId: 7})}}>
                        <FontAwesomeIcon icon={faBrain} color="#fff"/>
                    </div>
                    <div className="v-track" style={{transform: `translateY(${this.state.selectId * 60}px)`}}></div>
                </div>
                <div className="content">
                    <div className="title">
                        {this.state.titles[this.state.selectId] + ">"}<span className="exit" onClick={() => this.handleLogout()}>退出登录</span>
                    </div>
                    <div className="main-cnt">
                        {
                            this.getPanel()
                        }
                    </div>
                </div>
            </div>
        );
    }
    handleLogout(): void {
        fetch1("/login/logout", data => {
            window.location.assign("/login");
        });
    }
    getPanel(): React.ReactNode {
        switch (this.state.selectId) {
            case 0:
                return <AdminPage style={{}} self={{id: "", name: "", level: 1, createAt: new Date()}}/>;
            case 1: 
                return <MailPage/>;
            case 2: 
                return <SenderPage/>;
            case 3:
                return <PagePage/>;
            case 4:
                return <TesterPage/>;
            case 5:       
                return <StraPage/>;
            case 6:
                return <TaskPage/>;
            case 7:
                return <Test/>;
            default:
            break;
        }
    }

}