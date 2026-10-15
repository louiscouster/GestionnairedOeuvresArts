// ===== La classe Oeuvre =====
// Elle remplace la fonction creerOeuvre : même idée, mais sous forme de classe.

export class Oeuvre {
  // Champ PRIVÉ : on ne peut pas le lire ni le modifier depuis l'extérieur
  #annee;

  constructor({ titre, artiste, annee, technique, musee }) {
    this.titre = titre;
    this.artiste = artiste;
    this.annee = annee; // passe par le "set annee" ci-dessous (donc vérifié)
    this.technique = technique;
    this.musee = musee;
  }

  // GETTER : permet de lire l'année (oeuvre.annee)
  get annee() {
    return this.#annee;
  }

  // SETTER : appelé à chaque fois qu'on écrit oeuvre.annee = ...
  // Il vérifie la valeur avant de l'accepter
  set annee(valeur) {
    const nombre = Number(valeur);
    const anneeActuelle = new Date().getFullYear();

    if (!Number.isInteger(nombre) || nombre < 1 || nombre > anneeActuelle) {
      throw new Error("L'année doit être un nombre entre 1 et " + anneeActuelle + ".");
    }
    this.#annee = nombre;
  }

  // Âge de l'œuvre en années
  calculerAge() {
    return new Date().getFullYear() - this.#annee;
  }

  // Texte "Artiste (année) · X ans"
  artisteEtAnnee() {
    return `${this.artiste} (${this.#annee}) · ${this.calculerAge()} ans`;
  }

  // Résumé en une ligne
  afficherDetails() {
    return `${this.titre} - ${this.artiste}, ${this.#annee}`;
  }
}