; ==============================================================================
; EduPulse ERP Desktop Edition - Enterprise NSIS Installer Script
; ==============================================================================

Unicode True
RequestExecutionLevel user ; Allows installation without administrator privileges

!define PRODUCT_NAME "EduPulse ERP"
!define PRODUCT_VERSION "2.1.0"
!define PRODUCT_PUBLISHER "EduPulse Technologies"
!define PRODUCT_WEB_SITE "https://edupulse.cloud"
!define PRODUCT_DIR_REGKEY "Software\Microsoft\Windows\CurrentVersion\App Paths\EduPulse-ERP-Desktop-v2.exe"
!define PRODUCT_UNINST_KEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}"
!define PRODUCT_UNINST_ROOT_KEY "HKCU"

; Include Modern UI 2
!include "MUI2.nsh"
!include "FileFunc.nsh"

; Compression
SetCompressor /SOLID lzma

; General Settings
Name "${PRODUCT_NAME} ${PRODUCT_VERSION}"
OutFile "..\dist-installer\EduPulse_Setup_v${PRODUCT_VERSION}.exe"
InstallDir "$LOCALAPPDATA\EduPulseERP"
InstallDirRegKey ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_DIR_REGKEY}" ""
ShowInstDetails show
ShowUnInstDetails show

; Interface Settings
!define MUI_ABORTWARNING
!define MUI_ICON "..\src-tauri\icons\icon.ico"
!define MUI_UNICON "..\src-tauri\icons\icon.ico"

; Installer Pages
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!define MUI_FINISHPAGE_RUN "$INSTDIR\EduPulse-ERP-Desktop-v2.exe"
!define MUI_FINISHPAGE_RUN_TEXT "Launch EduPulse ERP now"
!insertmacro MUI_PAGE_FINISH

; Uninstaller Pages
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

; Language
!insertmacro MUI_LANGUAGE "English"

; Installation Section
Section "MainSection" SEC01
    SetOutPath "$INSTDIR"
    SetOverwrite ifnewer

    ; Install Desktop Native Executable
    File "..\EduPulse-ERP-Desktop-v2.exe"

    ; Install Backend Service JAR
    SetOutPath "$INSTDIR\backend"
    File /r "..\backend\*.*"

    ; Install Bundled Minimal Java 21 LTS Runtime
    SetOutPath "$INSTDIR\jre"
    File /r "..\jre\*.*"

    ; Create Desktop Shortcut
    CreateShortCut "$DESKTOP\${PRODUCT_NAME}.lnk" "$INSTDIR\EduPulse-ERP-Desktop-v2.exe" "" "$INSTDIR\EduPulse-ERP-Desktop-v2.exe" 0

    ; Create Start Menu Shortcuts
    CreateDirectory "$SMPROGRAMS\${PRODUCT_NAME}"
    CreateShortCut "$SMPROGRAMS\${PRODUCT_NAME}\${PRODUCT_NAME}.lnk" "$INSTDIR\EduPulse-ERP-Desktop-v2.exe" "" "$INSTDIR\EduPulse-ERP-Desktop-v2.exe" 0
    CreateShortCut "$SMPROGRAMS\${PRODUCT_NAME}\Uninstall ${PRODUCT_NAME}.lnk" "$INSTDIR\Uninstall.exe" "" "$INSTDIR\Uninstall.exe" 0

    ; Write Uninstaller
    WriteUninstaller "$INSTDIR\Uninstall.exe"

    ; Registry Keys for Windows Control Panel
    WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_DIR_REGKEY}" "" "$INSTDIR\EduPulse-ERP-Desktop-v2.exe"
    WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "DisplayName" "$(^Name)"
    WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "UninstallString" "$INSTDIR\Uninstall.exe"
    WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "DisplayIcon" "$INSTDIR\EduPulse-ERP-Desktop-v2.exe"
    WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "DisplayVersion" "${PRODUCT_VERSION}"
    WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "URLInfoAbout" "${PRODUCT_WEB_SITE}"
    WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "Publisher" "${PRODUCT_PUBLISHER}"
SectionEnd

; Uninstallation Section
Section Uninstall
    ; Remove Shortcuts
    Delete "$DESKTOP\${PRODUCT_NAME}.lnk"
    Delete "$SMPROGRAMS\${PRODUCT_NAME}\${PRODUCT_NAME}.lnk"
    Delete "$SMPROGRAMS\${PRODUCT_NAME}\Uninstall ${PRODUCT_NAME}.lnk"
    RMDir "$SMPROGRAMS\${PRODUCT_NAME}"

    ; Remove Application Files
    RMDir /r "$INSTDIR\jre"
    RMDir /r "$INSTDIR\backend"
    Delete "$INSTDIR\EduPulse-ERP-Desktop-v2.exe"
    Delete "$INSTDIR\Uninstall.exe"
    RMDir "$INSTDIR"

    ; Remove Registry Keys
    DeleteRegKey ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}"
    DeleteRegKey ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_DIR_REGKEY}"
    SetAutoClose true
SectionEnd
