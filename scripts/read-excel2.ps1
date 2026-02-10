$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false

$filePath = "C:\Users\Peter\Desktop\AceStars\AceStars Business Command Centre 2026 Final Bugged (1).xlsx"
$wb = $excel.Workbooks.Open($filePath)

# Export each sheet to CSV
$outputDir = "C:\Users\Peter\Desktop\AceStars\New Website\data"
if (!(Test-Path $outputDir)) { New-Item -ItemType Directory -Path $outputDir | Out-Null }

foreach ($ws in $wb.Worksheets) {
    $name = $ws.Name -replace '[^\w\d\s-]', ''
    $csvPath = Join-Path $outputDir "$name.csv"
    $ws.Copy()
    $tempWb = $excel.ActiveWorkbook
    $tempWb.SaveAs($csvPath, 6) # 6 = CSV
    $tempWb.Close($false)
    Write-Host "Saved: $csvPath"
}

$wb.Close($false)
$excel.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
Write-Host "Done!"
