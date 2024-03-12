# Déploiement

Le déploiement se fait à travers une étape (_stage_) manuelle de la _CI_ qui est déclenchée lorsqu'un **tag** contenant le mot clé **deploy** est rajouté sur git. Chaque tag est unique, mais vous pouvez utiliser des versions pour vos déploiements. Par exemple : **deploy_v1.0**, **deploy_v1.1**, etc.

Une fois que le tag est détecté par GitLab, un pipeline sera créé et vous verrez des options (_jobs_) pour le déploiement du client et du serveur. Ces _jobs_ doivent être cependant lancés manuellement. Pour le faire, naviguez sur le menu de pipelines disponible dans `CI/CD > Pipelines`. Le pipeline aura le statut `blocked`. Cliquez dessus et lancez la _job_ que vous souhaitez.

**Attention : le pipeline de déploiement ne fait que déployer le site web et/ou serveur. Il n'effectue pas toutes les validations de l'intégration continue. Vous devez vous assurer que votre projet est fonctionnel et de qualité acceptable avant de le déployer.**

[- Note importante : On vous conseille de tester le déploiement le plus tôt possible. Comme cela, si des complications surviennent, les chargés pourront vous aider à les résoudre le plus tôt possible. La veille de la remise du sprint n'est généralement pas un moment propice au débogage. -]

# Plan et répartitions des tâches pour sur les sprints

-   La section [Déploiement du client](#déploiement-du-client) contient toutes les informations en rapport avec le déploiement du client.

-   La section [Déploiement manuel du serveur](#déploiement-manuel-du-serveur) contient toutes les informations en rapport avec le déploiement manuel du serveur. La procédure décrite a pour but de démystifier le déploiement d'un serveur distant. Cette procédure doit-être faite au complet au moins une fois par au moins un membre de l'équipe. Elle n'est pas corrigée, mais est obligatoire.

-   La section [Déploiement automatique du serveur](#déploiement-automatique-du-server) contient toutes les informations en rapport avec le déploiement automatique du serveur à l'aide du pipeline. Un prérequis de cette étape est d'avoir une instance en marche sur Amazon EC2. Ce déploiement doit être fonctionnel aux SPRINTS 2 et 3.

# Déploiement du client

Le site web peut être déployé sur la plateforme GitLab Pages et accessible sur une adresse fixe. GitLab Pages est un serveur statique HTTP similaire au serveur de déploiement local.

Ce déploiement est fait à travers le système d'Intégration Continue dans GitLab. Avant de pouvoir déployer le site web, il faut configurer une variable de chemin de base. Pour faire ceci, vous devez suivre les étapes suivantes :

-   Naviguer sur le menu de variables disponible dans `Settings > CI/CD > Variables` de votre projet.
-   Ajouter une nouvelle variable avec `Add variable` dont le nom est `BASE_HREF` et la valeur est `/log2990/20231/equipe-XYZ/LOG2990-XYZ/` avec `XYZ` étant votre numéro d'équipe.
-   Assurez-vous que la variable n'est pas protégée ou masquée (décochez les 2 flags en bas) et cliquez sur `Add variable`. La variable sera maintenant disponible lors de la phase de déploiement.

Après avoir fini les configurations, vous pouvez lancer la _job_ `pages` qui a été créée après l'ajout du **tag**. Si elle réussi, votre site web sera déployé sur GitLab Pages. Vous pouvez trouver l'URL du site dans le menu `Pages` disponible dans `Settings > Pages`.

Par défaut, votre page web sera servie par un serveur statique **HTTPS**, mais votre serveur dynamique sera un simple serveur **HTTP**. Pour des raisons de sécurité, les navigateurs ne permettent pas à ce qu'une page servie par **HTTPS** récupère une ressource d'une origine **HTTP**. Afin de permettre à votre site web de communiquer avec votre serveur, vous devez décocher l'option **Force HTTPS (requires valid certificates)** dans le menu `Pages`. Ceci permet donc d'accéder à votre site web par **HTTP** et établir un contact fonctionnel avec votre serveur dynamique. L'adresse de votre site restera la même.

Note pour les plus curieux : Les étapes pour le déploiement de la page statique se trouvent dans le fichier [.gitlab-ci.yml](.gitlab-ci.yml) sous la job _pages_. De façon très concise, cette _job_ minifie tout votre code et crée une page statique. Ensuite elle rend publique à partir de l'adresse GitLab pages associée les fichiers `html`, `css` et `js` générés.

# Déploiement manuel du serveur

Le déploiement manuel se fait sur une machine distante communément appelée serveur. Dans notre cas-ci, nous utiliserons le service _Elastic Cloud Compute (EC2)_ du fournisseur Cloud Amazon (AWS) pour obtenir une machine virtuelle. Après l'obtention de notre machine, nous allons copier les fichiers du projet et lancer le serveur en exposant les ports nécessaires.

## Accès à la console AWS

Avant de commencer, vous aurez besoin d'un compte AWS. Vous pouvez vous en créer un à partir de l'adresse suivante : [ca-central-1.console.aws.amazon.com](https://ca-central-1.console.aws.amazon.com). Tout au long du tutoriel, vous devriez rester à la région `ca-central-1` située à Montréal. Assurez-vous toujours bien de cela.

La page d'accueil de la console AWS devrait être similaire à ceci :

![Console AWS](static/console_aws.png)

## Création d'un rôle IAM

Nous allons configurer le rôle `IAM` qui sera utilisé par notre Serveur. Ce rôle définit les services auxquels notre serveur pourra accéder. Allez dans la barre de recherche principale, tapez `IAM` et accédez au service.

![Recherche AWS IAM](static/aws_iam_search.png)

Aller à l'onglet `Rôles` et cliquer sur `Créer un rôle`. Vous devrez voir un assistant à trois étapes comme sur la capture suivante. Comme type d'entité de confiance, choisir `Service AWS`. Comme cas d'utilisation, choisir `EC2`. Cliquer sur le bouton `Suivant`.

![Créer un rôle dans AWS IAM](static/aws_iam_creer_un_role.png)

À l'étape des autorisations, assurez-vous de bien choisir les stratégies `AmazonEC2FullAccess` et `CloudWatchFullAccess`. Cliquer ensuite sur `Suivant` pour arriver à la dernière étape de l'assistant.

![Sélection des politiques d'autorisations dans AWS IAM](static/aws_iam_roles.png)

**Qu'est-ce que CloudWatch ?** CloudWatch est un service AWS. Dans le cadre de notre projet, nous l'utiliserons pour accéder aux logs de la VM directement depuis la console AWS.

Comme nom de rôle vous pouvez utiliser `AmazonEC2CloudWatchFullAccess` et comme description la même que celle sur la capture suivante. Cliquer sur `Créer un rôle`.

![Configuration des informations concernant le rôle IAM](static/aws_iam_role_information.png)

![Configuration des informations concernant le rôle IAM (2)](static/aws_iam_role_information_2.png)

## Création d'une paire de clés

Vous devez maintenant créer une paire de clés qui vous permettra d'avoir accès à votre serveur. Allez dans la barre de recherche principale et accédez au service `EC2`. Accédez à l'onglet `Paires de clés` dans la catégorie `Réseau et sécurité`. Cliquez ensuite sur l'option `Créer une paire de clés`.

![Tableau de bord pour les paires de clés dans AWS EC2](static/aws_ec2_paires_de_cles_tableau_de_bord.png)

Remplissez les champs comme suit et créer la paire de clés. La clé privée sera automatiquement téléchargée. Sauvegarder la clé privée dans un dossier où vous ne la perdrez pas (e.g. : `~/.ssh/`).

![Créer une paire de clés](static/creeer_paire_de_cles.png)

## Création d'un groupe de sécurité

Un groupe de sécurité définit des règles permettant de contrôler le trafic entrant et sortant. Allez dans le service `EC2` via la barre de recherche principale et accédez à l'onglet `Groupes de sécurité` dans la catégorie `Réseau et sécurité`. Cliquer sur le bouton `Créer un groupe de sécurité`.

![Groupes de sécurité dans AWS EC2](static/groupes_de_securite.png)

Remplissez les règles entrantes comme suit et ensuite créez le groupe de sécurité :

Pour l'accès SSH (accès à distance au serveur) :

-   Type: SSH
-   Source: N'importe où - IPv4

Pour le serveur `express` :

-   Type: Règle TCP personnalisée
-   Règle: TCP
-   Plage de ports: 3000
-   Source: N'importe où - IPv4
-   Description (Optionnel): Port du serveur express

![Création d'un groupe de sécurité dans AWS EC2 (1)](static/creer_groupe_de_securite_1.png)
![Création d'un groupe de sécurité dans AWS EC2 (2)](static/creer_groupe_de_securite_2.png)

## Création et démarrage d'une machine virtuelle

Vous êtes enfin prêt à démarrer une instance `EC2`. Ouvrez le menu déroulant `Services` et choisissez le service de calcul `EC2`. Aller ensuite sur l'onglet `Instances` et cliquer sur le bouton `Lancer des instances`.

![Instances EC2](static/aws_ec2_instances_tableau_de_bord.png)

Vous devez ensuite voir un assistant à plusieurs étapes qui nous guidera à configurer les paramètres de l'instance (Figure ci-dessous).

![Assistant de lancement d'instance](static/assistant_de_lancement_d_instance.png)

### Étape 1 : Nom et balises

Donnez un nom à votre serveur. Ex : `Projet2Server`.

### Étape 2 : Images d'applications et de systèmes d'exploitation (Amazon Machine Image)

Choisissez l'AMI `Amazon Linux 2023`.

![Choix de l'AMI](static/choix_ami.png)

### Étape 3 : Type d'instance et paire de clés (connexion)

Comme type d'instance, choisir `t2.micro` (l'offre gratuite) et comme paire de clés, celle que vous avez créée précédemment.

![Type d'instance](static/type_d_instance.png)
![Paire de clés](static/paire_de_cles.png)

**Restrictions de l'offre gratuite** : Avec l'offre gratuite, vous avez droit à 750 h de calcul gratuit renouvelable chaque mois pour les 12 premiers mois. Évitez donc de lancer plusieurs instances simultanément et éteignez vos machines quand vous n'en avez plus besoin.

### Étape 4 : Paramètres réseau

Assurez-vous de sélectionner le groupe de sécurité précédemment créé.

![Choix du groupe de sécurité](static/parametres_reseau.png)

### Étape 5 : Configurer le stockage

Choisissez entre 20 et 30 Gio de stockage.

![Configurer le stockage](static/configurer_le_stockage.png)

### Étape 6 : Détails avancés

Assurez-vous de choisir le profil d'instance IAM que vous avez précédemment créé.

![Configurer le profil d'instance IAM](static/profile_d_instance_iam.png)

### Étape 7 : Lancer l'instance

Cliquez sur le bouton `Lancer l'instance` pour finaliser la procédure.

![Lancer l'instance](static/lancer_l_instance.png)

## Accès à votre machine distance

Retournez au [Tableau de bord EC2](https://ca-central-1.console.aws.amazon.com/ec2/v2/home?region=ca-central-1#Instances:) (`Services -> EC2 -> Instances`). Aussitôt que l'état de votre machine passera à `En cours d'exécution`, cela signifiera que votre machine est prête à être utilisée.
Pour y avoir accès, nous allons utiliser une connexion `SSH`.

1. Pour les utilisateurs Linux, exécutez, si nécessaire, cette commande pour vous assurer que votre clé n’est pas visible publiquement par les autres utilisateurs.

```sh
chmod 400 chemin/vers/ec2-key.pem
```

2. Connectez-vous à votre instance à l’aide de son DNS public (disponible dans les détails de l'instance) :

```sh
ssh -i chemin/vers/ec2-key.pem ec2-user@<dns-public-de-votre-machine>
```

Si par la suite vous désirez quitter la connexion `SSH` et revenir à votre terminal, vous pouvez taper la commande :

```sh
exit
```

![Connection à la VM avec un Client SSH](static/connexion_ssh.png)

**Attention : L'adresse DNS publique sur la capture d'écran sera complètement différente de la votre. Ne la recopiez pas. Utilisez celle qui a été assignée à votre machine virtuelle disponible dans les détails de l'instance.**

À cette étape-ci, vous avez accès à la machine et vous pouvez exécuter n'importe quelle commande `sh` que vous vouliez.

## Lancer votre serveur

1. Installez les dépendances nécessaires

```sh
sudo yum install -y git
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.4/install.sh | bash
source ~/.nvm/nvm.sh
nvm install 18
nvm alias default 18
```

2. Allez dans un dossier temporaire

```sh
cd /tmp
```

3. Récupérez les fichiers de votre projet

```sh
git clone <url-de-votre-projet> repo
cd repo/server
git checkout <branche, tag ou SHA du commit>
```

4. Installez les dépendances du projet avec `npm`

```sh
npm ci
```

5. Lancez le serveur

```sh
npm start
```

Bravo 🎉, vous devrez être en mesure d'accéder à votre serveur depuis l'adresse : `<dns-public-de-votre-machine>:3000`. N'oubliez pas de mettre à jour le [fichier d'environnement de production](client/src/environments/environment.prod.ts). Lors d'un build en mode production (ex. celui du déploiement sur GitLab Pages), ce fichier remplacera [celui de développement](client/src/environments/environment.ts). Faisant en sorte qu'en mode production ou développement, les ressources correspondantes soient utilisées. Consulter [ce fichier](client/angular.json) à la ligne 52 pour plus de détails.

# Déploiement automatique du server

Pour faire marcher le pipeline, 4 [variables](https://docs.gitlab.com/ee/ci/variables/) devront être définies : `EC2_HOST`, `EC2_PEM_FILE_CONTENT`, `EC2_USER`, et `SERVER_PORT`. Toutes ces variables pourront être définies à partir de GitLab sur la page `Settings > CI/CD > Variables`. Toutes ces variables peuvent être masquées ou non (selon le niveau de confidentialité de l'information qu'elles détiennent), mais n'ont pas besoin d'être protégées.

#### EC2_HOST

Cette variable correspond à l'adresse de votre machine EC2 déployée. Vous y avez accès dans les détails de l'instance sous le nom de **Adresse DNS Publique**. Cette valeur doit avoir le schéma suivant : `ec2-<un nombre quelconque>.ca-central-1.compute.amazonaws.com`.

#### EC2_PEM_FILE_CONTENT

Cette variable correspond au fichier de permission `.pem` que vous aviez généré. Voici un exemple de fichier de permission :

```
-----BEGIN RSA PRIVATE KEY-----
MIIB9TCCAWACAQAwgbgxGTAXBgNVBAoMEFF1b1ZhZGlzIExpbWl0ZWQxHDAaBgNV
BAsME0RvY3VtZW50IERlcGFydG1lbnQxOTA3BgNVBAMMMFdoeSBhcmUgeW91IGRl
Y29kaW5nIG1lPyAgVGhpcyBpcyBvbmx5IGEgdGVzdCEhITERMA8GA1UEBwwISGFt
aWx0b24xETAPBgNVBAgMCFBlbWJyb2tlMQswCQYDVQQGEwJCTTEPMA0GCSqGSIb3
DQEJARYAMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCJ9WRanG/fUvcfKiGl
EL4aRLjGt537mZ28UU9/3eiJeJznNSOuNLnF+hmabAu7H0LT4K7EdqfF+XUZW/2j
RKRYcvOUDGF9A7OjW7UfKk1In3+6QDCi7X34RE161jqoaJjrm/T18TOKcgkkhRzE
apQnIDm0Ea/HVzX/PiSOGuertwIDAQABMAsGCSqGSIb3DQEBBQOBgQBzMJdAV4QP
Awel8LzGx5uMOshezF/KfP67wJ93UW+N7zXY6AwPgoLj4Kjw+WtU684JL8Dtr9FX
ozakE+8p06BpxegR4BR3FMHf6p+0jQxUEAkAyb/mVgm66TyghDGC6/YkiKoZptXQ
98TwDIK/39WEB/V607As+KoYazQG8drorw==
-----END RSA PRIVATE KEY-----
```

L'intégralité du fichier devra être copiée dans la variable `EC2_PEM_FILE_CONTENT`.
Note : Étant un fichier à haut caractère confidentiel, on vous recommande fortement de garder cette variable masquée.

#### EC2_USER

Cette variable représente l'utilisateur auquel se connecter sur le serveur distant, soit `ec2-user`. Cette valeur est déjà définie dans le fichier [.gitlab-ci.yml](.gitlab-ci.yml).

#### SERVER_PORT

Cette variable représente le port sur lequel votre serveur opère. Donnez-y la valeur `3000`.

\
Au cours du déploiement automatique, l'agent [Amazon CloudWatch Agent](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Install-CloudWatch-Agent.html) est installé sur votre instance EC2. Cet agent se charge de collecter diverses métriques en rapport avec l'utilisation des ressources (CPU, Mémoire, Swap, Disque) ainsi que les journaux de log de votre serveur et de les envoyer aux service AWS CloudWatch. Directement dans le service [CloudWatch](https://ca-central-1.console.aws.amazon.com/cloudwatch/home?region=ca-central-1#logsV2:log-groups) vous avez accès aux logs de votre serveur sous les onglets `Journaux > Groupes de journaux > /var/log/messages > <ID de l'instance>`.

![AWS CloudWatch Logs](static/cloud_watch_1.png)

Les métriques quant à elles sont disponibles dans les onglets `Métriques > Toutes les métriques > Parcourir`. La liste complète des métriques exportées est disponible dans le [fichier de configuration de l'agent](./amazon-cloudwatch-agent-config.json).

![AWS CloudWatch Metriques](static/cloud_watch_2.png)

# FAQ

## Le pipeline fail à la dernière étape car le fichier index.js n'existe pas

Essayez de compiler votre serveur et assurer vous le chemin vers le fichier `index.js` compilé dans le dossier `out/` correspond bien à celui de trouvant dans [la dernière ligne du CI](.gitlab-ci.yml).

## Le déploiement fonctionne, mais le client n'arrive pas à se connecter au socket

Vérifiez que les fichiers environnements sont bien configurés, que vous avez désactivé `Force HTTPs` (et refaire un nouveau déploiement) et enfin que vous accédez à votre site web en HTTP et non HTTPS (très important).

## Le déploiement fonctionne mais les images ne se chargent pas

Il faut mettre à jour la variable CI `BASE_HREF` en lui donnant la valeur : `/log2990/20231/equipe-XYZ/LOG2990-XYZ/`. Ensuite, changer tous les urls css pour qu’ils aient le format `src/assets/mon-asset.extension` et les urls HTML pour qu'ils aient le format `./assets/mon-asset.extension`. En utilisant ces formats, le compilateur Angular concaténera l'origine (http://polytechnique-montr-al.gitlab.io/), le base href et le chemin vers le fichier. Si vous voulez charger dynamiquement des images dans le ts vous devez faire la concaténation vous-même ([voir l'exemple suivant](https://itnext.io/how-to-extract-the-base-href-in-angular-bbbd559a1ad6)).

## Le déploiement Gitlab Pages fonctionne, mais je reçois une erreur de Gitlab du genre 401 Unauthorized

Le problème est souvent dû à un problème de cache. Réessayer de clear la cache de Chrome, se connecter en incognito ou sur un autre fureteur.

## J'ai tout fait, mais le pipeline ne marche toujours pas

S'assurer d'avoir bien mis les noms de variables, vérifier les fins de lignes de chaque variable. Ne serait-ce qu'un espace en trop peut faire échouer tout le déploiement. Aussi pas de variables protégées dans les variables CI/CD. Si ça ne va toujours pas, reprendre toute la procédure de zéro.
