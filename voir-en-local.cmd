@echo off
rem Double-clic : ouvre le site (site\) dans le navigateur, tel que vous le modifiez.
rem Laisser cette fenetre ouverte pendant la consultation ; la fermer pour arreter.
chcp 65001 >nul
cd /d "%~dp0"
start "" http://localhost:3002/
node preview.mjs
pause
