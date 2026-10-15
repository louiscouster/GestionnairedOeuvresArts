const $ = (id) => document.getElementById(id);

// Exercice 1 :

const produit = {
  nom: "Clavier",
  prixHT: 50,
  calculerTTC() {
    return this.prixHT * 1.2; // TVA 20 %
  },
};
 
function afficherPrixTTC() {
  $("details-produit").textContent = `${produit.nom} : ${produit.calculerTTC()} € TTC`;
}

// Exercice 2 :

const config = {
  theme: "sombre",
  langue: "fr",
  notifications: "activées",
};

const afficherConfig = () => {
  let html = "";
  for (const prop in config) {
    html += `<li>${prop} : ${config[prop]}</li>`;
  }

  document.querySelector("#liste-config").innerHTML = html;
};

// Exercice 3 : 

const augmenterPrix = () => {
    const prixHT = [10, 25, 50, 100];
    const nouveauPrix = prixHT.filter ((prix)=>prix >40);

    document.querySelector('#prix-augmentes').textContent = nouveauPrix.join(", ");
}

// Exercice 4 : 

const filtrerStock = () => {
    const articles = [
        { nom: "Livre", enStock: true },
        { nom: "Stylo", enStock: false },
        { nom: "Cahier", enStock: true }
    ];
    const coche = document.querySelector('#filtre-stock').checked;
    const visibles = coche ? articles.filter((a) => a.enStock) : articles;
 
    document.querySelector('#catalogue').textContent =
        visibles.map((a) => a.nom).join(", ");
}


const listeVoitures = async () => {
    const response = await fetch("EXERCICES/voiture.json");
    const voitures = await response.json();
    document.querySelector('#catalogue').textContent =
        voitures.map((v) => `${v.marque} ${v.modele} (${v.kilometrage} km)`).join(", ");
}

for (let v of resultat) {
  const voiture = new Vehicule(v.marque, v.modele, v.kilometrage, v.prix);
    voiture.push
}
const voitures = resultat.map((v) => {return new Vehicule(v.marque, v.modele, v.kilometrage, v.prix);
  return voitures;
});

console.log(voitures);

const listes = listeVoitures();
console.log(listes);  