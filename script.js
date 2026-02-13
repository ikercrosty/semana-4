/* script.js - Interacciones: tema, toasts, validación, preview, progreso, descarga JSON, confetti ligero */

/* ---------- UTILIDADES UI ---------- */
function createToast(message, type = 'info') {
  const root = document.getElementById('toastRoot') || document.body;
  const toast = document.createElement('div');
  toast.className = 'toast align-items-center text-bg-dark border-0 mb-2';
  toast.setAttribute('role','alert');
  toast.setAttribute('aria-live','assertive');
  toast.setAttribute('aria-atomic','true');
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Cerrar"></button>
    </div>
  `;
  const container = document.getElementById('toastRoot') || document.createElement('div');
  if (!document.getElementById('toastRoot')) {
    container.id = 'toastRoot';
    container.className = 'toast-root';
    document.body.appendChild(container);
  }
  document.getElementById('toastRoot').appendChild(toast);
  const bs = new bootstrap.Toast(toast, { delay: 3500 });
  bs.show();
  toast.addEventListener('hidden.bs.toast', () => toast.remove());
}

/* Confetti ligero */
function confettiBurst() {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.left = 0;
  canvas.style.top = 0;
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = 2000;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  const pieces = [];
  const colors = ['#7c5cff','#00d4ff','#2dd4bf','#ffd166','#ff6b6b'];
  for (let i=0;i<60;i++){
    pieces.push({
      x: Math.random()*canvas.width,
      y: Math.random()*-canvas.height,
      w: 6 + Math.random()*10,
      h: 8 + Math.random()*12,
      vx: -2 + Math.random()*4,
      vy: 2 + Math.random()*6,
      r: Math.random()*360,
      color: colors[Math.floor(Math.random()*colors.length)]
    });
  }
  let t = 0;
  function frame(){
    t++;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for (let p of pieces){
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.06;
      p.r += p.vx * 0.5;
      ctx.save();
      ctx.translate(p.x,p.y);
      ctx.rotate(p.r * Math.PI/180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);
      ctx.restore();
    }
    if (t < 160) requestAnimationFrame(frame);
    else canvas.remove();
  }
  requestAnimationFrame(frame);
}

/* Tema claro/oscuro toggle */
function initThemeToggle(buttonId) {
  const btn = document.getElementById(buttonId);
  if (!btn) return;
  const icon = btn.querySelector('i');
  const current = localStorage.getItem('theme') || 'dark';
  applyTheme(current);
  btn.addEventListener('click', () => {
    const next = (localStorage.getItem('theme') === 'light') ? 'dark' : 'light';
    applyTheme(next);
  });
  function applyTheme(t) {
    localStorage.setItem('theme', t);
    if (t === 'light') {
      document.documentElement.style.setProperty('--bg-1','linear-gradient(135deg,#f8fafc 0%, #e6f0ff 45%, #e6f7ff 100%)');
      document.documentElement.style.setProperty('--muted','rgba(20,30,40,0.6)');
      document.body.classList.add('light-mode');
      if (icon) { icon.className = 'fa-regular fa-sun'; }
    } else {
      document.documentElement.style.setProperty('--bg-1','linear-gradient(135deg,#0f172a 0%, #0b3a66 45%, #0b6b8f 100%)');
      document.documentElement.style.setProperty('--muted','rgba(230,238,248,0.65)');
      document.body.classList.remove('light-mode');
      if (icon) { icon.className = 'fa-regular fa-moon'; }
    }
  }
}

/* ---------- DEMO: Menú page ---------- */
document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle('themeToggle');
  initThemeToggle('themeToggle2');

  const demoBtn = document.getElementById('demoToastBtn');
  if (demoBtn) {
    demoBtn.addEventListener('click', () => {
      createToast('Interacción demo activada', 'info');
      confettiBurst();
    });
  }

  /* ---------- Form interactions (si existe formulario) ---------- */
  const form = document.getElementById('registroForm');
  if (!form) return;

  const fields = {
    nombre: form.querySelector('#nombre'),
    direccion: form.querySelector('#direccion'),
    telefono: form.querySelector('#telefono'),
    correo: form.querySelector('#correo'),
    area: form.querySelector('#area'),
    terminos: form.querySelector('#terminos')
  };

  const progressBar = document.getElementById('formProgress');
  const previewContent = document.getElementById('previewContent');
  const downloadBtn = document.getElementById('downloadBtn');
  const clearBtn = document.getElementById('clearBtn');
  const submitBtn = document.getElementById('submitBtn');

  // Cargar guardado
  const saved = JSON.parse(localStorage.getItem('registroDatos') || '{}');
  if (saved && Object.keys(saved).length) {
    fields.nombre.value = saved.nombre || '';
    fields.direccion.value = saved.direccion || '';
    fields.telefono.value = saved.telefono || '';
    fields.correo.value = saved.correo || '';
    fields.area.value = saved.area || '';
    fields.terminos.checked = saved.terminos || false;
    createToast('Datos cargados desde almacenamiento local', 'info');
  }

  // Actualizar preview y progreso
  function updateUI() {
    const v = {
      nombre: fields.nombre.value.trim(),
      direccion: fields.direccion.value.trim(),
      telefono: fields.telefono.value.trim(),
      correo: fields.correo.value.trim(),
      area: fields.area.value
    };
    previewContent.innerHTML = `
      <div><strong>Nombre:</strong> ${v.nombre || '<span style="opacity:.6">— vacío —</span>'}</div>
      <div><strong>Teléfono:</strong> ${v.telefono || '<span style="opacity:.6">— vacío —</span>'}</div>
      <div><strong>Correo:</strong> ${v.correo || '<span style="opacity:.6">— vacío —</span>'}</div>
      <div><strong>Área:</strong> ${v.area || '<span style="opacity:.6">— no seleccionada —</span>'}</div>
    `;
    let score = 0;
    if (v.nombre) score += 25;
    if (v.telefono) score += 25;
    if (v.correo) score += 25;
    if (v.area) score += 25;
    progressBar.style.width = score + '%';
  }

  // Input masks y validación en tiempo real
  fields.telefono.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^\d]/g,'').slice(0,15);
    updateUI();
  });
  ['nombre','correo','direccion'].forEach(id => {
    fields[id].addEventListener('input', updateUI);
  });
  fields.area.addEventListener('change', updateUI);

  // Guardado automático (debounce)
  let saveTimer = null;
  form.addEventListener('input', () => {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      const data = {
        nombre: fields.nombre.value.trim(),
        direccion: fields.direccion.value.trim(),
        telefono: fields.telefono.value.trim(),
        correo: fields.correo.value.trim(),
        area: fields.area.value,
        terminos: fields.terminos.checked
      };
      localStorage.setItem('registroDatos', JSON.stringify(data));
      createToast('Progreso guardado localmente', 'info');
    }, 900);
  });

  // Descargar JSON
  downloadBtn.addEventListener('click', () => {
    const data = {
      nombre: fields.nombre.value.trim(),
      direccion: fields.direccion.value.trim(),
      telefono: fields.telefono.value.trim(),
      correo: fields.correo.value.trim(),
      area: fields.area.value,
      fecha: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'registro_datos.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    createToast('Archivo JSON descargado', 'success');
  });

  // Limpiar formulario
  clearBtn.addEventListener('click', () => {
    form.reset();
    localStorage.removeItem('registroDatos');
    updateUI();
    createToast('Formulario limpiado', 'info');
  });

  // Envío: validación y modal resumen
  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      createToast('Corrija los campos marcados', 'danger');
      return;
    }

    const datos = {
      nombre: fields.nombre.value.trim(),
      direccion: fields.direccion.value.trim(),
      telefono: fields.telefono.value.trim(),
      correo: fields.correo.value.trim(),
      area: fields.area.value
    };

    // Modal resumen dinámico
    const modalHtml = `
      <div class="modal fade" id="resModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content bg-dark text-light">
            <div class="modal-header border-0">
              <h5 class="modal-title">Registro completado</h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body">
              <p>Se registró la siguiente información:</p>
              <ul>
                <li><strong>Nombre:</strong> ${datos.nombre}</li>
                <li><strong>Teléfono:</strong> ${datos.telefono}</li>
                <li><strong>Correo:</strong> ${datos.correo}</li>
                <li><strong>Área:</strong> ${datos.area}</li>
              </ul>
            </div>
            <div class="modal-footer border-0">
              <button id="modalDownload" type="button" class="btn btn-primary">Descargar JSON</button>
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
            </div>
          </div>
        </div>
      </div>
    `;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = modalHtml;
    document.body.appendChild(wrapper);
    const modalEl = document.getElementById('resModal');
    const bsModal = new bootstrap.Modal(modalEl);
    bsModal.show();

    // Descargar desde modal
    modalEl.querySelector('#modalDownload').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'registro_datos.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      createToast('JSON descargado', 'success');
    });

    // Al cerrar modal: limpiar y confetti
    modalEl.addEventListener('hidden.bs.modal', () => {
      localStorage.removeItem('registroDatos');
      form.reset();
      form.classList.remove('was-validated');
      updateUI();
      createToast('Formulario enviado correctamente', 'success');
      confettiBurst();
      modalEl.remove();
    }, { once: true });
  });

  // Inicializar UI
  updateUI();
});
