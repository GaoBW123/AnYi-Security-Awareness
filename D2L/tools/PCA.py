import imp
from tkinter import Menu
from sklearn import datasets
import numpy as np
import pandas
import matplotlib.pyplot as plt
from sklearn.decomposition import PCA

irs = datasets.load_iris()

def pca(data, n_com):
    mean_val = data.mean(axis=0)
    center = data - mean_val
    
    covMat =  center.T * center / center.shape[0]
    w, v = np.linalg.eig(covMat)
    
    idxMin2Max = np.argsort(w)
    idxMax2Min = idxMin2Max[::-1]

    tfMat = v[:,idxMax2Min[:n_com]]
    
    return data * tfMat, tfMat, w, v

data = pandas.read_csv(r"data\secon.csv")
data.fillna(data.mean(), inplace=True)


# lowdMat, tfMat, w, v = pca(np.mat(data), 590)
# print(lowdMat)

# fpc = lowdMat[:, 0].var() / lowdMat.var(axis=0).sum()
# print(fpc)

# vp = lowdMat.var(axis=0) / lowdMat.var(axis=0).sum()
# accvp =np.cumsum(vp)

# print()
# 绘制主成分方差占比随主成分数目的变化图
# 从图可以看出，为不损失太多信息，可选择保留前6个主成分
# plt.rcParams["font.sans-serif"]=["SimHei"] #设置字体
# plt.rcParams["axes.unicode_minus"]=False #该语句解决图像中的“-”负号的乱码问题
# plt.bar(range(10), np.array(accvp)[0,:10])
# plt.xlabel("主成分")
# plt.ylabel("累积占比")
# plt.xticks(range(10))
# plt.show()

data = np.mat(data)

lowdMat, tfMat, _, _ = pca(data, 590)


meanVal = np.mean(data, axis=0)  # 均值
reconMat = lowdMat * tfMat.T# 重构数据
print(f'reconMat.shape:{reconMat.shape} lowMat.shape{lowdMat.shape}')

# ppp = PCA(590)
# lma = ppp.fit_transform(data)
# reconMat = ppp.inverse_transform(lma)

errMat = data - reconMat  # 重构误差
froerr = np.linalg.norm(errMat, 'fro')  # Frobenius范数计算
print(froerr * errMat.size)
