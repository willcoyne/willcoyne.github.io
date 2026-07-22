#!/usr/bin/env bash
set -euo pipefail

BASEDIR="$(cd "$(dirname "$0")" && pwd)"
cd "$BASEDIR"

echo "Install & setup: willcoyne server + MariaDB (if missing)"

detect_pm(){
  if command -v dnf >/dev/null 2>&1; then echo dnf
  elif command -v apt-get >/dev/null 2>&1; then echo apt
  elif command -v pacman >/dev/null 2>&1; then echo pacman
  elif command -v zypper >/dev/null 2>&1; then echo zypper
  else echo unknown
  fi
}

PM=$(detect_pm)
echo "Detected package manager: $PM"

install_mariadb(){
  case "$PM" in
    dnf)
      sudo dnf install -y mariadb-server mariadb
      ;;
    apt)
      sudo apt-get update
      sudo DEBIAN_FRONTEND=noninteractive apt-get install -y mariadb-server mariadb-client
      ;;
    pacman)
      sudo pacman -Sy --noconfirm mariadb
      ;;
    zypper)
      sudo zypper install -y mariadb
      ;;
    *)
      echo "Unsupported package manager. Please install MariaDB/MySQL manually and re-run setup.sh" >&2
      return 1
      ;;
  esac
}

if ! command -v mysqld >/dev/null 2>&1 && ! systemctl is-active --quiet mariadb 2>/dev/null && ! systemctl is-active --quiet mysql 2>/dev/null; then
  echo "MariaDB not running or not installed. Installing..."
  install_mariadb
else
  echo "MariaDB appears installed or running. Skipping install."
fi

echo "Enabling and starting MariaDB service (may require sudo)..."
if sudo systemctl enable --now mariadb 2>/dev/null; then
  echo "Started mariadb.service"
elif sudo systemctl enable --now mysql 2>/dev/null; then
  echo "Started mysql.service"
else
  echo "Could not start mariadb/mysql via systemctl. You may need to start it manually." >&2
fi

echo "Waiting for DB to accept connections (up to 60s)"
for i in {1..60}; do
  if mysql -u root -e 'SELECT 1' >/dev/null 2>&1; then
    echo "DB accepting connections"
    break
  fi
  sleep 1
done

if ! mysql -u root -e 'SELECT 1' >/dev/null 2>&1; then
  echo "DB not accepting connections as root. The setup script will attempt to run migrations using sudo." 
fi

echo "Running existing setup.sh to apply migrations, create DB user, and start server."
chmod +x setup.sh
./setup.sh

echo "If setup completed, start the server with: cd $BASEDIR && npm run dev (or use docker compose)"
