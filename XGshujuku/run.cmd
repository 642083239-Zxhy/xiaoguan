@echo off
setlocal

set "XG_COMMAND=%~1"
if not defined XG_COMMAND set "XG_COMMAND=init"
set "XG_DATABASE=%~2"
if not defined XG_DATABASE set "XG_DATABASE=.\data\xg.db"

set "XG_PYTHON="
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 set "XG_PYTHON=python"
if not defined XG_PYTHON (
    where py >nul 2>nul
    if %ERRORLEVEL% EQU 0 set "XG_PYTHON=py"
)
if not defined XG_PYTHON (
    set "XG_BUNDLED_PYTHON=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
    if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" set "XG_PYTHON=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
)
if not defined XG_PYTHON (
    echo Python 3.10+ was not found. Install Python or add python/py to PATH.
    exit /b 1
)

pushd "%~dp0"
if /I "%XG_COMMAND%"=="test" (
    "%XG_PYTHON%" -B -m unittest discover -s tests -v
) else if /I "%XG_COMMAND%"=="init" (
    "%XG_PYTHON%" -B -m xg_database.cli --db "%XG_DATABASE%" init
) else if /I "%XG_COMMAND%"=="demo" (
    "%XG_PYTHON%" -B -m xg_database.cli --db "%XG_DATABASE%" demo
) else if /I "%XG_COMMAND%"=="cleanup" (
    "%XG_PYTHON%" -B -m xg_database.cli --db "%XG_DATABASE%" cleanup
) else if /I "%XG_COMMAND%"=="serve" (
    "%XG_PYTHON%" -B -m xg_database.http_api --db "%XG_DATABASE%" --host 127.0.0.1 --port 8765
) else (
    echo Usage: run.cmd [init^|demo^|cleanup^|test^|serve] [database-path]
    popd
    exit /b 2
)
set "XG_EXIT_CODE=%ERRORLEVEL%"
popd
exit /b %XG_EXIT_CODE%
