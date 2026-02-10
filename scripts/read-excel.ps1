$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false

$filePath = "C:\Users\Peter\Desktop\AceStars\AceStars Business Command Centre 2026 Final Bugged (1).xlsx"
$wb = $excel.Workbooks.Open($filePath)

Write-Host "=== SHEET NAMES ==="
foreach ($ws in $wb.Worksheets) {
    Write-Host $ws.Name
}

Write-Host ""

foreach ($ws in $wb.Worksheets) {
    Write-Host "=== SHEET: $($ws.Name) ==="
    $usedRange = $ws.UsedRange
    $rowCount = $usedRange.Rows.Count
    $colCount = $usedRange.Columns.Count
    Write-Host "Rows: $rowCount, Cols: $colCount"
    
    $maxRows = [Math]::Min($rowCount, 80)
    $maxCols = [Math]::Min($colCount, 20)
    
    for ($r = 1; $r -le $maxRows; $r++) {
        $rowData = @()
        for ($c = 1; $c -le $maxCols; $c++) {
            $cell = $usedRange.Cells.Item($r, $c)
            $val = ""
            if ($cell.Value2 -ne $null) {
                $val = $cell.Value2.ToString()
            }
            $rowData += $val
        }
        $line = $rowData -join "`t"
        Write-Host $line
    }
    Write-Host ""
}

$wb.Close($false)
$excel.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
