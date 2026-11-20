# ============================================================
#  restore-cms-api.ps1 - استعادة مجلد الـAPI المحذوف (F:\cms)
#  التشغيل: powershell -ExecutionPolicy Bypass -File .\restore-cms-api.ps1
# ============================================================
$ErrorActionPreference = 'Continue'
$stamp  = Get-Date -Format 'yyyyMMdd-HHmmss'
$outDir = Join-Path $PSScriptRoot "recovered-$stamp"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host " استعادة مجلد CMS API المحذوف" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# ---------- 0) حالة الأقراص ----------
Write-Host "`n[0] الأقراص المتاحة:" -ForegroundColor Yellow
Get-PSDrive -PSProvider FileSystem | ForEach-Object {
    Write-Host ("    {0}:  متاح={1}" -f $_.Name, (Test-Path ("{0}:\" -f $_.Name))) -ForegroundColor Gray
}
if (-not (Test-Path 'F:\')) {
    Write-Host "`n!!! القرص F: غير متاح الآن." -ForegroundColor Red
    Write-Host "    لو F: هارد خارجي / فلاشة / شبكة => المجلد لم يُحذف،" -ForegroundColor Red
    Write-Host "    القرص فقط غير موصول. وصّله ثم شغّل السكربت مرة أخرى." -ForegroundColor Red
}

# ---------- 1) استعادة من سلة المحذوفات ----------
Write-Host "`n[1] فحص سلة المحذوفات بحثا عن cms ..." -ForegroundColor Yellow

function Read-RecycleInfo {
    param([string]$IFile)
    try {
        $b = [System.IO.File]::ReadAllBytes($IFile)
        if ($b.Length -lt 26) { return $null }
        $orig = [System.Text.Encoding]::Unicode.GetString($b, 24, $b.Length - 24).TrimEnd([char]0)
        $size = [BitConverter]::ToInt64($b, 8)
        return [pscustomobject]@{ OriginalPath = $orig; Size = $size }
    } catch { return $null }
}

$found = 0
foreach ($drv in (Get-PSDrive -PSProvider FileSystem | Select-Object -ExpandProperty Name)) {
    $bin = "${drv}:\`$Recycle.Bin"
    if (-not (Test-Path -LiteralPath $bin)) { continue }
    Write-Host "    فحص: $bin" -ForegroundColor Gray

    $iFiles = Get-ChildItem -LiteralPath $bin -Filter '$I*' -Recurse -Force -ErrorAction SilentlyContinue
    foreach ($i in $iFiles) {
        $info = Read-RecycleInfo -IFile $i.FullName
        if (-not $info -or -not $info.OriginalPath) { continue }
        if ($info.OriginalPath -notmatch '(?i)\\(cms|cms-api|cms_api)(\\|$)') { continue }

        $found++
        Write-Host ("    [+] في السلة: {0}  ({1:N0} بايت)" -f $info.OriginalPath, $info.Size) -ForegroundColor Green

        $rName = '$R' + $i.Name.Substring(2)
        $rPath = Join-Path $i.DirectoryName $rName
        if (-not (Test-Path -LiteralPath $rPath)) {
            Write-Host "        ! الملف المقابل (R) غير موجود، تخطي." -ForegroundColor DarkYellow
            continue
        }

        $dest = $info.OriginalPath
        if (Test-Path -LiteralPath $dest) { $dest = Join-Path $outDir ('restored-' + ($info.OriginalPath -replace '[:\\/]', '_')) }
        try {
            $item = Get-Item -LiteralPath $rPath -Force
            if ($item.PSIsContainer) {
                Copy-Item -LiteralPath $rPath -Destination $dest -Recurse -Force
            } else {
                New-Item -ItemType Directory -Force -Path (Split-Path $dest -Parent) | Out-Null
                Copy-Item -LiteralPath $rPath -Destination $dest -Force
            }
            Write-Host "        => تمت الاستعادة إلى: $dest" -ForegroundColor Green
        } catch {
            Write-Host "        ! فشل النسخ: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}
if ($found -eq 0) { Write-Host "    لا يوجد شيء مطابق في السلة (قد تكون فُرّغت)." -ForegroundColor DarkYellow }

# ---------- 2) تاريخ VS Code المحلي (Local History) ----------
Write-Host "`n[2] فحص تاريخ VS Code المحلي ..." -ForegroundColor Yellow
$historyRoots = @(
    (Join-Path $env:APPDATA 'Code\User\History'),
    (Join-Path $env:APPDATA 'Code - Insiders\User\History'),
    (Join-Path $env:APPDATA 'Cursor\User\History')
)
$histCount = 0
foreach ($h in $historyRoots) {
    if (-not (Test-Path -LiteralPath $h)) { continue }
    Write-Host "    فحص: $h" -ForegroundColor Gray
    foreach ($entry in (Get-ChildItem -LiteralPath $h -Directory -ErrorAction SilentlyContinue)) {
        $json = Join-Path $entry.FullName 'entries.json'
        if (-not (Test-Path -LiteralPath $json)) { continue }
        try { $meta = Get-Content -LiteralPath $json -Raw | ConvertFrom-Json } catch { continue }
        $res = [string]$meta.resource
        if (-not $res) { continue }
        if ($res -notmatch '(?i)cms.*(api|worker)|(api|worker).*cms') { continue }

        $safe  = ($res -replace '^file:///', '' -replace '[:\\/]', '_')
        $ext   = [System.IO.Path]::GetExtension($res)
        foreach ($e in @($meta.entries)) {
            if (-not $e.id) { continue }
            $src = Join-Path $entry.FullName $e.id
            if (-not (Test-Path -LiteralPath $src)) { continue }
            $short  = [string]$e.id
            if ($short.Length -gt 6) { $short = $short.Substring(0, 6) }
            $dstFile = Join-Path (Join-Path $outDir 'history') "$safe.$short$ext"
            New-Item -ItemType Directory -Force -Path (Split-Path $dstFile -Parent) | Out-Null
            Copy-Item -LiteralPath $src -Destination $dstFile -Force
            $histCount++
        }
    }
}
if ($histCount -gt 0) {
    Write-Host "    => تم استخراج $histCount نسخة في: $outDir\history" -ForegroundColor Green
} else {
    Write-Host "    لا توجد نسخ مطابقة في تاريخ VS Code." -ForegroundColor DarkYellow
}

# ---------- 3) البحث عن أي مشروع worker حيّ ----------
Write-Host "`n[3] البحث عن wrangler.toml داخل مجلدات cms على الأقراص ..." -ForegroundColor Yellow
foreach ($drv in (Get-PSDrive -PSProvider FileSystem | Select-Object -ExpandProperty Name)) {
    $root = "${drv}:\"
    if (-not (Test-Path $root)) { continue }
    Write-Host "    بحث في: $root" -ForegroundColor Gray
    $hits = Get-ChildItem -LiteralPath $root -Filter 'wrangler.toml' -Recurse -Force -Depth 5 -ErrorAction SilentlyContinue |
            Where-Object { $_.FullName -match '(?i)cms' }
    foreach ($hit in $hits) { Write-Host "    [+] مشروع موجود: $($hit.DirectoryName)" -ForegroundColor Green }
}

# ---------- 4) الخلاصة ----------
Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host " النتيجة في: $outDir" -ForegroundColor Cyan
Write-Host " الـAPI الحيّ على Cloudflare يعمل ولا يحتاج استعادة:" -ForegroundColor Cyan
Write-Host "   https://cms-api.info1703.workers.dev/" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "`nاضغط Enter للخروج..."
try { [void](Read-Host) } catch { }
