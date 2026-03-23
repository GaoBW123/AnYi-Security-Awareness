from flask import Flask
from flask_cors import CORS, cross_origin
import matplotlib
import torch
from modules import DKT, ClassModule
from flask import request
from dataset import WebDataSet
import matplotlib.pyplot as plt
from torch.utils import data as TData
import numpy as np

app = Flask(__name__, static_folder=r"./static", static_url_path="/static")
cors = CORS(app, resources={r"/*": {"origins": "*"}})

dkt = DKT.DKTModule(8, 16)
dkt.load(r".\model\dkt.pkt")
atten = ClassModule.ClassModule(8, 16, 5, 4, True)
atten.load(r".\model\atten copy.pkt")

dkt.eval()
atten.eval()

matplotlib.use('Agg')
dataset = WebDataSet.WebsecDataset(r"D:\个人资料\本科\大创项目\结项\系统代码\前后端代码\D2L\data2.csv")
trainloader = TData.DataLoader(dataset, 1, False)

img_id = 0

@app.post("/dkt")
@cross_origin()
def getDkt():
    global img_id
    vec = request.json["atten"]
    pos = request.json["pos"]

    X = torch.range(0, 7, 1) + 8*torch.tensor([vec])

    dkt_res = dkt(X)
    mat = dkt_res.detach().numpy()[0]
    mat = np.transpose(mat)

    i = img_id
    img_id += 1    

    fig, ax = plt.subplots()
    ax.imshow(mat)
    ax.set_xlabel("Time")
    ax.set_ylabel("Action Rate")
    fig.savefig(f"./static/{i}.png")

    return {
        "res": dkt.res(dkt_res),
        "url": f"{i}.png"
    }



@app.post("/class")
@cross_origin()
def getClass():
    vec = request.json["atten"]
    pos = request.json["pos"]

    X = torch.range(0, 7, 1) + 8*torch.tensor([vec])
    q = torch.nn.functional.one_hot(torch.tensor([pos]), 5)
    
    dkt_res, _ = atten(X, q)
    
    return {
        "res": (dkt_res.argmax(-1).tolist())[0]
    }


if __name__ == '__main__':
    app.run(port=5000, debug=True)