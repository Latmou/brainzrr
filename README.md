This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## MusicBrainz Server & Live Data Feed

Ce projet utilise les images Docker officielles de [MetaBrainz](https://github.com/metabrainz/musicbrainz-docker) pour faire tourner une instance locale de MusicBrainz (miroir).

### Configuration

Pour utiliser votre instance locale de MusicBrainz, définissez `MUSICBRAINZ_BASE_URL` dans votre `.env` :

```env
MUSICBRAINZ_BASE_URL=http://localhost:5000
```

### Live Data Feed & Initialisation

Le processus d'initialisation et de réplication est désormais **automatisé**.

1. **Configurez votre Token** : Obtenez un jeton d'accès sur [MusicBrainz.org](https://musicbrainz.org/doc/Live_Data_Feed) et ajoutez-le à votre fichier `.env` :
   ```env
   MUSICBRAINZ_REPLICATION_ACCESS_TOKEN=votre_token_ici
   ```

2. **Lancement automatique** : Au démarrage du conteneur `musicbrainz`, le script vérifie si la base de données est vide. Si c'est le cas, il lance automatiquement l'importation initiale (`createdb.sh -fetch`).

3. **Réplication automatique** : Si le token est présent, une tâche cron est configurée à l'intérieur du conteneur pour synchroniser les données toutes les heures. Une synchronisation est également lancée immédiatement en arrière-plan au démarrage.

#### Suivre l'avancement
Vous pouvez suivre l'importation ou la réplication via les logs :
```bash
docker compose logs -f musicbrainz
```

**Note importante :** La première initialisation télécharge plusieurs Go de données et peut prendre plusieurs heures. L'application `brainzrr` basculera automatiquement sur l'API publique (`musicbrainz.org`) tant que votre instance locale n'est pas prête.

## Production et Docker

Le fichier `docker-compose.yml` supporte maintenant le déploiement en production.

### Lancer l'application

Vous pouvez basculer entre le mode développement et production via la variable `NODE_ENV` :

```bash
# Mode développement (par défaut)
docker-compose up -d

# Mode production (build + start)
NODE_ENV=production docker-compose up -d
```

### Configuration des URLs (Production)

Pour rendre les services accessibles via une URL publique, vous pouvez configurer les variables suivantes dans votre environnement ou un fichier `.env` :

- **Application (Next.js)** :
  - `PORT` : Port exposé (par défaut 3000)
  - `NEXTAUTH_URL` : URL publique de votre application

- **Invidious** :
  - `INVIDIOUS_PORT` : Port exposé (par défaut 3010)
  - `INVIDIOUS_DOMAIN` : Votre nom de domaine (ex: `invidious.example.com`)
  - `INVIDIOUS_EXTERNAL_PORT` : Port externe (si différent de 443/80)
  - `INVIDIOUS_HTTPS_ONLY` : Mettre à `true` si derrière un proxy HTTPS.

- **MusicBrainz** :
  - `MUSICBRAINZ_PORT` : Port exposé (par défaut 5000)
  - `MUSICBRAINZ_DOMAIN` : Votre nom de domaine
  - `MUSICBRAINZ_EXTERNAL_PORT` : Port externe
