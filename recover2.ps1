# =============================================================
#  recover2.ps1 - استعادة عميقة لكود CMS API (تعمل بالملف لا بالنسخ)
#  التشغيل:
#  powershell -ExecutionPolicy Bypass -File "c:\Users\gemya\Downloads\CMS\recover2.ps1"
# =============================================================
$ErrorActionPreference = 'SilentlyContinue'
$outDir = Join-Path 'C:\Users\gemya\Downloads\CMS' ('recovered-' + (Get-Date -Format 'yyyyMMdd-HHmmss'))
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$report = Join-Path $outDir 'report.txt'
function Log($m) { Write-Host $m; Add-Content -LiteralPath $report -Value $m -Encoding UTF8 }

Log "=========== تقرير الاستعادة $(Get-Date) ==========="

# ---------- A) معلومات القرص F ----------
Log "`n[A] معلومات القرص F:"
try {
    $v = Get-Volume -DriveLetter F
    Log ("    FileSystemType = " + $v.FileSystemType + " | SizeGB = " + [math]::Round($v.Size/1GB,1) + " | FreeGB = " + [math]::Round($v.SizeRemaining/1GB,1))
    if ($v.FileSystemType -in @('exFAT','FAT32','FAT')) {
        Log "    !!! نظام الملفات لا يدعم سلة محذوفات => الحذف كان نهائيا (كارفينج فقط ينفع)."
    }
} catch { Log "    تعذر قراءة معلومات القرص: $($_.Exception.Message)" }

Log "`n[A2] محتويات F:\ الحالية:"
$fRoot = Get-ChildItem -LiteralPath 'F:\' -Force
if ($fRoot) { $fRoot | ForEach-Object { Log ("    " + $_.Mode + "  " + $_.Name) } } else { Log "    (فارغ أو غير مقروء)" }

# ---------- B) سرد كامل لكل عناصر السلة (بدون فلترة) ----------
Log "`n[B] كل عناصر سلة المحذوفات الموجودة:"
function Read-RecycleInfo {
    param([string]$IFile)
    try {
        $b = [System.IO.File]::ReadAllBytes($IFile)
        if ($b.Length -lt 26) { return $null }
        $orig = [System.Text.Encoding]::Unicode.GetString($b, 24, $b.Length - 24).TrimEnd([char]0)
        return $orig
    } catch { return $null }
}
$allRecycle = @()
foreach ($drv in (Get-PSDrive -PSProvider FileSystem | Select-Object -ExpandProperty Name)) {
    $bin = "${drv}:\`$Recycle.Bin"
    if (-not (Test-Path -LiteralPath $bin)) { continue }
    $items = Get-ChildItem -LiteralPath $bin -Filter '$I*' -Recurse -Force
    Log ("    " + $drv + ": " + @($items).Count + " عنصر في السلة")
    foreach ($i in $items) {
        $orig = Read-RecycleInfo -IFile $i.FullName
        if (-not $orig) { continue }
        $allRecycle += [pscustomobject]@{ IF = $i.FullName; Path = $orig }
    }
}
Log ("    إجمالي العناصر المقروءة: " + $allRecycle.Count)
foreach ($r in $allRecycle) { Log ("      - " + $r.Path) }

# استعادة أي عنصر مساره فيه cms
$hit = @($allRecycle | Where-Object { $_.Path -match '(?i)cms' })
if ($hit.Count -gt 0) {
    Log "`n    [+] عناصر cms موجودة في السلة => جاري استعادة محلية:"
    foreach ($h in $hit) {
        $iFile = Get-Item -LiteralPath $h.IF -Force
        $rPath = Join-Path $iFile.DirectoryName ('$R' + $iFile.Name.Substring(2))
        $dest  = Join-Path $outDir ('restored-' + ($h.Path -replace '[:\\/]', '_'))
        if (Test-Path -LiteralPath $rPath) {
            Copy-Item -LiteralPath $rPath -Destination $dest -Recurse -Force
            Log ("      => " + $h.Path + "  ==>  " + $dest)
        } else { Log ("      ! لا يوجد ملف R مقابل لـ " + $h.Path) }
    }
} else { Log "    لا يوجد أي عنصر فيه cms في السلة." }

# ---------- C) تاريخ VS Code المحلي ----------
Log "`n[C] تاريخ VS Code المحلي (Local History):"
$sig = 'workers\.dev|CMS API|wrangler|cloudflare:workers|D1Database'
$roots = @(
    (Join-Path $env:APPDATA 'Code\User\History'),
    (Join-Path $env:APPDATA 'Code - Insiders\User\History'),
    (Join-Path $env:APPDATA 'Cursor\User\History'),
    (Join-Path $env:LOCALAPPDATA 'Programs\Microsoft VS Code')
) | Where-Object { $_ -and (Test-Path -LiteralPath $_) }

$vscCount = 0
foreach ($root in $roots) {
    Log ("    فحص: " + $root)
    $entries = Get-ChildItem -LiteralPath $root -Filter 'entries.json' -Recurse -Force
    Log ("      عدد ملفات entries.json = " + @($entries).Count)
    foreach ($en in $entries) {
        $meta = Get-Content -LiteralPath $en.FullName -Raw | ConvertFrom-Json
        if (-not $meta) { continue }
        $res = [string]$meta.resource
        $match = ($res -match '(?i)cms')
        if (-not $match) {
            foreach ($e in @($meta.entries)) {
                $f = Join-Path $en.DirectoryName ([string]$e.id)
                if (-not (Test-Path -LiteralPath $f)) { continue }
                $head = Get-Content -LiteralPath $f -Raw -TotalCount 1
                if ($head -match $sig) { $match = $true; break }
            }
        }
        if (-not $match) { continue }

        $decoded = [System.Uri]::UnescapeDataString($res) -replace '^file:///', ''
        $safe    = ($decoded -replace '[:\\/]', '_')
        $ext     = [System.IO.Path]::GetExtension($decoded)
        foreach ($e in @($meta.entries)) {
            $src = Join-Path $en.DirectoryName ([string]$e.id)
            if (-not (Test-Path -LiteralPath $src)) { continue }
            $sh = [string]$e.id; if ($sh.Length -gt 8) { $sh = $sh.Substring(0,8) }
            $dst = Join-Path (Join-Path $outDir 'vscode-history') ($safe + '.' + $sh + $ext)
            New-Item -ItemType Directory -Force -Path (Split-Path $dst -Parent) | Out-Null
            Copy-Item -LiteralPath $src -Destination $dst -Force
            $vscCount++
        }
        Log ("      [+] " + $decoded)
    }
}
Log ("    إجمالي النسخ المستخرجة من تاريخ VS Code = " + $vscCount)

# ---------- D) البحث عن مجلدات cms / مشاريع worker على الأقراص ----------
Log "`n[D] البحث عن أي نسخة حيّة من المشروع:"
$skip = '(?i)\\(windows|node_modules|\$Recycle\.Bin|System Volume Information|AppData\\Local\\Temp)\\'
foreach ($drv in (Get-PSDrive -PSProvider FileSystem | Select-Object -ExpandProperty Name)) {
    $root = "${drv}:\"
    if (-not (Test-Path $root)) { continue }
    Log ("    فحص القرص: " + $root)
    $dirs = Get-ChildItem -Path ($root + '*') -Directory -Recurse -Force -Depth 4 |
            Where-Object { $_.Name -match '(?i)^(cms|cms-api|cms_api|api-cms)$' -and $_.FullName -notmatch $skip }
    foreach ($d in $dirs) { Log ("    [dir] " + $d.FullName) }

    $wr = Get-ChildItem -Path ($root + '*') -File -Recurse -Force -Depth 6 |
          Where-Object { $_.Name -match '(?i)^wrangler\.(toml|json|jsonc)$' -and $_.FullName -notmatch $skip }
    foreach ($w in $wr) { Log ("    [wrangler] " + $w.FullName) }
}

# ---------- E) الخلاصة ----------
Log "`n=========== انتهى ==========="
Log ("مجلد النتائج: " + $outDir)
Write-Host "`nتم. التقرير: $report" -ForegroundColor Cyan
try { [void](Read-Host 'اضغط Enter للخروج') } catch { }
