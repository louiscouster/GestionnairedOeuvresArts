// ===== PARTIE 4 : objets, programmation fonctionnelle et persistance =====

const $ = (selecteur) => document.querySelector(selecteur);

const CLE_STOCKAGE = "gestionnaire-oeuvres";
const ANNEE_COURANTE = new Date().getFullYear();

// ----- Identifiants basés sur le temps (Date.now) -----
// Math.max garantit des id uniques même si deux œuvres sont créées dans la même milliseconde
let dernierId = 0;
const genererId = () => (dernierId = Math.max(dernierId + 1, Date.now()));

// ----- Modèle : un objet œuvre (attributs + méthodes qui utilisent `this`) -----
const creerOeuvre = ({
  id = genererId(),
  titre,
  artiste,
  annee,
  technique = "",
  musee = "",
  dateAjout = new Date().toISOString(), // date ISO de création
}) => ({
  // Propriétés
  id,
  titre,
  artiste,
  annee: Number(annee),
  technique,
  musee,
  dateAjout,

  // Âge de l'œuvre en années
  calculerAge() {
    return ANNEE_COURANTE - this.annee;
  },

  // Époque (switch) : libellé + classe CSS du badge
  epoque() {
    switch (true) {
      case this.annee < 1500:
        return { libelle: "Moyen Âge", classe: "epoque-ancien" };
      case this.annee < 1800:
        return { libelle: "Classique", classe: "epoque-classique" };
      case this.annee < 1900:
        return { libelle: "XIXe siècle", classe: "epoque-xix" };
      default:
        return { libelle: "Moderne", classe: "epoque-moderne" };
    }
  },

  // Texte "Artiste (année) · X ans"
  artisteEtAnnee() {
    return `${this.artiste} (${this.annee}) · ${this.calculerAge()} ans`;
  },

  // Date d'ajout au format local (ex : 13/10/2026)
  dateAjoutLocale() {
    return new Date(this.dateAjout).toLocaleDateString("fr-FR");
  },

  // Résumé en une ligne
  afficherDetails() {
    return `${this.titre} - ${this.artiste}, ${this.annee}`;
  },
});

// Affiche dans la console les attributs d'une œuvre (Object.keys + for...in)
const inspecterOeuvre = (oeuvre) => {
  console.log(`${oeuvre.afficherDetails()} (${Object.keys(oeuvre).length} clés)`);
  for (const cle in oeuvre) {
    if (typeof oeuvre[cle] !== "function") {
      console.log(`  ${cle} : ${oeuvre[cle]}`);
    }
  }
};

// ----- Données initiales (utilisées uniquement si le localStorage est vide) -----
const oeuvresInitiales = [
  {
    titre: "La Joconde",
    artiste: "Léonard de Vinci",
    annee: 1503,
    technique: "Huile sur bois de peuplier",
    musee: "Musée du Louvre, Paris",
  },
  {
    titre: "La Nuit étoilée",
    artiste: "Vincent van Gogh",
    annee: 1889,
    technique: "Huile sur toile",
    musee: "Museum of Modern Art (MoMA), New York",
  },
  {
    titre: "La Persistance de la mémoire",
    artiste: "Salvador Dalí",
    annee: 1931,
    technique: "Huile sur toile",
    musee: "Museum of Modern Art (MoMA), New York",
  },
];

// ----- Persistance (localStorage + JSON) -----

// Sauvegarde : JSON.stringify ignore les méthodes, seules les données sont stockées
const sauvegarder = () =>
  localStorage.setItem(CLE_STOCKAGE, JSON.stringify(oeuvres));

// Chargement : JSON.parse redonne des objets simples, qu'on "réhydrate" avec creerOeuvre
const chargerOeuvres = () => {
  try {
    const brut = localStorage.getItem(CLE_STOCKAGE);
    if (brut !== null) {
      return JSON.parse(brut).map(creerOeuvre);
    }
  } catch (erreur) {
    console.warn("Données sauvegardées illisibles, retour aux données initiales.", erreur);
  }
  return oeuvresInitiales.map(creerOeuvre);
};

// Tableau unique d'objets (remplacé, jamais modifié sur place)
let oeuvres = chargerOeuvres();

// ----- Éléments du DOM -----
const formulaireOeuvre = $("#formulaire-oeuvre");
const champTitre = $("#champ-titre");
const champArtiste = $("#champ-artiste");
const champAnnee = $("#champ-annee");
const champTechnique = $("#champ-technique");
const champMusee = $("#champ-musee");
const messageErreur = $("#message-erreur");
const listeOeuvres = $("#liste-oeuvres");
const champRecherche = $("#recherche");
const filtreEpoque = $("#filtre-epoque");

const champs = [champTitre, champArtiste, champAnnee, champTechnique, champMusee];

// Cases de statistiques
const statTotal = $("#stat-total");
const statAffichees = $("#stat-affichees");
const statArtistes = $("#stat-artistes");
const statMusees = $("#stat-musees");
const statAnneeMoyenne = $("#stat-annee-moyenne");
const statAgeMoyen = $("#stat-age-moyen");
const statPlusAncienne = $("#stat-plus-ancienne");
const statPlusRecente = $("#stat-plus-recente");

// ----- Validation -----
const tousRemplis = (...valeurs) => valeurs.every((valeur) => valeur !== "");

const anneeValide = (valeur) =>
  valeur !== "" &&
  Number.isInteger(Number(valeur)) &&
  Number(valeur) >= 1 &&
  Number(valeur) <= ANNEE_COURANTE;

const MESSAGE_ANNEE = `L'année doit être comprise entre 1 et ${ANNEE_COURANTE}.`;

const validerSaisie = (titre, artiste, annee) => {
  if (!tousRemplis(titre, artiste, annee)) {
    return "Le titre, l'artiste et l'année sont obligatoires.";
  }
  return anneeValide(annee) ? "" : MESSAGE_ANNEE;
};

const afficherMessage = (texte, succes = false) => {
  messageErreur.textContent = texte;
  messageErreur.classList.toggle("ok", succes);
};

// Contrôle en temps réel d'un champ (appelé par oninput)
const controlerSaisie = (champ) => {
  const valeur = champ.value.trim();
  champ.classList.remove("valide", "invalide");

  if (valeur === "" && !champ.required) {
    afficherMessage("");
    return;
  }

  const valide = champ === champAnnee ? anneeValide(valeur) : valeur !== "";
  champ.classList.add(valide ? "valide" : "invalide");

  let message = "";
  if (!valide) {
    message = champ === champAnnee ? MESSAGE_ANNEE : "Ce champ est obligatoire.";
  }
  afficherMessage(message);
};

// ----- Statistiques (reduce + Math) -----

// Écrit une valeur dans une case de stat (petite animation si elle change)
const afficherStat = (element, valeur) => {
  const texte = String(valeur);
  if (element.textContent === texte) return;
  element.textContent = texte;
  element.classList.remove("maj");
  void element.offsetWidth; // relance l'animation
  element.classList.add("maj");
};

// Compte les valeurs différentes (sans tenir compte des vides ni de la casse)
const compterDistincts = (valeurs) =>
  [...new Set(valeurs.map((v) => v.trim().toLowerCase()).filter((v) => v !== "")
  )].length;

// Moyenne d'une liste de nombres (reduce)
const moyenne = (nombres) =>
  nombres.reduce((somme, n) => somme + n, 0) / nombres.length;

const mettreAJourStats = (visibles) => {
  const annees = oeuvres.map((o) => o.annee);

  afficherStat(statTotal, oeuvres.length);
  afficherStat(statAffichees, visibles.length);
  afficherStat(statArtistes, compterDistincts(oeuvres.map((o) => o.artiste)));
  afficherStat(statMusees, compterDistincts(oeuvres.map((o) => o.musee)));

  if (annees.length === 0) {
    [statAnneeMoyenne, statAgeMoyen, statPlusAncienne, statPlusRecente].forEach(
      (element) => afficherStat(element, "–"),
    );
    return;
  }

  afficherStat(statAnneeMoyenne, Math.round(moyenne(annees)));
  afficherStat(statAgeMoyen, moyenne(oeuvres.map((o) => o.calculerAge())).toFixed(1));
  afficherStat(statPlusAncienne, Math.min(...annees));
  afficherStat(statPlusRecente, Math.max(...annees));
};

// ----- Filtrage (filter) -----
const filtrerOeuvres = () => {
  const recherche = champRecherche.value.trim().toLowerCase();
  const epoqueChoisie = filtreEpoque.value;

  return oeuvres.filter((o) => {
    const texte = `${o.titre} ${o.artiste} ${o.technique} ${o.musee}`.toLowerCase();
    const correspondTexte = texte.includes(recherche);
    const correspondEpoque = epoqueChoisie === "" || o.epoque().libelle === epoqueChoisie;
    return correspondTexte && correspondEpoque;
  });
};

// ----- Affichage (map) -----

// Protège le HTML injecté
const echapper = (texte) =>
  String(texte)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// HTML d'une carte
const carteHTML = (oeuvre) => {
  const { libelle, classe } = oeuvre.epoque();
  return `
    <section class="carte-oeuvre">
      <button type="button" class="btn-supprimer" onclick="supprimerOeuvre(${oeuvre.id})">Supprimer</button>
      <span class="badge-epoque ${classe}">${libelle}</span>
      <p class="titre-oeuvre">${echapper(oeuvre.titre)}</p>
      <p class="artiste-annee-oeuvre">${echapper(oeuvre.artisteEtAnnee())}</p>
      <p class="technique-oeuvre">${oeuvre.technique ? echapper(oeuvre.technique) : "Technique non renseignée"}</p>
      <p class="musee-oeuvre">${oeuvre.musee ? echapper(oeuvre.musee) : "Musée non renseigné"}</p>
      <p class="date-ajout">Ajoutée le ${oeuvre.dateAjoutLocale()}</p>
    </section>`;
};

// Recalcule la liste filtrée, l'affiche et met à jour les stats
const mettreAJourAffichage = () => {
  const visibles = filtrerOeuvres();

  if (visibles.length === 0) {
    const texte =
      oeuvres.length === 0
        ? "Aucune œuvre dans la collection."
        : "Aucune œuvre ne correspond à votre recherche.";
    listeOeuvres.innerHTML = `<p class="vide">${texte}</p>`;
  } else {
    listeOeuvres.innerHTML = visibles.map(carteHTML).join("");
  }

  mettreAJourStats(visibles);
};

// ----- Actions (appelées depuis le HTML) -----
const lireChamps = () => champs.map((champ) => champ.value.trim());

// onsubmit
const ajouterOeuvre = (event) => {
  event.preventDefault();

  const [titre, artiste, annee, technique, musee] = lireChamps();

  const erreur = validerSaisie(titre, artiste, annee);
  if (erreur) {
    afficherMessage(erreur);
    return;
  }

  const nouvelleOeuvre = creerOeuvre({ titre, artiste, annee, technique, musee });
  inspecterOeuvre(nouvelleOeuvre);

  oeuvres = [...oeuvres, nouvelleOeuvre]; // Spread : nouveau tableau
  sauvegarder();

  // On remet les filtres à zéro pour que la nouvelle œuvre soit visible
  champRecherche.value = "";
  filtreEpoque.value = "";

  afficherMessage("Œuvre ajoutée à la collection !", true);
  formulaireOeuvre.reset();
  champs.forEach((champ) => champ.classList.remove("valide", "invalide"));
  mettreAJourAffichage();
};

// onclick sur le bouton Supprimer
const supprimerOeuvre = (id) => {
  oeuvres = oeuvres.filter((o) => o.id !== id);
  sauvegarder();
  mettreAJourAffichage();
};

// Affichage initial (données rechargées depuis le localStorage)
mettreAJourAffichage();
