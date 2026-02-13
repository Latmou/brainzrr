#!/bin/bash
set -e

# Attendre que la base de données soit prête
echo "Waiting for database to be ready..."
DB_HOST=${MUSICBRAINZ_DB_HOST:-db}
DB_USER=${MUSICBRAINZ_POSTGRES_USER:-musicbrainz}
DB_NAME=${MUSICBRAINZ_POSTGRES_DB:-musicbrainz_db}
DB_PASS=${MUSICBRAINZ_POSTGRES_PASSWORD:-musicbrainz}

dockerize -wait "tcp://${DB_HOST}:5432" -timeout 120s

# Vérifier si la base de données est initialisée
echo "Checking if database is initialized..."
# On utilise pg_isready pour s'assurer que la db est vraiment prête à accepter des requêtes psql
until pg_isready -h "${DB_HOST}" -U "${DB_USER}" -d "${DB_NAME}"; do
  echo "Database is not ready yet... waiting"
  sleep 2
done

DB_INITIALIZED=$(PGPASSWORD="${DB_PASS}" psql -h "${DB_HOST}" -U "${DB_USER}" -d "${DB_NAME}" -tAc "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'replication_control');" 2>/dev/null || echo "f")

if [ "$DB_INITIALIZED" != "t" ]; then
    echo "Database not initialized. Starting initial import (createdb.sh -fetch)..."
    # S'assurer que les variables d'environnement sont disponibles pour createdb.sh
    export POSTGRES_USER="${DB_USER}"
    export POSTGRES_PASSWORD="${DB_PASS}"
    export POSTGRES_DB="${DB_NAME}"
    export PGPASSWORD="${DB_PASS}"
    export PGUSER="${DB_USER}"
    export PGHOST="${DB_HOST}"

    # Variables spécifiques à MusicBrainz pour InitDb.pl (via createdb.sh)
    export MUSICBRAINZ_POSTGRES_SERVER="${DB_HOST}"
    export MUSICBRAINZ_POSTGRES_READONLY_SERVER="${DB_HOST}"
    export MUSICBRAINZ_POSTGRES_USER="${DB_USER}"
    export MUSICBRAINZ_POSTGRES_PASSWORD="${DB_PASS}"
    export MUSICBRAINZ_BASE_DOWNLOAD_URL="${MUSICBRAINZ_BASE_DOWNLOAD_URL:-https://data.metabrainz.org/pub/musicbrainz}"
    export MUSICBRAINZ_BASE_FTP_URL="${MUSICBRAINZ_BASE_DOWNLOAD_URL}"
    export MUSICBRAINZ_STANDALONE_SERVER=0
    
    # Official scripts use these
    export POSTGRES_USER="${DB_USER}"
    export POSTGRES_PASSWORD="${DB_PASS}"
    
    # Toucher les fichiers pour éviter le prompt interactif de fetch-dump.sh
    mkdir -p /media/dbdump
    touch /media/dbdump/.for-non-commercial-use
    
    # Toucher un fichier de verrouillage pour éviter des ré-exécutions si le conteneur redémarre pendant l'import
    if [ ! -f /config/importing.lock ]; then
        touch /config/importing.lock
        echo "Running /usr/local/bin/createdb.sh -fetch..."
        # On ne redirige pas vers un fichier dans /config car il pourrait y avoir des problèmes de permissions
        # On laisse sortir dans stdout pour que docker logs le capte
        if /usr/local/bin/createdb.sh -fetch; then
            rm /config/importing.lock
            echo "Import finished successfully."
            
            echo "Initializing search index (Solr)..."
            # We run this through the indexer container to ensure we have the right environment and config
            # On attend Solr et RabbitMQ avant de libérer le healthcheck de MusicBrainz
            # cela garantit que l'indexer ne démarrera pas trop tôt
            dockerize -wait "tcp://musicbrainz-mq:5672" -wait "tcp://musicbrainz-search:8983" -timeout 120s
            
            # Setup AMQP and triggers
            # On ne lance plus SIR ici car il n'est pas forcément présent dans cette image.
            # C'est le service musicbrainz-indexer qui s'en occupe.
            echo "Skipping local SIR setup. Indexer container will handle it."
        else
            echo "Import failed. Removing lock and exiting."
            rm /config/importing.lock
            exit 1
        fi
    else
        echo "Import already in progress (lock file found). Skipping..."
        # On attend un peu pour laisser l'autre processus avancer ou le serveur démarrer
        sleep 60
        exit 0
    fi
else
    echo "Database already initialized."
fi

# Configurer la réplication automatique si un token est fourni
if [ -n "$MUSICBRAINZ_REPLICATION_ACCESS_TOKEN" ]; then
    echo "Replication token found. Setting up automatic replication every hour."
    
    # Ensure the token is available to MusicBrainz
    # The default DBDefs.pm expects it in /run/secrets/metabrainz_access_token
    mkdir -p /run/secrets
    echo -n "$MUSICBRAINZ_REPLICATION_ACCESS_TOKEN" > /run/secrets/metabrainz_access_token
    
    echo "0 * * * * /musicbrainz-server/admin/cron/mirror.sh" > /crons.conf
    # On lance une réplication initiale en arrière-plan pour rattraper le retard
    (sleep 30 && /usr/local/bin/replication.sh) &
fi

# Lancer le processus de démarrage standard
exec /usr/local/bin/start.sh
