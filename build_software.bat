@echo off
echo ====================================================
echo   FCPS Pro & MBBS MCQ Master - Software Builder
echo ====================================================
echo.

echo [Step 1/3] Building Production React Web Bundle...
call npm run build

echo [Step 2/3] Compiling Desktop Executable Bundle (PyInstaller)...
python -m PyInstaller --noconfirm --onedir --windowed --distpath "dist_exe" --add-data "dist;dist" --name "FCPS_Pro_App" app_main.py

echo [Step 3/3] Compiling IDM-Style Windows Setup Wizard (Inno Setup)...
"C:\Users\Muhammad Talha\AppData\Local\Programs\Inno Setup 6\iscc.exe" fcps_pro_installer.iss

if exist "Output\FCPS_Pro_MCQ_Master_Setup.exe" (
    echo.
    echo ====================================================
    echo   SOFTWARE INSTALLER CREATED SUCCESSFULLY!
    echo   Installer File: Output\FCPS_Pro_MCQ_Master_Setup.exe
    echo ====================================================
) else (
    echo.
    echo Build complete. Check Output folder.
)
