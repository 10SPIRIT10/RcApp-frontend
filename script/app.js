// Remplace cette URL par l'URL exacte transmise par Render lors du déploiement
const API_URL = "rcapp-backend-production.up.railway.app";

document.addEventListener("DOMContentLoaded", () => {
  // 1. Détection automatique du recruteur via l'URL (ex: index.html?ref=JEAN237)
  const urlParams = new URLSearchParams(window.location.search);
  const recruiterRef = urlParams.get("ref");

  if (recruiterRef) {
    document.getElementById("recruiter_ref").value = recruiterRef;
    console.log(`Lien de parrainage détecté : ${recruiterRef}`);
  }

  // 2. Écoute de la soumission du formulaire
  const form = document.getElementById("candidate-form");
  form.addEventListener("submit", handleFormSubmit);
});

async function handleFormSubmit(e) {
  e.preventDefault();

  const submitBtn = document.getElementById("submit-btn");
  const btnText = document.getElementById("btn-text");
  const spinner = document.getElementById("spinner");

  // État de chargement (désactivation du bouton)
  submitBtn.disabled = true;
  btnText.textContent = "Envoi en cours...";
  spinner.classList.remove("hidden");

  // Préparation des données du formulaire
  const formData = {
    recruiter_ref: document.getElementById("recruiter_ref").value,
    fullname: document.getElementById("fullname").value.trim(),
    phone: "+237" + document.getElementById("phone").value.trim(),
    city: document.getElementById("city").value,
    neighborhood: document.getElementById("neighborhood").value.trim(),
    sector: document.getElementById("sector").value,
  };

  try {
    // Requête POST vers l'API Express
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.error || "Erreur lors de l'enregistrement de la candidature.",
      );
    }

    // Affichage dynamique des résultats retournés par le backend
    displayRedirectionResult(formData, result.office);
  } catch (error) {
    console.error("Erreur API :", error);
    alert(`Désolé : ${error.message || "Impossible de contacter le serveur."}`);
  } finally {
    // Réinitialisation de l'état du bouton
    submitBtn.disabled = false;
    btnText.textContent = "Envoyer ma candidature";
    spinner.classList.add("hidden");
  }
}

function displayRedirectionResult(candidate, office) {
  // Masquer le formulaire et afficher le bloc de résultat
  document.getElementById("form-section").classList.add("hidden");
  const resultSection = document.getElementById("result-section");
  resultSection.classList.remove("hidden");

  if (office) {
    // CAS A : Le backend a trouvé un bureau actif pour la ville saisie
    document.getElementById("status-icon").textContent = "✅";
    document.getElementById("result-title").textContent =
      `Merci ${candidate.fullname} !`;
    document.getElementById("result-message").textContent =
      `Votre pré-inscription a été validée. Un bureau local est disponible à ${candidate.city}. Vous pouvez contacter notre agent ou vous y rendre directement.`;

    // Injection des données réelles du bureau depuis Supabase
    document.getElementById("office-name").textContent =
      `Bureau GetJob - ${office.city}`;
    document.getElementById("office-address").textContent =
      `📍 ${office.address}`;
    document.getElementById("office-call").href = `tel:${office.phone}`;
    document.getElementById("office-wa").href =
      `https://wa.me/237${office.phone}?text=${encodeURIComponent(`Bonjour, je m'appelle ${candidate.fullname}. Je me suis pré-inscrit(e) via la plateforme pour le domaine ${candidate.sector}.`)}`;

    document.getElementById("office-info").classList.remove("hidden");
  } else {
    // CAS B : Aucun bureau enregistré dans cette ville (Mise en attente)
    document.getElementById("status-icon").textContent = "⏳";
    document.getElementById("result-title").textContent =
      `Candidature Enregistrée !`;
    document.getElementById("result-message").textContent =
      `Merci ${candidate.fullname}. Nous n'avons pas encore de bureau physique à ${candidate.city}, mais votre dossier a été attribué à nos agents. Vous serez recontacté(e) par téléphone ou WhatsApp dès qu'une opportunité se présente dans votre zone.`;

    document.getElementById("office-info").classList.add("hidden");
  }
}
