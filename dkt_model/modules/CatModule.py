import torch
import torch.nn as nn
import torch.nn.functional as F


class CatModule(nn.Module):
    def __init__(self):
        super(CatModule, self).__init__()
    
    def forward(self, x, q):
        x = x.mean(axis=-2)
        return torch.cat([x, q], dim=-1)