#!/bin/bash

# GitLab Docker Complete Setup Script with 2FA and Admin Controls

echo "🚀 GitLab Docker Setup Started..."

# Install Docker and Docker Compose
echo "📦 Installing Docker..."
sudo apt update
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt update
sudo apt install -y docker-ce docker-compose

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Create GitLab directory
mkdir -p ~/gitlab-docker
cd ~/gitlab-docker

# Get server IP
SERVER_IP='192.168.200.20'
echo "🌐 Your server IP: $SERVER_IP"

# Create docker-compose.yml (replace YOUR_SERVER_IP with actual IP)
cat > docker-compose.yml << 'EOF'
version: '3.6'
services:
  gitlab:
    image: gitlab/gitlab-ce:latest
    container_name: gitlab
    restart: always
    hostname: 'localhost'
    environment:
      GITLAB_OMNIBUS_CONFIG: |
        external_url 'http://192.168.200.20'
        # Disable public signup
        gitlab_rails['gitlab_signup_enabled'] = false
        # Admin controls
        gitlab_rails['gitlab_default_can_create_group'] = false
        gitlab_rails['gitlab_username_changing_enabled'] = false
        # 2FA settings
        gitlab_rails['require_two_factor_authentication'] = false
        gitlab_rails['two_factor_grace_period'] = 48
        # Security
        gitlab_rails['rack_attack_git_basic_auth'] = {
          'enabled' => true,
          'ip_whitelist' => ["127.0.0.1"],
          'maxretry' => 10,
          'findtime' => 60,
          'bantime' => 3600
        }
    ports:
      - '80:80'
      - '443:443'
      - '2222:22'
    volumes:
      - gitlab_config:/etc/gitlab
      - gitlab_logs:/var/log/gitlab
      - gitlab_data:/var/opt/gitlab
    shm_size: '256m'

volumes:
  gitlab_config:
  gitlab_logs:
  gitlab_data:
EOF

# Replace IP in docker-compose.yml
sed -i "s/REPLACE_WITH_YOUR_IP/$SERVER_IP/g" docker-compose.yml

echo "🐳 Starting GitLab container..."
sudo docker-compose up -d

echo "⏳ Waiting for GitLab to start (this may take 5-10 minutes)..."
echo "🔍 Check status with: sudo docker-compose logs -f gitlab"

# Wait for GitLab to be ready
echo "⏰ GitLab is starting up. Please wait..."
sleep 60

# Get initial root password
echo "🔑 Getting initial root password..."
sudo docker exec gitlab cat /etc/gitlab/initial_root_password 2>/dev/null || echo "Password file not ready yet. Check in a few minutes with: sudo docker exec gitlab cat /etc/gitlab/initial_root_password"

echo "✅ GitLab Setup Complete!"
echo ""
echo "🌐 Access GitLab: http://$SERVER_IP"
echo "👤 Username: root"
echo "🔐 Password: Check above or run: sudo docker exec gitlab cat /etc/gitlab/initial_root_password"
echo ""
echo "📋 Next Steps:"
echo "1. Login as root"
echo "2. Change root password"
echo "3. Setup 2FA in User Settings"
echo "4. Create users via Admin Area"
echo "5. Configure email settings for 2FA"
echo ""
echo "🛠️ Useful Commands:"
echo "Start: sudo docker-compose up -d"
echo "Stop: sudo docker-compose down"
echo "Logs: sudo docker-compose logs -f gitlab"
echo "Status: sudo docker-compose ps"