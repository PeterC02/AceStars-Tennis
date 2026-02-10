$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false
$filePath = "C:\Users\Peter\Desktop\AceStars\AceStars Business Command Centre 2026 Final Bugged (1).xlsx"
$wb = $excel.Workbooks.Open($filePath)

$outDir = "C:\Users\Peter\Desktop\AceStars\New Website\data"
if (!(Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }

foreach ($ws in $wb.Worksheets) {
    $sheetName = $ws.Name -replace '[^a-zA-Z0-9 _-]', ''
    $outFile = Join-Path $outDir "$sheetName.txt"
    $usedRange = $ws.UsedRange
    $rows = $usedRange.Rows.Count
    $cols = $usedRange.Columns.Count
    $maxR = [Math]::Min($rows, 100)
    $maxC = [Math]::Min($cols, 20)
    $lines = @()
    for ($r = 1; $r -le $maxR; $r++) {
        $cells = @()
        for ($c = 1; $c -le $maxC; $c++) {
            $v = $usedRange.Cells.Item($r, $c).Value2
            if ($v -eq $null) { $cells += "" } else { $cells += $v.ToString() }
        }
        $lines += ($cells -join "`t")
    }
    $lines | Out-File -FilePath $outFile -Encoding UTF8
    Write-Host "Wrote $sheetName.txt ($maxR rows x $maxC cols)"
}

$wb.Close($false)
$excel.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
Write-Host "DONE"
