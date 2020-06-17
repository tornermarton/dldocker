FROM nvidia/cuda:10.0-cudnn7-devel-ubuntu18.04
MAINTAINER tornermarton

SHELL ["/bin/bash", "-c"]

WORKDIR /

# Create required directories
RUN mkdir /data         \
          /datasets     \
          /dashboard    \
          /resources

# Install system packages
COPY ./resources/requirements.system /resources/requirements.system
RUN apt -q update --fix-missing; xargs apt -q install -y < /resources/requirements.system

# Copy supervisord base configuration
COPY ./resources/supervisord.conf /etc/supervisor.conf

# Remove login messages
RUN chmod -x /etc/update-motd.d/*

# Configure ssh server
RUN mkdir /var/run/sshd;                                                                                 \
    sed -i 's/PermitRootLogin prohibit-password/PermitRootLogin no/' /etc/ssh/sshd_config;               \
    sed 's@session\s*required\s*pam_loginuid.so@session optional pam_loginuid.so@g' -i /etc/pam.d/sshd;  \
    echo "export VISIBLE=now" >> /etc/profile
ENV NOTVISIBLE "in users profile"
COPY resources/sshd.sv.conf /etc/supervisor/conf.d/sshd.sv.conf

# Change the initial root password
# !!!IMPORTANT: PASSWORD MUST BE CHANGED IMMIDIATELY AFTER FIRST LOGIN!!!
RUN echo 'root:nehezjelszo' | chpasswd

# Create user to use at SSH connection
# !!!IMPORTANT: PASSWORD MUST BE CHANGED IMMIDIATELY AFTER FIRST LOGIN!!!
RUN adduser dld-user; adduser dld-user dld-user;                 \
    echo 'dld-user:nehezjelszo' | chpasswd;                      \
    mkdir /home/dld-user/code;                                   \
    mkdir /home/dld-user/.ssh
COPY ./resources/bash_aliases /home/dld-user/.bash_aliases
COPY ./resources/authorized_keys /home/dld-user/.ssh/authorized_keys
RUN chown -R dld-user:dld-user /home/dld-user/

# Install Miniconda
# You can add other environments later
RUN wget -q https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh;   \
    bash Miniconda3-latest-Linux-x86_64.sh -b -p /usr/miniconda3
ENV PATH="/usr/miniconda3/bin:${PATH}"
RUN conda init bash
# Init miniconda for dld-user
USER dld-user
ENV PATH="/usr/miniconda3/bin:${PATH}"
RUN conda init bash
USER root

# Correct cufflinks imports (plotly.plotly deprecated)
#RUN sed -i -e 's/plotly\.plotly/chart_studio\.plotly/g' /usr/miniconda3/envs/*/lib/*/site-packages/cufflinks/*.py

# Dashboard
COPY ./dashboard/ /dashboard/
COPY resources/dashboard.sv.conf /etc/supervisor/conf.d/dashboard.sv.conf

EXPOSE 3000
EXPOSE 22

# Do not override this without calling this command eventually
ENTRYPOINT ["supervisord", "-c", "/etc/supervisor.conf"]