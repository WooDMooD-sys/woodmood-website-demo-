# WooDMooD – site de démo (protégé par mot de passe)

Démo du nouveau site, pour le prestataire et les clients :
https://woodmood-sys.github.io/woodmood-website-demo-/

## Au quotidien

1. **Modifier** les pages dans le dossier `site\` (sur l'ordinateur uniquement).
2. **Voir le résultat** : double-cliquer `voir-en-local.cmd` (ouvre http://localhost:3002/). Laisser la fenêtre noire ouverte pendant la consultation.
3. **Publier** : double-cliquer `publier.cmd`. Le site est chiffré avec le mot de passe de `mot-de-passe.txt`, puis envoyé sur GitHub. En ligne 1 à 2 minutes plus tard (Ctrl+F5 si l'ancienne version s'affiche).

**Changer le mot de passe** : modifier `mot-de-passe.txt` dans le Bloc-notes, puis double-cliquer `publier.cmd`.

## Ce qui va sur GitHub, et ce qui n'y va pas

- `site\` (le site lisible) et `mot-de-passe.txt` **restent sur cet ordinateur**. Ils ne sont jamais envoyés sur GitHub, car le dépôt est public.
- Sur GitHub, il n'y a que `docs\` : les pages chiffrées, illisibles sans le mot de passe.
- Les photos et vidéos ne sont pas chiffrées : quelqu'un qui connaît leur adresse exacte peut les ouvrir.
- `site\` n'est sauvegardé nulle part ailleurs : pensez à en garder une copie (clé USB, Drive…).

## Retiré automatiquement de la démo

Bandeau « Brouillon », notes internes, bloc-notes, blocs « à fournir », menu Blog vide, liens vers des pages qui n'existent pas encore, fichiers inutilisés. Le formulaire de contact n'envoie rien.
Si un nouveau brouillon apparaît dans `site\`, la publication s'arrête et indique la page concernée.

## Pour une autre session Claude

Tout est expliqué dans `CLAUDE.md` (lu automatiquement par Claude quand il travaille dans ce dossier).
