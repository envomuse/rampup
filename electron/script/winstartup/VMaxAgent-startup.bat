set vmaxagentpath=%cd%\VMaxAgent.exe
reg add HKCU\Software\Microsoft\Windows\CurrentVersion\Run /f /v VMaxAgent /d %vmaxagentpath%