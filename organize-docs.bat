@echo off
REM Script to organize markdown documentation files
REM Created: 2025-01-14

echo ========================================
echo  Documentation Organization Script
echo ========================================
echo.

REM Create directory structure inside .claude folder
echo Creating directory structure in .claude\docs...
if not exist ".claude" mkdir ".claude"
if not exist ".claude\docs" mkdir ".claude\docs"
if not exist ".claude\docs\guides" mkdir ".claude\docs\guides"
if not exist ".claude\docs\architecture" mkdir ".claude\docs\architecture"
if not exist ".claude\docs\history" mkdir ".claude\docs\history"
echo [OK] Directories created
echo.

REM Move historical fix documentation
echo Moving historical fix documentation...
if exist "ACCESSIBILITY-FIXES.md" move "ACCESSIBILITY-FIXES.md" ".claude\docs\history\"
if exist "PERFORMANCE-FIXES.md" move "PERFORMANCE-FIXES.md" ".claude\docs\history\"
if exist "SECURITY-FIX.md" move "SECURITY-FIX.md" ".claude\docs\history\"
if exist "TYPESCRIPT-COMPLETE.md" move "TYPESCRIPT-COMPLETE.md" ".claude\docs\history\"
if exist "CODE-STYLE-COMPLETE.md" move "CODE-STYLE-COMPLETE.md" ".claude\docs\history\"
if exist "UI-CONSISTENCY-COMPLETE.md" move "UI-CONSISTENCY-COMPLETE.md" ".claude\docs\history\"
if exist "CLOUDINARY-PDF-FIX.md" move "CLOUDINARY-PDF-FIX.md" ".claude\docs\history\"
echo [OK] Historical documentation moved
echo.

REM Move feature implementation docs
echo Moving architecture documentation...
if exist "COOKIE_CONSENT_IMPLEMENTATION.md" move "COOKIE_CONSENT_IMPLEMENTATION.md" ".claude\docs\architecture\"
if exist "SOCKET-IO-IMPLEMENTATION.md" move "SOCKET-IO-IMPLEMENTATION.md" ".claude\docs\architecture\"
if exist "UNREAD_BADGE_IMPLEMENTATION.md" move "UNREAD_BADGE_IMPLEMENTATION.md" ".claude\docs\architecture\"
if exist "IMPLEMENTATION_SUMMARY.md" move "IMPLEMENTATION_SUMMARY.md" ".claude\docs\architecture\"
echo [OK] Architecture documentation moved
echo.

REM Move guides
echo Moving guide documentation...
if exist "AUDIT-GUIDE.md" move "AUDIT-GUIDE.md" ".claude\docs\guides\"
if exist "AUDIT-SUMMARY.md" move "AUDIT-SUMMARY.md" ".claude\docs\guides\"
if exist "SETUP.md" move "SETUP.md" ".claude\docs\guides\"
echo [OK] Guide documentation moved
echo.

REM Move the docs README to .claude folder
echo Creating documentation index...
if exist ".claude-docs-README.md" move ".claude-docs-README.md" ".claude\docs\README.md"
if exist "DOCS-ORGANIZATION-SUMMARY.md" move "DOCS-ORGANIZATION-SUMMARY.md" ".claude\docs\history\ORGANIZATION-SUMMARY.md"
echo [OK] Documentation index created
echo.

REM Remove redundant files
echo Removing redundant files...
if exist "TYPESCRIPT-FIXES-PROGRESS.md" (
    del "TYPESCRIPT-FIXES-PROGRESS.md"
    echo [OK] Deleted TYPESCRIPT-FIXES-PROGRESS.md (superseded)
)
if exist "TYPESCRIPT-FIXES-FINAL.md" (
    del "TYPESCRIPT-FIXES-FINAL.md"
    echo [OK] Deleted TYPESCRIPT-FIXES-FINAL.md (superseded)
)
echo.

REM Files remaining in root
echo ========================================
echo Files remaining in root directory:
echo ========================================
echo   - README.md (main project readme)
echo   - audit-report.md (current audit state)
echo.
echo Component-specific documentation:
echo   - app\(root)\about\README.md
echo   - components\client\shared\README.md
echo.

echo ========================================
echo New documentation structure:
echo ========================================
echo.
echo .claude\docs\
echo   ^|-- guides\
echo   ^|     ^|-- AUDIT-GUIDE.md
echo   ^|     ^|-- AUDIT-SUMMARY.md
echo   ^|     ^+-- SETUP.md
echo   ^|
echo   ^|-- architecture\
echo   ^|     ^|-- COOKIE_CONSENT_IMPLEMENTATION.md
echo   ^|     ^|-- SOCKET-IO-IMPLEMENTATION.md
echo   ^|     ^|-- UNREAD_BADGE_IMPLEMENTATION.md
echo   ^|     ^+-- IMPLEMENTATION_SUMMARY.md
echo   ^|
echo   ^+-- history\
echo         ^|-- ACCESSIBILITY-FIXES.md
echo         ^|-- PERFORMANCE-FIXES.md
echo         ^|-- SECURITY-FIX.md
echo         ^|-- TYPESCRIPT-COMPLETE.md
echo         ^|-- CODE-STYLE-COMPLETE.md
echo         ^|-- UI-CONSISTENCY-COMPLETE.md
echo         ^+-- CLOUDINARY-PDF-FIX.md
echo.

echo ========================================
echo  Organization Complete!
echo ========================================
echo.
echo Your documentation is now organized and ready to use.
echo.
pause
