# Cap Citoyen — Brochure technique et fonctionnelle

---

## Presentation generale

**Cap Citoyen** est une plateforme web pedagogique qui accompagne les etrangers residant en France dans deux demarches majeures :

1. L'obtention de la **carte de resident de 10 ans**
2. L'acquisition de la **nationalite francaise** (naturalisation par decret ou declaration par mariage)

L'application permet de comprendre les conditions, preparer son dossier, et surtout s'entrainer a l'examen civique et au test de langue via des cours sources, des quiz interactifs et un examen blanc en conditions reelles.

**Public cible** : personnes etrangeres residant en France, souvent peu a l'aise avec le jargon administratif. L'interface est entierement en francais, claire et rassurante.

---

## Stack technique

| Composant | Technologie |
|-----------|-------------|
| Frontend | React 19 + TypeScript + Vite 8 |
| Routing | TanStack Router (file-based, SSR) |
| UI | Tailwind CSS 4 + shadcn/ui + Radix UI |
| Polices | Fraunces (titres) + Inter (corps) |
| Icones | Lucide React |
| Backend / BDD | Supabase (PostgreSQL) |
| Authentification | Supabase Auth (email/mot de passe, PKCE) |
| Data fetching | TanStack React Query |
| Graphiques | Recharts |
| Markdown | React Markdown |
| Deploiement | Lovable (auto-deploy sur push GitHub) |
| Hebergement | Cloudflare (via Nitro/TanStack Start) |

---

## Architecture de la base de donnees

### Tables principales

| Table | Fonction |
|-------|----------|
| `profiles` | Profil utilisateur (id = auth.users.id, email, nom) |
| `user_roles` | Roles (admin / user) par utilisateur |
| `modules` | Modules thematiques (langue, carte_resident, naturalisation, examen_civique) |
| `lecons` | Lecons en markdown avec source officielle et date de verification |
| `questions` | Banque de questions QCM/vrai-faux avec explication et source |
| `quiz_tentatives` | Historique des tentatives (score, total, details par question) |
| `progression` | Suivi de progression par lecon (non_commence, en_cours, termine) |
| `checklist_items` | Checklist de dossier par utilisateur (carte_resident ou naturalisation) |

### Securite (Row Level Security)

- Chaque utilisateur ne voit et ne modifie **que ses propres donnees** (progression, tentatives, checklist, profil)
- Le contenu pedagogique (modules, lecons, questions) est **lisible par tous les connectes**, mais **modifiable uniquement par les admins**
- La verification admin se fait **cote serveur** via une fonction SQL `has_role(user_id, 'admin')` — pas un simple masquage frontend

### Trigger automatique

A chaque inscription, le trigger `handle_new_user()` :
1. Cree automatiquement la ligne `profiles` correspondante
2. Attribue le role `admin` au tout premier utilisateur inscrit
3. Attribue le role `user` a tous les suivants

---

## Fonctionnalites detaillees

### Pages publiques (accessibles sans compte)

| Route | Contenu |
|-------|---------|
| `/` | Page d'accueil avec hero, features, disclaimer |
| `/demarches` | Presentation des deux parcours (carte resident + naturalisation) |
| `/a-propos` | Mission, fiabilite, sources officielles |
| `/connexion` | Connexion email/mot de passe |
| `/inscription` | Creation de compte avec validation |
| `/mot-de-passe-oublie` | Reinitialisation du mot de passe par email |

### Espace utilisateur (compte requis)

| Route | Fonctionnalite |
|-------|---------------|
| `/tableau-bord` | Dashboard : progression globale (%), derniers scores (graphique Recharts), prochaine lecon |
| `/parcours` | Liste des modules par categorie avec lecons et % d'avancement |
| `/lecon/:id` | Contenu markdown de la lecon + source officielle + bouton "Marquer comme termine" |
| `/quiz/:moduleId` | Quiz thematique : 20 questions max, correction immediate, score, recommencer |
| `/examen-blanc` | Examen civique en conditions reelles (voir ci-dessous) |
| `/checklist` | Checklist interactive pour carte resident ET naturalisation |
| `/profil` | Nom, email, badge admin, deconnexion |

### Examen civique blanc — Detail

L'examen blanc reproduit les conditions reelles de l'examen civique officiel :

- **40 questions** tirees aleatoirement dans la banque
- **Chronometre de 30 minutes** (fin automatique si le temps expire)
- **Seuil de reussite : 32/40 (80%)**
- **Correction detaillee** en fin d'examen : reponse donnee, bonne reponse, explication pedagogique, source officielle
- **Resultat enregistre** en base avec tous les details (question par question)
- Possibilite de recommencer autant de fois que souhaite

### Quiz thematiques

- Questions filtrees par module (langue, carte resident, naturalisation, examen civique)
- Maximum 20 questions par session (melangees aleatoirement)
- **Correction immediate** apres chaque question (pas besoin d'attendre la fin)
- Affichage de l'explication et de la source officielle pour chaque reponse
- Score final + possibilite de recommencer

### Checklist de dossier

Deux listes independantes :

**Carte de resident (12 pieces)** :
- Formulaire CERFA, photos, passeport, justificatif de domicile, etc.

**Naturalisation (15 pieces)** :
- CERFA 12753, attestation de niveau B2, actes d'etat civil, etc.

Chaque item est cochable, sauvegarde immediatement en base, et retrouve apres reconnexion. Barre de progression visuelle.

---

## Espace administrateur (/admin)

L'admin accede a un espace dedie avec une barre de navigation specifique (fond bleu). Il est protege par verification du role en base de donnees.

### Tableau de bord admin

4 indicateurs en temps reel :
- Nombre d'utilisateurs inscrits
- Nombre de questions en base
- Nombre de tentatives d'examen
- Taux de reussite moyen

+ Section "Questions les plus echouees" (top 5)
+ Recommandations de maintenance

### CRUD Questions

- **Ajouter** une question : enonce, type (QCM/vrai-faux), 4 options, bonne reponse, explication, module, difficulte (1-3), source officielle (URL), date de verification
- **Modifier** n'importe quelle question existante
- **Supprimer** avec confirmation
- **Filtrer** par module ou recherche textuelle
- **Import en masse** : coller un tableau JSON pour inserer des dizaines de questions d'un coup
- **Bouton "Peupler"** : insertion automatique de 88 questions d'entrainement en un clic (visible uniquement si la base est vide)

### CRUD Modules et Lecons

- Creer/modifier/supprimer des modules (titre, description, categorie, icone, ordre)
- Creer/modifier/supprimer des lecons dans chaque module (titre, contenu markdown, source officielle, date de verification, ordre)
- Editeur markdown avec police monospace pour visualiser le formatage

---

## Banque de questions (88 questions)

Les questions sont conformes au referentiel officiel de l'examen civique en vigueur (loi du 26 janvier 2024 + decret 2025-648). Elles couvrent :

| Module | Nombre | Themes |
|--------|--------|--------|
| Conditions & niveaux de langue | 7 | TCF IRN, TEF, niveaux A2/B1/B2, dispenses, validite |
| Carte de resident 10 ans | 8 | Conditions, duree, ANEF, renouvellement, dispenses |
| Naturalisation francaise | 8 | Voies, delais, CERFA, mariage, casier judiciaire |
| Examen civique blanc | 65 | Devise, drapeau, Marianne, hymne, laicite, institutions, histoire, geographie, droits, devoirs, UE |

**Total : 88 questions** (objectif 80-120 atteint)

Chaque question comporte :
- Source officielle (URL service-public.gouv.fr, legifrance.gouv.fr, etc.)
- Date de verification (01/01/2026)
- Explication pedagogique

---

## Fiabilite et conformite juridique

### Disclaimer (affiche en permanence)

> Cap Citoyen est un outil pedagogique. Les informations sont issues de sources officielles mais ne constituent pas un conseil juridique. Referez-vous toujours a service-public.gouv.fr et a votre prefecture.

Ce disclaimer est affiche :
- Sur la page d'accueil (section dediee)
- Dans le footer de TOUTES les pages

### Sources officielles de reference

- service-public.gouv.fr (fiches F2208, F11201, F11926)
- immigration.interieur.gouv.fr
- france-education-international.fr (TCF IRN)
- legifrance.gouv.fr (Constitution, CESEDA)

### Affichage source + date

Chaque contenu (lecon, question, explication) affiche un badge :
> Source : service-public.gouv.fr — verifie le 01/01/2026

---

## Authentification et securite

| Fonctionnalite | Implementation |
|----------------|---------------|
| Inscription | Email + mot de passe (min 8 caracteres) + confirmation + nom |
| Connexion | Email/mot de passe avec messages d'erreur en francais |
| Deconnexion | signOut Supabase + redirection accueil |
| Session persistante | localStorage + autoRefreshToken (pas de deconnexion au refresh) |
| Mot de passe oublie | Email de reinitialisation via Supabase Auth |
| Routes protegees | Guard `beforeLoad` verifie `getUser()` |
| Routes admin | Guard supplementaire verifie role dans `user_roles` |
| RLS | Toutes les tables protegees par Row Level Security |
| service_role key | JAMAIS exposee cote client |

### Messages d'erreur en francais

| Erreur Supabase | Message affiche |
|-----------------|-----------------|
| Invalid login credentials | Identifiants incorrects. |
| Email not confirmed | Veuillez confirmer votre email. |
| User already registered | Cet email est deja utilise. |
| Weak password | Le mot de passe doit contenir au moins 8 caracteres. |
| Too many requests | Trop de tentatives. Reessayez dans quelques minutes. |

---

## Design et UX

### Identite visuelle

- **Couleurs** : bleu marine (france-blue), rouge discret (republic), fond clair
- **Polices** : Fraunces (variable, optique) pour les titres, Inter pour le corps
- **Coins arrondis** : `rounded-2xl` sur les cartes
- **Ombres** : `shadow-elegant` pour la profondeur
- **Gradient hero** : degrade bleu marine avec pattern geometrique

### Responsive

- Mobile-first : navigation compacte en barre sous le header
- Desktop : navigation horizontale complete
- Grilles adaptatives (`grid-cols-1` → `md:grid-cols-2` → `lg:grid-cols-3`)

### Accessibilite

- Contrastes AA sur tous les textes
- `focus-visible` sur tous les elements interactifs
- `aria-invalid` sur les champs en erreur
- Semantic HTML (header, main, nav, footer, section)

---

## Maintenance et evolution

### Pour l'administrateur

1. **Ajouter des questions** : Admin > Questions > Nouvelle question (ou Import JSON)
2. **Mettre a jour les sources** : Modifier la date de verification apres recheck
3. **Ajouter un module** : Admin > Modules & lecons > Nouveau module
4. **Surveiller le taux de reussite** : Admin > Tableau de bord

### Pour le developpeur

- `npm run dev` : serveur de developpement (port 8080)
- `npm run build` : build de production
- `npx tsc --noEmit` : verification TypeScript
- Push sur `main` : deploiement automatique via Lovable

### Variables d'environnement requises

```
VITE_SUPABASE_URL=https://ggnpqptpjdvhbdkbfkws.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ... (anon key)
```

---

## Flux utilisateur type

```
Visiteur arrive sur la landing page
    |
    v
S'inscrit (nom + email + mot de passe)
    |
    v
Profil cree automatiquement (trigger)
    |
    v
Redirige vers le tableau de bord
    |
    +---> Parcours : lit les lecons, marque "termine"
    |
    +---> Quiz thematique : s'entraine module par module
    |
    +---> Examen blanc : 40 questions, chrono, correction
    |
    +---> Checklist : coche les pieces de son dossier
    |
    v
Progresse, revient, voit ses scores evoluer
```

---

## Resume des garanties

- 0 erreur TypeScript
- Build de production reussi
- Toutes les routes fonctionnelles (aucun lien mort)
- Authentification complete avec persistance
- 88 questions conformes au referentiel officiel
- Administration complete (CRUD + stats + import)
- Sources officielles affichees partout
- Disclaimer legal permanent
- RLS active sur toutes les tables
- Premier inscrit = admin automatique
- Responsive mobile + desktop
- Accessible (contrastes AA, focus visibles)

---

*Document genere le 19 juin 2026 — Version officielle.*
