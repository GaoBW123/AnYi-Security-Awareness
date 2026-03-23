from time import sleep
import torch
import torch.nn as nn
import torch.nn.functional as F


class SelectItem(nn.Module):
    def __init__(self, idx: int):
        super(SelectItem, self).__init__()
        self.idx = idx
        
    def forward(self, x):
        return x[self.idx]