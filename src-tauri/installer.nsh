; DeskCraft — NSIS installer hooks
; Force desktop shortcut creation even on silent installs (auto-update flow).

!macro NSIS_HOOK_POSTINSTALL
  CreateShortCut "$DESKTOP\DeskCraft.lnk" "$INSTDIR\deskcraft.exe" "" "$INSTDIR\deskcraft.exe" 0
!macroend

!macro NSIS_HOOK_POSTUNINSTALL
  Delete "$DESKTOP\DeskCraft.lnk"
!macroend
