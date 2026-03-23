import * as React from "react";

import "./TaskItem.scss";
import * as echarts from "echarts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretLeft, faCaretRight, faDownload } from "@fortawesome/free-solid-svg-icons";
import { convertToCSV } from "../../tools/csv";
import { fetch1 } from "../../tools/myfetch";

interface TaskItemState {
    listenItems: {id: string, taskId: string, testerId: string, 
        action: "OpenMail" |
                "OpenAttachment"|
                "ClickURL"|
                "UnLocation"|
                "ScanQRCode"|
                "SubmitPasswd"|
                "ForgottenPasswd"|
                "RedirectTo"
    , createAt: Date}[],
    page: number,
};

interface Item {
    OpenMail: number,
    OpenAttachment: number,
    ClickURL: number,
    UnLocation: number,
    ScanQRCode: number,
    SubmitPasswd: number,
    ForgottenPasswd: number,
    RedirectTo: number
}

const getDefaultItem = ():Item => {
    return {
        OpenMail: 0,
        OpenAttachment: 0,
        ClickURL: 0,
        UnLocation: 0,
        ScanQRCode: 0,
        SubmitPasswd: 0,
        ForgottenPasswd: 0,
        RedirectTo: 0
    };
}

interface TaskItemProps {
    taskId: string
};

export default class TaskItem extends React.Component<TaskItemProps, TaskItemState> {
    barDiv = React.createRef<HTMLDivElement>();
    rateDiv = React.createRef<HTMLDivElement>();
    bar: echarts.EChartsType;
    rate: echarts.EChartsType;

    constructor(props: TaskItemProps) {
        super(props);
        this.state = {
            listenItems: [],
            page:0
        };
    }

    render(): React.ReactNode {
        return (
            <div className="taskitem">
                <div className="taskitem-graph">
                    <div className="tg-times" ref={this.barDiv}></div>
                    <div className="tg-rate" ref={this.rateDiv}></div>
                </div>
                <div className="taskitem-items">
                    <div className="tii-header">
                        <span className="tii-tester-id">测试者ID</span>
                        <span className="tii-action">动作</span>
                        <span className="tii-time">时间</span>
                        <span className="tii-ops">
                            <FontAwesomeIcon icon={faDownload} onClick={() => this.handleDownload()}/>
                            <FontAwesomeIcon icon={faCaretLeft} onClick={() => this.handlePre()}/>
                            <FontAwesomeIcon icon={faCaretRight} onClick={() => this.handleNext()}/>
                            <span>{this.state.page + 1}/{Math.ceil(this.state.listenItems.length/100)}</span>
                        </span>
                    </div>
                    <div className="tii-h-line"></div>
                    <div className="tii-body">
                        {this.state.listenItems.slice(this.state.page * 100, this.state.page * 100 + 100).map((e, idx) => {
                            return <div className="tii-item" key={idx}>
                                <span className="tii-tester-id">{e.testerId}</span>
                                <span className="tii-action">{e.action}</span>
                                <span className="tii-time">{e.createAt.toLocaleString()}</span>
                            </div>
                        })}
                    </div>
                </div>
            </div>
        );
    }

    handleNext(): void {
        let page = this.state.page;
        let cnt = Math.ceil(this.state.listenItems.length/100);

        if (cnt - 1 > page) {
            this.setState({
                page: page+1
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

    handleDownload(): void {
        (async () => {
            let data = this.state.listenItems;
            let items: {[id: string]: {tester: string} & Item }  = {};

            data.forEach(val => {
                if (!(val.testerId in items)) {
                    let item = getDefaultItem();
                    item[val.action] = 1;
                    items[val.testerId] = Object.assign({tester: val.testerId}, item);
                } else {
                    items[val.testerId][val.action] = 1;
                }
            });

            let dataArr: ({ tester: string; } & Item)[] = [];
            Object.keys(items).map(e => {
                dataArr.push(items[e]);
            });
            return convertToCSV(dataArr);
        })()
        .then(res => {
            let a = document.createElement("a");
            let blob = new Blob([res], {type: "text/csv"});

            a.download = this.props.taskId + ".csv";
            a.href = URL.createObjectURL(blob);
            a.style.display = "none";

            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

        })
        .catch(err => {
            alert("出错了");            
        });
    }

    componentDidMount(): void {
        
        this.bar = echarts.init(this.barDiv.current);
        this.rate = echarts.init(this.rateDiv.current);

        fetch1(`/admin/getRes?task=${this.props.taskId}`, data => {
            let items = (data as []).map(e => {
                return {
                    id: e["id"], 
                    taskId: e["taskId"],
                    testerId: e["testerId"], 
                    action: e["actionType"],
                    createAt: new Date(e["createdAt"])
                }
            });

            this.setState({
                listenItems: items
            }, () => {
                this.handleGraphLoad();
            });
        });
    }

    handleGraphLoad() {
        let date = Array<number>(30).fill(0)
        .map((_, idx) => new Date(Date.now() - 29*3600*24*1000 + idx * 1*3600*24*1000));
        let date2Idx: {[day: string]: number} = {};
        date.forEach((e, idx) => {
            date2Idx[e.toLocaleDateString()] = idx;
        });

        let map: Item[] = new Array(30);
        for (let i = 0; i < 30; i++) {
            map[i] = getDefaultItem();
        }
        
        let data = this.state.listenItems;
        data.forEach(e => {
            if ((e.createAt.toLocaleDateString() in date2Idx)) {
                map[date2Idx[e.createAt.toLocaleDateString()]][e.action] += 1;
            }
        });
        
        this.bar.setOption({
            title: {
                text: "最近30天点击情况"
            },
            xAxis: {
                data: date.map(e => e.toLocaleDateString())
            },
            yAxis: {},
            grid: {
                left: "5%",
                right: "5%",
                bottom: "10%",
            },
            legend: {},
            tooltip: {
                trigger: "axis",
                axisPointer: {
                    type: "shadow"
                }
            },
            series: [
                {
                    name: "点击链接",
                    type: "bar",
                    data: map.map((e) => {
                        return e.ClickURL;
                    }),
                    stack: "A"
                },
                {
                    name: "打开邮件",
                    type: "bar",
                    data: map.map(e => e.OpenMail),
                    stack: "A"
                },
                {
                    name: "打开附件",
                    type: "bar",
                    data: map.map(e => e.OpenAttachment),
                    stack: "B"
                },
                {
                    name: "禁止定位",
                    type: "bar",
                    data: map.map(e => e.UnLocation),
                    stack: "B"
                },
                {
                    name: "扫描二维码",
                    type: "bar",
                    data: map.map(e => e.ScanQRCode),
                    stack: "B"
                },
                {
                    name: "提交密码",
                    type: "bar",
                    data: map.map(e => e.SubmitPasswd),
                    stack: "C"
                },
                {
                    name: "忘记密码",
                    type: "bar",
                    data: map.map(e => e.ForgottenPasswd),
                    stack: "C"
                },
                {
                    name: "超时不关闭",
                    type: "bar",
                    data: map.map(e => e.RedirectTo),
                    stack: "B"
                }
            ]
        });

        let rate: Item = getDefaultItem();
        map.forEach(e => {
            rate.ClickURL += e.ClickURL;
            rate.ForgottenPasswd += e.ForgottenPasswd;
            rate.OpenAttachment += e.OpenAttachment;
            rate.OpenMail += e.OpenMail;
            rate.RedirectTo += e.RedirectTo;
            rate.ScanQRCode += e.ScanQRCode;
            rate.SubmitPasswd += e.SubmitPasswd;
            rate.UnLocation += e.UnLocation;
        });

        this.rate.setOption({
            title: {
                text: "各动作占比"
            },
            tooltip: {
                trigger: "item",
                axisPointer: {
                    type: "shadow"
                }
            },
            series: [
                {
                    name: "Action Rate",
                    type: "pie",
                    data: [
                        { value: rate.ClickURL, name: '点击链接' },
                        { value: rate.OpenMail, name: '打开邮件' },
                        { value: rate.OpenAttachment, name: '打开附件' },
                        { value: rate.UnLocation, name: '禁止定位' },
                        { value: rate.ScanQRCode, name: '扫描二维码' },
                        { value: rate.ForgottenPasswd, name: '提交密码' },
                        { value: rate.ForgottenPasswd, name: '忘记密码' },
                        { value: rate.RedirectTo, name: '超时不关闭' }
                    ],
                    roseType: "area"
                }
            ]
        });
    }
}