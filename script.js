/* script.js - Tema claro/oscuro con texto adaptativo y avatar emoji aleatorio */

/* ---------- AVATAR EMOJI ALEATORIO ---------- */
function generateRandomEmojiAvatar(targetId) {
  const emojis = [
    "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🙂", "😉", "😊",
    "🤓", "🧐", "😎", "🤖", "👾", "🧑‍💻", "👨‍💻", "👩‍💻", "🧑‍🎓", "🧑‍🔧",
    "🧠", "💻", "🖥️", "🕹️", "🎧", "📱", "🔧", "⚙️", "🧩", "📚"
  ];
  const el = document.getElementById(targetId);
  if (!el) return;
  // Elegir emoji aleatorio
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];
  el.textContent = emoji;
  // accesibilidad
  el.setAttribute('aria-label', `Avatar: ${emoji}`);
  // animación sutil de entrada
  el.style.transform = 'scale(.6) rotate(-8deg)';
  el.style.opacity = '0';
  el.style.transition = 'transform .45s cubic-bezier(.2,.9,.3,1), opacity .45s';
  requestAnimationFrame(() => {
    el.style.opacity = '1';
    el.style.transform = 'scale(1) rotate(0deg)';
  });
  // al hacer click, generar otro emoji
  el.addEventListener('click', () => {
    const next = emojis[Math.floor(Math.random() * emojis.length)];
    el.textContent = next;
    el.setAttribute('aria-label', `Avatar: ${next}`);
    // micro-bounce
    el.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.12)' }, { transform: 'scale(1)' }], { duration: 360, easing: 'cubic-bezier(.2,.9,.3,1)' });
  });
}

/* ---------- TEMA CLARO/OSCURO (texto adaptativo) ---------- */
function initThemeToggle(buttonId) {
  const btn = document.getElementById(buttonId);
  if (!btn) return;
  const icon = btn.querySelector('i');
  // aplicar tema guardado o por defecto (oscuro)
  const saved = localStorage.getItem('theme') || 'dark';
  applyTheme(saved);
  btn.addEventListener('click', () => {
    const next = (localStorage.getItem('theme') === 'light') ? 'dark' : 'light';
    applyTheme(next);
  });

  function applyTheme(mode) {
    localStorage.setItem('theme', mode);
    if (mode === 'light') {
      document.body.classList.add('light-mode');
      if (icon) icon.className = 'fa-regular fa-sun';
      // asegurar contraste: texto oscuro ya definido en CSS var --text
    } else {
      document.body.classList.remove('light-mode');
      if (icon) icon.className = 'fa-regular fa-moon';
    }
  }
}

/* ---------- TOAST SIMPLE ---------- */
function createToast(message) {
  const root = document.getElementById('toastRoot') || document.body;
  const toast = document.createElement('div');
  toast.className = 'toast align-items-center text-bg-dark border-0 mb-2';
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Cerrar"></button>
    </div>
  `;
  if (!document.getElementById('toastRoot')) {
    const container = document.createElement('div');
    container.id = 'toastRoot';
    container.className = 'toast-root';
    document.body.appendChild(container);
  }
  document.getElementById('toastRoot').appendChild(toast);
  const bs = new bootstrap.Toast(toast, { delay: 3000 });
  bs.show();
  toast.addEventListener('hidden.bs.toast', () => toast.remove());
}

/* ---------- INICIALIZACIÓN GENERAL ---------- */
document.addEventListener('DOMContentLoaded', () => {
  // avatar emoji en ambas páginas (si existe)
  generateRandomEmojiAvatar('avatarEmoji');

  // toggles de tema (puede haber dos botones en páginas distintas)
  initThemeToggle('themeToggle');
  initThemeToggle('themeToggle2');

  // demo: botón que puede existir en Menú.html
  const demoBtn = document.getElementById('demoToastBtn');
  if (demoBtn) demoBtn.addEventListener('click', () => {
    createToast('Demo activada — ¡disfruta el diseño!');
  });

  /* ---------- Si existe formulario, inicializar interacciones ---------- */
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

  // cargar guardado
  const saved = JSON.parse(localStorage.getItem('registroDatos') || '{}');
  if (saved && Object.keys(saved).length) {
    fields.nombre.value = saved.nombre || '';
    fields.direccion.value = saved.direccion || '';
    fields.telefono.value = saved.telefono || '';
    fields.correo.value = saved.correo || '';
    fields.area.value = saved.area || '';
    fields.terminos.checked = saved.terminos || false;
    createToast('Datos cargados desde almacenamiento local');
  }

  function updateUI() {
    const v = {
      nombre: fields.nombre.value.trim(),
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

  // máscaras y eventos
  fields.telefono.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^\d]/g, '').slice(0, 15);
    updateUI();
  });
  ['nombre', 'correo', 'direccion'].forEach(id => {
    fields[id].addEventListener('input', updateUI);
  });
  fields.area.addEventListener('change', updateUI);

  // guardado automático (debounce)
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
      createToast('Progreso guardado localmente');
    }, 900);
  });

  // descargar JSON
  if (downloadBtn) downloadBtn.addEventListener('click', () => {
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
    createToast('Archivo JSON descargado');
  });

  // limpiar
  if (clearBtn) clearBtn.addEventListener('click', () => {
    form.reset();
    localStorage.removeItem('registroDatos');
    updateUI();
    createToast('Formulario limpiado');
  });

  // envío
  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      createToast('Corrija los campos marcados');
      return;
    }
    // resumen simple y limpieza
    createToast('Registro completado');
    localStorage.removeItem('registroDatos');
    form.reset();
    form.classList.remove('was-validated');
    updateUI();
    confettiSimple();
  });

  // inicializar UI
  updateUI();
});

/* Confetti simple reutilizable */
function confettiSimple() {
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
  const colors = ['#7c5cff', '#00d4ff', '#2dd4bf', '#ffd166', '#ff6b6b'];
  for (let i = 0; i < 50; i++) {
    pieces.push({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      w: 6 + Math.random() * 10,
      h: 8 + Math.random() * 12,
      vx: -2 + Math.random() * 4,
      vy: 2 + Math.random() * 6,
      r: Math.random() * 360,
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }
  let t = 0;
  function frame() {
    t++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let p of pieces) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.06;
      p.r += p.vx * 0.5;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r * Math.PI / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (t < 140) requestAnimationFrame(frame);
    else canvas.remove();
  }
  requestAnimationFrame(frame);
}
