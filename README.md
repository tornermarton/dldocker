# DL DOCKER

Base docker image for deep learning projects.

Author: Márton Torner
 
## Usage

### Important notes
 
If the images is used as a base for other docker images please 
DO NOT override the ENTRYPOINT (or don't forget to start supervisord service).
DO NOT specify CMD since it will make the container unable to run.

### Run container

To run the container use the following command:

```bash
docker run -d                   \
-p 3000:3000 -p 7722:22         \
--name dldocker-example         \
tornermarton/dldocker:latest
```

Optional arguments:

- `--runtime=nvidia` Allow the container to use the GPU (if the host has any)

- `--restart=unless-stopped` Restart container on system restart, failure, etc.

- `-v [/path/on/host]:/data` Attach data folder on host to /data (persistent storage)

- `-v [/path/on/host]:/datasets` Attach datasets folder on host to /datasets (persistent storage)

### Docker Compose

An easier way to run and control the container is to use docker-compose (recommended).
Example content of the docker-compose.yml file:

```yaml
version: "2.3"

services:
  dldocker:
    runtime: nvidia
    image: tornermarton/dldocker:latest
    container_name: dldocker-example
    hostname: dldocker
    ports:
      - "7722:22"
      - "3000:3000"
    tty: true
    environment:
      - CUDA_VISIBLE_DEVICES=0
    restart: unless-stopped
    volumes:
      - [/path/on/host]:/data
      - [/path/on/host]:/datasets
```

To run the container use the following command: `docker-compose up -d`.

### Default services

The container has two default services:

- SSH

- A simple dashboard to display the host machine performance measures (CPU, RAM, GPU usage).

### Miniconda

Miniconda3 is installed on the container (and a base env). 
If you need help to create and use your own environment please read:
[https://docs.conda.io/projects/conda/en/latest/user-guide/tasks/manage-environments.html](https://docs.conda.io/projects/conda/en/latest/user-guide/tasks/manage-environments.html)

After installing a new conda env please run the following commands to add the code directory to sys.path (so the module inside it can be imported):
```bash
su
conda activate [ENV_NAME]
conda develop /home/dld-user/code/
```

### Adding services to supervisord

If you want to adda new service to supervisord to run in in the background (e.g. Jupyter Notebook) 
create a new conf file and save it under: /etc/supervisor/conf.d/[name].conf (on the container).
The main supervisord service reads all configurations (*.conf) from this folder.

For a detailed description please read [http://supervisord.org/configuration.html](http://supervisord.org/configuration.html).

Example (/etc/supervisor/conf.d/tensorboard.sv.conf):

```text
[program:tensorboard]
command=/usr/miniconda3/envs/condaenv/bin/tensorboard --logdir /logs/tensorboard
autostart=false
```

### SSH config

To connect to the container with ssh key-pair please copy your PUBLIC key into
the /home/dld-user/.ssh/authorized_keys file on the container.

To make connecting easier, you can add these lines to the ~/.ssh/config file on your computer.
```text
Host [HOST (for e.g. dl-docker => ssh dl-docker)]
 HostName [HOSTNAME (url)]
 Port [PORT]
 User dld-user
 StrictHostKeyChecking no
 LocalForward 8888 localhost:8888
 LocalForward 3000 localhost:3000
 LocalForward 80 localhost:80
 LocalForward 443 localhost:443
 LocalForward 22 localhost:22
 LocalForward 21 localhost:21
 IdentityFile [PRIVATE KEY FILE PATH]
```