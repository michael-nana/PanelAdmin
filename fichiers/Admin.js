const form = document.getElementById('carrouselForm');
const preview = document.getElementById('preview');
const openBtn = document.getElementById('openModalBtn');
const openModif = document.getElementById('openModif');
const openPartenaire = document.getElementById('openPartenaire');
const partenaireForm = document.getElementById('partenaireForm');
const checkbox = document.getElementById('actifCheckbox');
const statusText = document.getElementById('statusText');

const data = {
  texte: form.texte.value,
  image_uri: form.image_uri.value,
  description: form.description.value,
  actif: form.actif.checked ? 1 : 0
};

openBtn.addEventListener('click', () => {
  form.classList.toggle('hidden'); // ajoute/enlève la classe
  form.classList.toggle('show');
});
openPartenaire.addEventListener('click', () => {
   partenaireForm.classList.toggle('hiddenPartenaire'); 
   partenaireForm.classList.toggle('showPartenaire'); 
  });

checkbox.addEventListener('change', () => { 
  if (checkbox.checked) { 
    statusText.textContent = 'Actif'; 
    statusText.classList.remove('inactif');
   } else { 
    statusText.textContent = 'Inactif'; 
    statusText.classList.add('inactif'); 
  } 
});


form.image_uri.addEventListener('input', () => {
  const url = form.image_uri.value;
  preview.innerHTML = url ? `<img src="${url}" alt="Preview" />` : '';
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    texte: form.texte.value,
    image_uri: form.image_uri.value,
    description: form.description.value,
    actif: form.actif.checked ? 1 : 0
  };

  const res = await fetch('http://192.168.112.215:3000/carousels', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  const result = await res.json();
  alert(' Carrousel ajouté !');
  form.reset();
  preview.innerHTML = '';
});

async function updateDashboardStats() {
  try {
    // Carrousels
    const resCarrousels = await fetch('http://192.168.112.215:3000/carousels');
    const carrousels = await resCarrousels.json();
    document.querySelector('#dashboardCarrouselsCount').textContent = carrousels.length;

    // Partenaires
    const resPartenaires = await fetch('http://192.168.112.215:3000/partenaires');
    const partenaires = await resPartenaires.json();
    document.querySelector('#dashboardPartenairesCount').textContent = partenaires.length;

    // Représentations
    const resReps = await fetch('http://192.168.112.215:3000/representations');
    const reps = await resReps.json();
    document.querySelector('#dashboardRepresentationsCount').textContent = reps.length;
  } catch (err) {
    console.error("Erreur dashboard:", err);
  }
  
}

async function renderCarrousels() {
  const res = await fetch('http://192.168.112.215:3000/carousels');
  const data = await res.json();

  const grid = document.getElementById('carrouselGrid');
  grid.innerHTML = '';

  data.forEach(c => {
    const card = document.createElement('div');
    card.className = 'carrousel-card';
    card.innerHTML = `
      <div class="carrousel-thumb">
        <img src="${c.image_uri}" alt="${c.texte}" style="width:100%; height:120px; object-fit:cover; border-radius:8px;" />
      </div>
      
    `;
    grid.appendChild(card);
  });
}


async function renderPartenaires() {
  const res = await fetch('http://192.168.112.215:3000/partenaires');
  const partenaires = await res.json();

  const tbody = document.getElementById('partenaireTableBody');
  tbody.innerHTML = '';

  partenaires.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><img src="${p.logo_uri}" alt="${p.nom}" style="width:40px;height:40px;border-radius:50%;" /></td>
      <td><span class="partner-name">${p.nom}</span></td>
      <td><a class="partner-site" href="${p.lien}" target="_blank">${p.lien}</a></td>
      <td><span class="badge ${p.actif ? 'badge-actif' : 'badge-inactif'}">${p.actif ? 'Actif' : 'Inactif'}</span></td>
    `;
    tbody.appendChild(tr);
  });
}




async function fetchCarrousels() {
  const res = await fetch('http://192.168.112.215:3000/carousels');
  const data = await res.json();

  const list = document.getElementById('carrouselList');
  list.innerHTML = '';

  data.forEach(c => {
    const card = document.createElement('div');
    card.className = 'carrousel-full-card';
    card.innerHTML = `
      <!-- Image en haut -->
      <div class="carrousel-full-thumb">
        <img src="${c.image_uri}" alt="${c.texte}" />
      </div>

      <!-- Titre + description -->
      <div class="carrousel-full-body">
        <div class="carrousel-full-name">${c.texte}</div>
      </div>

      <!-- Footer avec toggle + actions -->
      <div class="carrousel-full-footer">
        <div style="display:flex;align-items:center;gap:8px;">
          <label class="toggle">
            <input type="checkbox" ${c.actif ? 'checked' : ''} onchange="updateToggleLabel(this)"/>
            <span class="toggle-track"></span><span class="toggle-thumb"></span>
          </label>
          <span class="toggle-text">${c.actif ? 'Actif' : 'Inactif'}</span>
        </div>
        <div class="carrousel-actions">
          <button class="btn-action btn-edit" 
  onclick="editCarrousel(${c.id})">
  Modifier
</button>
          <button class="btn-action btn-delete" onclick="deleteCarrousel(${c.id})">Supprimer</button>
        </div>
      </div>
    `;
    list.appendChild(card);
  });
  updateDashboardStats();
  renderCarrousels();

}



async function deleteCarrousel(id) {
  if (!confirm('Confirmer la suppression ?')) return;

  await fetch(`http://192.168.112.215:3000/carousels/${id}`, {
    method: 'DELETE'
  });

  alert(' Carrousel supprimé');
  fetchCarrousels(); // recharge la liste
}

// Appel initial
fetchCarrousels();



async function editCarrousel(id) {
  const res = await fetch(`http://192.168.112.215:3000/carousels/${id}`);
  const c = await res.json();

  const form = document.getElementById('editForm');
  form.style.display = 'block';
  form.classList.remove('hiddenModif');
  form.scrollIntoView({ behavior: 'smooth' });

  form.querySelector('[name="id"]').value = c.id;
  form.querySelector('[name="texte"]').value = c.texte;
  form.querySelector('[name="image_uri"]').value = c.image_uri;
  form.querySelector('[name="description"]').value = c.description || '';
  form.querySelector('[name="actif"]').checked = c.actif === 1;
}

document.getElementById('editForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;

  const data = {
    id: form.id.value,
    image_uri: form.image_uri.value,
    texte: form.texte.value,
    description: form.description.value,
    actif: form.actif.checked ? 1 : 0
  };

  await fetch(`http://192.168.112.215:3000/carousels/${form.id.value}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  alert(' Carrousel mis à jour');
  form.reset();
  form.style.display = 'none';
  fetchCarrousels();
});


async function fetchPartenaires() {
  const res = await fetch('http://192.168.112.215:3000/partenaires');
  const partenaires = await res.json();

  const list = document.getElementById('partenaireList');
  list.innerHTML = '';

  partenaires.forEach(p => {
    const item = document.createElement('div');
    item.className = '';
        item.innerHTML = `
        <div class="partenaire-item">
        <img src="${p.logo_uri}" alt="${p.nom}" />
        <div class="partenaire-info">
          <p><strong>${p.nom}</strong></p>
          <a href="${p.lien}" target="_blank">${p.lien}</a>
          <button onclick="editPartenaire(${p.id}, '${p.nom.replace(/'/g, "\\'")}', '${p.logo_uri}', '${p.lien}', ${p.actif})">📝 Modifier</button>
          <button onclick="deletePartenaire(${p.id})"> Supprimer</button>
        </div>
      </div>
    `;

    list.appendChild(item);
  });
  updateDashboardStats();
  renderPartenaires();

}

document.getElementById('partenaireForm').addEventListener('submit', async (e) => {
  e.preventDefault();
    console.log(' Formulaire partenaire soumis'); // ← log de test
  const form = e.target;

  const data = {
    nom: form.nom.value,
    logo_uri: form.logo_uri.value,
    lien: form.lien.value,
    actif: form.actif.checked ? 1 : 0
  };

  await fetch('http://192.168.112.215:3000/partenaires', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  alert(' Partenaire ajouté');
  form.reset();
  fetchPartenaires();
});

function editPartenaire(id, nom, logo_uri, lien, actif) {
  const form = document.getElementById('editPartenaireForm');
  form.style.display = 'block';
  form.id.value = id;
  form.nom.value = nom;
  form.logo_uri.value = logo_uri;
  form.lien.value = lien;
  form.actif.checked = actif === 1;
}

document.getElementById('editPartenaireForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;

  const data = {
    nom: form.nom.value,
    logo_uri: form.logo_uri.value,
    lien: form.lien.value,
    actif: form.actif.checked ? 1 : 0
  };

  await fetch(`http://192.168.112.215:3000/partenaires/${form.id.value}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  alert('Partenaire mis à jour');
  form.reset();
  form.style.display = 'none';
  fetchPartenaires();
});

async function deletePartenaire(id) {
  if (!confirm('Confirmer la suppression ?')) return;

  await fetch(`http://192.168.112.215:3000/partenaires/${id}`, {
    method: 'DELETE'
  });

  alert(' Partenaire supprimé');
  fetchPartenaires();
}

// Appel initial
fetchPartenaires();

const representationForm = document.getElementById('representationForm');
const list = document.getElementById('representationList');

representationForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
    name: representationForm.name.value,
    phone: representationForm.phone.value,
    locationUrl: representationForm.locationUrl.value,
    type: representationForm.type.value,
    actif: representationForm.actif.checked ? 1 : 0
  };

  await fetch('http://192.168.112.215:3000/representations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  alert(' Représentation ajoutée');
  representationForm.reset();
  fetchRepresentations();
});



async function fetchRepresentations() {
  const res = await fetch('http://192.168.112.215:3000/representations');
  const data = await res.json();
  list.innerHTML = '';

  data.forEach(r => {
    const item = document.createElement('div');
   const typeClass = r.type === 'international' 
  ? 'rep-type international' 
  : r.type === 'national' 
    ? 'rep-type national' 
    : 'rep-type frontalier';

item.className = 'rep-card';
item.innerHTML = `
  <div class="rep-header">
    <strong class="rep-name">${r.name}</strong>
    <span class="${typeClass}">${r.type}</span>
  </div>
  <div class="rep-body">
    <p class="rep-phone"> ${r.phone}</p>
    <p class="rep-location"> ${r.locationUrl || '-'}</p>
  </div>
  <div class="rep-footer">
    <span class="badge ${r.actif ? 'badge-actif' : 'badge-inactif'}">
      ${r.actif ? 'Actif' : 'Inactif'}
    </span>
    <div class="rep-actions">
      <button class="btn-action btn-edit"
        onclick="editRepresentation(${r.id}, '${r.name.replace(/'/g,"\\'")}', '${r.phone}', '${r.locationUrl}', '${r.type}', ${r.actif})"> Modifier</button>
      <button class="btn-action btn-delete"
        onclick="deleteRepresentation(${r.id})"> Supprimer</button>
    </div>
  </div>
`;



    list.appendChild(item);
  });
  updateDashboardStats();
}

function editRepresentation(id, name, phone, locationUrl, type, actif) {
  const form = document.getElementById('editRepresentationForm');
  form.style.display = 'block';
  form.id.value = id;
  form.name.value = name;
  form.phone.value = phone;
  form.locationUrl.value = locationUrl;
  form.type.value = type;
  form.actif.checked = actif === 1;
}

document.getElementById('editRepresentationForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;

  const data = {
    name: form.name.value,
    phone: form.phone.value,
    locationUrl: form.locationUrl.value,
    type: form.type.value,
    actif: form.actif.checked ? 1 : 0
  };

  await fetch(`http://192.168.112.215:3000/representations/${form.id.value}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  alert(' Représentation mise à jour');
  form.reset();
  form.style.display = 'none';
  fetchRepresentations();
});


async function deleteRepresentation(id) {
  if (!confirm('Confirmer la suppression ?')) return;
  await fetch(`http://192.168.112.215:3000/representations/${id}`, {
    method: 'DELETE'
  });
  alert(' Supprimé');
  fetchRepresentations();
}

// Appel initial
fetchRepresentations();





// ─── NAVIGATION SPA ───────────────────────────────────────────
 function navigateTo(viewName, navEl) {
  // Cas particulier : page externe
  if (viewName === 'Inscription') {
    window.location.href = 'Inscription.html';
    return;
  }
  if (viewName === 'Connexion') {
    window.location.href = 'Connexion.html';
    return;
  }

  // Cas normal : navigation interne
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById('view-' + viewName);
  if (target) {
    target.classList.add('active');
  }

  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  if (navEl) {
    navEl.classList.add('active');
  }
}



  // ─── TOGGLE LABEL ─────────────────────────────────────────────
  function updateToggleLabel(input) {
    const footer = input.closest('.carrousel-footer') || input.closest('.carrousel-full-footer');
    const text = footer ? footer.querySelector('.toggle-text') : null;
    if (text) {
      if (input.checked) {
        text.textContent = 'Actif';
        text.style.color = 'var(--green-dark)';
      } else {
        text.textContent = 'Inactif';
        text.style.color = 'var(--muted)';
      }
    }
  }


 document.addEventListener('DOMContentLoaded', () => {
  const nom = localStorage.getItem('nom');
  if (nom) {
    document.getElementById('adminName').textContent = nom;
  }
});

document.addEventListener('DOMContentLoaded', () => {
  // Afficher le nom
  const nom = localStorage.getItem('nom');
  if (nom) {
    document.getElementById('adminName').textContent = nom;
  }

  // Afficher le rôle
  const role = localStorage.getItem('role');
  if (role) {
    let roleText;
    switch (role) {
      case '1':
        roleText = ' Administrateur';
        break;
      case '2':
        roleText = ' Superviseur';
        break;
      default:
        roleText = 'Inconnu';
    }
    document.getElementById('adminRole').textContent = roleText;
  }
});


document.addEventListener('DOMContentLoaded', () => {
  const role = localStorage.getItem('role'); // récupère le rôle

  // Si le rôle est "2" (Superviseur), on cache la section comptes
  if (role === '2') {
    const comptesSection = document.getElementById('view-comptes');
    if (comptesSection) {
      comptesSection.style.display = 'none';
    }

    // On peut aussi désactiver le bouton dans la sidebar
    const comptesBtn = document.querySelector('button[onclick*="comptes"]');
    if (comptesBtn) {
      comptesBtn.disabled = true;
      comptesBtn.style.opacity = 0.5;
      comptesBtn.style.cursor = 'not-allowed';
    }
  }
});

// Charger les comptes
async function fetchComptes() {
  const res = await fetch('http://localhost:3000/users'); // adapte l’URL
  const comptes = await res.json();
  renderComptes(comptes);
  updateStats(comptes);
}

// Afficher cartes
function renderComptes(comptes) {
  const grid = document.getElementById('comptes-grid');
  grid.innerHTML = '';
  comptes.forEach(c => {
    const card = document.createElement('div');
    card.className = 'compte-card';
    card.innerHTML = `
      <div class="compte-avatar">${c.nom.charAt(0)}</div>
      <div class="compte-name">${c.nom}</div>
      <div class="compte-email">${c.email}</div>
      <div class="compte-role">${mapRole(c.role_id)}</div>
    `;
    card.onclick = () => openCompteModal(c);
    grid.appendChild(card);
  });
}

// Mapper rôle
function mapRole(role_id) {
  switch(role_id) {
    case 1: return ' Administrateur';
    case 2: return ' Superviseur';
   
    default: return 'Inconnu';
  }
}

// Stats
function updateStats(comptes) {
  document.getElementById('count-total').textContent = comptes.length;
  document.getElementById('count-admin').textContent = comptes.filter(c => c.role_id === 1).length;
  document.getElementById('count-super').textContent = comptes.filter(c => c.role_id === 2).length;
}

// Recherche
function filterComptes() {
  const term = document.getElementById('comptes-search').value.toLowerCase();
  document.querySelectorAll('.compte-card').forEach(card => {
    const name = card.querySelector('.compte-name').textContent.toLowerCase();
    const email = card.querySelector('.compte-email').textContent.toLowerCase();
    card.style.display = (name.includes(term) || email.includes(term)) ? '' : 'none';
  });
}

// Filtres
function filterComptesByRole(role, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.compte-card').forEach(card => {
    const roleText = card.querySelector('.compte-role').textContent;
    card.style.display = (role === 'tous' || roleText.includes(role)) ? '' : 'none';
  });
}

// Modal
function openCompteModal(compte) {
  document.getElementById('compte-modal-overlay').classList.add('show');
  document.getElementById('compte-modal-id').value = compte.id;
  document.getElementById('compte-modal-nom').value = compte.nom;
  document.getElementById('compte-modal-email').value = compte.email;
  document.getElementById('compte-modal-role').value = mapRole(compte.role_id).split(' ')[1];
  document.getElementById('compte-modal-actif').checked = true;
}
function closeCompteModal() {
  document.getElementById('compte-modal-overlay').classList.remove('show');
}
function closeCompteModalOnOverlay(e) {
  if (e.target.id === 'compte-modal-overlay') closeCompteModal();
}

// Soumission édition
async function submitCompteEdit() {
  const id = document.getElementById('compte-modal-id').value;
  const data = {
    nom: document.getElementById('compte-modal-nom').value,
    email: document.getElementById('compte-modal-email').value,
    role: document.getElementById('compte-modal-role').value,
    actif: document.getElementById('compte-modal-actif').checked ? 1 : 0
  };
  await fetch(`http://localhost:3000/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  alert('Compte mis à jour');
  closeCompteModal();
  fetchComptes();
}

// Init
document.addEventListener('DOMContentLoaded', fetchComptes);

const BASE_PLAINTES = 'http://192.168.112.215:3000'; // ton backend principal
let currentPlainteId = null;

async function fetchPlaintes() {
  try {
    const res = await fetch(`${BASE_PLAINTES}/plaintes/liste`);

    const plaintes = await res.json();
    renderPlaintes(plaintes);
    updatePlaintesStats(plaintes);
  } catch (err) {
    console.error('Erreur plaintes:', err);
  }
}

function updatePlaintesStats(plaintes) {
  document.getElementById('count-plaintes-total').textContent = plaintes.length;
  document.getElementById('count-plaintes-attente').textContent = 
    plaintes.filter(p => p.statut === 'nouveau' || !p.statut).length;
  document.getElementById('count-plaintes-resolues').textContent = 
    plaintes.filter(p => p.statut === 'resolu').length;
}

function renderPlaintes(plaintes) {
  const list = document.getElementById('plaintes-list');
  list.innerHTML = '';

  if (plaintes.length === 0) {
    list.innerHTML = '<p style="color:#aaa;text-align:center;padding:40px;">Aucune plainte trouvée.</p>';
    return;
  }

  plaintes.forEach(p => {
    const statut = p.statut || 'nouveau';
    const statutClass = statut === 'resolu' ? 'badge-actif' : 
                        statut === 'en_cours' ? 'badge-orange' : 'badge-inactif';
    const statutLabel = statut === 'resolu' ? 'Résolu' : 
                        statut === 'en_cours' ? 'En cours' : 'Nouveau';

    const card = document.createElement('div');
    card.className = 'plainte-card';
    card.dataset.statut = statut;
    card.dataset.message = (p.message || '').toLowerCase();
    card.dataset.site = (p.sitePlainte || '').toLowerCase();
    card.innerHTML = `
  <div class="plainte-header">
    <div>
      <strong class="plainte-site">${p.sitePlainte || '—'}</strong>
      <span class="plainte-service"> › ${p.servicePlainte || '—'}</span>
    </div>
    <span class="badge ${statutClass}">${statutLabel}</span>
  </div>

  ${p.image_base64 ? `
    <div class="plainte-thumb">
      <img src="${p.image_base64}" alt="Pièce jointe" />
    </div>` : ''}

  <p class="plainte-message">${(p.message || '').substring(0, 120)}${p.message?.length > 120 ? '...' : ''}</p>
  <div class="plainte-footer">
    <span class="plainte-date">${p.date ? new Date(p.date).toLocaleDateString('fr-FR') : '—'}</span>
    <div style="display:flex;gap:8px;">
      <button class="btn-action btn-edit" onclick="openPlainteModal(${p.id})">Voir</button>
      <button class="btn-action btn-delete" onclick="deletePlainte(${p.id})">Supprimer</button>
    </div>
  </div>
`;
    list.appendChild(card);
  });
}

async function openPlainteModal(id) {
  currentPlainteId = id;
  const res = await fetch(`${BASE_PLAINTES}/plaintes/liste`);

  const plaintes = await res.json();
  const p = plaintes.find(pl => pl.id === id);
  if (!p) return;

  document.getElementById('plainte-modal-statut').value = p.statut || 'nouveau';
  document.getElementById('plainte-modal-body').innerHTML = `
    <div style="display:flex;flex-direction:column;gap:12px;padding:8px 0;">
      <div><strong>Site :</strong> ${p.sitePlainte || '—'}</div>
      <div><strong>Service :</strong> ${p.servicePlainte || '—'}</div>
      <div><strong>Message :</strong><p style="margin-top:6px;color:#555;line-height:1.6;">${p.message || '—'}</p></div>
          ${p.image_base64 ? `
            <div>
              <strong>Pièce jointe :</strong><br/>
              <img src="${p.image_base64}" 
                  style="max-width:100%;border-radius:8px;margin-top:6px;" />
            </div>` 
          : p.image_uri ? `
            <div>
              <strong>Pièce jointe :</strong>
              <span style="color:#aaa;font-size:13px;"> (fichier local non accessible)</span>
            </div>` : ''} 
              <div><strong>Date :</strong> ${p.date ? new Date(p.date).toLocaleString('fr-FR') : '—'}</div>
    </div>
  `;
  document.getElementById('plainte-modal-overlay').classList.add('show');
}

function closePlainteModal() {
  document.getElementById('plainte-modal-overlay').classList.remove('show');
  currentPlainteId = null;
}

function closePlainteModalOnOverlay(e) {
  if (e.target.id === 'plainte-modal-overlay') closePlainteModal();
}

async function updatePlainteStatut() {
  if (!currentPlainteId) return;
  const statut = document.getElementById('plainte-modal-statut').value;
  
  try {
    const res = await fetch(`${BASE_PLAINTES}/plaintes/${currentPlainteId}/statut`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statut })
    });

    const data = await res.json();
    
    if (data.success) {
      alert('Statut mis à jour !');
      closePlainteModal();
      await fetchPlaintes(); // ✅ recharge toute la liste
    } else {
      alert('Erreur : ' + (data.error || 'Statut non mis à jour'));
    }
  } catch (err) {
    console.error('Erreur updatePlainteStatut:', err);
    alert('Erreur réseau');
  }
}

async function deletePlainte(id) {
  if (!confirm('Supprimer cette plainte ?')) return;
  await fetch(`${BASE_PLAINTES}/plaintes/${id}`, { method: 'DELETE' });
  alert('Plainte supprimée');
  fetchPlaintes();
}

function filterPlaintes() {
  const term = document.getElementById('plaintes-search').value.toLowerCase();
  document.querySelectorAll('.plainte-card').forEach(card => {
    const msg = card.dataset.message || '';
    const site = card.dataset.site || '';
    card.style.display = (msg.includes(term) || site.includes(term)) ? '' : 'none';
  });
}

function filterPlaintesByStatut(statut, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.plainte-card').forEach(card => {
    card.style.display = (statut === 'tous' || card.dataset.statut === statut) ? '' : 'none';
  });
}

// Init
document.addEventListener('DOMContentLoaded', fetchPlaintes);