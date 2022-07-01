# dd-infer
Data-driven Infer 

## Installation Guides
### Requirements:
* CPU: 64-bit processor with at least an i686-class processor and 8 cores.
* 32Gb Memory
* 250Gb free disk space
* Virtualbox (>= 5.2)
* Vagrant (>= 2.2.14)

### Building Instructions
* Initialize the virtual machine (creating a new VM, installing necessary packages, and compiling `infer`)
```bash
vagrant plugin install vagrant-disksize
vagrant up  # It may take a long time (>12hr)
```

## Getting Started
All the experiments must be done in the virtual machine.
```bash
vagrant ssh
```

### Preparing the benchmark programs
1. Install required packages for building the benchmark programs.

```bash
pushd /vagrant
sudo ./install.sh
```

2. Build and capture benchmark programs by Infer.

```bash
./setup.sh # Repeat until all pass. It may take a long time (>2-3hr)
```
It should create 85 folders in `/home/vagrant/infer-outs`. Otherwise, run it again.

3. Create call-graphs for the benchmark programs.

Since Infer's call-graph construction algorithm makes the analysis non-deterministic, we compute call-graph information in advance and use it in Infer.
```bash
./reset_cg.sh
```
Call-graphs are generated in `/vagrant/cgs`.

### Running Original Infer
To run original Infer on 
```
$ infer analyze --pulse-only -o /home/vagrant/infer-outs/gawk-5.1.0
```

### Running Data-Driven Infer
```
$ ./bin/DDInfer.sh ~/infer-outs/gawk-5.1.0
```
