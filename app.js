// =====================================================
// THE ALPHA PROMPT SYSTEM
// Supabase Authentication + Prompt Library
// =====================================================


// =====================================================
// SUPABASE
// =====================================================

const SUPABASE_URL = 'https://veuiegyngkrktuatzjya.supabase.co';

const SUPABASE_PUBLISHABLE_KEY =
  'sb_publishable_tuH1BcZ1l59fPLupoUw4nw_B9PGYeW8';

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);


// =====================================================
// ELEMENTOS DE AUTENTICACIÓN
// =====================================================

const authScreen = document.getElementById('authScreen');
const appScreen = document.getElementById('appScreen');

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');

const registerEmail = document.getElementById('registerEmail');
const registerPassword = document.getElementById('registerPassword');
const registerPasswordConfirm =
  document.getElementById('registerPasswordConfirm');

const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');

const logoutBtn = document.getElementById('logoutBtn');

const showRegisterBtn =
  document.getElementById('showRegisterBtn');

const showLoginBtn =
  document.getElementById('showLoginBtn');

const loginMessage =
  document.getElementById('loginMessage');

const registerMessage =
  document.getElementById('registerMessage');

const userEmail =
  document.getElementById('userEmail');


// =====================================================
// ELEMENTOS DE LA BIBLIOTECA
// =====================================================

let prompts = [];
let chapters = [];

const cards = document.getElementById('cards');
const search = document.getElementById('search');
const chapterFilter =
  document.getElementById('chapterFilter');

const resultInfo =
  document.getElementById('resultInfo');

const clearBtn =
  document.getElementById('clearBtn');

const toast =
  document.getElementById('toast');


// =====================================================
// ESTADO
// =====================================================

let currentUser = null;


// =====================================================
// INICIO
// =====================================================

async function startApp() {

  // Primero comprobamos la sesión
  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  if (session) {
    await showApp(session.user);
  } else {
    showAuth();
  }


  // Escuchar cambios de sesión
  supabaseClient.auth.onAuthStateChange(
    async (event, session) => {

      console.log('Auth event:', event);

      if (session) {
        await showApp(session.user);
      } else {
        showAuth();
      }

    }
  );
}


// =====================================================
// MOSTRAR LOGIN
// =====================================================

function showAuth() {

  currentUser = null;

  if (authScreen) {
    authScreen.style.display = 'flex';
  }

  if (appScreen) {
    appScreen.style.display = 'none';
  }

  if (userEmail) {
    userEmail.textContent = '';
  }

}


// =====================================================
// MOSTRAR APLICACIÓN
// =====================================================

async function showApp(user) {

  currentUser = user;

  if (authScreen) {
    authScreen.style.display = 'none';
  }

  if (appScreen) {
    appScreen.style.display = 'block';
  }

  if (userEmail) {
    userEmail.textContent = user.email || '';
  }

  await initLibrary();

}


// =====================================================
// LOGIN
// =====================================================

async function login() {

  const email = loginEmail.value.trim();
  const password = loginPassword.value;

  clearMessages();

  if (!email || !password) {

    showLoginMessage(
      'Completa tu email y contraseña.'
    );

    return;
  }

  setButtonLoading(loginBtn, true, 'ENTRANDO...');

  const {
    data,
    error
  } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  setButtonLoading(
    loginBtn,
    false,
    'INICIAR SESIÓN'
  );


  if (error) {

    console.error(error);

    let message =
      'No pudimos iniciar sesión.';

    if (
      error.message
        .toLowerCase()
        .includes('email not confirmed')
    ) {

      message =
        'Tu email todavía no ha sido confirmado. Revisa tu correo.';

    } else if (
      error.message
        .toLowerCase()
        .includes('invalid login credentials')
    ) {

      message =
        'Email o contraseña incorrectos.';

    }

    showLoginMessage(message);

    return;
  }


  if (data.session) {

    loginEmail.value = '';
    loginPassword.value = '';

    await showApp(data.session.user);

  }

}


// =====================================================
// REGISTRO
// =====================================================

async function register() {

  const email =
    registerEmail.value.trim();

  const password =
    registerPassword.value;

  const passwordConfirm =
    registerPasswordConfirm.value;

  clearMessages();


  if (!email || !password || !passwordConfirm) {

    showRegisterMessage(
      'Completa todos los campos.'
    );

    return;
  }


  if (password.length < 6) {

    showRegisterMessage(
      'La contraseña debe tener al menos 6 caracteres.'
    );

    return;
  }


  if (password !== passwordConfirm) {

    showRegisterMessage(
      'Las contraseñas no coinciden.'
    );

    return;
  }


  setButtonLoading(
    registerBtn,
    true,
    'CREANDO CUENTA...'
  );


  const redirectUrl =
    'https://giancarlojeri.github.io/The-Alpha-Prompt-System/';


  const {
    data,
    error
  } = await supabaseClient.auth.signUp({

    email,
    password,

    options: {
      emailRedirectTo: redirectUrl
    }

  });


  setButtonLoading(
    registerBtn,
    false,
    'CREAR CUENTA'
  );


  if (error) {

    console.error(error);

    showRegisterMessage(
      translateAuthError(error.message)
    );

    return;
  }


  // Si Supabase requiere confirmación
  if (data.user && !data.session) {

    registerEmail.value = '';
    registerPassword.value = '';
    registerPasswordConfirm.value = '';

    showRegisterMessage(
      'Cuenta creada. Revisa tu email y confirma tu cuenta antes de iniciar sesión.'
    );

    return;
  }


  // Si la confirmación de email está desactivada
  if (data.session) {

    await showApp(data.session.user);

  }

}


// =====================================================
// LOGOUT
// =====================================================

async function logout() {

  if (logoutBtn) {
    logoutBtn.disabled = true;
    logoutBtn.textContent = 'SALIENDO...';
  }

  const { error } =
    await supabaseClient.auth.signOut();

  if (error) {
    console.error(error);
  }

  if (logoutBtn) {
    logoutBtn.disabled = false;
    logoutBtn.textContent = 'CERRAR SESIÓN';
  }

}


// =====================================================
// CAMBIAR ENTRE LOGIN / REGISTRO
// =====================================================

function showRegister() {

  clearMessages();

  loginForm.style.display = 'none';
  registerForm.style.display = 'block';

}


function showLogin() {

  clearMessages();

  registerForm.style.display = 'none';
  loginForm.style.display = 'block';

}


// =====================================================
// MENSAJES
// =====================================================

function showLoginMessage(message) {

  if (!loginMessage) return;

  loginMessage.textContent = message;
  loginMessage.style.display = 'block';

}


function showRegisterMessage(message) {

  if (!registerMessage) return;

  registerMessage.textContent = message;
  registerMessage.style.display = 'block';

}


function clearMessages() {

  if (loginMessage) {
    loginMessage.textContent = '';
    loginMessage.style.display = 'none';
  }

  if (registerMessage) {
    registerMessage.textContent = '';
    registerMessage.style.display = 'none';
  }

}


// =====================================================
// TRADUCIR ERRORES
// =====================================================

function translateAuthError(message) {

  const text =
    String(message || '').toLowerCase();


  if (text.includes('already registered')) {
    return 'Este email ya tiene una cuenta. Intenta iniciar sesión.';
  }


  if (text.includes('invalid email')) {
    return 'Introduce un email válido.';
  }


  if (text.includes('password')) {
    return 'La contraseña no cumple los requisitos.';
  }


  if (text.includes('rate limit')) {
    return 'Demasiados intentos. Espera unos minutos e inténtalo nuevamente.';
  }


  return 'No pudimos crear la cuenta. Inténtalo nuevamente.';

}


// =====================================================
// BOTONES
// =====================================================

function setButtonLoading(
  button,
  loading,
  text
) {

  if (!button) return;

  button.disabled = loading;
  button.textContent = text;

}


// =====================================================
// INICIALIZAR BIBLIOTECA
// =====================================================

async function initLibrary() {

  try {

    const [
      promptsResponse,
      chaptersResponse
    ] = await Promise.all([

      fetch('prompts.json'),

      fetch('chapters.json')

    ]);


    if (!promptsResponse.ok) {
      throw new Error('No se pudo cargar prompts.json');
    }


    if (!chaptersResponse.ok) {
      throw new Error('No se pudo cargar chapters.json');
    }


    prompts =
      await promptsResponse.json();

    chapters =
      await chaptersResponse.json();


    // Limpiar opciones anteriores
    chapterFilter.innerHTML = `
      <option value="all">
        Todos los capítulos
      </option>
    `;


    chapters.forEach(c => {

      const option =
        document.createElement('option');

      option.value = c.id;

      option.textContent =
        `Capítulo ${c.id} · ${c.title}`;

      chapterFilter.appendChild(option);

    });


    render();

    openFromUrl();

  } catch (error) {

    console.error(
      'Error cargando biblioteca:',
      error
    );

    cards.innerHTML = `
      <div class="empty">
        No pudimos cargar la biblioteca.
        <br><br>
        Recarga la página e inténtalo nuevamente.
      </div>
    `;

  }

}


// =====================================================
// ABRIR PROMPT DESDE URL
// =====================================================

function openFromUrl() {

  const q =
    new URLSearchParams(location.search);

  const id =
    q.get('p') ||
    (location.hash.match(
      /prompt-(\d+)/
    ) || [])[1];


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


// =====================================================
// RENDER DE PROMPTS
// =====================================================

function render() {

  const q =
    search.value
      .trim()
      .toLowerCase();

  const ch =
    chapterFilter.value;


  const filtered =
    prompts.filter(p => {

      const variables =
        Array.isArray(p.variables)
          ? p.variables.join(' ')
          : '';


      const hay = [

        p.title,

        p.chapter_title,

        p.purpose,

        variables,

        p.prompt

      ]
        .join(' ')
        .toLowerCase();


      return (

        (!q || hay.includes(q))

        &&

        (
          ch === 'all'
          ||
          String(p.chapter) === ch
        )

      );

    });


  resultInfo.textContent =
    `Mostrando ${filtered.length} de ${prompts.length} prompts`;


  cards.innerHTML = '';


  if (!filtered.length) {

    cards.innerHTML = `
      <div class="empty">
        No encontramos prompts con esos criterios.
        <br>
        Prueba otra palabra o limpia los filtros.
      </div>
    `;

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


    const variables =
      Array.isArray(p.variables)
        ? p.variables
        : [];


    const vars =
      variables.length

        ? variables
            .map(v =>
              `<span class="var">${escapeHtml(v)}</span>`
            )
            .join('')

        : `<span class="var">
             Sin variables declaradas
           </span>`;


    article.innerHTML = `

      <div class="card-top">

        <div style="
          display:flex;
          gap:14px;
          align-items:flex-start
        ">

          <div class="num">
            ${String(p.id).padStart(3, '0')}
          </div>

          <div>

            <h3 class="title">
              ${escapeHtml(p.title)}
            </h3>

            <div class="chapter">
              Capítulo ${p.chapter}
              ·
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

        <pre>${escapeHtml(p.prompt)}</pre>

        <div class="copy-row">

          <button
            class="copy-btn"
            data-id="${p.id}"
          >
            COPIAR PROMPT
          </button>

        </div>

      </div>

    `;


    frag.appendChild(article);

  });


  cards.appendChild(frag);

}


// =====================================================
// COPIAR PROMPT
// =====================================================

async function copyPrompt(id) {

  const p =
    prompts.find(x => x.id === id);


  if (!p) return;


  try {

    await navigator.clipboard.writeText(
      p.prompt
    );

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


  if (toast) {

    toast.classList.add('show');

    setTimeout(() => {

      toast.classList.remove('show');

    }, 1400);

  }

}


// =====================================================
// ESCAPE HTML
// =====================================================

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


// =====================================================
// EVENTOS
// =====================================================

if (loginBtn) {

  loginBtn.addEventListener(
    'click',
    login
  );

}


if (registerBtn) {

  registerBtn.addEventListener(
    'click',
    register
  );

}


if (logoutBtn) {

  logoutBtn.addEventListener(
    'click',
    logout
  );

}


if (showRegisterBtn) {

  showRegisterBtn.addEventListener(
    'click',
    showRegister
  );

}


if (showLoginBtn) {

  showLoginBtn.addEventListener(
    'click',
    showLogin
  );

}


// Enter en Login
if (loginForm) {

  loginForm.addEventListener(
    'keydown',
    e => {

      if (e.key === 'Enter') {

        e.preventDefault();

        login();

      }

    }
  );

}


// Enter en Registro
if (registerForm) {

  registerForm.addEventListener(
    'keydown',
    e => {

      if (e.key === 'Enter') {

        e.preventDefault();

        register();

      }

    }
  );

}


// Copiar prompt
document.addEventListener(
  'click',
  e => {

    const btn =
      e.target.closest('.copy-btn');


    if (btn) {

      copyPrompt(
        Number(btn.dataset.id)
      );

    }

  }
);


// Búsqueda
if (search) {

  search.addEventListener(
    'input',
    render
  );

}


// Filtro
if (chapterFilter) {

  chapterFilter.addEventListener(
    'change',
    render
  );

}


// Limpiar
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


// =====================================================
// ARRANCAR
// =====================================================

startApp();
