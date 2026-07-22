#!/usr/bin/env bash
set -euo pipefail

BASEDIR="$(cd "$(dirname "$0")" && pwd)"
cd "$BASEDIR"

echo "Server setup starting in $BASEDIR"

# Create .env from example if missing
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
    echo "Created .env from .env.example"
  else
    echo ".env.example not found; please create .env manually" >&2
  fi
else
  echo ".env already exists; leaving it in place"
fi

# Install Node dependencies
if command -v npm >/dev/null 2>&1; then
  echo "Installing npm dependencies..."
  npm install
else
  echo "npm not found. Please install Node.js and npm." >&2
  exit 1
fi

# Prefer Docker Compose if available for a fully automated DB setup
COMPOSE_CMD=""
if docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE_CMD="docker-compose"
fi

if [ -n "$COMPOSE_CMD" ]; then
  echo "Using $COMPOSE_CMD to bring up services..."
  $COMPOSE_CMD up --build -d

  echo "Waiting for MySQL to become ready..."
  # wait until mysql accepts connections
  for i in {1..60}; do
    if $COMPOSE_CMD exec -T db mysql -uroot -pexample -e 'SELECT 1' >/dev/null 2>&1; then
      echo "MySQL is ready"
      break
    fi
    echo "Waiting for MySQL... ($i/60)"
    sleep 2
  done

  echo "Applying migrations..."
  $COMPOSE_CMD exec -T db mysql -uroot -pexample < migrations/init.sql

  echo "Server and DB started via $COMPOSE_CMD. Server exposed on port 4000."
  exit 0
fi

# Fallback: try to start a local MySQL/MariaDB service then run migrations
if command -v mysql >/dev/null 2>&1; then
  echo "Found local mysql client. Attempting to ensure server is running..."

  # Try to start common mysql services with sudo if systemctl is available
  if command -v systemctl >/dev/null 2>&1; then
    echo "Attempting to start mysql/mariadb service via systemctl (may prompt for sudo)..."
    for svc in mysql mariadb mysqld; do
      if sudo systemctl start "$svc" >/dev/null 2>&1; then
        echo "Started service $svc"
        break
      fi
    done
  fi

  echo "Waiting up to 60s for MySQL to accept connections..."
  for i in {1..60}; do
    if mysql -u root -e 'SELECT 1' >/dev/null 2>&1; then
      echo "MySQL is accepting connections"
      break
    fi
    sleep 1
  done

  if mysql -u root -e 'SELECT 1' >/dev/null 2>&1; then
    echo "Applying migrations..."
    mysql -u root < migrations/init.sql
  else
    # try using sudo mysql if available
    if command -v sudo >/dev/null 2>&1; then
      echo "Attempting to run migrations with sudo (may prompt for password)..."
      if sudo mysql -u root -e 'SELECT 1' >/dev/null 2>&1; then
        sudo mysql -u root < migrations/init.sql
      else
        echo "Could not connect to local MySQL even with sudo. You can either install/start MySQL or use Docker Compose."
        echo "To start a DB with Docker Compose (recommended):"
        echo "  docker compose up --build -d"
        echo "Or start your MySQL server and run: mysql -u root -p < migrations/init.sql"
        exit 1
      fi
    else
      echo "Could not connect to a local MySQL server. You can either install/start MySQL or use Docker Compose."
      echo "To start a DB with Docker Compose (recommended):"
      echo "  docker compose up --build -d"
      echo "Or start your MySQL server and run: mysql -u root -p < migrations/init.sql"
      exit 1
    fi
  fi

  # Read DB_* values from .env without sourcing (avoid unbalanced quotes)
  DB_USER=$(grep -E '^DB_USER=' .env | cut -d'=' -f2- | sed 's/^"//;s/"$//')
  DB_PASSWORD=$(grep -E '^DB_PASSWORD=' .env | cut -d'=' -f2- | sed 's/^"//;s/"$//')
  DB_NAME=$(grep -E '^DB_NAME=' .env | cut -d'=' -f2- | sed 's/^"//;s/"$//')

  # If DB_USER is root, create a dedicated app user and update .env to avoid socket-auth issues
  if [ "${DB_USER:-}" = "root" ]; then
    NEW_DB_USER="willcoyne_app"
    echo "DB_USER is 'root' — creating a dedicated DB user '${NEW_DB_USER}' and updating .env"
    # escape single quotes in password
    esc_pwd=$(printf "%s" "$DB_PASSWORD" | sed "s/'/''/g")
    if sudo mysql -u root -e "CREATE USER IF NOT EXISTS '${NEW_DB_USER}'@'%' IDENTIFIED BY '${esc_pwd}'; GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${NEW_DB_USER}'@'%'; FLUSH PRIVILEGES;"; then
      # update .env
      sed -i "s/^DB_USER=.*/DB_USER=${NEW_DB_USER}/" .env
      sed -i "s/^DB_PASSWORD=.*/DB_PASSWORD=${DB_PASSWORD//\//\\\/}/" .env
      echo "Updated .env to use DB_USER=${NEW_DB_USER}."
    else
      echo "Failed to create DB user ${NEW_DB_USER}. You may need to create a DB user manually." >&2
    fi
  fi
else
  echo "Neither Docker Compose nor local mysql client found. Please install Docker or MySQL and run migrations manually:" >&2
  echo "  mysql -u root -p < migrations/init.sql" >&2
  exit 1
fi

echo "To start the server locally: npm run dev"
