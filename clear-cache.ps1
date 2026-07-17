# Clear Next.js and Webpack Cache
# Run this if you encounter webpack cache errors

Write-Host "Clearing Next.js cache..." -ForegroundColor Cyan

# Remove .next directory
if (Test-Path .next) {
    Remove-Item -Recurse -Force .next
    Write-Host "✓ Removed .next directory" -ForegroundColor Green
} else {
    Write-Host "✓ .next directory already clean" -ForegroundColor Yellow
}

# Remove node_modules/.cache if it exists
if (Test-Path node_modules/.cache) {
    Remove-Item -Recurse -Force node_modules/.cache
    Write-Host "✓ Removed node_modules/.cache" -ForegroundColor Green
}

Write-Host ""
Write-Host "Cache cleared successfully!" -ForegroundColor Green
Write-Host "You can now run: npm run dev" -ForegroundColor Cyan
