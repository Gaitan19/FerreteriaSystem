#!/bin/bash

# Script to download real system screenshots from GitHub issue comments
# Run this script to replace placeholder files with actual screenshots

echo "Downloading real system screenshots..."

cd /home/runner/work/FerreteriaSystem/FerreteriaSystem/screenshots

# Download Dashboard screenshot
echo "Downloading dashboard screenshot..."
curl -L -o dashboard-real.png "https://github.com/user-attachments/assets/3c94de08-19c1-4c8c-89d0-17f21049c4f5"

# Download Users Management screenshot  
echo "Downloading users management screenshot..."
curl -L -o usuarios-real.png "https://github.com/user-attachments/assets/e2c96c72-4e02-4814-9513-e5f25d72d689"

# Download Products Management screenshot
echo "Downloading products management screenshot..."
curl -L -o productos-real.png "https://github.com/user-attachments/assets/787ae8f6-8893-4bea-afab-14f40fcda3c9"

# Download Sales Module screenshot
echo "Downloading sales module screenshot..."
curl -L -o ventas-real.png "https://github.com/user-attachments/assets/9f29df9a-c2f3-492d-a73d-995eaefa3f66"

# Download Sales History screenshot
echo "Downloading sales history screenshot..."
curl -L -o historial-ventas-real.png "https://github.com/user-attachments/assets/4110091f-831e-45c9-ab16-f00be811db45"

# Download Categories Management screenshot
echo "Downloading categories management screenshot..."
curl -L -o categorias-real.png "https://github.com/user-attachments/assets/5ab92047-9846-4eda-989b-f003d3bf5643"

# Download Suppliers Management screenshot
echo "Downloading suppliers management screenshot..."
curl -L -o proveedores-real.png "https://github.com/user-attachments/assets/07299118-1396-4a7b-9c9d-0c33921b9e3b"

echo "All screenshots downloaded successfully!"
echo "Screenshots are now available in the screenshots/ directory"