import torch.utils.data as TD
import pandas as pd
import torch
import numpy as np

position2idx = {
    "Position_1": 0,
    "Position_2": 1,
    "Position_3": 2,
    "Position_4": 3,
    "Position_5": 4
}

grade2idx = {
    'A': 0,
    'B': 1,
    'C': 2,
    'D': 3    
}

class WebsecDataset(TD.Dataset):

    def __init__(self, path: str):
        self.path = path
        self.data = None
        
        self.loadData()
    
    def loadData(self):
        self.data = pd.read_csv(self.path).values
        for idx in range(len(self.data)):
            self.data[idx, 0] = position2idx[self.data[idx, 0]]
            self.data[idx, -1] = grade2idx[self.data[idx, -1]]
        
    def __len__(self):
        return self.data.shape[0]
        
    def __getitem__(self, index):
        q = torch.tensor(self.data[index, 0])
        X = torch.from_numpy(self.data[index, 1:-2].astype(np.int32))
        y = torch.tensor(self.data[index, -1])
        X = torch.arange(0, X.shape[0], 1) + X * X.shape[0]
        
        return q, X, y