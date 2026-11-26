# WooDMooD – site de démo (protégé par mot de passe)

Version de démonstration du nouveau site, publiée sur GitHub Pages :
https://woodmood-sys.github.io/woodmood-website-demo-/

Le site de travail reste dans `Site Internet/nouveau-site` sur l'ordinateur ; ce dépôt ne contient
que la version publiée (`docs/`), dont chaque page est chiffrée avec le mot de passe de la démo.

## Mettre à jour la démo

Depuis ce dossier :

```
node build.mjs
git add -A
git commit -m "Mise à jour de la démo"
git push
```

`build.mjs` demande le mot de passe (ou le lit dans un fichier local `.demo-password`, jamais envoyé sur GitHub).
Pour changer le mot de passe : relancer `node build.mjs` avec le nouveau, puis commit + push.

## Voir la démo en local

```
node preview.mjs
```
puis ouvrir http://localhost:3002/woodmood-website-demo-/

## Bon à savoir

- Les pages (textes, prix…) sont chiffrées : sans le mot de passe, on ne peut pas les lire, même dans le code du dépôt.
- Les photos et vidéos ne sont pas chiffrées : quelqu'un qui connaît leur adresse exacte peut les ouvrir.
- Une fois le mot de passe tapé, le navigateur s'en souvient.
- Le formulaire de contact n'envoie rien (mode démo).
- Les brouillons sont retirés automatiquement (bandeau « Brouillon », notes internes, bloc-notes, blocs « à fournir », menu Blog vide, liens vers des pages inexistantes, fichiers inutilisés). Si un nouveau brouillon apparaît dans `nouveau-site`, `build.mjs` s'arrête et indique la page concernée.
