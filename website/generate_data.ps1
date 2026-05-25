$bookDir = "..\Book"
$websiteDir = "."

$files = Get-ChildItem -Path $bookDir -Filter "Chapter*.md" | Sort-Object Name
$dataList = @()

foreach ($file in $files) {
    $content = [IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    $lines = [IO.File]::ReadAllLines($file.FullName, [System.Text.Encoding]::UTF8)
    
    $title = $lines[0].Replace("# ", "").Trim()
    if ($title.Contains("] ")) {
        $title = $title.Substring($title.IndexOf("] ") + 2).Trim()
    }
    
    $dataObj = @{
        id = "chap" + ($dataList.Count + 1)
        title = $title
        content = $content
    }
    $dataList += $dataObj
}

$jsonStr = ConvertTo-Json -InputObject $dataList -Depth 5
$jsContent = "const chaptersData = " + $jsonStr + ";"
[IO.File]::WriteAllText((Join-Path $websiteDir "data.js"), $jsContent, [System.Text.Encoding]::UTF8)
Write-Host "data.js generated successfully."
