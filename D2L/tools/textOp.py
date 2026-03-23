import os
import sys
import re
import collections
from matplotlib import pyplot as plt
import numpy as np

sys.path.append("d:\\Code\\VSCode_Python\\D2L")

from settings.setting import Setting

#从文件读取文本
def loadFile(filePath: str, encoding="utf-8"):
    with open(filePath, "r", encoding=encoding) as fin:
        return fin.readlines()
    
#拆分词元
def splitChar(text):
    res = []
    for line in text:
        line = line.strip()
        if line != '\n' and line != '':
            res.append(list(line))
    return res


#词表
class Vocab:
    def __init__(self, tokens) -> None:
        self.C2V = {' ':0, '\n': 1}
        self.V2C = [' ', '\n']    
        self.tokens = sorted(Vocab.tokens_counter(tokens),key=lambda x: x[1], reverse=True)

        for c, times in self.tokens:
            if c not in self.C2V and times >= 0:
                self.V2C.append(c)
                self.C2V[c] = len(self.V2C) - 1
        
        print(self.tokens)
    
    def __len__(self):
        return len(self.V2C)
    
    def __getitem__(self, line):
        return [self.C2V[c] for c in line]
    
    def idx2token(self, line):
        return [self.V2C[idx] for idx in line]
    
    def drawFrep(self):
        times = [times for c, times in self.tokens]
        plt.plot(range(1, len(self.tokens)), times[1:len(self.tokens)])
        plt.show()
    
    def tokens_counter(tokens):
        tempTokens = [token for line in tokens for token in line]
        return collections.Counter(tempTokens).items()
    
    def saveIdxToFile(self, path, tokens):
        with open(path, "w", encoding='utf-8') as fout:
            for line in tokens:
                idxs = self[line]
                for idx in idxs:
                    fout.write(str(idx))
                    fout.write(" ")
                fout.write("\n")    

text = loadFile(os.path.join(Setting.DataPath, "雪中悍刀行.txt"), "gb18030")
tokens = splitChar(text)
vocab = Vocab(tokens)
vocab.saveIdxToFile(os.path.join(Setting.DataPath, "雪中悍刀行.vcb"), tokens)
vocab.drawFrep()
