#!/bin/bash
# Create shadow database for Prisma migrations

echo "Creating shadow database for Prisma..."
sudo -u postgres psql <<EOF
CREATE DATABASE meetora_shadow OWNER meetora;
GRANT ALL PRIVILEGES ON DATABASE meetora_shadow TO meetora;
\c meetora_shadow
GRANT ALL ON SCHEMA public TO meetora;
EOF

echo "Shadow database created successfully!"
