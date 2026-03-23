import * as React from "react";

import "./PagePage.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrashCan } from "@fortawesome/free-regular-svg-icons";
import { faAngleLeft, faAngleRight, faPlus } from "@fortawesome/free-solid-svg-icons";
import Editor from "react-simple-code-editor";
import hljs from "highlight.js";
import "highlight.js/styles/a11y-light.css";
import { number } from "echarts";

interface PagePageState {
    pages: {id: string, name: string, createAt: Date} [],
    page: number,
    
    pageCode: string,
    pageName: string,
    createStatue: string,

    editType: "C" | "M",
    editIdx: number,
    showName: string
};

interface PagePageProps {

};

export default class PagePage extends React.Component<PagePageProps, PagePageState> {
    static editHideAnim = "fade-down-out ease-in-out 0.2s forwards";
    static editShowAnim = "fade-up-in ease-in-out 0.2s forwards";

    constructor(props: PagePageProps) {
        super(props);
        this.state = {
            pages: [],
            page: 0,
            pageCode: "",
            pageName: "",
            createStatue: "fade-down-out ease-in-out 0s forwards",
            editType: "C",
            editIdx: -1,

            showName: ""
        };
    }

    test = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 , 13, 14];

    render(): React.ReactNode {
        return (
            <>
                <div className="page-head">
                    <span>{this.state.pages.length} 个网页</span>
                    <span className="page-head-add">
                        <FontAwesomeIcon icon={faPlus} fontSize={20} onClick={() => this.handleAddpage()}/>
                    </span>
                </div>
                <div className="page-cont">
                    {this.state.pages.slice(this.state.page * 100, this.state.page * 100 + 100).map((e, idx) => {
                        return <div className="card" key={idx} style={{gridColumn: `${idx % 4 + 1}`, gridRow: `${Math.floor(idx/4) + 1}`}}>
                            <div className="page-image"></div>
                            <div className="page-op">
                                <FontAwesomeIcon icon={faTrashCan} className="page-del" onClick={() => this.handleDle(idx)}/>
                                <FontAwesomeIcon icon={faPenToSquare} className="page-edit" onClick={() => this.handleEdit(idx)}/>
                            </div>
                            <div className="page-info">
                                <div className="page-name">{e.name}</div>
                                <div className="page-id">ID: {e.id}</div>
                                <div className="page-create">创建时间: {e.createAt.toLocaleString()}</div>
                            </div>
                        </div>
                    })}
                </div>
                <div className="page-page">
                    <div className={`page-pre-page ${this.state.page > 0 ? "page-active" : "page-noactive"}`}
                    onClick={() => this.handlePre()}>
                        <FontAwesomeIcon icon={faAngleLeft} className=""/>
                    </div>
                    <div className={`page-next-page ${Math.ceil(this.state.pages.length/100) - 1 > this.state.page ? "page-active" : "page-noactive"}`}
                    onClick={() => this.handleNext()}>
                        <FontAwesomeIcon icon={faAngleRight} className=""/>
                    </div>
                </div>
                <div className="page-edit-cont" style={{animation: this.state.createStatue}}>
                    <div className="page-detail">
                        <div className="md-name">
                            <input type="text" value={this.state.pageName} required placeholder="网页名称" onChange={(e) => this.setState({pageName: e.target.value})}/>
                        </div>
                        <div className="md-edit">
                            <div className="md-input-file">
                                <input type="file" accept="text/html" onChange={(e) => this.handleFileChange(e)}/>
                            </div>
                            <div className="md-editor">
                            <Editor 
                                value={this.state.pageCode}
                                onValueChange={code => this.setState({pageCode: code})}
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
        fetch("/admin/listPage?offset=0&limit=99999", {method: "POST"})
        .then(res => res.json())
        .then(data => {if(data["status"] === 200) return data["data"]; else throw new Error(data["message"]);})
        .then(data => {
            let olds = this.state.pages;
            let items = (data as []).map(e => {
                return {
                    id: e["id"], 
                    name: e["name"], 
                    createAt: new Date(e["createAt"])
                }
            });
            olds = olds.concat(items);

            this.setState({
                page: 0,
                pages: olds
            });
        })
        .catch(err => alert(err));
    }

    handleSure(): void {
        let name = this.state.pageName;
        let code = this.state.pageCode;

        if (name !== "" && code !== "") {
            if (this.state.editType === "C") {
                fetch("/admin/addPage?meth=DATA&name=" + name, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        data: code
                    })
                }).then(res => res.json())
                .then(data => {
                    if(data["status"] === 200) {
                        return data["data"];
                    } else {
                        throw new Error(data["message"]);
                    }
                }).then(e => {
                    let newIt = {
                        id: e["id"],
                        name: e["name"],
                        createAt: new Date(e["createAt"])
                    };

                    let its = this.state.pages;
                    its.push(newIt);

                    this.setState({
                        pages: its,
                        createStatue: PagePage.editHideAnim
                    });
                }).catch(err => alert(err));
            } else if (this.state.editType === "M") {
                let item = this.state.pages[this.state.editIdx];

                fetch("/admin/modPage?name=" + name + "&page=" + item.id, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        data: code
                    })
                }).then(res => res.json())
                .then(data => {
                    if(data["status"] === 200) {
                        return data["data"];
                    } else {
                        throw new Error(data["message"]);
                    }
                }).then(e => {
                    let its = this.state.pages;
                    its[this.state.editIdx].name = name;
                    this.setState({
                        pages: its,
                        createStatue: PagePage.editHideAnim
                    });
                }).catch(err => alert(err));
            }
        } else {
            alert("输入不能为空");
        }
    }
    handleCancle(): void {
        this.setState({
            createStatue: PagePage.editHideAnim
        })
    }
    handleFileChange(e: React.ChangeEvent<HTMLInputElement>): void {
        if (e.target.files["length"] === 1) {
            let file = e.target.files[0];
            let reader = new FileReader();
            
            reader.readAsText(file, "UTF-8");
            reader.onloadend = (e) => {
                this.setState({pageCode: e.target.result as string});
            };

        } else {
            this.setState({pageCode: ""});
        }
    }
    handleNext(): void {
        let cnt = this.state.pages.length;
        let page = this.state.page;

        if (Math.ceil(cnt/100) - 1 > page) {
            this.setState({
                page: page + 1
            });
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
    handleEdit(idx: number): void {
        let item = this.state.pages[idx];

        this.setState({
            createStatue: PagePage.editShowAnim,
            editType: "M",
            editIdx: idx
        });


        fetch(`/admin/getPage?page=${item.id}`, {method: "POST"})
        .then(res => res.json())
        .then(data => {
            if (data["status"] !== 200) {
                throw new Error(data["messsage"]);
            } else {
                return data["data"];
            }
        })
        .then(data => {
            this.setState({
                pageName: data["info"]["name"],
                pageCode: data["data"]
            });
        })
        .catch(err => {
            alert(err);
        });
    }

    handleDle(idx: number): void {
        let item = this.state.pages[idx];
        let olds = this.state.pages;

        fetch("/admin/delPage?page=" + item.id, {method: "POST"})
        .then(res => res.json())
        .then(data => {
            if(data["status"] !== 200) throw new Error(data["message"]);
        }).then(() => {
            olds.splice(idx, 1);
            this.setState({
                pages: olds
            })
        }).catch(err => alert(err));
    }

    handleAddpage() {
        this.setState({
            createStatue: PagePage.editShowAnim,
            editType: "C"
        });
    }
}