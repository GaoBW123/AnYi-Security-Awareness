import * as React from "react";
import * as md5 from "md5";
import "./Login.scss";
import Cookies = require("js-cookie");

interface LoginState {
    name: string,
    pass: string
};

interface LoginProps {

};

export default class Login extends React.Component<LoginProps, LoginState> {
    constructor(props: LoginProps) {
        super(props);
        this.state = {name: "", pass: ""};
    }

    render(): React.ReactNode {
        return (
            <div className="login">
                <div className="input">
                    <div className="title">登录控制台</div>
                    <div className="h-line"></div>
                    <div className="in-box name">
                        <input type="text" required onChange={(e) => {this.setState({name: e.target.value})}}/>
                        <div className="name" >用户名</div>
                    </div>
                    <div className="in-box pass">
                        <input type="password" required onChange={(e) => {this.setState({pass: e.target.value})}}/>
                        <div className="pass">密码</div>
                    </div>
                    <div className="btn">
                        <input type="button" value={"登录"} onClick={(e) => {this.handleSubmit();}}/>
                    </div>
                </div>
            </div>
        );
    }
    
    handleSubmit() {
        if (this.state.name === "" || this.state.name === null || this.state.name === undefined) {
            window.alert("用户名不能为空");
            return;
        }

        if (this.state.pass === null || this.state.pass === undefined || this.state.pass.length < 6 ) {
            window.alert("密码太短");
            return;
        }

        fetch(`/login/submit?name=${this.state.name}&pass=${md5(this.state.pass)}`, {
            method: "POST",
            credentials: "same-origin"
        }).then((val) => {
            return val.json()
        }).then((val) => {
            if (val["status"] === 200) {
                // Cookies.set("adminId", val["data"]["id"], {expires: new Date(val["data"]["vaildAt"]), path: "/", sameSite: "None", secure: true});
                window.location.href = "/app";
            } else {
                alert(val["message"]);
            }
        }).catch((err) => {
            alert("Err");
        });
    }
}