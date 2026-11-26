@echo off
rem Double-clic : chiffre le site (site\) avec mot-de-passe.txt et le publie sur GitHub Pages.
chcp 65001 >nul
cd /d "%~dp0"
echo Chiffrement du site...
node build.mjs || goto erreur
git add -A
git commit -q -m "Mise a jour de la demo" || goto erreur
echo Envoi sur GitHub...
git push -q || goto erreur
echo.
echo Publie. En ligne dans 1 a 2 minutes (Ctrl+F5 si l'ancienne version s'affiche) :
echo https://woodmood-sys.github.io/woodmood-website-demo-/
echo.
pause
exit /b 0
:erreur
echo.
echo Probleme : la publication n'est pas allee au bout (voir le message ci-dessus).
pause
exit /b 1
