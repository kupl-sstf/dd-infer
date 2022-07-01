import numpy as np
from sklearn.neural_network import MLPClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.gaussian_process import GaussianProcessClassifier
from sklearn.gaussian_process.kernels import RBF
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, AdaBoostClassifier
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import accuracy_score
import sys 
import subprocess
import random
import time
import pickle
import pandas

classifiers = [
#    KNeighborsClassifier(3),  
#    SVC(kernel="linear", C=0.025),
#    SVC(gamma=2, C=1),  ## too slow
#    GaussianProcessClassifier(1.0 * RBF(1.0)), ## too slow
    DecisionTreeClassifier(max_depth=5),
    RandomForestClassifier(max_depth=5, n_estimators=10, max_features=1),
    MLPClassifier(alpha=1, max_iter=1000),
    AdaBoostClassifier(),
    GradientBoostingClassifier(),
    GaussianNB()
    ]

names = [
   # "Nearest Neighbors", "Linear SVM", "RBF SVM", 
   # "Gaussian Process",
         "Decision Tree", "Random Forest", "Neural Net", "AdaBoost", "GradientBoost",
         "Naive Bayes"]

def balance_trainset (X, y, ratio):
    X, y = list(X), list(y)
    n_total = len(y)
    n_pos = y.count(1)
    size = min(n_pos * ratio, n_total)
    print("Data size: ", size)
    return X[:size], y[:size]

def split_data (data):
    X, y = [], []
    for d in data:
        feat, label = d[:-1], d[-1]
        X.append(feat)
        y.append(label)
    return X, y

def read_negdata (filename, n_pos):
    neg = []
    pos = 0
    with open(filename, "r") as f:
        for line in f:
            d = list (map(lambda x: int(x), line.split()))
            neg.append(d)
            pos += 1
            if pos == n_pos:
                break
    return np.array(neg)

def read_data (filename, ratio):
    pos, neg = [], []
    n_pos, n_neg = 0, 0
    with open(filename, "r") as f:
        for line in f:
            d = list (map(lambda x: int(x), line.split()))
            if d[-1] == 1:
                pos.append(d)

    n_pos = len(pos)
    with open(filename, "r") as f:
        for line in f:
            d = list (map(lambda x: int(x), line.split()))
            if d[-1] != 1:
                neg.append(d)
                n_neg += 1
                if n_neg == n_pos:
                    break
    return np.array(pos), np.array(neg)

def train_clf (clf, X, y, W):
    X = np.array(X)
    y = np.array(y)
    clf.fit(X, y)#, sample_weight = W)
    return clf

def classify (clf, x):
    pred = clf.predict ([x])
    if hasattr(clf, "decision_function"):
        prob = clf.decision_function([x])
    elif hasattr (clf, "predict_prob"):
        prob = clf.predict_prob([x])
        if pred == 1:
            prob = np.array ([list(prob)[0][0]])
        else:
            prob = np.array ([list(prob)[0][1]])
    else:
        prob = [0]
    return pred[0], prob[0]

def evaluate_clf (clf, X, y):
    predictions = []
    probabilities = []

    for x in X:
        pred, prob = classify (clf, x)
        predictions.append(pred)
        probabilities.append(prob)

    zipped = [(a,b) for (a,b) in zip(predictions, probabilities)]

    correct, incorrect = 0, 0
    positive, recall = 0, 0
    TP, FP, FN, TN = 0, 0, 0, 0
    
    for i in range(len(y)):
        pred = predictions[i]
        label = y[i]
        if pred == label:
            correct = correct + 1
        else:
            incorrect = incorrect + 1
    
        if y[i] == 1:
            positive = positive + 1
            if pred == 1:
                TP = TP + 1
            else:
                FN = FN + 1
        else:
            if pred == 1:
                FP = FP + 1
            else:
                TN = TN + 1
    
    print("Correct  : ", correct)
    print("Incorrect: ", incorrect)
    
    print("TP : ", TP)
    print("FP : ", FP)
    print("FN : ", FN)
    print("TN : ", TN)

    if (TP + FP) == 0:
        print("precision : n/a")
    else:
        print("precision : ", TP / (TP + FP))

    if positive == 0:
        print("recall : n/a")
    else: 
        print("recall    : ", TP / positive)

def train (clf):
    if(len(sys.argv) > 2): 
        filename_train_pos = str(sys.argv[2])
        filename_train_neg = str(sys.argv[3])
        savefile = str(sys.argv[4])
        balance_ratio = int(sys.argv[5])
    else:
        raise FileNotFoundError("\n File names must be specified\n")
  
    train_and_save_model (clf, filename_train_pos, filename_train_neg, savefile, balance_ratio)

def train_and_save_model (clf, filename_train_pos, filename_train_neg, savefile, balance_ratio):
    start = time.time() 
    train_pos = pandas.read_csv(filename_train_pos, header=None, delimiter=r"\s+")
    train_pos = train_pos.values
    train_neg = pandas.read_csv(filename_train_neg, header=None, delimiter=r"\s+", nrows=(balance_ratio-1)*(len(train_pos)))
    weight = len(train_neg) / len(train_pos)

    print ("---- training set ----")
    print ("#positive examples", len(train_pos))
    print ("#negative examples", len(train_neg))
    print ("#weight ratio", weight, flush=True)
   
    train = np.concatenate((train_pos, train_neg),axis=0)
    del train_pos
    del train_neg
    c = len(train[0])-1
    X = train[:,:c]
    y = train[:,c]
    W = train[:,c] * weight * 10 + 1
    
    print ("Split rate : ", balance_ratio)
    print ("#training examples: ", len(y))
    clf = train_clf (clf, X, y, W)
#    print ("training finished")
#    print ("--- evaluation result ---", flush=True)
#    evaluate_clf (clf, X_train, y_train)


    pickle.dump(clf, open(savefile, "wb"))
    print ("saved model as ", savefile)
#    evaluate_clf(clf, X, y)
    end = time.time()
    print("")
    print("Elapsed time: ", end - start)

def eval_classifiers ():
    filename_train = str(sys.argv[2])
    savefile = str(sys.argv[3])
    for (name, clf) in zip(names, classifiers):
        for r in [2, 4, 8, 16]:
            print("\n")
            print("Training with", name, " and balance ratio =", r, flush=True)
            train_and_save_model (clf, filename_train, savefile, r) 
     
def evaluate(name, model, test):
    c = len(test[0]) - 1
    test_data = test[:,:c]
    test_label = test[:,c]
    test_pred = model.predict(test_data)
    accuracy = accuracy_score(test_label, test_pred)
    tmp = "Accuracy for "+name+" %.2f%% from %d"
    print(tmp % (accuracy * 100.0, len(test)))

model = None
if sys.argv[1] == "train":
    train(GradientBoostingClassifier(random_state=0))
elif sys.argv[1] == "eval":
    eval_classifiers ()
elif sys.argv[1] == "test":
    modelfile = sys.argv[2]
    testfile = sys.argv[3]
    model = pickle.load(open(modelfile, "rb"))
  
    test = pandas.read_csv(testfile, header=None, delimiter=r"\s+", dtype=np.int16).values
    c = len(test[0])-1

    evaluate("all", model, test)
    pos_test = np.array(list(filter(lambda x:x[c] == 1, test)))
    evaluate("positive", model, pos_test)
    neg_test = np.array(list(filter(lambda x:x[c] == 0, test)))
    evaluate("negative", model, neg_test)
else:
    print("Fail")
