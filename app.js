let prompts = [];
let chapters = [];
const cards = document.getElementById('cards');
const search = document.getElementById('search');
const chapterFilter = document.getElementById('chapterFilter');
const resultInfo = document.getElementById('resultInfo');
const clearBtn = document.getElementById('clearBtn');
const toast = document.getElementById('toast');

async function init(){
  [prompts, chapters] = await Promise.all([
    fetch('prompts.json').then(r=>r.json()),
    fetch('chapters.json').then(r=>r.json())
  ]);

  chapters.forEach(c=>{
    const o=document.createElement('option');
    o.value=c.id;
    o.textContent=`Capítulo ${c.id} · ${c.title}`;
    chapterFilter.appendChild(o);
  });

  render();
  openFromUrl();
}

function openFromUrl(){
  const q = new URLSearchParams(location.search);
  const id = q.get('p') || (location.hash.match(/prompt-(\d+)/)||[])[1];
  if(!id) return;
  const target=document.getElementById(`prompt-${String(id).padStart(3,'0')}`);
  if(target){
    setTimeout(()=>target.scrollIntoView({behavior:'smooth',block:'start'}),150);
    target.style.outline='1px solid #16a9ff';
    setTimeout(()=>target.style.outline='',1800);
  }
}

function render(){
  const q=search.value.trim().toLowerCase();
  const ch=chapterFilter.value;
  const filtered=prompts.filter(p=>{
    const hay=[p.title,p.chapter_title,p.purpose,p.variables.join(' '),p.prompt].join(' ').toLowerCase();
    return (!q || hay.includes(q)) && (ch==='all' || String(p.chapter)===ch);
  });

  resultInfo.textContent=`Mostrando ${filtered.length} de ${prompts.length} prompts`;
  cards.innerHTML='';

  if(!filtered.length){
    cards.innerHTML='<div class="empty">No encontramos prompts con esos criterios.<br>Prueba otra palabra o limpia los filtros.</div>';
    return;
  }

  const frag=document.createDocumentFragment();
  filtered.forEach(p=>{
    const article=document.createElement('article');
    article.className='card';
    article.id=`prompt-${String(p.id).padStart(3,'0')}`;

    const vars=p.variables.length
      ? `<div class="vars">${p.variables.map(v=>`<span class="var">${escapeHtml(v)}</span>`).join('')}</div>`
      : `<span class="var">Sin variables declaradas</span>`;

    article.innerHTML=`
      <div class="card-top">
        <div style="display:flex;gap:14px;align-items:flex-start">
          <div class="num">${String(p.id).padStart(3,'0')}</div>
          <div>
            <h3 class="title">${escapeHtml(p.title)}</h3>
            <div class="chapter">Capítulo ${p.chapter} · ${escapeHtml(p.chapter_title)}</div>
          </div>
        </div>
        ${p.is_json ? '<span class="badge">JSON</span>' : '<span class="badge">PROMPT</span>'}
      </div>

      <div class="section-label">¿Para qué sirve?</div>
      <p class="purpose">${escapeHtml(p.purpose)}</p>

      <div class="section-label">Variables</div>
      <div class="vars">${vars}</div>

      <div class="section-label">Prompt</div>
      <div class="prompt-box">
        <pre>${escapeHtml(p.prompt)}</pre>
        <div class="copy-row">
          <button class="copy-btn" data-id="${p.id}">COPIAR PROMPT</button>
        </div>
      </div>
    `;
    frag.appendChild(article);
  });
  cards.appendChild(frag);
}

async function copyPrompt(id){
  const p=prompts.find(x=>x.id===id);
  if(!p) return;
  try{
    await navigator.clipboard.writeText(p.prompt);
  }catch(e){
    const ta=document.createElement('textarea');
    ta.value=p.prompt;
    ta.style.position='fixed';ta.style.opacity='0';
    document.body.appendChild(ta);ta.select();
    document.execCommand('copy');
    ta.remove();
  }
  toast.classList.add('show');
  setTimeout(()=>toast.classList.remove('show'),1400);
}

document.addEventListener('click',e=>{
  const btn=e.target.closest('.copy-btn');
  if(btn) copyPrompt(Number(btn.dataset.id));
});
search.addEventListener('input',render);
chapterFilter.addEventListener('change',render);
clearBtn.addEventListener('click',()=>{
  search.value=''; chapterFilter.value='all'; render();
});

function escapeHtml(s){
  return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}
init();
