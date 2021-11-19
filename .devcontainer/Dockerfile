FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:0-14

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get -y install --no-install-recommends java-common zip \
  && wget https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip \
  && unzip awscli-exe-linux-x86_64.zip \
  && ./aws/install \
  # Clean up
  && rm -f awscli-exe-linux-x86_64.zip \
  && apt-get autoremove -y \
  && apt-get clean -y \
  && rm -rf /var/lib/apt/lists/*

# COPY ./certs/cacert.pem /etc/ssl/certs/cacert.pem
# COPY ./certs/ca-bundle-curl.crt /etc/ssl/certs/ca-bundle-curl.crt
# COPY ./certs/iret-CA.cer /etc/ssl/certs/iret-ca.cer
# RUN chmod 777 /etc/ssl/certs/cacert.pem
# RUN chmod 777 /etc/ssl/certs/ca-bundle-curl.crt
# RUN chmod 777 /etc/ssl/certs/iret-ca.cer

# ENV CURL_CA_BUNDLE=/etc/ssl/certs/cacert.pem
ENV DEBIAN_FRONTEND=dialog

WORKDIR /workspaces