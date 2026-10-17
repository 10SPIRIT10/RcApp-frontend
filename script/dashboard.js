// URL de ton API Backend Render
const API_URL = "rcapp-backend-production.up.railway.app";

let currentAgentRef = null;
let allCandidates = [];
let activeFilter = "ALL";

document.addEventListener("DOMContentLoaded", () => {
  // Vérifier si le recruteur est déjà connecté localement
  const savedRef = localStorage.getItem("getjob_recruiter_ref");
  if (savedRef) {
    autoLogin(savedRef);
  }

  // Écoute de la connexion
  document.getElementById("login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const code = document
      .getElementById("ref-code-input")
      .value.trim()
      .toUpperCase();
    if (code) {
      localStorage.setItem("getjob_recruiter_ref", code);
      autoLogin(code);
    }
  });

  // Déconnexion
  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("getjob_recruiter_ref");
    window.location.reload();
  });

  // Copier le lien d'affiliation Facebook
  document
    .getElementById("copy-link-btn")
    .addEventListener("click", copyPersonalLink);

  // Filtres
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      document
        .querySelectorAll(".filter-btn")
        .forEach((b) => b.classList.remove("active"));
      e.target.classList.add("active");
      activeFilter = e.target.dataset.filter;
      renderCandidates();
    });
  });
});

function autoLogin(refCode) {
  currentAgentRef = refCode;

  // Afficher le Dashboard et masquer le Login
  document.getElementById("login-section").classList.add("hidden");
  document.getElementById("dashboard-section").classList.remove("hidden");

  // Remplir les infos de l'agent
  document.getElementById("agent-code").textContent = `Code : ${refCode}`;

  // Générer le lien personnel du recruteur
  const baseUrl =
    window.location.origin +
    window.location.pathname.replace("dashboard.html", "index.html");
  const shareUrl = `${baseUrl}?ref=${refCode}`;
  document.getElementById("personal-link").textContent = shareUrl;

  // Charger les candidats depuis l'API
  fetchCandidates();
}

async function fetchCandidates() {
  const container = document.getElementById("candidates-container");
  container.innerHTML =
    '<div class="empty-state"><p>🔄 Chargement des candidats...</p></div>';

  try {
    const response = await fetch(`${API_URL}?ref=${currentAgentRef}`);
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || "Impossible de récupérer les données.");
    }

    allCandidates = result.data || [];
    updateStats();
    renderCandidates();
  } catch (error) {
    console.error("Erreur Dashboard :", error);
    container.innerHTML = `<div class="empty-state"><p class="error">❌ ${error.message}</p></div>`;
  }
}

function updateStats() {
  document.getElementById("total-count").textContent = allCandidates.length;
  const newCount = allCandidates.filter((c) => c.status === "NOUVEAU").length;
  document.getElementById("new-count").textContent = newCount;
}

function renderCandidates() {
  const container = document.getElementById("candidates-container");
  container.innerHTML = "";

  // Filtrage
  let filtered = allCandidates;
  if (activeFilter === "NOUVEAU") {
    filtered = allCandidates.filter((c) => c.status === "NOUVEAU");
  } else if (activeFilter === "ARCHIVE") {
    filtered = allCandidates.filter((c) => c.status === "ARCHIVE");
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state card">
        <p>📭 Aucun candidat trouvé dans cette section.</p>
      </div>`;
    return;
  }

  filtered.forEach((candidate) => {
    const card = document.createElement("div");
    card.className = `candidate-card card ${candidate.status === "ARCHIVE" ? "archived" : ""}`;

    const dateFormatted = new Date(candidate.created_at).toLocaleDateString(
      "fr-FR",
      {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      },
    );

    const waText = encodeURIComponent(
      `Bonjour ${candidate.fullname}, je vous contacte suite à votre pré-inscription sur GetJob pour le domaine ${candidate.sector}.`,
    );

    card.innerHTML = `
      <div class="card-header">
        <h3 class="candidate-name">${candidate.fullname}</h3>
        <span class="badge ${candidate.status === "NOUVEAU" ? "badge-new" : "badge-old"}">${candidate.status}</span>
      </div>

      <div class="candidate-details">
        <p>📍 <strong>Localisation :</strong> ${candidate.city} (${candidate.neighborhood})</p>
        <p>💼 <strong>Domaine :</strong> ${candidate.sector}</p>
        <p>📞 <strong>Téléphone :</strong> ${candidate.phone}</p>
        <p class="date-text">📅 Inscrit le ${dateFormatted}</p>
      </div>

      <div class="card-actions">
        <a href="https://wa.me/${candidate.phone.replace("+", "")}?text=${waText}" target="_blank" class="btn-action btn-wa">
          💬 WhatsApp
        </a>
        <a href="tel:${candidate.phone}" class="btn-action btn-call">
          📞 Appeler
        </a>
      </div>
    `;

    container.appendChild(card);
  });
}

function copyPersonalLink() {
  const linkText = document.getElementById("personal-link").textContent;
  navigator.clipboard.writeText(linkText).then(() => {
    const btn = document.getElementById("copy-link-btn");
    btn.textContent = "✅ Lien Copié !";
    btn.style.background = "#16a34a";
    setTimeout(() => {
      btn.textContent = "📋 Copier mon lien";
      btn.style.background = "#2563eb";
    }, 2000);
  });
}

