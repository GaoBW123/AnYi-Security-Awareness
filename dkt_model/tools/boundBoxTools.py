import os
import sys
import xml.etree.cElementTree as ET

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from settings.setting import Setting

abs_path = os.path.abspath(os.path.dirname(__file__))

tree = ET.ElementTree(file=os.path.join(Setting.DataPath, 'VOCtrainval_11-May-2012/VOCdevkit/VOC2012/Annotations/2007_000027.xml'))

print(tree.getroot())

class Annotation:
    def __init__(self) -> None:
        self.folder = ""
        self.filename = ""
        self.source = {
            'database': "",
            'annotation': "",
            'image': ""
        }
        self.size = {
            'width': 0,
            'height': 0,
            'depth': 0
        }
        self.segmented = 0
        self.objects = []
        
    def loadFromXml(self, file):
        try: 
            root = ET.ElementTree(file=file).getroot()
            
        except:
            print()