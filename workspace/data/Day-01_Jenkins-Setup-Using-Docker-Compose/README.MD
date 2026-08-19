# 🚀 **Day 01 — Jenkins Setup Using Docker Compose**

Welcome to **Day 01** of the DevOps Jenkins series!
Today, we will set up **Jenkins** using **Docker Compose**, generate SSH keys for agents, and launch Jenkins in just a few minutes.
Let’s begin! 🎯

## 🎬 Video Demonstration

[![Watch on Youtube](https://i.ytimg.com/vi/QhkCKXNMR6M/maxresdefault.jpg)](https://youtu.be/QhkCKXNMR6M)

## 🧱 **1. Project Structure Overview**

Your directory should contain:

```
.
├── docker-compose.yml
├── setup.sh
├── ssh_keys/
└── jenkins_data/
```

This will help keep Jenkins data persistent and organized.

## ⚙️ **2. Docker Compose File (jenkins in Docker)**

We are using the latest Jenkins image and mounting volumes to persist data and allow Jenkins to interact with Docker.

```yaml
# nano compose.yaml

services:
  jenkins:
    image: jenkins/jenkins:latest
    container_name: jenkins
    privileged: true
    user: root
    restart: always
    ports:
      - 8080:8080
    volumes:
      - ${JENKINS_DATA_DIR}:/var/jenkins_home
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - DOCKER_HOST=unix:///var/run/docker.sock
      - TZ=UTC
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:8080/login || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 5
```

### 🔍 What this does?

* **8080** → Jenkins UI
* **docker.sock** → Allows Jenkins to execute Docker commands
* **persistent volume** → Jenkins data won’t be lost

## 🛠️ **3. Automated Setup Script**

Your `setup.sh` script:
- ✔️ Generates SSH keys
- ✔️ Creates `.env` file
- ✔️ Starts Jenkins using Docker Compose
- ✔️ Shows initial admin password

Here is the script:

```bash
# nano setup.sh

#!/bin/bash
set -e

# -------------------------------------
# Logging functions with emojis
# -------------------------------------
info() { echo -e "\e[34m[INFO]\e[0m 🔵 $1"; }
success() { echo -e "\e[32m[SUCCESS]\e[0m ✅ $1"; }
error() { echo -e "\e[31m[ERROR]\e[0m ❌ $1"; }

# -------------------------------------
# Validate Docker installation
# -------------------------------------
if ! command -v docker &> /dev/null; then
    error "Docker is not installed! Please install Docker before running this script."
    exit 1
fi

# Validate Docker Compose (v2)
if ! command -v docker compose &> /dev/null; then
    error "Docker Compose v2 is not installed! Install Docker Compose plugin for Docker."
    exit 1
fi

# -------------------------------------
# Check if Jenkins is already running
# -------------------------------------
if docker ps | grep -q jenkins; then
    info "Jenkins container is already running. 🚀 Nothing to do."
    exit 0
fi

# -------------------------------------
# Setup variables
# -------------------------------------
SSH_KEY_DIR="./ssh_keys"
SSH_KEY_NAME="jenkins_agent_key"
ENV_FILE=".env"
JENKINS_DATA_DIR="./jenkins_data"

# -------------------------------------
# Create SSH keys if missing
# -------------------------------------
mkdir -p "$SSH_KEY_DIR"

if [ ! -f "$SSH_KEY_DIR/$SSH_KEY_NAME" ]; then
    info "Generating SSH key pair for Jenkins agent... 🔐"
    ssh-keygen -t rsa -b 4096 -C "jenkins-agent" -f "$SSH_KEY_DIR/$SSH_KEY_NAME" -N ""
    success "SSH key pair created! 🔑"
else
    info "SSH key pair already exists. 👍"
fi

JENKINS_AGENT_SSH_PUBLIC_KEY=$(cat "$SSH_KEY_DIR/$SSH_KEY_NAME.pub")

# -------------------------------------
# Create .env file
# -------------------------------------
info "Creating environment file... 📄"

cat <<EOF > "$ENV_FILE"
JENKINS_DATA_DIR=$JENKINS_DATA_DIR
JENKINS_AGENT_SSH_PUBLIC_KEY=$JENKINS_AGENT_SSH_PUBLIC_KEY
EOF

success "Environment file created: $ENV_FILE 📦"

# -------------------------------------
# Start containers
# -------------------------------------
info "Starting Jenkins using Docker Compose... 🚀"
docker compose up -d

success "Jenkins is now running at: http://localhost:8080 🌐"
info "Using SSH private key for agent: $SSH_KEY_DIR/$SSH_KEY_NAME 🔑"

# -------------------------------------
# Display initial admin password
# -------------------------------------
info "Fetching Jenkins initial admin password (waiting 10 seconds)... ⏳"
sleep 10

docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword 2>/dev/null \
    && success "Above is your Jenkins admin password 🎉" \
    || error "Unable to retrieve admin password. Jenkins may still be starting. ⌛"
```

## ▶️ **4. How to Run the Setup**

Run these commands:

```bash
chmod +x setup.sh
./setup.sh
```

That’s it! Jenkins will now start in a Docker container.

## 🌐 **5. Access Jenkins UI**

Open your browser:

👉 **[http://IP:8080](http://IP:8080)**

Retrieve the initial admin password (the script prints it automatically):

```
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

## 🔧 **6. Install Basic Plugins (Recommended for Beginners)**

Once you log into Jenkins for the first time:

### ✔️ Step 1 — Select "Install Suggested Plugins"

This installs a set of essential plugins automatically, including:

* Git
* Pipeline
* Credentials
* SSH Agent
* Blue Ocean
* Docker Pipeline
* Matrix Authorization
* Slack Notification

These plugins are enough to get started with CI/CD pipelines.

### ⚙️ Step 2 — Create First Admin User

Enter:

* Username
* Password
* Full name
* Email

Click **Save and Continue**.

### 🧩 Step 3 — Verify Plugin Installation

After plugins finish installing:

1. Go to **Dashboard → Manage Jenkins → Manage Plugins**
2. Check **Installed Plugins** tab
3. Optionally install additional plugins such as:

   * 🐳 **Docker**
   * 🛢️ **Docker Pipeline**
   * 🔐 **Credentials Binding**
   * 📦 **GitHub Integration**
   * 🚀 **Declarative Pipeline**

## 🎉 **Jenkins Setup Complete!**

Now your Jenkins instance is ready to create jobs, configure agents, and start pipelines.



## 🧠 About This Project

This project is maintained by **DevOps In Action**, mainly focusing on practical, hands-on DevOps setups for CI/CD automation, containerization, and infrastructure management.

### 💼 Connect with Me 👇😊

* 🔥 [**YouTube**](https://www.youtube.com/@DevOpsinAction?sub_confirmation=1)
* ✍️ [**Blog**](https://ibraransari.blogspot.com/)
* 💼 [**LinkedIn**](https://www.linkedin.com/in/ansariibrar/)
* 👨‍💻 [**GitHub**](https://github.com/meibraransari?tab=repositories)
* 💬 [**Telegram**](https://t.me/DevOpsinActionTelegram)
* 🐳 [**Docker Hub**](https://hub.docker.com/u/ibraransaridocker)


### ⭐ If You Found This Helpful...

***Please star the repo and share it! Thanks a lot!*** 🌟




