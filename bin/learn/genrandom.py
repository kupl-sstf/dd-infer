import numpy as np
import sys
import pickle

def random_val(x):
    t = tuple(x)
    if t in history:
        return history[t]
    else:
        r = numpy.random.randn()
        history[t] = r
        return r

history = {}
class RandModel:
    def decision_function(x):
        return list(map(random_val, x))

clf = RandModel()

savefile = str(sys.argv[1])
pickle.dump(clf, open(savefile, "wb"))

