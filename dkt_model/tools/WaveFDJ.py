from msilib.schema import SelfReg
from time import sleep
import matplotlib.pyplot as plt
import numpy as np



class Point2D:
    def __init__(self, X=np.array([0.0, 0.0]), V=np.array([0.0, 0.0]), A=np.array([0.0, 0.0]), M=1) -> None:
        self.X = X
        self.V = V
        self.A = A
        self.M = M

    def getNext(self, delta_t, new_A):
        new_X = self.X + delta_t * self.V + self.A * delta_t**2 * 0.5
        new_V = self.V + delta_t * self.A
        return Point2D(new_X, new_V, new_A, self.M)


class Track2D:
    def __init__(self, init_state=Point2D()) -> None:
        self.Point2Ds = [init_state]
        self.Positons = []
        self.Vs = []
        self.As = []
        
    def update(self, delta_t, total_time, F):
        t = 0
        while t <= total_time:
            self.Point2Ds.append(self.Point2Ds[-1].getNext(delta_t, F(self)/self.Point2Ds[-1].M))
            t += delta_t
            
    def clear(self, init_state):
        self.Point2Ds.clear()
        self.Point2Ds.append(init_state)

    def getPos(self):
        for point in self.Point2Ds:
            self.Positons.append(point.X)
        return np.array(self.Positons)        
        
    def getVs(self):
        for point in self.Point2Ds:
            self.Positons.append(point.V)
        return np.array(self.Vs)
            
    def getAs(self):
        for point in self.Point2Ds:
            self.Positons.append(point.A)
        return np.array(self.As)

    def drawTrack(self):
        pos = self.getPos()
        plt.scatter(pos[:,0], pos[:,1], c=range(len(pos)))
        plt.show()
        
def sca(v, delta_x, k):
    return v / np.linalg.norm(v) * k * (-delta_x) 

def scaI(update: Track2D):
    return np.array([0.0, -1])

test = Track2D(Point2D(X=np.array([1.0, 0.0]),V=np.array([1.0, 0.0]), A=np.array([0.0, 0.0]), M=1))
test.update(10, 1000, scaI)
print(test.getPos())
test.drawTrack()