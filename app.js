// toast
function toast(msg, bg='#2d3a5e') { 
  let t=document.createElement('div'); 
  t.innerText=msg; 
  t.style.position='fixed'; 
  t.style.bottom='20px'; 
  t.style.left='50%'; 
  t.style.transform='translateX(-50%)'; 
  t.style.backgroundColor=bg; 
  t.style.color='white'; 
  t.style.padding='6px 18px'; 
  t.style.borderRadius='40px'; 
  t.style.fontSize='0.75rem'; 
  t.style.zIndex='9999'; 
  t.style.fontWeight='500'; 
  t.style.pointerEvents='none';
  document.body.appendChild(t); 
  setTimeout(()=>t.remove(),2000); 
}

// geo
let map, marker, lat=25.5535, lon=-100.932;

function initMap() { 
  try {
    map = L.map('leaflet-map').setView([lat, lon], 13); 
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map); 
    marker = L.marker([lat, lon]).addTo(map).bindPopup('📍 Saltillo'); 
    document.getElementById('disp-lat').innerText = lat; 
    document.getElementById('disp-lon').innerText = lon;
    console.log('✅ Mapa inicializado');
  } catch(e) {
    console.error('Error en el mapa:', e);
    toast('Error al cargar el mapa', '#dc2626');
  }
}

function getMyLocation() { 
  if(!navigator.geolocation) {
    toast('GPS no disponible en este navegador', '#dc2626');
    return;
  }
  
  toast('Obteniendo ubicación...', '#60a5fa');
  navigator.geolocation.getCurrentPosition(
    pos => { 
      lat = pos.coords.latitude; 
      lon = pos.coords.longitude; 
      if(map) {
        map.setView([lat, lon], 14); 
        marker.setLatLng([lat, lon]); 
      }
      document.getElementById('disp-lat').innerText = lat.toFixed(4); 
      document.getElementById('disp-lon').innerText = lon.toFixed(4); 
      document.getElementById('disp-acc').innerText = Math.round(pos.coords.accuracy) + 'm'; 
      toast('Ubicación actualizada'); 
    }, 
    err => {
      console.error('Error GPS:', err);
      toast('No se pudo obtener la ubicación. Permite el acceso al GPS.', '#dc2626');
    },
    { enableHighAccuracy: true, timeout: 10000 }
  ); 
}

async function geoFilter(q) { 
  if(!q) return; 
  try { 
    let r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q + ' Saltillo Mexico')}&format=json&limit=5`); 
    let d = await r.json(); 
    if(!d.length) {
      toast('Sin resultados para: ' + q, '#f59e0b');
      return;
    }
    
    if(map) {
      map.eachLayer(l => { 
        if(l instanceof L.Marker && l !== marker) map.removeLayer(l); 
      }); 
      d.forEach(p => L.marker([p.lat, p.lon]).addTo(map).bindPopup(p.display_name.split(',')[0])); 
      map.setView([d[0].lat, d[0].lon], 14); 
    }
    toast(`${d.length} lugar(es) encontrado(s)`, '#60a5fa'); 
  } catch(e) {
    console.error('Error en búsqueda:', e);
    toast('Error de conexión al buscar lugares', '#dc2626');
  } 
}

function geoSearch() { 
  let q = document.getElementById('geo-input').value.trim(); 
  if(q) geoFilter(q); 
  else toast('Ingresa un lugar para buscar', '#f59e0b');
}

// itunes
let itunesType = 'song', itunesItems = [];

function itunesSetType(type) { 
  itunesType = type; 
  document.querySelectorAll('.itunes-tab').forEach(btn => { 
    btn.classList.remove('active'); 
  }); 
  document.getElementById(`tab-${type}`).classList.add('active'); 
  itunesSearch(); 
}

async function itunesSearch() { 
  let query = document.getElementById('itunes-search').value.trim(); 
  if(!query) query = 'BTS'; 
  
  const listContainer = document.getElementById('itunes-list');
  listContainer.innerHTML = '<div class="flex justify-center py-4"><div class="animate-spin w-5 h-5 border-2 border-rose-300 border-t-rose-600 rounded-full"></div></div>';
  
  try { 
    let entity = itunesType === 'song' ? 'song' : 'album'; 
    let url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=${entity}&limit=12&country=MX`; 
    let r = await fetch(url); 
    
    if(!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
    
    let d = await r.json(); 
    itunesItems = d.results || []; 
    
    if(itunesItems.length === 0) {
      listContainer.innerHTML = '<div class="text-center text-rose-600 text-xs p-3">No se encontraron resultados</div>';
      return;
    }
    
    listContainer.innerHTML = itunesItems.map((item, i) => { 
      let name = item.trackName || item.collectionName; 
      let artist = item.artistName || ''; 
      let art = (item.artworkUrl100 || '').replace('100x100bb', '60x60bb'); 
      let hasPreview = !!item.previewUrl; 
      return `<div class="list-item" onclick="itunesDetail(${i})"><img src="${art}" class="w-10 h-10 rounded-lg object-cover"><div class="flex-1"><div class="font-medium text-sm">${name}</div><div class="text-[11px] text-slate-500">${artist}</div></div>${hasPreview ? '<span class="text-[10px] text-rose-500">▶</span>' : ''}</div>`; 
    }).join(''); 
    toast(`${itunesItems.length} resultados encontrados`); 
  } catch(e) { 
    console.error('Error en iTunes:', e);
    listContainer.innerHTML = '<div class="text-center text-rose-600 text-xs p-3">Error al cargar datos de iTunes</div>'; 
    toast('Error al conectar con iTunes API', '#dc2626');
  } 
}

function itunesDetail(i) { 
  let item = itunesItems[i]; 
  if(!item) return; 
  let name = item.trackName || item.collectionName; 
  let artist = item.artistName || ''; 
  let art = (item.artworkUrl100 || '').replace('100x100bb', '400x400bb'); 
  let preview = item.previewUrl || ''; 
  let link = item.trackViewUrl || item.collectionViewUrl || '#'; 
  
  document.getElementById('it-d-img').src = art; 
  document.getElementById('it-d-name').innerText = name; 
  document.getElementById('it-d-artist').innerText = artist; 
  document.getElementById('it-d-link').href = link; 
  
  let previewDiv = document.getElementById('it-preview'); 
  if(preview) { 
    let audio = document.getElementById('it-audio'); 
    if(!audio) { 
      let na = document.createElement('audio'); 
      na.id = 'it-audio'; 
      na.controls = true; 
      na.style.width = '100%'; 
      document.getElementById('it-preview').appendChild(na); 
      audio = na;
    } 
    audio.src = preview; 
    previewDiv.classList.remove('hidden'); 
    audio.play().catch(e => console.log('Error al reproducir:', e)); 
  } else { 
    previewDiv.classList.add('hidden'); 
  } 
  
  document.getElementById('itunes-list').style.display = 'none'; 
  document.getElementById('itunes-detail').classList.remove('hidden'); 
}

function itunesBackToList() { 
  document.getElementById('itunes-list').style.display = 'flex'; 
  document.getElementById('itunes-detail').classList.add('hidden'); 
  let a = document.getElementById('it-audio'); 
  if(a) { 
    a.pause(); 
    a.src = ''; 
  } 
}

// productos
let allProducts = [], filteredProds = [];
const catMap = {
  "electronics": "Electrónica",
  "jewelery": "Joyería", 
  "men's clothing": "Ropa Hombre",
  "women's clothing": "Ropa Mujer"
};

async function loadProducts() { 
  const listContainer = document.getElementById('product-list');
  listContainer.innerHTML = '<div class="flex justify-center py-4"><div class="animate-spin w-5 h-5 border-2 border-teal-400 border-t-teal-700 rounded-full"></div></div>';
  
  try { 
    let res = await fetch('https://fakestoreapi.com/products'); 
    if(!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    
    allProducts = await res.json(); 
    let cats = [...new Set(allProducts.map(p => p.category))]; 
    let sel = document.getElementById('category-select'); 
    sel.innerHTML = '<option value="">Todas las categorías</option>' + cats.map(c => `<option value="${c}">${catMap[c] || c}</option>`).join(''); 
    document.getElementById('cat-count').innerText = cats.length; 
    filterProducts();
  } catch(e) { 
    console.error('Error en productos:', e);
    listContainer.innerHTML = '<div class="text-center text-red-400 text-xs p-3">Error al cargar productos</div>'; 
    toast('Error al conectar con FakeStore API', '#dc2626');
  } 
}

function filterProducts() { 
  let term = document.getElementById('product-search').value.toLowerCase(); 
  let cat = document.getElementById('category-select').value; 
  filteredProds = allProducts.filter(p => 
    (!cat || p.category === cat) && 
    (!term || p.title.toLowerCase().includes(term))
  ); 
  document.getElementById('product-count').innerText = filteredProds.length; 
  
  if(filteredProds.length === 0) {
    document.getElementById('product-list').innerHTML = '<div class="text-center text-slate-600 text-xs p-3">No hay productos que coincidan</div>';
    return;
  }
  
  document.getElementById('product-list').innerHTML = filteredProds.map((p, i) => `
    <div class="list-item" onclick="productDetail(${i})">
      <img src="${p.image}" class="w-12 h-12 object-contain">
      <div>
        <div class="font-medium text-xs product-title">${p.title.substring(0, 50)}${p.title.length > 50 ? '...' : ''}</div>
        <div class="font-bold text-emerald-800 text-xs">$${p.price}</div>
        <div class="text-[10px] text-slate-600">${catMap[p.category] || p.category}</div>
      </div>
    </div>
  `).join(''); 
}

function productDetail(i) { 
  let p = filteredProds[i]; 
  document.getElementById('prod-img').src = p.image; 
  document.getElementById('prod-title').innerText = p.title; 
  document.getElementById('prod-price').innerText = `$${p.price} USD`; 
  document.getElementById('prod-cat').innerText = catMap[p.category] || p.category; 
  document.getElementById('product-list').style.display = 'none'; 
  document.getElementById('product-detail').classList.remove('hidden'); 
}

function productBackToList() { 
  document.getElementById('product-list').style.display = 'flex'; 
  document.getElementById('product-detail').classList.add('hidden'); 
}

// perfil git
async function buscarGithub() { 
  let user = document.getElementById('github-username').value.trim() || 'esmessar'; 
  let box = document.getElementById('github-result'); 
  box.innerHTML = '<div class="flex justify-center w-full"><div class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div></div>'; 
  box.classList.remove('hidden'); 
  
  try { 
    let res = await fetch(`https://api.github.com/users/${user}`); 
    if(!res.ok) {
      if(res.status === 404) throw new Error('Usuario no encontrado');
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    let data = await res.json(); 
    if(data.message === 'Not Found') { 
      box.innerHTML = '<div class="text-red-300 text-center text-xs">Usuario no encontrado</div>'; 
      document.getElementById('gh-name').innerText = '---'; 
      document.getElementById('gh-repos').innerText = '0'; 
      return; 
    } 
    
    box.innerHTML = `<img src="${data.avatar_url}" class="avatar-sm"><div><div class="font-semibold text-sm text-white">${data.name || data.login}</div><p class="text-xs text-gray-200">${data.bio?.substring(0, 60) || 'Sin biografía'}</p></div>`; 
    document.getElementById('gh-name').innerText = data.name || data.login; 
    document.getElementById('gh-repos').innerText = data.public_repos || 0; 
  } catch(e) { 
    console.error('Error en GitHub:', e);
    box.innerHTML = `<div class="text-red-300 text-center text-xs">${e.message === 'Usuario no encontrado' ? 'Usuario no encontrado' : 'Error de red'}</div>`; 
    toast('Error al conectar con GitHub API', '#dc2626');
  } 
}

// db firestore
let fbDocs = [];

async function dbLoadAll() { 
  if(!window.firebaseReady) {
    console.log('Esperando inicialización de Firebase...');
    setTimeout(dbLoadAll, 1000);
    return;
  }
  
  try { 
    const collectionRef = window._fbCollection(window._fbDB, 'usuarios');
    const snap = await window._fbGetDocs(collectionRef); 
    fbDocs = []; 
    snap.forEach(d => fbDocs.push({id: d.id, ...d.data()})); 
    
    document.getElementById('db-count').innerText = fbDocs.length; 
    
    if(fbDocs.length === 0) {
      document.getElementById('db-tbody').innerHTML = '<tr><td colspan="4" class="text-center py-2 text-xs">No hay perfiles guardados</td></tr>';
      return;
    }
    
    document.getElementById('db-tbody').innerHTML = fbDocs.map((d, i) => `
      <tr>
        <td>${i+1}</td>
        <td class="font-medium">${d.nombre || '—'}</td>
        <td class="text-slate-600">${d.bio || '—'}</td>
        <td><button onclick="dbDelete('${d.id}')" class="text-rose-500 text-xs hover:text-rose-700">✕</button></td>
      </tr>
    `).join(''); 
    
    console.log('Datos de Firebase cargados');
  } catch(e) { 
    console.error('Error en Firestore:', e);
    document.getElementById('db-tbody').innerHTML = '<tr><td colspan="4" class="text-center py-2 text-xs text-red-500">Error al cargar datos</td></tr>';
    toast('Error al conectar con Firebase', '#dc2626');
  } 
}

async function dbInsert() { 
  if(!window.firebaseReady) {
    toast('Firebase no está listo', '#dc2626');
    return;
  }
  
  let nombre = document.getElementById('db-nombre').value.trim(); 
  let bio = document.getElementById('db-bio').value.trim(); 
  if(!nombre) {
    toast('Ingresa un nombre de usuario', '#dc2626');
    return;
  } 
  
  try { 
    await window._fbAddDoc(window._fbCollection(window._fbDB, 'usuarios'), {
      nombre, 
      bio, 
      timestamp: new Date().toISOString()
    }); 
    toast('Perfil guardado correctamente ✅', '#fb923c'); 
    document.getElementById('db-nombre').value = ''; 
    document.getElementById('db-bio').value = ''; 
    await dbLoadAll(); 
  } catch(e) {
    console.error('Error al guardar:', e);
    toast('Error al guardar en Firebase', '#dc2626');
  } 
}

async function dbDelete(id) { 
  if(!window.firebaseReady) return;
  
  try { 
    await window._fbDeleteDoc(window._fbDoc(window._fbDB, 'usuarios', id)); 
    toast('Perfil eliminado'); 
    await dbLoadAll(); 
  } catch(e) {
    console.error('Error al eliminar:', e);
    toast('Error al eliminar perfil', '#dc2626');
  } 
}

async function dbDropSelected() { 
  if(!window.firebaseReady) return;
  if(!confirm('⚠️ ¿Estás seguro de que quieres borrar TODOS los perfiles? Esta acción no se puede deshacer.')) return; 
  
  try { 
    await Promise.all(fbDocs.map(d => window._fbDeleteDoc(window._fbDoc(window._fbDB, 'usuarios', d.id)))); 
    toast('Base de datos limpiada correctamente', '#fb923c'); 
    await dbLoadAll(); 
  } catch(e) {
    console.error('Error al limpiar:', e);
    toast('Error al limpiar la base de datos', '#dc2626');
  } 
}

// sms
let smsCount = parseInt(localStorage.getItem('smsCount') || '0');
document.getElementById('sms-count').innerText = smsCount;
const smsInbox = document.getElementById('sms-inbox');

const savedMessages = JSON.parse(localStorage.getItem('smsMessages') || '[]');
savedMessages.forEach(msg => addMessageToInbox(msg.phone, msg.message, msg.time));

function addMessageToInbox(phone, message, time) {
  if(smsInbox.querySelector('.text-slate-400')) smsInbox.innerHTML = '';
  let bubble = document.createElement('div'); 
  bubble.className = 'msg-bubble mb-1'; 
  bubble.innerHTML = `
    <div class="flex justify-between items-start">
      <span class="font-semibold text-sm">${phone}</span>
      <span class="text-[10px] text-slate-500">${time}</span>
    </div>
    <p class="text-sm mt-1">${message}</p>
    <div class="text-right text-xs text-slate-500 mt-1">
      <span class="check-wa">✓✓</span>
    </div>
  `; 
  smsInbox.prepend(bubble);
}

function smsSend() { 
  let phone = document.getElementById('sms-phone').value.trim(); 
  let msg = document.getElementById('sms-msg').value.trim(); 
  
  if(!phone) {
    toast('Ingresa un número de teléfono', '#dc2626');
    return;
  }
  if(!msg) {
    toast('Escribe un mensaje', '#dc2626');
    return;
  }
  if(msg.length > 160) {
    toast('El mensaje no puede exceder los 160 caracteres', '#dc2626');
    return;
  }
  
  smsCount++; 
  document.getElementById('sms-count').innerText = smsCount; 
  
  let now = new Date(); 
  let fechaFormateada = now.toLocaleString('es-MX', {
    hour: '2-digit', 
    minute: '2-digit', 
    day: '2-digit', 
    month: '2-digit'
  }); 
  
  addMessageToInbox(phone, msg, fechaFormateada);
  
  const messages = JSON.parse(localStorage.getItem('smsMessages') || '[]');
  messages.unshift({ phone, message: msg, time: fechaFormateada });
  if(messages.length > 50) messages.pop();
  localStorage.setItem('smsMessages', JSON.stringify(messages));
  localStorage.setItem('smsCount', smsCount);
  
  document.getElementById('sms-msg').value = ''; 
  toast('Mensaje enviado }', '#0891b2'); 
}

// iniciar
if(document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMap);
} else {
  initMap();
}

setTimeout(() => {
  itunesSearch();
}, 500);

setTimeout(() => {
  loadProducts();
}, 300);

setTimeout(() => {
  buscarGithub();
}, 400);

if(window.firebaseReady) {
  dbLoadAll();
} else {
  window.addEventListener('firebaseReady', dbLoadAll);
}

window.addEventListener('firebaseStatus', (event) => {
  if(!event.detail.success) {
    document.getElementById('db-tbody').innerHTML = `<tr><td colspan="4" class="text-center py-2 text-xs text-red-500">Error: ${event.detail.error}</td></tr>`;
    toast('Firebase no pudo inicializarse. Revisa la consola.', '#dc2626');
  }
});

document.getElementById('sms-msg').addEventListener('input', function() { 
  if(this.value.length > 160) {
    this.value = this.value.slice(0, 160);
    toast('Máximo 160 caracteres', '#f59e0b');
  }
});

