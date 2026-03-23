import math
import torch
import torch.nn as nn
import torch.nn.functional as F


class AttentionDotScale(nn.Module):
    def __init__(self, num_point, key_dim):
        super(AttentionDotScale, self).__init__()

        self.key_dim = key_dim
        self.num_point = num_point
        
        self.x2key = nn.Sequential(nn.Linear(self.num_point, self.key_dim), nn.ReLU())

    def forward(self, x, q):
        d = q.shape[-1]
        key = self.x2key(x.transpose(1, 2))
        q = q.reshape(q.shape[0], 1, -1)
        w = F.softmax(torch.bmm(q.float(), key.transpose(1, 2)/math.sqrt(d)), dim=-1)
        return torch.bmm(w, x.transpose(1, 2)).reshape(q.shape[0], -1)