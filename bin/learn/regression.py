import numpy as np
from sklearn import svm
from sklearn.ensemble import VotingRegressor
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.pipeline import make_pipeline
from sklearn.neighbors import KNeighborsRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import SGDRegressor
from sklearn.linear_model import LinearRegression, LogisticRegression, BayesianRidge
from sklearn.metrics import mean_squared_error, mean_absolute_error
from sklearn.metrics import mean_squared_log_error, mean_absolute_percentage_error
from sklearn.metrics import median_absolute_error
from sklearn.ensemble import RandomForestRegressor
import sys 
import subprocess
import random
import time
import pickle

def read_data (filename):
    data = []
    f = open (filename, "r")
    for line in f:
        d = list (map(lambda x: int(x), line.split()))
        data.append(d)
    #random.shuffle (data)
    return data

def split_data (data):
    X, y = [], []
    for d in data:
        feat, score = d[:-1], d[-1]
        X.append(feat)
        y.append(score)
    return X, y

data = read_data ("train.txt")
X, y_true = split_data (data)

regs = [
    RandomForestRegressor(random_state=1), ## best
    LinearRegression(),
    BayesianRidge(),
    GradientBoostingRegressor(random_state=0),
    KNeighborsRegressor(n_neighbors=2),
    VotingRegressor(estimators=[('gb', GradientBoostingRegressor(random_state=1)), 
                                ('rf', RandomForestRegressor(random_state=1)), 
                                ('lr', LinearRegression())]),
    svm.SVR() ## very slow
    ]
    

for reg in regs:
    print(reg)

    clf = reg.fit(X, y_true)

    # evaluation on the training data
    y_pred = clf.predict(X)
    
    # RMSE (Root Mean Squared Error)
    RMSE = mean_squared_error (y_true, y_pred) ** 0.5
    
    # MAE (Mean Absolute Error)
    MAE = mean_absolute_error (y_true, y_pred) 
    
    # MAPE (Mean Absolute Percentage Error)
    MAPE = mean_absolute_percentage_error (y_true, y_pred)
    
    # Median Absolute Error
    MediAE = median_absolute_error (y_true, y_pred)
    
    print("RMSE  :", RMSE)
    print("MAE   :", MAE)
    print("MAPE  :", MAPE)
    print("MediAE:", MediAE)
    print("")
