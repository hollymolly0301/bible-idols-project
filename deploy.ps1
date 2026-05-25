# ----------------------------------------------------
# AUGEN PRO — 1-CLICK AUTOMATIC GITHUB DEPLOYMENT SCRIPT (ASCII ONLY)
# ----------------------------------------------------

$Host.UI.RawUI.WindowTitle = "Augen Pro - Auto GitHub Deployer"
Clear-Host

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "         AUGEN PRO - GitHub Auto Deployer                 " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " This script installs Git, commits your code, and pushes   " -ForegroundColor LightGray
Write-Host " it directly to your GitHub repository automatically.       " -ForegroundColor LightGray
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check Git
$gitCheck = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitCheck) {
    Write-Host "[!] Git is not installed on your system." -ForegroundColor Yellow
    Write-Host "[*] Installing Git via winget. Please wait..." -ForegroundColor Cyan
    
    Start-Process winget -ArgumentList "install --id Git.Git -e --source winget --accept-package-agreements --accept-source-agreements" -NoNewWindow -Wait
    
    Write-Host ""
    Write-Host "[✓] Git has been installed successfully!" -ForegroundColor Green
    Write-Host "[!] Please close this window and open a new PowerShell window to run this script again." -ForegroundColor Red
    Write-Host "Press Enter to exit..."
    Read-Host
    Exit
} else {
    Write-Host "[✓] Git is installed and running." -ForegroundColor Green
}

# 2. Local commit
Write-Host ""
Write-Host "[*] Step 1: Initializing local Git repository and committing..." -ForegroundColor Cyan

if (-not (Test-Path ".git")) {
    git init
}
git add .
git commit -m "feat: Augen Pro style Bible idols digital book" --quiet

Write-Host "[✓] Local code committed successfully!" -ForegroundColor Green

# 3. Remote URL
Write-Host ""
Write-Host "[*] Step 2: Configuring GitHub Remote Repository" -ForegroundColor Cyan
Write-Host "Did you already create a new repository on GitHub?" -ForegroundColor LightGray
Write-Host "1) Yes, I already created it (I will paste the URL)" -ForegroundColor White
Write-Host "2) No, not yet (Please open GitHub for me)" -ForegroundColor White
$choice = Read-Host "Select option (1 or 2)"

if ($choice -eq "2") {
    Write-Host "[*] Opening browser to create a new GitHub repository..." -ForegroundColor Cyan
    Start-Process "https://github.com/new"
    Write-Host "After creating it, please copy the repository URL." -ForegroundColor Yellow
}

Write-Host ""
$repoUrl = Read-Host "Please paste your GitHub repository URL (e.g. https://github.com/username/repo.git)"
$repoUrl = $repoUrl.Trim()

if (-not $repoUrl) {
    Write-Host "[!] Invalid URL. Exiting." -ForegroundColor Red
    Read-Host "Press Enter to exit..."
    Exit
}

# Reset remote
git remote remove origin 2>$null
git remote add origin $repoUrl
git branch -M main

# 4. Push
Write-Host ""
Write-Host "[*] Step 3: Pushing code to GitHub..." -ForegroundColor Cyan
Write-Host "[!] If this is your first time, a GitHub browser login prompt will appear. Please approve it." -ForegroundColor Yellow
Write-Host ""

git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host " 🎉 GitHub deployment completed successfully!            " -ForegroundColor Green
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host " Now, go to Vercel (https://vercel.com) dashboard," -ForegroundColor LightGray
    Write-Host " import this repository, and click 'Deploy'! Done!" -ForegroundColor LightGray
    Write-Host "==========================================================" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "[!] Error pushing code. Please check your GitHub login state." -ForegroundColor Red
}

Write-Host ""
Read-Host "Press Enter to exit..."
