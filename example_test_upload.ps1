# Example PowerShell to POST a file to the local server
$File = "path\to\somefile.txt"
$Response = Invoke-RestMethod -Uri http://localhost:5000/upload -Method Post -InFile $File -ContentType "multipart/form-data"
$Response | ConvertTo-Json -Depth 4
