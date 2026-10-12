// Raccourci pour récupérer un élément par son id
const $ = (id) => document.getElementById(id);

// Crée un objet œuvre : attributs + méthodes (qui utilisent `this`)
const creerOeuvre = ({ titre, artiste, annee, technique, musee }) => ({
  // Propriétés (attributs)
  titre,
  artiste,
  annee: Number(annee),
  technique,
  musee,

  // Méthode : âge de l'œuvre en années
  calculerAge() {
    return new Date().getFullYear() - this.annee;
  },

  // Méthode : texte "Artiste (année) · X ans"
  artisteEtAnnee() {
    return `${this.artiste} (${this.annee}) · ${this.calculerAge()} ans`;
  },

  // Méthode : résumé en une ligne
  afficherDetails() {
    return `${this.titre} - ${this.artiste}, ${this.annee}`;
  },
});

// Œuvres toujours présentes au chargement de la page
const oeuvres = [
  creerOeuvre({
    titre: "La Joconde",
    artiste: "Léonard de Vinci",
    annee: 1503,
    technique: "Huile sur bois de peuplier",
    musee: "Musée du Louvre, Paris",
  }),
  creerOeuvre({
    titre: "La Nuit étoilée",
    artiste: "Vincent van Gogh",
    annee: 1889,
    technique: "Huile sur toile",
    musee: "Museum of Modern Art (MoMA), New York",
  }),
  creerOeuvre({
    titre: "La Persistance de la mémoire",
    artiste: "Salvador Dalí",
    annee: 1931,
    technique: "Huile sur toile",
    musee: "Museum of Modern Art (MoMA), New York",
  }),
];

// Affiche dans la console les attributs d'une œuvre (Object.keys + for...in)
const inspecterOeuvre = (oeuvre) => {
  console.log(`${oeuvre.afficherDetails()} (${Object.keys(oeuvre).length} clés)`);
  for (const cle in oeuvre) {
    if (typeof oeuvre[cle] !== "function") {
      console.log(`  ${cle} : ${oeuvre[cle]}`);
    }
  }
};

// Carte de départ présente dans le HTML (servira de modèle)
const carteOriginale = $("carte-oeuvre");

// Cases de statistiques
const statTotal = $("stat-total");
const statArtistes = $("stat-artistes");
const statMusees = $("stat-musees");
const statAnneeMoyenne = $("stat-annee-moyenne");
const statAgeMoyen = $("stat-age-moyen");
const statPlusAncienne = $("stat-plus-ancienne");

// Formulaire et champs de saisie
const formulaireOeuvre = $("formulaire-oeuvre");
const champTitre = $("champ-titre");
const champArtiste = $("champ-artiste");
const champAnnee = $("champ-annee");
const champTechnique = $("champ-technique");
const champMusee = $("champ-musee");

// Écrit un texte dans un élément de la carte
const ecrire = (carte, selecteur, texte) =>
  (carte.querySelector(selecteur).textContent = texte);

// Remplit une carte avec les infos d'une œuvre
const remplirCarte = (carte, oeuvre) => {
  ecrire(carte, ".titre-oeuvre", oeuvre.titre);
  ecrire(carte, ".artiste-annee-oeuvre", oeuvre.artisteEtAnnee());
  ecrire(carte, ".technique-oeuvre", oeuvre.technique);
  ecrire(carte, ".musee-oeuvre", oeuvre.musee);
};

// Duplique la carte de départ et l'ajoute à la fin de la page
const ajouterCarte = (oeuvre) => {
  const nouvelleCarte = carteOriginale.cloneNode(true);

  // Évite les id en double dans la page
  nouvelleCarte.removeAttribute("id");
  nouvelleCarte.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"));

  remplirCarte(nouvelleCarte, oeuvre);
  carteOriginale.parentElement.append(nouvelleCarte);
};

// Écrit une valeur dans une case de stat (avec une petite animation si elle change)
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
  [...new Set(valeurs.map((v) => v.trim().toLowerCase()).filter((v) => v !== ""))]
    .length;

// Moyenne d'une liste de nombres
const moyenne = (nombres) =>
  nombres.reduce((somme, n) => somme + n, 0) / nombres.length;

// Recalcule et affiche toutes les statistiques
const mettreAJourStats = () => {
  const annees = oeuvres.map((o) => o.annee);

  afficherStat(statTotal, oeuvres.length);
  afficherStat(statArtistes, compterDistincts(oeuvres.map((o) => o.artiste)));
  afficherStat(statMusees, compterDistincts(oeuvres.map((o) => o.musee)));

  if (annees.length === 0) {
    afficherStat(statAnneeMoyenne, "–");
    afficherStat(statAgeMoyen, "–");
    afficherStat(statPlusAncienne, "–");
    return;
  }

  afficherStat(statAnneeMoyenne, Math.round(moyenne(annees)));
  afficherStat(statAgeMoyen, Math.round(moyenne(oeuvres.map((o) => o.calculerAge()))));
  afficherStat(statPlusAncienne, Math.min(...annees));
};

// Fonction appelée lors de la soumission du formulaire
const mettreAJourInfosOeuvre = (event) => {
  event.preventDefault(); // Empêche le rechargement de la page

  const nouvelleOeuvre = creerOeuvre({
    titre: champTitre.value,
    artiste: champArtiste.value,
    annee: champAnnee.value,
    technique: champTechnique.value,
    musee: champMusee.value,
  });

  inspecterOeuvre(nouvelleOeuvre);
  oeuvres.push(nouvelleOeuvre);
  ajouterCarte(nouvelleOeuvre);
  mettreAJourStats();

  formulaireOeuvre.reset();
};

// Écoute la soumission du formulaire
formulaireOeuvre.addEventListener("submit", mettreAJourInfosOeuvre);

// Affichage initial : la 1re œuvre dans la carte existante, les autres dupliquées
const [premiereOeuvre, ...autresOeuvres] = oeuvres;
remplirCarte(carteOriginale, premiereOeuvre);
autresOeuvres.forEach((o) => ajouterCarte(o));
mettreAJourStats();