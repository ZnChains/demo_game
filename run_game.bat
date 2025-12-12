@echo off

:: 检查是否有浏览器可用来打开游戏
set "browser_path="

:: 检查常见浏览器路径
if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" set "browser_path=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set "browser_path=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" set "browser_path=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" set "browser_path=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
if exist "%ProgramFiles(x86)%\Mozilla Firefox\firefox.exe" set "browser_path=%ProgramFiles(x86)%\Mozilla Firefox\firefox.exe"
if exist "%ProgramFiles%\Mozilla Firefox\firefox.exe" set "browser_path=%ProgramFiles%\Mozilla Firefox\firefox.exe"

:: 如果找到浏览器，使用浏览器打开游戏
if defined browser_path (
    echo 使用 %browser_path% 打开贪吃蛇游戏...
    start "" "%browser_path%" "%~dp0index.html"
) else (
    :: 否则使用默认程序打开
    echo 尝试使用默认浏览器打开贪吃蛇游戏...
    start "" "%~dp0index.html"
)

:: 等待用户按键后退出
echo.
echo 游戏已启动！
echo 如果游戏没有自动打开，请手动在浏览器中打开 index.html 文件。
echo 按任意键退出...
pause >nul