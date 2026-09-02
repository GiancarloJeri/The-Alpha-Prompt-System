// =====================================================
// THE ALPHA PROMPT SYSTEM
// Supabase Authentication + Prompt Library
// =====================================================


// =====================================================
// SUPABASE
// =====================================================

const SUPABASE_URL =
  "https://veuiegyngkrktuatzjya.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_tuH1BcZ1l59fPLupoUw4nw_B9PGYeW8";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);


// =====================================================
// ELEMENTOS DE AUTENTICACIÓN
// =====================================================

const authScreen =
  document.getElementById("authScreen");

const appScreen =
  document.getElementById("appScreen");

const loginBox =
  document.getElementById("loginBox");

const registerBox =
  document.getElementById("registerBox");

const loginEmail =
  document.getElementById("loginEmail");

const loginPassword =
  document.getElementById("loginPassword");

const registerEmail =
  document.getElementById("registerEmail");

const registerPassword =
  document.getElementById("registerPassword");

const registerPassword2 =
  document.getElementById("registerPassword2");

const loginBtn =
  document.getElementById("loginBtn");

const registerBtn =
  document.getElementById("registerBtn");

const showRegisterBtn =
  document.getElementById("showRegisterBtn");

const showLoginBtn =
  document.getElementById("showLoginBtn");

const authMessage =
  document.getElementById("authMessage");

const logoutBtn =
  document.getElementById("logoutBtn");

const userEmail =
  document.getElementById("userEmail");


// =====================================================
// ELEMENTOS DE LA BIBLIOTECA
// =====================================================

let prompts = [];
let chapters = [];

const cards =
  document.getElementById("cards");

const search =
  document.getElementById("search");

const chapterFilter =
  document.getElementById("chapterFilter");

const resultInfo =
  document.getElementById("resultInfo");

const clearBtn =
  document.getElementById("clearBtn");

const toast =
  document.getElementById("toast");


// =====================================================
// ESTADO
// =====================================================

let currentUser = null;
let libraryLoaded = false;


// =====================================================
// MENSAJES
// =====================================================

function showMessage(message, type = "info") {

  if (!authMessage) return;

  authMessage.textContent = message;

  authMessage.className = "auth-message";

  if (type === "error") {
    authMessage.classList.add("error");
  }

  if (type === "success") {
    authMessage.classList.add("success");
  }

}


function clearMessage() {

  if (!authMessage) return;

  authMessage.textContent = "";
  authMessage.className = "auth-message";

}


// =====================================================
// MOSTRAR LOGIN
// =====================================================

function showAuth() {

  currentUser = null;

  if (authScreen) {
    authScreen.classList.remove("hidden");
  }

  if (appScreen) {
    appScreen.classList.add("hidden");
  }

  if (loginBox) {
    loginBox.classList.remove("hidden");
  }

  if (registerBox) {
    registerBox.classList.add("hidden");
  }

  if (userEmail) {
    userEmail.textContent = "";
  }

  clearMessage();

}


// =====================================================
// MOSTRAR APLICACIÓN
// =====================================================

async function showApp(user) {

  if (!user) return;

  currentUser = user;

  if (authScreen) {
    authScreen.classList.add("hidden");
  }

  if (appScreen) {
    appScreen.classList.remove("hidden");
  }

  if (userEmail) {
    userEmail.textContent = user.email || "";
  }

  if (!libraryLoaded) {
    await initLibrary();
  }

}


// =====================================================
// CAMBIAR A REGISTRO
// =====================================================

function showRegister() {

  clearMessage();

  if (loginBox) {
    loginBox.classList.add("hidden");
  }

  if (registerBox) {
    registerBox.classList.remove("hidden");
  }

}


// =====================================================
// CAMBIAR A LOGIN
// =====================================================

function showLogin() {

  clearMessage();

  if (registerBox) {
    registerBox.classList.add("hidden");
  }

  if (loginBox) {
    loginBox.classList.remove("hidden");
  }

}


// =====================================================
// LOADING DE BOTONES
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
// LOGIN
// =====================================================

async function login() {

  const email =
    loginEmail
      ? loginEmail.value.trim()
      : "";

  const password =
    loginPassword
      ? loginPassword.value
      : "";

  clearMessage();

  if (!email || !password) {

    showMessage(
      "Ingresa tu email y contraseña.",
      "error"
    );

    return;
  }

  setButtonLoading(
    loginBtn,
    true,
    "INGRESANDO..."
  );

  try {

    const {
      data,
      error
    } =
      await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
      });


    if (error) {

      console.error(
        "Error de login:",
        error
      );

      const errorText =
        String(error.message || "")
          .toLowerCase();


      if (
        errorText.includes(
          "email not confirmed"
        )
      ) {

        showMessage(
          "Tu email todavía no ha sido confirmado. Revisa tu correo.",
          "error"
        );

      } else {

        showMessage(
          "Email o contraseña incorrectos.",
          "error"
        );

      }

      return;
    }


    if (
      data &&
      data.session &&
      data.user
    ) {

      if (loginEmail) {
        loginEmail.value = "";
      }

      if (loginPassword) {
        loginPassword.value = "";
      }

      await showApp(data.user);

    }

  } catch (error) {

    console.error(
      "Error inesperado:",
      error
    );

    showMessage(
      "Ocurrió un error al iniciar sesión.",
      "error"
    );

  } finally {

    setButtonLoading(
      loginBtn,
      false,
      "INICIAR SESIÓN"
    );

  }

}


// =====================================================
// REGISTRO
// =====================================================

async function register() {

  const email =
    registerEmail
      ? registerEmail.value.trim()
      : "";

  const password =
    registerPassword
      ? registerPassword.value
      : "";

  const password2 =
    registerPassword2
      ? registerPassword2.value
      : "";

  clearMessage();


  // Validar campos

  if (
    !email ||
    !password ||
    !password2
  ) {

    showMessage(
      "Completa todos los campos.",
      "error"
    );

    return;
  }


  // Validar contraseña

  if (password.length < 6) {

    showMessage(
      "La contraseña debe tener al menos 6 caracteres.",
      "error"
    );

    return;
  }


  // Confirmar contraseña

  if (password !== password2) {

    showMessage(
      "Las contraseñas no coinciden.",
      "error"
    );

    return;
  }


  setButtonLoading(
    registerBtn,
    true,
    "CREANDO CUENTA..."
  );


  try {

    const redirectUrl =
      "https://giancarlojeri.github.io/The-Alpha-Prompt-System/";


    const {
      data,
      error
    } =
      await supabaseClient.auth.signUp({

        email: email,

        password: password,

        options: {

          emailRedirectTo:
            redirectUrl

        }

      });


    if (error) {

      console.error(
        "Error de registro:",
        error
      );

      showMessage(
        translateAuthError(
          error.message
        ),
        "error"
      );

      return;
    }


    console.log(
      "Registro Supabase:",
      data
    );


    // Supabase requiere confirmar email

    if (
      data.user &&
      !data.session
    ) {

      if (registerEmail) {
        registerEmail.value = "";
      }

      if (registerPassword) {
        registerPassword.value = "";
      }

      if (registerPassword2) {
        registerPassword2.value = "";
      }

      showMessage(
        "Cuenta creada correctamente. Revisa tu email para confirmar tu cuenta.",
        "success"
      );

      return;
    }


    // Cuenta creada y sesión activa

    if (
      data.session &&
      data.user
    ) {

      await showApp(
        data.user
      );

    }

  } catch (error) {

    console.error(
      "Error inesperado:",
      error
    );

    showMessage(
      "Ocurrió un error inesperado al crear la cuenta.",
      "error"
    );

  } finally {

    setButtonLoading(
      registerBtn,
      false,
      "CREAR CUENTA"
    );

  }

}


// =====================================================
// TRADUCIR ERRORES DE SUPABASE
// =====================================================

function translateAuthError(message) {

  const text =
    String(message || "")
      .toLowerCase();


  if (
    text.includes(
      "already registered"
    )
  ) {

    return (
      "Este email ya tiene una cuenta. " +
      "Intenta iniciar sesión."
    );

  }


  if (
    text.includes(
      "user already registered"
    )
  ) {

    return (
      "Este email ya tiene una cuenta. " +
      "Intenta iniciar sesión."
    );

  }


  if (
    text.includes(
      "invalid email"
    )
  ) {

    return (
      "Introduce un email válido."
    );

  }


  if (
    text.includes(
      "password"
    )
  ) {

    return (
      "La contraseña no cumple los requisitos."
    );

  }


  if (
    text.includes(
      "rate limit"
    )
  ) {

    return (
      "Demasiados intentos. " +
      "Espera unos minutos e inténtalo nuevamente."
    );

  }


  return (
    "No pudimos crear la cuenta. " +
    "Inténtalo nuevamente."
  );

}


// =====================================================
// LOGOUT
// =====================================================

async function logout() {

  setButtonLoading(
    logoutBtn,
    true,
    "SALIENDO..."
  );

  try {

    const {
      error
    } =
      await supabaseClient.auth.signOut();


    if (error) {

      console.error(
        "Error cerrando sesión:",
        error
      );

      return;
    }


    showAuth();

  } catch (error) {

    console.error(
      "Error inesperado:",
      error
    );

  } finally {

    setButtonLoading(
      logoutBtn,
      false,
      "CERRAR SESIÓN"
    );

  }

}


// =====================================================
// INICIALIZAR BIBLIOTECA
// =====================================================

async function initLibrary() {

  if (!cards) {
    console.error(
      "No existe el elemento #cards"
    );
    return;
  }

  try {

    const [
      promptsResponse,
      chaptersResponse
    ] =
      await Promise.all([

        fetch("prompts.json"),

        fetch("chapters.json")

      ]);


    if (!promptsResponse.ok) {

      throw new Error(
        "No se pudo cargar prompts.json"
      );

    }


    if (!chaptersResponse.ok) {

      throw new Error(
        "No se pudo cargar chapters.json"
      );

    }


    prompts =
      await promptsResponse.json();


    chapters =
      await chaptersResponse.json();


    console.log(
      "Prompts cargados:",
      prompts.length
    );


    console.log(
      "Capítulos cargados:",
      chapters.length
    );


    // Limpiar filtro

    if (chapterFilter) {

      chapterFilter.innerHTML = `
        <option value="all">
          Todos los capítulos
        </option>
      `;


      chapters.forEach(
        chapter => {

          const option =
            document.createElement(
              "option"
            );


          option.value =
            chapter.id;


          option.textContent =
            `Capítulo ${chapter.id} · ${chapter.title}`;


          chapterFilter.appendChild(
            option
          );

        }
      );

    }


    libraryLoaded = true;

    render();

    openFromUrl();

  } catch (error) {

    console.error(
      "Error cargando biblioteca:",
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
// RENDER DE PROMPTS
// =====================================================

function render() {

  if (
    !cards ||
    !search ||
    !chapterFilter ||
    !resultInfo
  ) {
    return;
  }


  const q =
    search.value
      .trim()
      .toLowerCase();


  const chapter =
    chapterFilter.value;


  const filtered =
    prompts.filter(
      prompt => {

        const variables =
          Array.isArray(
            prompt.variables
          )
            ? prompt.variables.join(" ")
            : "";


        const haystack = [

          prompt.title,

          prompt.chapter_title,

          prompt.purpose,

          variables,

          prompt.prompt

        ]
          .join(" ")
          .toLowerCase();


        const matchesSearch =
          !q ||
          haystack.includes(q);


        const matchesChapter =
          chapter === "all" ||
          String(prompt.chapter) ===
            String(chapter);


        return (
          matchesSearch &&
          matchesChapter
        );

      }
    );


  resultInfo.textContent =
    `Mostrando ${filtered.length} de ${prompts.length} prompts`;


  cards.innerHTML = "";


  if (!filtered.length) {

    cards.innerHTML = `
      <div class="empty">
        No encontramos prompts con esos criterios.
        <br><br>
        Prueba otra palabra o limpia los filtros.
      </div>
    `;

    return;
  }


  const fragment =
    document.createDocumentFragment();


  filtered.forEach(
    prompt => {

      const article =
        document.createElement(
          "article"
        );


      article.className =
        "card";


      article.id =
        `prompt-${String(prompt.id).padStart(3, "0")}`;


      const variables =
        Array.isArray(
          prompt.variables
        )
          ? prompt.variables
          : [];


      const variablesHTML =
        variables.length

          ? variables
              .map(
                variable =>
                  `<span class="var">${escapeHtml(variable)}</span>`
              )
              .join("")

          : `
              <span class="var">
                Sin variables declaradas
              </span>
            `;


      const badge =
        prompt.is_json
          ? "JSON"
          : "PROMPT";


      article.innerHTML = `

        <div class="card-top">

          <div style="
            display:flex;
            gap:14px;
            align-items:flex-start;
          ">

            <div class="num">
              ${String(prompt.id).padStart(3, "0")}
            </div>

            <div>

              <h3 class="title">
                ${escapeHtml(prompt.title)}
              </h3>

              <div class="chapter">
                Capítulo ${prompt.chapter}
                ·
                ${escapeHtml(prompt.chapter_title)}
              </div>

            </div>

          </div>

          <span class="badge">
            ${badge}
          </span>

        </div>


        <div class="section-label">
          ¿Para qué sirve?
        </div>


        <p class="purpose">
          ${escapeHtml(prompt.purpose)}
        </p>


        <div class="section-label">
          Variables
        </div>


        <div class="vars">
          ${variablesHTML}
        </div>


        <div class="section-label">
          Prompt
        </div>


        <div class="prompt-box">

          <pre>${escapeHtml(prompt.prompt)}</pre>

          <div class="copy-row">

            <button
              class="copy-btn"
              data-id="${prompt.id}"
            >
              COPIAR PROMPT
            </button>

          </div>

        </div>

      `;


      fragment.appendChild(
        article
      );

    }
  );


  cards.appendChild(
    fragment
  );

}


// =====================================================
// COPIAR PROMPT
// =====================================================

async function copyPrompt(id) {

  const prompt =
    prompts.find(
      item =>
        Number(item.id) ===
        Number(id)
    );


  if (!prompt) return;


  try {

    await navigator.clipboard.writeText(
      prompt.prompt
    );

  } catch (error) {

    console.warn(
      "Clipboard API no disponible. Usando fallback."
    );


    const textarea =
      document.createElement(
        "textarea"
      );


    textarea.value =
      prompt.prompt;


    textarea.style.position =
      "fixed";

    textarea.style.opacity =
      "0";


    document.body.appendChild(
      textarea
    );


    textarea.select();


    document.execCommand(
      "copy"
    );


    textarea.remove();

  }


  if (toast) {

    toast.classList.add(
      "show"
    );


    setTimeout(
      () => {

        toast.classList.remove(
          "show"
        );

      },
      1400
    );

  }

}


// =====================================================
// ABRIR PROMPT DESDE URL
// =====================================================

function openFromUrl() {

  const params =
    new URLSearchParams(
      window.location.search
    );


  const id =
    params.get("p") ||
    (
      window.location.hash.match(
        /prompt-(\d+)/
      ) || []
    )[1];


  if (!id) return;


  const target =
    document.getElementById(
      `prompt-${String(id).padStart(3, "0")}`
    );


  if (!target) return;


  setTimeout(
    () => {

      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });


      target.style.outline =
        "1px solid #C8922E";


      setTimeout(
        () => {

          target.style.outline =
            "";

        },
        1800
      );

    },
    150
  );

}


// =====================================================
// ESCAPAR HTML
// =====================================================

function escapeHtml(value) {

  return String(value ?? "")
    .replace(
      /[&<>"']/g,
      character => {

        const entities = {

          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;"

        };


        return entities[
          character
        ];

      }
    );

}


// =====================================================
// EVENTOS
// =====================================================


// Login

if (loginBtn) {

  loginBtn.addEventListener(
    "click",
    login
  );

}


// Registro

if (registerBtn) {

  registerBtn.addEventListener(
    "click",
    register
  );

}


// Mostrar registro

if (showRegisterBtn) {

  showRegisterBtn.addEventListener(
    "click",
    showRegister
  );

}


// Mostrar login

if (showLoginBtn) {

  showLoginBtn.addEventListener(
    "click",
    showLogin
  );

}


// Logout

if (logoutBtn) {

  logoutBtn.addEventListener(
    "click",
    logout
  );

}


// =====================================================
// ENTER EN LOGIN
// =====================================================

if (loginBox) {

  loginBox.addEventListener(
    "keydown",
    event => {

      if (event.key === "Enter") {

        event.preventDefault();

        login();

      }

    }
  );

}


// =====================================================
// ENTER EN REGISTRO
// =====================================================

if (registerBox) {

  registerBox.addEventListener(
    "keydown",
    event => {

      if (event.key === "Enter") {

        event.preventDefault();

        register();

      }

    }
  );

}


// =====================================================
// COPIAR PROMPT
// =====================================================

document.addEventListener(
  "click",
  event => {

    const button =
      event.target.closest(
        ".copy-btn"
      );


    if (!button) return;


    const id =
      Number(
        button.dataset.id
      );


    copyPrompt(id);

  }
);


// =====================================================
// BÚSQUEDA
// =====================================================

if (search) {

  search.addEventListener(
    "input",
    render
  );

}


// =====================================================
// FILTRO DE CAPÍTULO
// =====================================================

if (chapterFilter) {

  chapterFilter.addEventListener(
    "change",
    render
  );

}


// =====================================================
// LIMPIAR FILTROS
// =====================================================

if (clearBtn) {

  clearBtn.addEventListener(
    "click",
    () => {

      if (search) {
        search.value = "";
      }

      if (chapterFilter) {
        chapterFilter.value = "all";
      }

      render();

    }
  );

}


// =====================================================
// SESIÓN INICIAL
// =====================================================

async function startApp() {

  try {

    console.log(
      "THE ALPHA PROMPT SYSTEM iniciando..."
    );


    const {
      data,
      error
    } =
      await supabaseClient.auth.getSession();


    if (error) {

      console.error(
        "Error obteniendo sesión:",
        error
      );

      showAuth();

      return;
    }


    if (
      data &&
      data.session &&
      data.session.user
    ) {

      await showApp(
        data.session.user
      );

    } else {

      showAuth();

    }


  } catch (error) {

    console.error(
      "Error iniciando aplicación:",
      error
    );

    showAuth();

  }


  // Escuchar cambios de autenticación

  supabaseClient.auth.onAuthStateChange(
    async (
      event,
      session
    ) => {

      console.log(
        "Auth event:",
        event
      );


      if (
        session &&
        session.user
      ) {

        await showApp(
          session.user
        );

      } else {

        showAuth();

      }

    }
  );

}


// =====================================================
// ARRANCAR
// =====================================================

startApp();
