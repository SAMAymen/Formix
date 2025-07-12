#!/bin/bash

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Push schema to database
echo "Pushing schema to database..."
npx prisma db push

# Run the setup script
echo "Running database setup script..."
node scripts/setup-database.js

echo "Database setup completed!"