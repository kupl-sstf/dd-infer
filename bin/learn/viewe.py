import pickle
import xgboost as xgb
import matplotlib.pyplot as plt
import sys

def plot(name, outname):
   model = pickle.load(open(name, 'rb'))
   if hasattr(model, 'feature_importances_'):
       x = model.feature_importances_
       m=min(list(filter(lambda x:x>0,x)))
       x = ['%.3f' % (i/m) for i in x]
       x = ",".join(x)
       if outname == "":
          print(x)
       else:
          f = open(outname, "w")
          f.write(x)
          f.close()
   else:
       x = model.get_score(importance_type='gain')
       a = [int(x[1:]) for x in x.keys()]
       mi = max(a)
       x = ['%.3f' % (x['f'+str(i)]) if 'f'+str(i) in x else "0" for i in range(0,mi)]
       x = ",".join(x)
       if outname == "":
          print(x)
       else:
          f = open(outname, "w")
          f.write(x)
          f.close()

filename=""
if len(sys.argv) > 2 and sys.argv[2] == "-o":
   filename=sys.argv[3]
plot(sys.argv[1], filename)

