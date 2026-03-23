import dataset.WebDataSet as WebDataSet
import modules.DKT as DKT
import torch.utils.data as TData
import torch.nn as nn
import torch
import modules.ClassModule as ClassModule
import matplotlib.pyplot as plt
import numpy as np


def getAc(y_hat, y):
    y_t = nn.functional.softmax(y_hat, -1)
    label = y_t.argmax(dim=-1)
    t = label == y
    return t.sum()/len(t)    

def train_class():
    dataset = WebDataSet.WebsecDataset(r"D:\Code\VSCode_Python\D2L\data\data2.csv")
    train, test = TData.random_split(dataset, [len(dataset)-10, 10])
    trainloader = TData.DataLoader(train, 50, True)
    testloader = TData.DataLoader(test, 1, False)

    net = ClassModule.ClassModule(8, 16, 5, 4, True)
    optm = torch.optim.Adam(net.parameters(), 0.005)

    loss = nn.CrossEntropyLoss()
    Loss = []
    Ac = []

    for epoch in range(100):
        L = []
        net.train()
        for q, X, y in trainloader:
            q = nn.functional.one_hot(q, 5)
            y_hat, track = net(X, q)
            l = loss(y_hat, y)
            optm.zero_grad()
            l.backward()
            optm.step()
            L.append(float(l))
        
        AC = []
        net.eval()
        with torch.no_grad():
            for q_t, X_t, y_t in testloader:
                q_t = nn.functional.one_hot(q_t, 5)
                y_hat, track = net(X_t, q_t)
                AC.append(float(getAc(y_hat, y_t)))
        Loss.append(sum(L)/len(L))
        Ac.append(sum(AC)/len(AC))
        print(f"epoch: {epoch}\t Loss:{sum(L)/len(L):.6f}", end="\t")
        print(f"Accuracy:{sum(AC)/len(AC)}")
    

    fig, ax = plt.subplots(1, 1, dpi=200)
    ax.plot(range(len(Loss)), Ac)
    plt.show()    
    torch.save(net.state_dict(), "./atten.pkt")

    # Loss = np.array(Loss)
    # Ac = np.array(Ac)

    # np.save("./atten_loss", Loss)
    # np.save("./atten_ac", Ac)

def train_dkt():
    dataset = WebDataSet.WebsecDataset(r"D:\Code\VSCode_Python\D2L\data\data2.csv")
    train, test = TData.random_split(dataset, [len(dataset)-10, 10])
    trainloader = TData.DataLoader(train, 50, True)
    testloader = TData.DataLoader(test, 1, False)

    net = DKT.DKTModule(8, 16)
    optm = torch.optim.Adam(net.parameters(), 0.005)

    for epoch in range(1, 101):
        for q, X, y in trainloader:
            net.train()
            L = []
            for q, X, y in trainloader:
                q = nn.functional.one_hot(q, 5)
                y_hat = net(X)
                l = net.loss(y_hat, X)

                optm.zero_grad()
                l.backward()
                optm.step()
                L.append(float(l))
        print(sum(L)/len(L))                
        
    for q, X, y in testloader:
        net.eval()
        y_hat = net(X)
        y_hat = y_hat.detach().numpy()[0]
        print(y_hat.argmax(-1))
        y_hat = np.transpose(y_hat)
        print(np.shape(y_hat))
        print(y_hat)
        print(X)
        plt.imshow(y_hat)
        plt.show()

    torch.save(net.state_dict(), "./dkt.pkt")

train_dkt()
