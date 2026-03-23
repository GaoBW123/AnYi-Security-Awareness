import torch
import torch.nn as nn
import torch.nn.functional as F

import modules.SelectItem as SelectItem

def init_w(m):
            if isinstance(m, nn.Linear):
                torch.nn.init.normal_(m.weight.data)


class DKTModule(nn.Module):
    def __init__(self, num_points, num_hiddens):
        super(DKTModule, self).__init__()
        
        self.num_points = num_points
        self.num_hiddens = num_hiddens
        
        self.register_buffer('one_hot_idx', torch.arange(0, num_points, 1))

        lstm = nn.LSTM(input_size=self.num_points*2, 
                            hidden_size=self.num_hiddens, 
                            batch_first=False)

        hidden2y = nn.Sequential(nn.Linear(self.num_hiddens, self.num_points), nn.Dropout(0.2), nn.Sigmoid())

        self.net = nn.Sequential(lstm, SelectItem.SelectItem(0), hidden2y)    

        self.net.apply(init_w)        
        
        
        
    def forward(self, x):
        one_hot_x = F.one_hot(x.T.long(), num_classes=self.num_points*2).float()
        time_first_x = self.net(one_hot_x)

        return time_first_x.permute(1, 0, 2)
    
    
    def loss(self, y_hat, y):
        z = F.one_hot(self.get_buffer('one_hot_idx'))
        z = (z * y_hat).sum(-1)
        t = (y >= 8)*1
        return (-(t*torch.log(z)+(1-t)*torch.log(1-z))).sum()/y.shape[0]
    
    def res(self, y_hat):
        max_arg = y_hat.argmax(-1)
        max_val = y_hat.max(-1)
        return [max_arg.tolist()[0], max_val[0].tolist()[0]]
    
    def load(self, path):
         self.load_state_dict(torch.load(path))