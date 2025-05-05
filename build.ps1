# Build script for Idiibi PMS Desktop Application

# Ensure we're in the app directory
Set-Location -Path $PSScriptRoot

# Install dependencies if needed
if (-not (Test-Path -Path "node_modules")) {
    Write-Host "Installing dependencies..."
    npm install
}

# Create icon.ico from icon.png if it doesn't exist
if (-not (Test-Path -Path "src\assets\icon.ico")) {
    Write-Host "Creating icon.ico from icon.png..."
    # Note: This requires ImageMagick to be installed
    # You can install it using: choco install imagemagick
    # Or manually convert the PNG to ICO using an online converter
    # magick convert src\assets\icon.png src\assets\icon.ico
    
    # For now, we'll just copy the PNG as a placeholder
    Copy-Item -Path "src\assets\icon.png" -Destination "src\assets\icon.ico"
}

# Build the application
Write-Host "Building the application..."
npm run dist

Write-Host "Build completed. Check the dist folder for the installer."
