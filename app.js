// ======================================================
// THE ALPHA PROMPT SYSTEM
// Supabase Authentication + Prompt System
// ======================================================

const SUPABASE_URL = 'https://veuiegyngkrktuatzjya.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_tuH1BcZ1l59fPLupoUw4nw_B9PGYeW8';

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

// ======================================================
// ELEMENTOS
// ======================================================

let prompts = [];
let chapters = [];

const cards = document.getElementById('cards');
const search = document.getElementById('search');
const chapterFilter = document.getElementById('chapterFilter');
const resultInfo = document.getElementById('resultInfo');
const clearBtn = document.getElementById('clearBtn');
const toast = document.getElementById('toast');

// ======================================================
// AUTHENTICATION
// ======================================================

async function checkAuth() {

  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  if (!session) {
    showLoginScreen();
    return;
  }

  showApp(session.user);
}

function showLoginScreen() {

  document.body.innerHTML = `
    <div class="auth-screen">

      <div class="auth-card">

        <div class="auth-brand">
          <div class="auth-eyebrow">GIANCARLO JERÍ</div>
          <h1>THE ALPHA <span>PROMPT SYSTEM</span></h1>
          <p>Tu biblioteca privada de prompts profesionales.</p>
        </div>

        <div id="authMessage" class="auth-message"></div>

        <div id="loginForm">

          <h2>Bienvenido, Alpha.</h2>

          <p class="auth-subtitle">
            Inicia sesión para acceder al sistema.
          </p>

          <input
            id="loginEmail"
            type="email"
            placeholder="Tu email"
            autocomplete="email"
          >

          <input
            id="loginPassword"
            type="password"
            placeholder="Tu contraseña"
            autocomplete="current-password"
          >

          <button id="loginBtn" class="auth-btn">
            INICIAR SESIÓN
          </button>

          <button id="forgotBtn" class="auth-link">
            ¿Olvidaste tu contraseña?
          </button>

          <div class="auth-divider">
            <span>¿Aún no tienes cuenta?</span>
          </div>

          <button id="showRegisterBtn" class="auth-secondary">
            CREAR MI CUENTA
          </button>

        </div>


        <div id="registerForm" style="display:none">

          <h2>Únete al sistema.</h2>

          <p class="auth-subtitle">
            Crea tu cuenta para acceder a The Alpha Prompt System.
          </p>

          <input
            id="registerName"
            type="text"
            placeholder="Tu nombre"
            autocomplete="name"
          >

          <input
            id="registerEmail"
            type="email"
            placeholder="Tu email"
            autocomplete="email"
          >

          <input
            id="registerPassword"
            type="password"
            placeholder="Crea una contraseña"
            autocomplete="new-password"
          >

          <button id="registerBtn" class="auth-btn">
            CREAR CUENTA
          </button>

          <button id="showLoginBtn" class="auth-link">
            ← Ya tengo una cuenta
          </button>

        </div>

      </div>

    </div>
  `;

  setupAuthEvents();
}


// ======================================================
// AUTH EVENTS
// ======================================================

function setupAuthEvents() {

  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  const showRegisterBtn =
    document.getElementById('showRegisterBtn');

  const showLoginBtn =
    document.getElementById('showLoginBtn');

  const loginBtn =
    document.getElementById('loginBtn');

  const registerBtn =
    document.getElementById('registerBtn');

  const forgotBtn =
    document.getElementById('forgotBtn');


  showRegisterBtn.addEventListener('click', () => {

    loginForm.style.display = 'none';
    registerForm.style.display = 'block';

    clearAuthMessage();

  });


  showLoginBtn.addEventListener('click', () => {

    registerForm.style.display = 'none';
    loginForm.style.display = 'block';

    clearAuthMessage();

  });


  loginBtn.addEventListener('click', loginUser);

  registerBtn.addEventListener('click', registerUser);

  forgotBtn.addEventListener('click', resetPassword);


  // Permitir ENTER para enviar formularios

  document.addEventListener('keydown', e => {

    if (e.key !== 'Enter') return;

    if (loginForm.style.display !== 'none') {
      loginUser();
    } else {
      registerUser();
    }

  });

}


// ======================================================
// REGISTER
// ======================================================

async function registerUser() {

  const name =
    document.getElementById('registerName').value.trim();

  const email =
    document.getElementById('registerEmail').value.trim();

  const password =
    document.getElementById('registerPassword').value;


  if (!name || !email || !password) {

    showAuthMessage(
      'Completa todos los campos.',
      'error'
    );

    return;
  }


  if (password.length < 6) {

    showAuthMessage(
      'La contraseña debe tener al menos 6 caracteres.',
      'error'
    );

    return;
  }


  setAuthButtonLoading(
    'registerBtn',
    true,
    'CREANDO CUENTA...'
  );


  const { data, error } =
    await supabaseClient.auth.signUp({

      email,
      password,

      options: {

        data: {
          full_name: name
        },

        emailRedirectTo:
          'https://giancarlojeri.github.io/The-Alpha-Prompt-System/'

      }

    });


  setAuthButtonLoading(
    'registerBtn',
    false,
    'CREAR CUENTA'
  );


  if (error) {

    showAuthMessage(
      translateAuthError(error.message),
      'error'
    );

    return;
  }


  // Si Supabase exige confirmación de email

  if (data.user && !data.session) {

    showAuthMessage(
      'Cuenta creada. Revisa tu email y confirma tu cuenta antes de iniciar sesión.',
      'success'
    );

    return;
  }


  showAuthMessage(
    'Cuenta creada correctamente.',
    'success'
  );

}


// ======================================================
// LOGIN
// ======================================================

async function loginUser() {

  const email =
    document.getElementById('loginEmail').value.trim();

  const password =
    document.getElementById('loginPassword').value;


  if (!email || !password) {

    showAuthMessage(
      'Introduce tu email y contraseña.',
      'error'
    );

    return;
  }


  setAuthButtonLoading(
    'loginBtn',
    true,
    'ENTRANDO...'
  );


  const { data, error } =
    await supabaseClient.auth.signInWithPassword({

      email,
      password

    });


  setAuthButtonLoading(
    'loginBtn',
    false,
    'INICIAR SESIÓN'
  );


  if (error) {

    showAuthMessage(
      translateAuthError(error.message),
      'error'
    );

    return;
  }


  showApp(data.user);

}


// ======================================================
// PASSWORD RESET
// ======================================================

async function resetPassword() {

  const email =
    document.getElementById('loginEmail').value.trim();


  if (!email) {

    showAuthMessage(
      'Primero escribe tu email.',
      'error'
    );

    return;
  }


  const { error } =
    await supabaseClient.auth.resetPasswordForEmail(
      email,
      {
        redirectTo:
          'https://giancarlojeri.github.io/The-Alpha-Prompt-System/'
      }
    );


  if (error) {

    showAuthMessage(
      translateAuthError(error.message),
      'error'
    );

    return;
  }


  showAuthMessage(
    'Te hemos enviado un email para restablecer tu contraseña.',
    'success'
  );

}


// ======================================================
// SHOW APPLICATION
// ======================================================

function showApp(user) {

  location.reload();

}


// ======================================================
// AUTH MESSAGE
// ======================================================

function showAuthMessage(message, type = 'error') {

  const box =
    document.getElementById('authMessage');

  if (!box) return;

  box.textContent = message;

  box.className =
    `auth-message ${type}`;

}


function clearAuthMessage() {

  const box =
    document.getElementById('authMessage');

  if (!box) return;

  box.textContent = '';

  box.className = 'auth-message';

}


function setAuthButtonLoading(id, loading, text) {

  const button =
    document.getElementById(id);

  if (!button) return;

  button.disabled = loading;

  button.textContent = text;

}


// ======================================================
// AUTH ERROR TRANSLATION
// ======================================================

function translateAuthError(message) {

  const errors = {

    'Invalid login credentials':
      'Email o contraseña incorrectos.',

    'Email not confirmed':
      'Debes confirmar tu email antes de iniciar sesión.',

    'User already registered':
      'Este email ya tiene una cuenta.',

    'Password should be at least 6 characters':
      'La contraseña debe tener al menos 6 caracteres.'

  };


  return errors[message] || message;

}


// ======================================================
// LOGOUT
// ======================================================

async function logoutUser() {

  await supabaseClient.auth.signOut();

  location.reload();

}


// ======================================================
// APPLICATION
// ======================================================

async function init() {

  [prompts, chapters] = await Promise.all([

    fetch('prompts.json')
      .then(r => r.json()),

    fetch('chapters.json')
      .then(r => r.json())

  ]);


  chapters.forEach(c => {

    const o =
      document.createElement('option');

    o.value = c.id;

    o.textContent =
      `Capítulo ${c.id} · ${c.title}`;

    chapterFilter.appendChild(o);

  });


  render();

  openFromUrl();

}


// ======================================================
// OPEN PROMPT FROM URL
// ======================================================

function openFromUrl() {

  const q =
    new URLSearchParams(location.search);

  const id =
    q.get('p') ||
    (location.hash.match(/prompt-(\d+)/) || [])[1];


  if (!id) return;


  const target =
    document.getElementById(
      `prompt-${String(id).padStart(3, '0')}`
    );


  if (target) {

    setTimeout(() => {

      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });

    }, 150);


    target.style.outline =
      '1px solid #16a9ff';


    setTimeout(() => {

      target.style.outline = '';

    }, 1800);

  }

}


// ======================================================
// RENDER PROMPTS
// ======================================================

function render() {

  const q =
    search.value.trim().toLowerCase();

  const ch =
    chapterFilter.value;


  const filtered =
    prompts.filter(p => {

      const hay = [

        p.title,
        p.chapter_title,
        p.purpose,
        p.variables.join(' '),
        p.prompt

      ]
        .join(' ')
        .toLowerCase();


      return (

        (!q || hay.includes(q)) &&

        (ch === 'all' ||
          String(p.chapter) === ch)

      );

    });


  resultInfo.textContent =
    `Mostrando ${filtered.length} de ${prompts.length} prompts`;

  cards.innerHTML = '';


  if (!filtered.length) {

    cards.innerHTML =
      '<div class="empty">No encontramos prompts con esos criterios.<br>Prueba otra palabra o limpia los filtros.</div>';

    return;

  }


  const frag =
    document.createDocumentFragment();


  filtered.forEach(p => {

    const article =
      document.createElement('article');

    article.className = 'card';

    article.id =
      `prompt-${String(p.id).padStart(3, '0')}`;


    const vars =
      p.variables.length

        ? `<div class="vars">
            ${p.variables
              .map(v =>
                `<span class="var">
                  ${escapeHtml(v)}
                </span>`
              )
              .join('')}
           </div>`

        : `<span class="var">
             Sin variables declaradas
           </span>`;


    article.innerHTML = `

      <div class="card-top">

        <div style="display:flex;gap:14px;align-items:flex-start">

          <div class="num">
            ${String(p.id).padStart(3, '0')}
          </div>

          <div>

            <h3 class="title">
              ${escapeHtml(p.title)}
            </h3>

            <div class="chapter">
              Capítulo ${p.chapter} ·
              ${escapeHtml(p.chapter_title)}
            </div>

          </div>

        </div>

        ${
          p.is_json
            ? '<span class="badge">JSON</span>'
            : '<span class="badge">PROMPT</span>'
        }

      </div>


      <div class="section-label">
        ¿Para qué sirve?
      </div>

      <p class="purpose">
        ${escapeHtml(p.purpose)}
      </p>


      <div class="section-label">
        Variables
      </div>

      <div class="vars">
        ${vars}
      </div>


      <div class="section-label">
        Prompt
      </div>

      <div class="prompt-box">

        <pre>
          ${escapeHtml(p.prompt)}
        </pre>

        <div class="copy-row">

          <button
            class="copy-btn"
            data-id="${p.id}">
            COPIAR PROMPT
          </button>

        </div>

      </div>

    `;


    frag.appendChild(article);

  });


  cards.appendChild(frag);

}


// ======================================================
// COPY PROMPT
// ======================================================

async function copyPrompt(id) {

  const p =
    prompts.find(x => x.id === id);

  if (!p) return;


  try {

    await navigator.clipboard
      .writeText(p.prompt);

  } catch (e) {

    const ta =
      document.createElement('textarea');

    ta.value = p.prompt;

    ta.style.position = 'fixed';

    ta.style.opacity = '0';

    document.body.appendChild(ta);

    ta.select();

    document.execCommand('copy');

    ta.remove();

  }


  toast.classList.add('show');

  setTimeout(
    () => toast.classList.remove('show'),
    1400
  );

}


// ======================================================
// EVENTS
// ======================================================

document.addEventListener('click', e => {

  const btn =
    e.target.closest('.copy-btn');

  if (btn) {

    copyPrompt(
      Number(btn.dataset.id)
    );

  }

});


if (search) {

  search.addEventListener(
    'input',
    render
  );

}


if (chapterFilter) {

  chapterFilter.addEventListener(
    'change',
    render
  );

}


if (clearBtn) {

  clearBtn.addEventListener(
    'click',
    () => {

      search.value = '';

      chapterFilter.value = 'all';

      render();

    }
  );

}


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHtml(s) {

  return String(s ?? '')
    .replace(
      /[&<>"']/g,
      m => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[m])
    );

}


// ======================================================
// START
// ======================================================

async function start() {

  await checkAuth();

  // Si existe una sesión, checkAuth habrá
  // recargado la aplicación.
  // Si no existe sesión, muestra login.

  if (
    document.getElementById('cards')
  ) {

    await init();

  }

}


// ======================================================
// AUTH STATE
// ======================================================

supabaseClient.auth.onAuthStateChange(
  (event, session) => {

    if (event === 'SIGNED_OUT') {

      location.reload();

    }

  }
);


// START

start();
