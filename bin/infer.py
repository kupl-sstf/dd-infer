import sys, os
import subprocess
import time
import random
import re
import matplotlib.pyplot as plt

def run_infer(infer_out, k, model, quiet):
   total_time, total_alarms = 0, 0
   try:
       if not os.path.isdir(infer_out):
           print("  * Error: infer-out does not exist for " + infer_out)
           exit(1)
       else:
           start_t = time.time()
           use_model = "--pulse-join-select " + model

           threads = "-j 1"
           threads = ""

           verbose_opt = ""
           if quiet:
               verbose_opt = " -q 2>&1 > /dev/null"

           cmd = f"infer analyze {threads} --pulse-only --pulse-max-disjuncts " + str(k) + " -o " + infer_out + " " + use_model + verbose_opt
           print(cmd, file=sys.stderr)
           os.system(cmd)
           end_t = time.time()
           elapsed_time = end_t - start_t

           report = os.path.join(infer_out, "report.txt")
           f = open (report, "r")
           text = f.read().replace('\n', '')
           issues = re.findall('Found ([0-9]+) issue', text)
           if len(issues) == 0:
               issues_count = 0
           else:
               issues_count = int(issues[0])

           total_time = total_time + elapsed_time
           total_alarms = total_alarms + issues_count

       return total_time, total_alarms
   except:
       print(f"Skipping {p} due to unkonwn exceptions")
       return 0, 0
def run_infer_pre(path, k, model, quiet):
    return run_infer(path, k, model, quiet)
def run_infer_main(path, k, model, quiet):
    return run_infer(path, k, model, quiet)
def pre_analysis(pgm, pre_k, models):
    opt_model = None
    opt_alarms = -1
    pt = 0
    if len(models) == 1:
        return models[0], 0, 0
    for model in models:
        t, a = run_infer_pre(pgm, pre_k, model, True)
        if opt_alarms < a:
            opt_alarms = a
            opt_model = model
        pt = pt + t
    return opt_model, opt_alarms, pt

def run_dd_infer(path, pre_k, main_k, models):
    model, alarms, pretime = pre_analysis(path, pre_k, models)
    run_infer_main(path, main_k, model, False)

if len(sys.argv) < 6:
    print("usage:")
    print("python infer.py PATH 1 5 1 models")
    exit(1)

filename = sys.argv[1]
pre_k = int(sys.argv[2])
main_k = int(sys.argv[3])
models = []

for model in sys.argv[4:]:
    models.append(model)

print(f"prek = {pre_k}, maink = {main_k}, models = {models}", flush=True)
run_dd_infer(filename, pre_k, main_k, models)
