import torch
import torch.nn as nn

import modules.Attention as Attention
import modules.CatModule as CatModule
import modules.DKT as DKT

class ClassModule(nn.Module):
    def __init__(self, num_points, num_hiddens, key_dim, num_class, is_attention=False):
        super(ClassModule, self).__init__()
        self.num_points = num_points
        self.num_hiddens = num_hiddens
        self.key_dim = key_dim
        self.num_class = num_class
        self.is_attention = is_attention
        
        self.DTK = DKT.DKTModule(self.num_points, self.num_hiddens)
        if self.is_attention:
            self.atten = Attention.AttentionDotScale(self.num_points, self.key_dim)
            self.classify = nn.Linear(self.num_points, num_class)
        else:
            self.cat = CatModule.CatModule()
            self.classify = nn.Linear(self.num_points + self.key_dim, num_class)

        self.init_weight()

    def forward(self, x, q):
        know_track = self.DTK(x)
        if self.is_attention:
            pre_class = self.atten(know_track, q)
        else:
            pre_class = self.cat(know_track, q)
            
        return self.classify(pre_class), know_track
    
    def init_weight(self):
        for m in self.modules():
            if isinstance(m, nn.Linear):
                nn.init.xavier_normal_(m.weight)
                nn.init.zeros_(m.bias)
    
    def get_softmaxed(y):
        return torch.softmax(y, dim=-1)
     
    def get_type(self, y):
        softmaxed = ClassModule.get_softmaxed(y)
        print(softmaxed)
        return softmaxed.argmax(axis=1)
        
    def load(self, path):
        self.load_state_dict(torch.load(path))