import pickle
import xgboost as xgb
import matplotlib.pyplot as plt
import sys

def plot(name, outname):
   model = pickle.load(open(name, 'rb'))
   if hasattr(model, 'feature_importances_'):
       if outname == "":
          x = model.feature_importances_
          x = list(map(lambda x: 1 if x>0 else 0, x))
          print(x)
       else:
          f = open(outname, "w")
          x = model.feature_importances_
          x = list(map(lambda x: 1 if x>0 else 0, x))
          for i,v in enumerate(x):
             if v > 0:
                f.write(f'<!-- f{i} -->')
          f.close()
   else:
      xgb.plot_importance(model)
      if outname == "":
         plt.show()
      else:
         plt.savefig(outname)

filename=""
if len(sys.argv) > 2 and sys.argv[2] == "-o":
   filename=sys.argv[3]
plot(sys.argv[1], filename)
