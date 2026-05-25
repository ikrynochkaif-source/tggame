param(
  [int]$Port = 5173
)

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Runtime = Join-Path $Root ".runtime"
$EnvFile = Join-Path $Root ".env"
$ServerOut = Join-Path $Runtime "server.out.log"
$ServerErr = Join-Path $Runtime "server.err.log"
$TunnelOut = Join-Path $Runtime "localtunnel.out.log"
$TunnelErr = Join-Path $Runtime "localtunnel.err.log"
$ServerPidFile = Join-Path $Runtime "server.pid"
$TunnelPidFile = Join-Path $Runtime "tunnel.pid"

New-Item -ItemType Directory -Force -Path $Runtime | Out-Null

function Stop-ExistingProcess {
  param([string]$PidFile)

  if (Test-Path $PidFile) {
    $ExistingPid = Get-Content -LiteralPath $PidFile -ErrorAction SilentlyContinue
    if ($ExistingPid) {
      Stop-Process -Id ([int]$ExistingPid) -ErrorAction SilentlyContinue
    }
    Remove-Item -LiteralPath $PidFile -ErrorAction SilentlyContinue
  }
}

function Set-EnvValue {
  param(
    [string]$Key,
    [string]$Value
  )

  $Lines = @()
  if (Test-Path $EnvFile) {
    $Lines = Get-Content -LiteralPath $EnvFile
  }

  $Pattern = "^$([regex]::Escape($Key))="
  $Found = $false
  $Next = foreach ($Line in $Lines) {
    if ($Line -match $Pattern) {
      $Found = $true
      "$Key=$Value"
    } else {
      $Line
    }
  }

  if (-not $Found) {
    $Next += "$Key=$Value"
  }

  Set-Content -LiteralPath $EnvFile -Value $Next -Encoding utf8
}

function Wait-ForHttpOk {
  param(
    [string]$Url,
    [int]$TimeoutSeconds = 30
  )

  $Deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $Deadline) {
    try {
      $Status = Invoke-WebRequest -UseBasicParsing $Url -TimeoutSec 10 | Select-Object -ExpandProperty StatusCode
      if ($Status -eq 200) {
        return $true
      }
    } catch {
      Start-Sleep -Seconds 1
    }
  }

  return $false
}

function Start-Server {
  Remove-Item -LiteralPath $ServerOut,$ServerErr -ErrorAction SilentlyContinue
  $Process = Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory $Root -WindowStyle Hidden -RedirectStandardOutput $ServerOut -RedirectStandardError $ServerErr -PassThru
  Set-Content -LiteralPath $ServerPidFile -Value $Process.Id -Encoding ascii
  return $Process.Id
}

function Start-Tunnel {
  Remove-Item -LiteralPath $TunnelOut,$TunnelErr -ErrorAction SilentlyContinue
  $Process = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "npx -y localtunnel --port $Port --local-host localhost" -WorkingDirectory $Root -WindowStyle Hidden -RedirectStandardOutput $TunnelOut -RedirectStandardError $TunnelErr -PassThru
  Set-Content -LiteralPath $TunnelPidFile -Value $Process.Id -Encoding ascii
  return $Process.Id
}

Stop-ExistingProcess -PidFile $ServerPidFile
Stop-ExistingProcess -PidFile $TunnelPidFile

Set-EnvValue -Key "PORT" -Value "$Port"
Set-EnvValue -Key "BOT_POLLING" -Value "false"

$BootstrapPid = Start-Server
if (-not (Wait-ForHttpOk -Url "http://127.0.0.1:$Port" -TimeoutSeconds 30)) {
  throw "Local server did not start on port $Port."
}

$TunnelPid = Start-Tunnel
$TunnelUrl = $null
$Deadline = (Get-Date).AddSeconds(75)

while ((Get-Date) -lt $Deadline -and -not $TunnelUrl) {
  Start-Sleep -Seconds 2
  $Text = ""
  if (Test-Path $TunnelOut) {
    $Text += Get-Content -LiteralPath $TunnelOut -Raw -ErrorAction SilentlyContinue
  }
  if (Test-Path $TunnelErr) {
    $Text += "`n"
    $Text += Get-Content -LiteralPath $TunnelErr -Raw -ErrorAction SilentlyContinue
  }

  $Match = [regex]::Match($Text, "https://[a-z0-9-]+\.loca\.lt")
  if ($Match.Success) {
    $TunnelUrl = $Match.Value
  }
}

if (-not $TunnelUrl) {
  throw "Could not obtain localtunnel HTTPS URL. Check $TunnelOut and $TunnelErr."
}

if (-not (Wait-ForHttpOk -Url $TunnelUrl -TimeoutSeconds 45)) {
  throw "Tunnel URL was created but did not return HTTP 200: $TunnelUrl"
}

Set-EnvValue -Key "WEB_APP_URL" -Value $TunnelUrl
Set-EnvValue -Key "BOT_POLLING" -Value "true"

npm run bot:setup

Stop-ExistingProcess -PidFile $ServerPidFile
$FinalPid = Start-Server

if (-not (Wait-ForHttpOk -Url "http://127.0.0.1:$Port" -TimeoutSeconds 30)) {
  throw "Final local server did not start on port $Port."
}

Write-Host "AI-Creator is ready."
Write-Host "Local:  http://127.0.0.1:$Port"
Write-Host "Public: $TunnelUrl"
Write-Host "Server PID: $FinalPid"
Write-Host "Tunnel PID: $TunnelPid"
