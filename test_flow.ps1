$response = Invoke-RestMethod -Uri 'http://localhost:8080/auth/login' -Method Post -Body '{"username":"student","password":"student"}' -ContentType 'application/json'
$token = $response.token
Write-Output "Token: $token"
