// ===== Le service : va chercher les œuvres dans le fichier JSON =====

import { Oeuvre } from "./Oeuvre.js";

export class CatalogueService {
  constructor(url) {
    this.url = url; // adresse du fichier JSON
  }

  // async : la fonction est asynchrone (elle attend la réponse du serveur)
  async chargerOeuvres() {
    try {
      // await : on attend que fetch ait fini avant de continuer
      const reponse = await fetch(this.url);

      // fetch ne plante pas tout seul si le fichier est introuvable (erreur 404) :
      // il faut vérifier reponse.ok nous-mêmes
      if (!reponse.ok) {
        throw new Error("Erreur HTTP " + reponse.status);
      }

      const donnees = await reponse.json(); // lit le JSON
      // transforme chaque objet simple du JSON en vraie Oeuvre
      return donnees.map((objet) => new Oeuvre(objet));
    } catch (erreur) {
      console.error(erreur);
      throw new Error("Impossible de charger les œuvres (" + erreur.message + ").");
    }
  }
}