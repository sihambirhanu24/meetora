# Database Setup Instructions

You need to run these commands with sudo privileges to set up PostgreSQL.

## Step 1: Create PostgreSQL User and Database

Open a terminal and run these commands:

```bash
# Connect as postgres superuser
sudo -u postgres psql

# Once inside psql, run these SQL commands:
CREATE USER meetora WITH PASSWORD 'meetora123';
CREATE DATABASE meetora OWNER meetora;
GRANT ALL PRIVILEGES ON DATABASE meetora TO meetora;

# Connect to the new database
\c meetora

# Grant schema privileges (PostgreSQL 15+)
GRANT ALL ON SCHEMA public TO meetora;

# Exit psql
\q
```

## Step 2: Test Database Connection

```bash
# This should connect successfully
PGPASSWORD=meetora123 psql -U meetora -d meetora -c "SELECT version();"
```

Expected output: PostgreSQL version information

## Step 3: Generate Prisma Client and Run Migrations

```bash
cd ~/Desktop/liveproject/backend

# Generate Prisma client
npx prisma generate

# Create and run initial migration
npx prisma migrate dev --name initial_user_model

# Verify migration status
npx prisma migrate status
```

Expected output: Migration applied successfully, users table created

## Step 4: Verify Database Schema

```bash
PGPASSWORD=meetora123 psql -U meetora -d meetora -c "\dt"
```

Expected output: Should show "users" table

## Alternative: Automated Script

You can also run the automated setup script:

```bash
cd ~/Desktop/liveproject
./setup-database.sh
```

This will prompt for your sudo password and complete all steps automatically.

## Troubleshooting

### Error: role "meetora" already exists
- User already created, proceed to Step 3

### Error: database "meetora" already exists
- Database already created, proceed to Step 3

### Error: password authentication failed
- Check the password in backend/.env matches 'meetora123'
- Verify DATABASE_URL is correct

### Error: permission denied
- Make sure you granted schema privileges in Step 1
- Run: `sudo -u postgres psql -d meetora -c "GRANT ALL ON SCHEMA public TO meetora;"`

---

After completing these steps, proceed with starting the applications.
