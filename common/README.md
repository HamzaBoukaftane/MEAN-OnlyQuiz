# Dossier common

Ce dossier `common` devrait seulement être utilisé pour des interfaces partagées entre le client et le server, et non pour de la logique d'application.

Raison :

> Un service au terme Angular du terme (client) est différent d’un service au sens typedi/nestjs (serveur). En prenant en compte que chaque projet compilera chaque fichier, on ne vous conseille pas de mettre de logique dans ce dossier. Des constantes c’est passable.
>
> Un problème de mettre la logique dans le common c’est les tests. Il faut aussi faire des tests standalone. Ce qui devient compliqué.
