// URL de ton API Backend hébergée sur Railway
const API_URL = 'https://rcapp-backend-production.up.railway.app';

document.addEventListener('DOMContentLoaded', () => {
    const candidateForm = document.getElementById('candidateForm');
    const responseSection = document.getElementById('responseSection');
    const officeDetails = document.getElementById('officeDetails');
    const refCodeInput = document.getElementById('refCode');

    // 1. Extraire le code recruteur/parrain depuis l'URL (ex: https://rcapp-luco.netlify.app/?ref=TEST237)
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');

    if (refCode && refCodeInput) {
        refCodeInput.value = refCode.trim().toUpperCase();
    }

    // 2. Gestion de la soumission du formulaire
    if (candidateForm) {
        candidateForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = candidateForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn ? submitBtn.innerText : 'Envoyer';
            
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerText = 'Enregistrement en cours...';
            }

            // Extraction des valeurs des champs
            const formData = {
                fullname: document.getElementById('fullname').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                city: document.getElementById('city').value,
                neighborhood: document.getElementById('neighborhood').value.trim(),
                sector: document.getElementById('sector').value,
                recruiter_ref: document.getElementById('refCode') ? document.getElementById('refCode').value.trim().toUpperCase() : ''
            };

            try {
                // Envoi de la requête POST au backend Railway
                const response = await fetch(`${API_URL}/api/candidates`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || data.error || 'Une erreur est survenue lors de l\'enregistrement.');
                }

                // Masquer le formulaire et afficher la section de confirmation
                candidateForm.reset();
                candidateForm.style.display = 'none';

                if (responseSection) {
                    responseSection.style.display = 'block';
                }

                // Affichage du bureau attribué ou message générique
                if (data.office && officeDetails) {
                    officeDetails.innerHTML = `
                        <div class="office-card">
                            <h3>📍 Votre bureau de rattachement : ${data.office.office_name || data.office.city}</h3>
                            <p><strong>Adresse :</strong> ${data.office.address}</p>
                            <p><strong>Contact Responsable :</strong> <a href="tel:${data.office.manager_phone}">${data.office.manager_phone}</a></p>
                        </div>
                    `;
                } else if (officeDetails) {
                    officeDetails.innerHTML = `
                        <p class="info-text">
                            Votre candidature a bien été enregistrée. Un agent de votre région prendra contact avec vous dans les plus brefs délais.
                        </p>
                    `;
                }

            } catch (error) {
                console.error('Erreur lors de la soumission :', error);
                alert(`Désolé : ${error.message}`);
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerText = originalBtnText;
                }
            }
        });
    }
});