@echo off
setlocal

echo === VoyageVista startup ===

REM --- Setup the env and the JWT secret token ---
copy /Y .env.sample .env >nul || goto :error

REM Generate a random SECRET_KEY (URL-safe, same as startup.sh) and write it into .env
powershell -NoProfile -Command "$b=New-Object byte[] 32; $r=[System.Security.Cryptography.RandomNumberGenerator]::Create(); $r.GetBytes($b); $k=[Convert]::ToBase64String($b).TrimEnd('=').Replace('+','-').Replace('/','_'); $c=Get-Content -Raw .env; Set-Content -Path .env -Value ($c -replace '(?m)^SECRET_KEY=[^\r\n]*',('SECRET_KEY='+$k)) -NoNewline" || goto :error

REM --- Backend: dependencies and database ---
cd backend || goto :error
call uv sync || goto :error
call uv run alembic upgrade head || goto :error
call uv run python app\initial_data.py || goto :error

REM --- Frontend: dependencies and build ---
cd ..
call bun install || goto :error
cd frontend || goto :error
call bun run build || goto :error

echo.
echo Startup complete!
exit /b 0

:error
echo.
echo Startup failed. See messages above.
exit /b 1