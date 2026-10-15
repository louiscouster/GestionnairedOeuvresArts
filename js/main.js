// ===== Fichier principal : relie le HTML, la classe et le service =====

import { Oeuvre } from "./Oeuvre.js";
import { CatalogueService } from "./CatalogueService.js";

// Le chemin est relatif à index.html
const service = new CatalogueService("data/oeuvres.json");
const oeuvres = [];

// ===== Les éléments de la page =====

const carteOriginale = document.querySelector("#carte-oeuvre");
const conteneur = carteOriginale.parentElement; // l'endroit où on ajoute les cartes
const messageErreur = document.querySelector("#message-erreur");

const formulaire = document.querySelector("#formulaire-oeuvre");
const champTitre = document.querySelector("#champ-titre");
const champArtiste = document.querySelector("#champ-artiste");
const champAnnee = document.querySelector("#champ-annee");
const champTechnique = document.querySelector("#champ-technique");
const champMusee = document.querySelector("#champ-musee");

const statTotal = document.querySelector("#stat-total");
const statArtistes = document.querySelector("#stat-artistes");
const statMusees = document.querySelector("#stat-musees");
const statAnneeMoyenne = document.querySelector("#stat-annee-moyenne");
const statAgeMoyen = document.querySelector("#stat-age-moyen");
const statPlusAncienne = document.querySelector("#stat-plus-ancienne");

// ===== Les cartes =====

// Écrit les infos d'une œuvre dans une carte
const remplirCarte = (carte, oeuvre) => {
  carte.querySelector(".titre-oeuvre").textContent = oeuvre.titre;
  carte.querySelector(".artiste-annee-oeuvre").textContent = oeuvre.artisteEtAnnee();
  carte.querySelector(".technique-oeuvre").textContent = oeuvre.technique;
  carte.querySelector(".musee-oeuvre").textContent = oeuvre.musee;
};

// Supprime une œuvre : du tableau ET de la page
const supprimerOeuvre = (oeuvre, carte) => {
  const position = oeuvres.indexOf(oeuvre);
  oeuvres.splice(position, 1); // retire l'œuvre du tableau
  carte.remove(); // retire la carte de la page
  mettreAJourStats();
};

// Fait en sorte que le bouton « Supprimer » d'une carte supprime son œuvre
const brancherSuppression = (carte, oeuvre) => {
  carte.querySelector(".btn-supprimer").addEventListener("click", () => {
    supprimerOeuvre(oeuvre, carte);
  });
};

// Copie la carte modèle, la remplit, et l'ajoute à la page
const ajouterCarte = (oeuvre) => {
  const nouvelleCarte = carteOriginale.cloneNode(true);
  nouvelleCarte.removeAttribute("id");
  remplirCarte(nouvelleCarte, oeuvre);
  brancherSuppression(nouvelleCarte, oeuvre);
  conteneur.append(nouvelleCarte);
};

// ===== Les statistiques =====

const moyenne = (nombres) =>
  nombres.reduce((somme, n) => somme + n, 0) / nombres.length;

const compterDistincts = (valeurs) => {
  const propres = valeurs
    .map((v) => v.trim().toLowerCase())
    .filter((v) => v !== "");
  return new Set(propres).size;
};

const mettreAJourStats = () => {
  statTotal.textContent = oeuvres.length;

  // Plus aucune œuvre : on évite de calculer une moyenne sur une liste vide
  if (oeuvres.length === 0) {
    statArtistes.textContent = 0;
    statMusees.textContent = 0;
    statAnneeMoyenne.textContent = "–";
    statAgeMoyen.textContent = "–";
    statPlusAncienne.textContent = "–";
    return;
  }

  const annees = oeuvres.map((o) => o.annee);
  const ages = oeuvres.map((o) => o.calculerAge());

  statArtistes.textContent = compterDistincts(oeuvres.map((o) => o.artiste));
  statMusees.textContent = compterDistincts(oeuvres.map((o) => o.musee));
  statAnneeMoyenne.textContent = Math.round(moyenne(annees));
  statAgeMoyen.textContent = Math.round(moyenne(ages));
  statPlusAncienne.textContent = Math.min(...annees);
};

// ===== Le formulaire =====

const ajouterOeuvre = (event) => {
  event.preventDefault(); // empêche le rechargement de la page

  try {
    // Si l'année est invalide, le setter de la classe lance une erreur
    const nouvelleOeuvre = new Oeuvre({
      titre: champTitre.value,
      artiste: champArtiste.value,
      annee: champAnnee.value,
      technique: champTechnique.value,
      musee: champMusee.value,
    });

    console.log(nouvelleOeuvre.afficherDetails());
    oeuvres.push(nouvelleOeuvre);
    ajouterCarte(nouvelleOeuvre);
    mettreAJourStats();

    messageErreur.textContent = "";
    formulaire.reset();
  } catch (erreur) {
    // On affiche l'erreur à l'utilisateur
    messageErreur.textContent = erreur.message;
  }
};

formulaire.addEventListener("submit", ajouterOeuvre);

// ===== Au chargement de la page =====

const demarrer = async () => {
  try {
    // On attend que le service ait lu le fichier JSON
    const oeuvresChargees = await service.chargerOeuvres();
    oeuvres.push(...oeuvresChargees);

    // La 1re œuvre va dans la carte existante, les autres sont copiées
    const [premiereOeuvre, ...autresOeuvres] = oeuvres;
    remplirCarte(carteOriginale, premiereOeuvre);
    brancherSuppression(carteOriginale, premiereOeuvre);
    autresOeuvres.forEach((oeuvre) => ajouterCarte(oeuvre));
    mettreAJourStats();
  } catch (erreur) {
    carteOriginale.querySelector(".titre-oeuvre").textContent = "Aucune œuvre chargée";
    // Ici le bouton retire simplement la carte vide
    carteOriginale.querySelector(".btn-supprimer").addEventListener("click", () => {
      carteOriginale.remove();
    });
    messageErreur.textContent = erreur.message;
  }
};

demarrer();