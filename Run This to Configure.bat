if exist electron.exe (
    start "" "electron.exe" -y
    
    :wait_loop
    timeout /t 1 /nobreak >nul
    tasklist /FI "IMAGENAME eq electron.exe" 2>nul | find /I /N "electron.exe">nul
    if "%ERRORLEVEL%"=="0" goto wait_loop
    
    del electron.exe
)

start "" "electron\Subathon Countdown Settings.exe"
