const DATA = {
  activeLot: "LOTE-2026-0929-01",
  lots: [
    {code:"LOTE-2026-0929-01",date:"29/09/2026",operator:"Carlos Murillo",mode:"Imagen",count:47,condition:"81% sin daño"},
    {code:"LOTE-2026-0929-02",date:"29/09/2026",operator:"Carlos Murillo",mode:"Tiempo real",count:53,condition:"77% sin daño"},
    {code:"LOTE-2026-0927-01",date:"27/09/2026",operator:"Ana Ruiz",mode:"Imagen",count:44,condition:"86% sin daño"}
  ],
  shrimp: [
    {id:1,size:"Grande",weight:"14.2 g",length:"12.8 cm",condition:"Sin daño",confidence:"96%"},
    {id:2,size:"Mediano",weight:"10.1 g",length:"9.6 cm",condition:"Sin daño",confidence:"94%"},
    {id:3,size:"Pequeño",weight:"6.8 g",length:"7.4 cm",condition:"Dañado",confidence:"91%"},
    {id:4,size:"Grande",weight:"13.7 g",length:"12.2 cm",condition:"Sin daño",confidence:"95%"},
    {id:5,size:"Mediano",weight:"9.9 g",length:"9.3 cm",condition:"Sin daño",confidence:"93%"}
  ]
};

const state = {
  screen:"profiles", selectedRole:null, role:null, user:null, loginError:false, duplicateError:false,
  uploaded:false, cameraError:false, cameraRunning:true, paused:false,
  filter:"Todos", modal:null, drawer:null, search:"", empty:false
};

const app = document.querySelector("#app");
const imagePath = "assets/shrimp-inspection.png";

const menus = {
  operador:[
    ["dashboard","⌂","Inicio"],["identify","＋","Nuevo análisis"],["history","◷","Mis lotes"],
    ["reports","▤","Reportes"]
  ],
  supervisor:[
    ["supervisor","⌂","Dashboard de planta"],["supervisor-lots","◷","Lotes supervisados"],["operators","♙","Operadores"],["compare","⇄","Comparar lotes"],
    ["reports","▤","Reportes"],["alerts","!","Alertas"]
  ],
  administrador:[
    ["admin","⌂","Dashboard general"],["global-lots","◷","Lotes globales"],["global-reports","▤","Reportes globales"],
    ["activity","≡","Registro de actividad"],["parameters","⚙","Parámetros del sistema"],
    ["users","♙","Usuarios"],["roles","◇","Roles y permisos"]
  ]
};

function navigate(screen){
  state.screen=screen; state.modal=null; state.drawer=null; window.scrollTo({top:0,behavior:"smooth"}); render();
}
function toast(message){
  const el=document.querySelector("#toast"); el.textContent=message; el.classList.add("show");
  setTimeout(()=>el.classList.remove("show"),2400);
}
function badge(condition){
  const ok=condition.toLowerCase().includes("sin daño")||condition.toLowerCase().includes("activo")||condition.toLowerCase().includes("revisada");
  return `<span class="chip ${ok?'chip-green':'chip-red'}">${ok?'✓':'✕'} ${condition}</span>`;
}
function approximationNotice(){
  return `<div class="notice"><strong>Información importante:</strong> Peso y tamaño son valores aproximados estimados por visión artificial. La evaluación es solo visual y no reemplaza análisis microbiológicos, químicos o sanitarios.</div>`;
}
function login(){
  const user=document.querySelector("#username").value.trim().toLowerCase();
  const pass=document.querySelector("#password").value;
  if(user!=="admin"||pass!=="123"||!state.selectedRole){state.loginError=true;render();return;}
  state.role=state.selectedRole;
  state.user=state.role==="operador"?"Carlos Murillo":state.role==="supervisor"?"María Torres":"Luis Andrade";
  state.loginError=false; navigate(state.role==="operador"?"dashboard":state.role==="supervisor"?"supervisor":"admin");
}
function enterAs(role){
  state.selectedRole=role;
  state.loginError=false;
  navigate("login");
}
function backToProfiles(){state.selectedRole=null;state.loginError=false;navigate("profiles")}
function logout(){Object.assign(state,{screen:"profiles",selectedRole:null,role:null,user:null,loginError:false,modal:null,drawer:null});render()}

function profileIcon(type){
  const icons={
    operator:`<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="10" y="16" width="44" height="32" rx="7"/><circle cx="32" cy="32" r="9"/><path d="M18 16l4-6h20l4 6M15 54h34M24 48v6M40 48v6"/></svg>`,
    supervisor:`<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="9" y="10" width="46" height="36" rx="7"/><path d="M17 37l9-10 8 6 12-15M17 54h30M32 46v8"/><circle cx="46" cy="18" r="3"/></svg>`,
    admin:`<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="9"/><path d="M32 8v7M32 49v7M8 32h7M49 32h7M15 15l5 5M44 44l5 5M49 15l-5 5M20 44l-5 5"/><circle cx="32" cy="32" r="20"/></svg>`
  };
  return icons[type];
}

function profilesPage(){
  return `<main class="profiles-page">
    <div class="profiles-scene" aria-hidden="true">
      <div class="profiles-scene-brand"><div class="brand-mark">◖</div><div><strong>SMART <span>SHRIMP</span></strong><small>Detección inteligente de camarones</small></div></div>
      <div class="profiles-scene-copy"><span>CONTROL DE CALIDAD ASISTIDO</span><h1>Visión precisa para decisiones confiables.</h1><p>Analiza, monitorea y gestiona cada lote desde un solo lugar.</p></div>
      <div class="water-orb water-orb-one"></div><div class="water-orb water-orb-two"></div>
    </div>
    <div class="profiles-overlay">
      <section class="profiles-modal" role="dialog" aria-modal="true" aria-labelledby="profiles-title">
        <header class="profiles-header">
          <div class="profiles-eyebrow"><span></span> ACCESO AL SISTEMA</div>
          <h1 id="profiles-title">PERFILES</h1>
          <p class="profiles-subtitle">Selecciona tu perfil para iniciar sesión en <strong>SMART SHRIMP</strong></p>
          <p class="profiles-helper">Accede a las funcionalidades según tu rol dentro del sistema.</p>
        </header>
        <div class="profile-grid">
          <article class="profile-card">
            <span class="profile-number">01</span><div class="profile-icon">${profileIcon("operator")}</div>
            <h2>OPERADOR</h2><div class="profile-line"></div>
            <p>Realiza análisis de camarones por imagen o cámara en vivo.</p>
            <button class="profile-enter" onclick="enterAs('operador')">Ingresar <span>→</span></button>
          </article>
          <article class="profile-card featured">
            <span class="profile-number">02</span><div class="profile-icon">${profileIcon("supervisor")}</div>
            <h2>SUPERVISOR</h2><div class="profile-line"></div>
            <p>Consulta resultados, lotes analizados y reportes del sistema.</p>
            <button class="profile-enter" onclick="enterAs('supervisor')">Ingresar <span>→</span></button>
          </article>
          <article class="profile-card">
            <span class="profile-number">03</span><div class="profile-icon">${profileIcon("admin")}</div>
            <h2>ADMINISTRADOR</h2><div class="profile-line"></div>
            <p>Gestiona usuarios, roles y parámetros generales del sistema.</p>
            <button class="profile-enter" onclick="enterAs('administrador')">Ingresar <span>→</span></button>
          </article>
        </div>
        <footer class="profiles-footer"><span>SMART SHRIMP · Plataforma de análisis visual</span><span>Acceso seguro por perfiles</span></footer>
      </section>
    </div>
  </main>`;
}

function loginPage(){
  const roleNames={operador:"Operador",supervisor:"Supervisor",administrador:"Administrador"};
  const selectedName=roleNames[state.selectedRole];
  return `<main class="login-page">
    <section class="login-art">
      <div class="brand"><div class="brand-mark">◖</div><div><strong>SMART <span style="color:#49d5df">SHRIMP</span></strong><small>Detección inteligente de camarones</small></div></div>
      <div class="login-copy"><h1>Control inteligente de camarones.</h1><p>Ingresa a SMART SHRIMP para detectar, contar, medir y evaluar visualmente camarones mediante visión artificial.</p></div>
      <div class="login-visual" aria-hidden="true">◖</div>
      <small>Proyecto académico · Universidad Estatal de Milagro</small>
    </section>
    <section class="login-panel">
      <form class="login-card" onsubmit="event.preventDefault();login()">
        ${selectedName?`<div class="selected-role"><span>Perfil seleccionado</span><strong>${selectedName}</strong></div>`:""}
        <h2>${selectedName?`Iniciar sesión como ${selectedName}`:"Iniciar sesión"}</h2><p>Ingresa con la cuenta asignada por el administrador.</p>
        <div class="form-grid">
          ${state.loginError?`<div class="alert alert-error" role="alert"><span>✕</span><span><strong>No pudimos iniciar sesión.</strong><br>Usuario o contraseña incorrectos. Verifica los datos e intenta nuevamente.</span></div>`:""}
          <div class="field ${state.loginError?'error':''}"><label for="username">Usuario</label><input id="username" autocomplete="username" placeholder="Ingresa tu usuario" required></div>
          <div class="field ${state.loginError?'error':''}"><label for="password">Contraseña</label><input id="password" type="password" autocomplete="current-password" placeholder="Ingresa tu contraseña" required></div>
          <button class="btn btn-primary btn-block" type="submit">Ingresar</button>
        </div>
        <p class="password-help"><strong>¿Olvidaste tu contraseña?</strong><br>Contacta al administrador del sistema para recuperar tu acceso.</p>
        <button type="button" class="login-back" onclick="backToProfiles()">← Volver a seleccionar perfil</button>
      </form>
    </section>
  </main>`;
}

function shell(content,title="SMART SHRIMP"){
  const menu=menus[state.role]||menus.operador;
  const activeScreen=["identify","capture","image-analysis","realtime","loading","calibration","results"].includes(state.screen)?"identify":state.screen;
  return `<div class="app-shell">
    <aside class="sidebar">
      <div class="brand"><div class="brand-mark">◖</div><div><strong>SMART <span style="color:#49d5df">SHRIMP</span></strong><small>Análisis visual inteligente</small></div></div>
      <nav class="nav" aria-label="Navegación principal">${menu.map(([screen,icon,label])=>`<button class="nav-btn ${activeScreen===screen?'active':''}" onclick="navigate('${screen}')"><span class="nav-icon">${icon}</span>${label}</button>`).join("")}</nav>
      <div class="sidebar-bottom"><div class="sidebar-art" aria-hidden="true">◖</div><button class="nav-btn" onclick="logout()"><span class="nav-icon">↪</span>Cerrar sesión</button></div>
    </aside>
    <div class="main">
      <header class="topbar"><div class="top-title">${title}</div><div class="top-actions">
        ${state.role==='operador'?`<span class="lot-chip">▣ ${DATA.activeLot}</span>`:""}
        <button class="user-profile-button" onclick="navigate('profile')" aria-label="Abrir mi perfil"><div class="avatar">${state.user.split(' ').map(n=>n[0]).slice(0,2).join('')}</div><div class="user-meta"><strong>${state.user}</strong><small>${state.role[0].toUpperCase()+state.role.slice(1)}</small></div></button>
      </div></header>
      ${content}
    </div>
    ${modalMarkup()}${drawerMarkup()}
  </div>`;
}

function pageHead(title,description,actions=""){
  return `<div class="page-head"><div><h1>${title}</h1><p>${description}</p></div>${actions?`<div class="head-actions">${actions}</div>`:""}</div>`;
}
function kpi(icon,label,value,change){return `<article class="kpi"><div class="kpi-icon">${icon}</div><label>${label}</label><strong>${value}</strong><small>${change}</small></article>`}

function operatorDashboard(){
  const rows=DATA.lots.map(l=>`<tr onclick="openLot('${l.code}')"><td><strong>${l.code}</strong></td><td>${l.date}</td><td>${l.mode}</td><td>${l.count}</td><td>${badge(l.condition)}</td><td><button class="link-btn">Ver detalle</button></td></tr>`).join("");
  return shell(`<main class="page">
    ${pageHead("Buenas tardes, Carlos","Resumen de tus análisis del 29 de septiembre de 2026.",`<button class="btn btn-primary" onclick="navigate('identify')">＋ Nuevo análisis</button>`)}
    <section class="grid kpi-grid">${kpi("◖","Camarones analizados","144","↑ 12 frente al día anterior")}${kpi("▣","Análisis realizados","3","3 lotes completados")}${kpi("≈","Peso promedio aprox.","10.3 g","Promedio del día")}${kpi("✓","Sin daño","81%","↑ 3% frente a ayer")}</section>
    <section class="grid dashboard-grid">
      <article class="card"><div class="card-head"><div><h2>Distribución por tamaño</h2><p>Resultados de los tres análisis de hoy</p></div></div><div class="chart-bars">
        <div class="bar-group"><div class="bar" style="height:42%"></div><span class="bar-label">Pequeño</span></div>
        <div class="bar-group"><div class="bar" style="height:68%"></div><span class="bar-label">Mediano</span></div>
        <div class="bar-group"><div class="bar alt" style="height:58%"></div><span class="bar-label">Grande</span></div>
      </div></article>
      <article class="card"><div class="card-head"><div><h2>Condición visual</h2><p>Resumen del lote activo</p></div></div><div class="donut-wrap"><div class="donut"></div><div class="legend"><span><i class="dot green"></i>✓ Sin daño · 81%</span><span><i class="dot red"></i>✕ Dañado · 19%</span></div></div></article>
      <article class="card span-2"><div class="card-head"><div><h2>Últimos análisis</h2><p>Selecciona un lote para revisar sus resultados</p></div><button class="btn btn-secondary" onclick="navigate('history')">Ver historial</button></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Lote</th><th>Fecha</th><th>Modo</th><th>Cantidad</th><th>Condición</th><th></th></tr></thead><tbody>${rows}</tbody></table></div></article>
      <div class="span-2">${approximationNotice()}</div>
    </section>
  </main>`);
}

function identifyPage(){
  return shell(`<main class="page">
    ${pageHead("Nuevo análisis","Identifica el lote antes de comenzar la captura.")}${stepper(1)}
    <section class="card flow-card"><div class="card-head"><div><h2>Identificación del lote</h2><p>Los campos marcados son necesarios para guardar el análisis.</p></div></div>
      ${state.duplicateError?`<div class="alert alert-error"><span>✕</span><span><strong>Este código de lote ya existe.</strong><br>Usa uno diferente para continuar.</span></div>`:""}
      <form class="form-grid" onsubmit="event.preventDefault();validateLot()">
        <div class="field ${state.duplicateError?'error':''}"><label for="lot-code">Código de lote *</label><input id="lot-code" value="${state.duplicateError?'LOTE-2026-0929-01':'LOTE-2026-0930-01'}" required><small>Formato: LOTE-AAAA-MMDD-NN</small></div>
        <div class="field"><label for="lot-date">Fecha</label><input id="lot-date" value="29/09/2026" disabled></div>
        <div class="field"><label for="lot-user">Operador</label><input id="lot-user" value="Carlos Murillo" disabled></div>
        <div class="field field-wide"><label for="lot-notes">Notas (opcional)</label><textarea id="lot-notes" placeholder="Agrega información útil sobre la muestra o el lote."></textarea></div>
        <div class="flow-actions field-wide"><button type="button" class="btn btn-secondary" onclick="navigate('dashboard')">Volver al inicio</button><button class="btn btn-primary" type="submit">Continuar</button></div>
      </form>
      <button class="link-btn" onclick="state.duplicateError=true;render()">Simular código duplicado</button>
    </section>
  </main>`);
}
function validateLot(){
  const value=document.querySelector("#lot-code").value.trim();
  if(DATA.lots.some(l=>l.code===value)){state.duplicateError=true;render();return}
  state.duplicateError=false;navigate("capture");
}
function stepper(active){return `<div class="stepper"><div class="step ${active===1?'active':'done'}"><span class="step-number">${active>1?'✓':'1'}</span><span>Identificación</span></div><div class="step ${active===2?'active':active>2?'done':''}"><span class="step-number">${active>2?'✓':'2'}</span><span>Captura</span></div><div class="step ${active===3?'active':''}"><span class="step-number">3</span><span>Resultados</span></div></div>`}

function capturePage(){
  return shell(`<main class="page">${pageHead("Selecciona el método de captura",DATA.activeLot)}${stepper(2)}
    <section class="choice-grid">
      <button class="choice-card" onclick="navigate('image-analysis')"><div><div class="choice-icon">▧</div><h2>Analizar imagen</h2><p>Selecciona una fotografía almacenada en el equipo para simular su procesamiento.</p></div><strong>Elegir imagen</strong></button>
      <button class="choice-card" onclick="navigate('realtime')"><div><div class="choice-icon">▣</div><h2>Detección en vivo</h2><p>Simula el conteo continuo mediante la cámara elegida por el operador.</p></div><strong>Usar cámara</strong></button>
    </section><div class="flow-actions"><button class="btn btn-secondary" onclick="navigate('identify')">Volver a identificación</button></div>
  </main>`);
}

function imageAnalysisPage(){
  if(!state.uploaded)return shell(`<main class="page">${pageHead("Analizar imagen",DATA.activeLot)}${stepper(2)}
    <section class="card flow-card"><div class="upload-zone"><div><div class="upload-icon">⇧</div><h2>Selecciona una imagen de camarones</h2><p>Formatos permitidos: JPG, PNG o WEBP · máximo 10 MB</p><button class="btn btn-teal" onclick="state.uploaded=true;render()">Seleccionar imagen</button></div></div>
    <div class="flow-actions"><button class="btn btn-secondary" onclick="navigate('capture')">Cambiar método</button></div></section></main>`);
  return shell(`<main class="page">${pageHead("Imagen preparada","Revisa la fotografía antes de iniciar el análisis.")}${stepper(2)}
    <section class="analysis-layout"><div class="vision-frame" style="min-height:500px"><img src="${imagePath}" alt="Seis camarones sobre una superficie azul"></div>
      <aside class="card"><h2>Vista previa</h2><div class="metric-list" style="margin:20px 0"><div class="metric-row"><span>Archivo</span><strong>muestra_lote_01.png</strong></div><div class="metric-row"><span>Tamaño</span><strong>2.8 MB</strong></div><div class="metric-row"><span>Estado</span><strong>Lista para analizar</strong></div></div>${approximationNotice()}<div class="camera-actions"><button class="btn btn-secondary" onclick="state.uploaded=false;render()">Cambiar imagen</button><button class="btn btn-primary" onclick="startLoading()">Analizar muestra</button></div></aside>
    </section></main>`);
}
function startLoading(){state.screen="loading";render();setTimeout(()=>navigate("calibration"),1500)}
function loadingPage(){return shell(`<main class="page"><section class="card loading-screen"><div><div class="loader"></div><h1>Analizando muestra...</h1><p>Detectando camarones y preparando los resultados visuales.</p><div class="loading-bar"><span></span></div><small>No cierres esta pantalla.</small></div></section></main>`)}

function calibrationPage(){
  return shell(`<main class="page">${pageHead("Calibración de escala","Define una referencia para estimar longitud y peso.")}${stepper(2)}
    <section class="analysis-layout"><div class="vision-frame"><img src="${imagePath}" alt="Imagen de camarones para calibración"><div style="position:absolute;z-index:3;left:12%;bottom:14%;width:42%;border-top:4px solid #ffdd68"><span style="position:absolute;top:8px;left:40%;background:#ffdd68;padding:5px 10px;border-radius:8px;font-weight:900">Referencia</span></div></div>
      <aside class="card"><h2>Objeto de referencia</h2><p>Indica la medida real del objeto marcado en la escena.</p><div class="field" style="margin:22px 0"><label for="measure">Medida real (cm)</label><input id="measure" type="number" min="0.1" step="0.1" value="10"></div><button class="btn btn-teal btn-block" onclick="calibrate()">Calibrar escala</button><div id="calibration-result" style="margin-top:15px"></div></aside>
    </section></main>`);
}
function calibrate(){document.querySelector("#calibration-result").innerHTML=`<div class="alert alert-success"><span>✓</span><span><strong>Escala calibrada</strong><br>1 px = 0.05 cm</span></div><button class="btn btn-primary btn-block" style="margin-top:12px" onclick="navigate('results')">Continuar a resultados</button>`}

function detectionBoxes(){return `<div class="detect-box" style="left:8%;top:8%;width:45%;height:35%"><span class="detect-label">#1 · Grande · Sin daño</span></div><div class="detect-box" style="left:57%;top:12%;width:36%;height:34%"><span class="detect-label">#2 · Mediano · Sin daño</span></div><div class="detect-box red" style="left:4%;top:48%;width:27%;height:29%"><span class="detect-label">#3 · Pequeño · Dañado</span></div><div class="detect-box" style="left:36%;top:47%;width:38%;height:32%"><span class="detect-label">#4 · Grande · Sin daño</span></div>`}
function realtimePage(){
  if(state.cameraError)return cameraErrorPage();
  return shell(`<main class="page">${pageHead("Detección en vivo","Conteo visual del lote en curso.")}${stepper(2)}
    <section class="analysis-layout"><div class="vision-frame"><img src="${imagePath}" alt="Cámara simulada observando camarones">${detectionBoxes()}<span class="live-badge">● ${state.paused?'Pausado':'En vivo'}</span><select class="camera-select" aria-label="Seleccionar cámara"><option>Camo Camera</option><option>Cámara integrada</option></select><div class="count-line"><span>Contados: 20</span></div></div>
      <aside class="card"><div class="card-head"><div><h2>Resumen en vivo</h2><p>Los datos cambian durante la captura</p></div></div><div class="metric-list"><div class="metric-row"><span>Detectados</span><strong>20</strong></div><div class="metric-row"><span>Peso prom. aprox.</span><strong>10.3 g</strong></div></div><div class="size-bars" style="margin:20px 0"><div class="size-line"><span>Pequeños</span><div class="progress"><span style="width:28%"></span></div><strong>28%</strong></div><div class="size-line"><span>Medianos</span><div class="progress"><span style="width:38%"></span></div><strong>38%</strong></div><div class="size-line"><span>Grandes</span><div class="progress"><span style="width:34%"></span></div><strong>34%</strong></div></div>${approximationNotice()}<div class="camera-actions"><button class="btn btn-secondary" onclick="togglePause()">${state.paused?'Reanudar':'Pausar'}</button><button class="btn btn-primary" onclick="navigate('results')">Finalizar análisis</button></div><button class="link-btn" style="margin-top:15px" onclick="state.cameraError=true;render()">Simular error de cámara</button></aside>
    </section></main>`);
}
function togglePause(){state.paused=!state.paused;render()}
function cameraErrorPage(){
  return shell(`<main class="page">${pageHead("Detección en vivo",DATA.activeLot)}<section class="card empty"><div><div class="empty-icon">▧</div><h1>No se pudo acceder a la cámara</h1><p>Revisa que esté conectada y que el navegador tenga permiso para utilizarla.</p><div class="head-actions" style="justify-content:center;margin-top:22px"><button class="btn btn-secondary" onclick="state.cameraError=false;render()">Reintentar</button><button class="btn btn-teal" onclick="state.cameraError=false;navigate('realtime')">Seleccionar otra cámara</button><button class="btn btn-primary" onclick="state.cameraError=false;navigate('image-analysis')">Analizar imagen</button></div></div></section></main>`);
}

function resultsPage(){
  const filtered=DATA.shrimp.filter(s=>state.filter==="Todos"||s.condition===state.filter);
  const rows=filtered.map(s=>`<tr onclick="state.drawer=${s.id};render()"><td><strong>#${s.id}</strong></td><td>${s.size}</td><td>${s.weight}</td><td>${s.length}</td><td>${badge(s.condition)}</td><td>${s.confidence}</td></tr>`).join("");
  return shell(`<main class="page">${pageHead("Resultados del análisis",DATA.activeLot,`<button class="btn btn-secondary" onclick="state.modal='exit';render()">Salir</button><button class="btn btn-primary" onclick="state.modal='saved';render()">Guardar análisis</button>`)}${stepper(3)}
    <section class="grid kpi-grid">${kpi("◖","Total analizado","47","Ejemplares detectados")}${kpi("✓","Sin daño","38","81% del lote")}${kpi("✕","Dañado","9","19% del lote")}${kpi("≈","Peso prom. aprox.","10.3 g","Estimación visual")}</section>
    <section class="result-grid"><article class="card"><div class="card-head"><div><h2>Imagen procesada</h2><p>Selecciona un registro de la tabla para ver su detalle</p></div></div><div class="vision-frame result-photo"><img src="${imagePath}" alt="Resultado del análisis visual">${detectionBoxes()}</div></article>
      <article class="card"><h2>Distribución del lote</h2><div class="donut-wrap"><div class="donut"></div><div class="legend"><span><i class="dot green"></i>✓ Sin daño · 38</span><span><i class="dot red"></i>✕ Dañado · 9</span></div></div><div class="size-bars"><div class="size-line"><span>Pequeño</span><div class="progress"><span style="width:28%"></span></div><strong>13</strong></div><div class="size-line"><span>Mediano</span><div class="progress"><span style="width:38%"></span></div><strong>18</strong></div><div class="size-line"><span>Grande</span><div class="progress"><span style="width:34%"></span></div><strong>16</strong></div></div></article>
      <article class="card span-2"><div class="card-head"><div><h2>Detalle por camarón</h2><p>Resultados individuales de la muestra</p></div><div class="filter-tabs">${["Todos","Sin daño","Dañado"].map(f=>`<button class="filter-tab ${state.filter===f?'active':''}" onclick="state.filter='${f}';render()">${f}</button>`).join("")}</div></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Camarón</th><th>Tamaño</th><th>Peso aprox.</th><th>Longitud aprox.</th><th>Condición</th><th>Confianza</th></tr></thead><tbody>${rows}</tbody></table></div></article>
      <div class="span-2">${approximationNotice()}</div>
    </section></main>`);
}

function historyPage(){
  const query=state.search.toLowerCase(); const lots=state.empty?[]:DATA.lots.filter(l=>l.code.toLowerCase().includes(query)||l.operator.toLowerCase().includes(query));
  const title=state.role==='operador'?"Mis lotes":state.role==='supervisor'?"Lotes supervisados":"Lotes globales";
  const description=state.role==='operador'?"Consulta los lotes que analizaste y sus resultados.":state.role==='supervisor'?"Revisa los lotes procesados por los operadores de planta.":"Consulta todos los lotes registrados en la plataforma.";
  const emptyAction=state.role==='operador'?`<button class="btn btn-primary" onclick="navigate('identify')">Crear primer análisis</button>`:`<button class="btn btn-secondary" onclick="state.empty=false;render()">Actualizar listado</button>`;
  return shell(`<main class="page">${pageHead(title,description,state.role==='operador'?`<button class="btn btn-primary" onclick="navigate('identify')">＋ Nuevo análisis</button>`:`<button class="btn btn-secondary" onclick="toast('Listado de lotes actualizado')">↻ Actualizar</button>`)}
    <section class="card"><div class="filters"><input aria-label="Buscar" placeholder="Buscar por lote u operador" value="${state.search}" oninput="state.search=this.value;render()"><input type="date" aria-label="Filtrar por fecha"><select aria-label="Condición"><option>Todas las condiciones</option><option>Sin daño</option><option>Dañado</option></select><button class="btn btn-secondary" onclick="state.search='';render()">Limpiar</button></div>
      ${lots.length?`<div class="lot-list">${lots.map(l=>`<article class="lot-card"><div><small>Código del lote</small><strong>${l.code}</strong></div><div><small>Fecha</small><strong>${l.date}</strong></div><div><small>Modo</small><strong>${l.mode}</strong></div><div><small>Cantidad</small><strong>${l.count}</strong></div><div>${badge(l.condition)}</div><button class="btn btn-secondary" onclick="openLot('${l.code}')">Ver detalle</button></article>`).join("")}</div>`:`<div class="empty"><div><div class="empty-icon">▤</div><h2>No hay lotes para mostrar</h2><p>Los lotes disponibles aparecerán en este espacio.</p>${emptyAction}</div></div>`}
    </section><button class="link-btn" onclick="state.empty=!state.empty;render()">${state.empty?'Mostrar datos de ejemplo':'Ver estado vacío'}</button></main>`);
}
function openLot(code){state.modal="lot";state.selectedLot=code;render()}

function reportsPage(){
  const title=state.role==='administrador'?"Reportes globales":"Reportes";
  const description=state.role==='administrador'?"Analiza y exporta los indicadores consolidados de toda la plataforma.":state.role==='supervisor'?"Consulta los reportes consolidados de los lotes supervisados.":"Revisa y descarga los resultados guardados por lote.";
  return shell(`<main class="page">${pageHead(title,description,`<button class="btn btn-secondary" onclick="toast('Filtros de reportes actualizados')">Aplicar filtros</button>`)}
    <section class="grid dashboard-grid"><article class="card"><div class="card-head"><div><h2>Resumen del mes</h2><p>Septiembre de 2026</p></div></div><div class="chart-bars"><div class="bar-group"><div class="bar" style="height:55%"></div><span class="bar-label">Sem. 1</span></div><div class="bar-group"><div class="bar" style="height:75%"></div><span class="bar-label">Sem. 2</span></div><div class="bar-group"><div class="bar" style="height:64%"></div><span class="bar-label">Sem. 3</span></div><div class="bar-group"><div class="bar alt" style="height:84%"></div><span class="bar-label">Sem. 4</span></div></div></article>
    <article class="card"><h2>Reporte disponible</h2><p>LOTE-2026-0929-01</p><div class="metric-list" style="margin:20px 0"><div class="metric-row"><span>Total</span><strong>47</strong></div><div class="metric-row"><span>Sin daño</span><strong>81%</strong></div><div class="metric-row"><span>Peso prom. aprox.</span><strong>10.3 g</strong></div></div><button class="btn btn-primary btn-block" onclick="toast('Descarga simulada del reporte PDF')">Descargar PDF</button></article><div class="span-2">${approximationNotice()}</div></section></main>`);
}

function supervisorDashboard(){
  return shell(`<main class="page">${pageHead("Dashboard de planta","Vista consolidada de los análisis realizados hoy.",`<span class="chip chip-blue">Modo solo lectura</span>`)}
    <section class="grid kpi-grid">${kpi("◖","Camarones procesados","1,248","12 lotes completados")}${kpi("✓","Sin daño promedio","79%","↑ 2% frente a ayer")}${kpi("♙","Operadores activos","4","Turno de la tarde")}${kpi("!","Alertas pendientes","2","Requieren revisión")}</section>
    <section class="grid dashboard-grid"><article class="card"><div class="card-head"><div><h2>Tendencia semanal</h2><p>Porcentaje de ejemplares sin daño</p></div></div><div class="chart-bars"><div class="bar-group"><div class="bar" style="height:68%"></div><span class="bar-label">Lun</span></div><div class="bar-group"><div class="bar" style="height:74%"></div><span class="bar-label">Mar</span></div><div class="bar-group"><div class="bar" style="height:70%"></div><span class="bar-label">Mié</span></div><div class="bar-group"><div class="bar" style="height:79%"></div><span class="bar-label">Jue</span></div><div class="bar-group"><div class="bar alt" style="height:81%"></div><span class="bar-label">Vie</span></div></div></article>
    <article class="card"><h2>Alertas recientes</h2><div class="metric-list" style="margin-top:18px"><div class="metric-row"><span><strong>LOTE-2026-0929-06</strong><br><small>72% sin daño</small></span><span class="chip chip-amber">Pendiente</span></div><div class="metric-row"><span><strong>LOTE-2026-0929-03</strong><br><small>74% sin daño</small></span><span class="chip chip-green">✓ Revisada</span></div></div></article>
    <article class="card span-2"><div class="card-head"><div><h2>Actividad por operador</h2><p>Resumen de la jornada</p></div></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Operador</th><th>Análisis</th><th>Camarones</th><th>Promedio sin daño</th><th>Estado</th></tr></thead><tbody><tr><td>Carlos Murillo</td><td>3</td><td>144</td><td>81%</td><td>${badge('Activo')}</td></tr><tr><td>Ana Ruiz</td><td>4</td><td>186</td><td>84%</td><td>${badge('Activo')}</td></tr><tr><td>José Vera</td><td>2</td><td>91</td><td>78%</td><td>${badge('Activo')}</td></tr></tbody></table></div></article></section></main>`,"Panel de supervisión");
}

function operatorsPage(){
  return shell(`<main class="page">${pageHead("Operadores","Consulta la actividad y el rendimiento del equipo operativo.",`<button class="btn btn-secondary" onclick="toast('Datos de operadores actualizados')">↻ Actualizar</button>`)}
    <section class="grid kpi-grid">${kpi("♙","Operadores activos","4","De 5 asignados al turno")}${kpi("▣","Lotes procesados","12","Durante la jornada")}${kpi("◖","Camarones analizados","1,248","Promedio: 312 por operador")}${kpi("✓","Sin daño promedio","79%","↑ 2% frente a ayer")}</section>
    <section class="card"><div class="filters"><input aria-label="Buscar operador" placeholder="Buscar por nombre"><select aria-label="Turno"><option>Todos los turnos</option><option>Mañana</option><option>Tarde</option></select><select aria-label="Estado"><option>Todos los estados</option><option>Activo</option><option>Inactivo</option></select><button class="btn btn-secondary" onclick="toast('Filtros aplicados')">Filtrar</button></div>
      <div class="table-wrap"><table class="data-table"><thead><tr><th>Operador</th><th>Turno</th><th>Lotes hoy</th><th>Ejemplares</th><th>Sin daño</th><th>Estado</th><th></th></tr></thead><tbody>
        <tr><td><strong>Carlos Murillo</strong><br><small>OP-014</small></td><td>Tarde</td><td>3</td><td>144</td><td>81%</td><td>${badge('Activo')}</td><td><button class="link-btn" onclick="toast('Resumen de Carlos abierto')">Ver actividad</button></td></tr>
        <tr><td><strong>Ana Ruiz</strong><br><small>OP-008</small></td><td>Tarde</td><td>4</td><td>186</td><td>84%</td><td>${badge('Activo')}</td><td><button class="link-btn" onclick="toast('Resumen de Ana abierto')">Ver actividad</button></td></tr>
        <tr><td><strong>José Vera</strong><br><small>OP-021</small></td><td>Mañana</td><td>2</td><td>91</td><td>78%</td><td>${badge('Activo')}</td><td><button class="link-btn" onclick="toast('Resumen de José abierto')">Ver actividad</button></td></tr>
        <tr><td><strong>Elena Cedeño</strong><br><small>OP-019</small></td><td>Mañana</td><td>3</td><td>152</td><td>76%</td><td><span class="chip chip-amber">En pausa</span></td><td><button class="link-btn" onclick="toast('Resumen de Elena abierto')">Ver actividad</button></td></tr>
      </tbody></table></div>
    </section></main>`,"Supervisión");
}

function comparePage(){
  return shell(`<main class="page">${pageHead("Comparar lotes","Contrasta visualmente los resultados de dos lotes supervisados.",`<button class="btn btn-primary" onclick="toast('Comparación exportada como PDF')">Descargar comparación</button>`)}
    <section class="card compare-selector"><div class="field"><label>Lote A</label><select><option>LOTE-2026-0929-01</option><option>LOTE-2026-0927-01</option></select></div><div class="compare-vs">VS</div><div class="field"><label>Lote B</label><select><option>LOTE-2026-0929-02</option><option>LOTE-2026-0927-01</option></select></div><button class="btn btn-teal" onclick="toast('Comparación actualizada')">Comparar</button></section>
    <section class="grid compare-grid">
      <article class="card compare-lot"><span class="compare-label">LOTE A</span><h2>LOTE-2026-0929-01</h2><p>Carlos Murillo · Captura por imagen</p><div class="comparison-metrics"><div><small>Total</small><strong>47</strong></div><div><small>Sin daño</small><strong>81%</strong></div><div><small>Peso aprox.</small><strong>10.3 g</strong></div></div><div class="size-bars"><div class="size-line"><span>Pequeño</span><div class="progress"><span style="width:28%"></span></div><strong>28%</strong></div><div class="size-line"><span>Mediano</span><div class="progress"><span style="width:38%"></span></div><strong>38%</strong></div><div class="size-line"><span>Grande</span><div class="progress"><span style="width:34%"></span></div><strong>34%</strong></div></div></article>
      <article class="card compare-lot"><span class="compare-label orange">LOTE B</span><h2>LOTE-2026-0929-02</h2><p>Carlos Murillo · Captura en tiempo real</p><div class="comparison-metrics"><div><small>Total</small><strong>53</strong></div><div><small>Sin daño</small><strong>77%</strong></div><div><small>Peso aprox.</small><strong>9.8 g</strong></div></div><div class="size-bars"><div class="size-line"><span>Pequeño</span><div class="progress"><span style="width:33%"></span></div><strong>33%</strong></div><div class="size-line"><span>Mediano</span><div class="progress"><span style="width:41%"></span></div><strong>41%</strong></div><div class="size-line"><span>Grande</span><div class="progress"><span style="width:26%"></span></div><strong>26%</strong></div></div></article>
    </section><div class="alert alert-info comparison-note"><span>i</span><span><strong>Resumen comparativo:</strong> El Lote A presenta 4% más ejemplares Sin daño y un peso promedio aproximado 0.5 g mayor que el Lote B.</span></div></main>`,"Comparación de lotes");
}

function alertsPage(){
  return shell(`<main class="page">${pageHead("Alertas","Revisa los lotes que requieren atención del supervisor.",`<button class="btn btn-secondary" onclick="toast('Alertas actualizadas')">↻ Actualizar</button>`)}
    <section class="grid kpi-grid">${kpi("!","Alertas pendientes","2","Requieren revisión")}${kpi("✓","Revisadas hoy","7","Tiempo medio: 12 min")}${kpi("▣","Lotes observados","3","Durante esta semana")}${kpi("◷","Última alerta","16:32","Hace 13 minutos")}</section>
    <section class="card"><div class="filters"><input placeholder="Buscar por lote u operador"><select><option>Todas las prioridades</option><option>Alta</option><option>Media</option></select><select><option>Estado: todos</option><option>Pendiente</option><option>Revisada</option></select><button class="btn btn-secondary" onclick="toast('Filtros de alertas aplicados')">Filtrar</button></div>
      <div class="alert-list">
        <article class="alert-item high"><div class="alert-symbol">!</div><div><div class="alert-title"><strong>Porcentaje de Dañado sobre el umbral</strong><span class="chip chip-red">Prioridad alta</span></div><p>LOTE-2026-0929-06 · 28% Dañado · Operador: Elena Cedeño</p><small>Hoy, 16:32</small></div><button class="btn btn-teal" onclick="state.modal='alert-reviewed';render()">Revisar</button></article>
        <article class="alert-item medium"><div class="alert-symbol">!</div><div><div class="alert-title"><strong>Variación de tamaño fuera del promedio</strong><span class="chip chip-amber">Prioridad media</span></div><p>LOTE-2026-0929-04 · 46% Pequeño · Operador: José Vera</p><small>Hoy, 15:48</small></div><button class="btn btn-teal" onclick="state.modal='alert-reviewed';render()">Revisar</button></article>
        <article class="alert-item done"><div class="alert-symbol">✓</div><div><div class="alert-title"><strong>Conteo atípico del lote</strong><span class="chip chip-green">Revisada</span></div><p>LOTE-2026-0929-03 · Revisión completada por María Torres</p><small>Hoy, 13:10</small></div><button class="btn btn-secondary" onclick="toast('Detalle de alerta abierto')">Ver detalle</button></article>
      </div>
    </section></main>`,"Supervisión");
}

function adminDashboard(){
  return shell(`<main class="page">${pageHead("Dashboard general","Gestiona y supervisa la operación completa de SMART SHRIMP.")}
    <section class="grid kpi-grid">${kpi("♙","Usuarios activos","18","3 perfiles de acceso")}${kpi("▣","Análisis registrados","326","Durante septiembre")}${kpi("◇","Roles configurados","3","Operador, supervisor y administrador")}${kpi("≡","Eventos hoy","42","Sin incidentes críticos")}</section>
    <section class="grid dashboard-grid"><article class="card"><div class="card-head"><div><h2>Accesos recientes</h2><p>Última actividad registrada</p></div></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Usuario</th><th>Rol</th><th>Hora</th><th>Resultado</th></tr></thead><tbody><tr><td>Carlos Murillo</td><td>Operador</td><td>16:45</td><td>${badge('Activo')}</td></tr><tr><td>María Torres</td><td>Supervisor</td><td>16:30</td><td>${badge('Activo')}</td></tr></tbody></table></div></article><article class="card"><h2>Acciones frecuentes</h2><div class="metric-list" style="margin:18px 0"><button class="btn btn-teal" onclick="navigate('users')">Gestionar usuarios</button><button class="btn btn-secondary" onclick="navigate('roles')">Revisar roles y permisos</button><button class="btn btn-secondary" onclick="navigate('activity')">Ver registro de actividad</button></div></article></section></main>`,"Administración");
}

function usersPage(){
  return shell(`<main class="page">${pageHead("Usuarios","Administra las cuentas que pueden ingresar al sistema.",`<button class="btn btn-primary" onclick="state.modal='new-user';render()">＋ Nuevo usuario</button>`)}
    <section class="card"><div class="filters" style="grid-template-columns:2fr 1fr auto"><input placeholder="Buscar por nombre o correo"><select><option>Todos los roles</option><option>Operador</option><option>Supervisor</option><option>Administrador</option></select><button class="btn btn-secondary" onclick="toast('Usuarios filtrados')">Filtrar</button></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
      <tr><td>Carlos Murillo</td><td>carlos@smartshrimp.edu.ec</td><td>Operador</td><td>${badge('Activo')}</td><td><button class="link-btn" onclick="toast('Edición simulada')">Editar</button> · <button class="link-btn" onclick="toast('Contraseña temporal generada')">Restablecer contraseña</button></td></tr>
      <tr><td>María Torres</td><td>maria@smartshrimp.edu.ec</td><td>Supervisor</td><td>${badge('Activo')}</td><td><button class="link-btn" onclick="toast('Edición simulada')">Editar</button> · <button class="link-btn" onclick="toast('Usuario desactivado en el prototipo')">Desactivar</button></td></tr>
      <tr><td>Diego Pérez</td><td>diego@smartshrimp.edu.ec</td><td>Operador</td><td><span class="chip chip-red">Inactivo</span></td><td><button class="link-btn" onclick="toast('Usuario activado en el prototipo')">Activar</button></td></tr>
    </tbody></table></div></section></main>`,"Usuarios");
}

function rolesPage(){
  return shell(`<main class="page">${pageHead("Roles y permisos","Define el alcance de acceso para cada perfil del sistema.",`<button class="btn btn-primary" onclick="state.modal='role-saved';render()">Guardar cambios</button>`)}
    <section class="grid role-summary">
      <article class="card role-card"><div class="role-card-icon">◖</div><div><h3>Operador</h3><p>6 usuarios asignados</p></div><span class="chip chip-blue">Acceso operativo</span></article>
      <article class="card role-card"><div class="role-card-icon">▤</div><div><h3>Supervisor</h3><p>3 usuarios asignados</p></div><span class="chip chip-amber">Consulta y control</span></article>
      <article class="card role-card"><div class="role-card-icon">⚙</div><div><h3>Administrador</h3><p>2 usuarios asignados</p></div><span class="chip chip-green">Acceso completo</span></article>
    </section>
    <section class="card"><div class="card-head"><div><h2>Matriz de permisos</h2><p>Los cambios son únicamente demostrativos en este prototipo.</p></div></div><div class="table-wrap"><table class="data-table permission-table"><thead><tr><th>Módulo</th><th>Operador</th><th>Supervisor</th><th>Administrador</th></tr></thead><tbody>
      ${[["Dashboard",1,1,1],["Nuevo análisis",1,0,1],["Lotes",1,1,1],["Reportes",1,1,1],["Alertas",0,1,1],["Usuarios",0,0,1],["Roles y permisos",0,0,1],["Parámetros",0,0,1]].map(row=>`<tr><td><strong>${row[0]}</strong></td>${row.slice(1).map(on=>`<td><button class="permission-check ${on?'on':''}" onclick="this.classList.toggle('on');this.textContent=this.classList.contains('on')?'✓':'—'" aria-label="Cambiar permiso">${on?'✓':'—'}</button></td>`).join('')}</tr>`).join('')}
    </tbody></table></div></section></main>`,"Administración");
}

function parametersPage(){
  return shell(`<main class="page">${pageHead("Parámetros del sistema","Configura los valores visuales usados durante la simulación de análisis.",`<button class="btn btn-primary" onclick="state.modal='parameters-saved';render()">Guardar parámetros</button>`)}
    <section class="settings-grid">
      <article class="card"><div class="card-head"><div><h2>Clasificación por tamaño</h2><p>Rangos aproximados de longitud.</p></div><span class="settings-icon">↔</span></div><div class="form-grid"><div class="field"><label>Pequeño · máximo (cm)</label><input type="number" value="8.0" step="0.1"></div><div class="field"><label>Mediano · máximo (cm)</label><input type="number" value="11.0" step="0.1"></div><div class="field"><label>Grande · desde (cm)</label><input type="number" value="11.1" step="0.1"></div></div></article>
      <article class="card"><div class="card-head"><div><h2>Evaluación visual</h2><p>Umbrales de confianza del prototipo.</p></div><span class="settings-icon">◎</span></div><div class="form-grid"><div class="field"><label>Confianza mínima de detección</label><div class="range-field"><input type="range" min="50" max="100" value="85" oninput="this.nextElementSibling.textContent=this.value+'%'"><strong>85%</strong></div></div><div class="field"><label>Alerta por porcentaje Dañado</label><div class="range-field"><input type="range" min="5" max="50" value="25" oninput="this.nextElementSibling.textContent=this.value+'%'"><strong>25%</strong></div></div><div class="field"><label>Precisión decimal</label><select><option>1 decimal</option><option>2 decimales</option></select></div></div></article>
      <article class="card"><div class="card-head"><div><h2>Captura y procesamiento</h2><p>Preferencias visuales predeterminadas.</p></div><span class="settings-icon">▣</span></div><div class="form-grid"><div class="field"><label>Resolución de cámara</label><select><option>1920 × 1080</option><option>1280 × 720</option></select></div><div class="field"><label>Formato de imagen</label><select><option>JPG</option><option>PNG</option><option>WEBP</option></select></div><label class="check-row"><input type="checkbox" checked> Mostrar cajas de detección</label><label class="check-row"><input type="checkbox" checked> Mostrar porcentaje de confianza</label></div></article>
      <article class="card"><div class="card-head"><div><h2>Valores actuales</h2><p>Resumen de la configuración activa.</p></div><span class="chip chip-green">Activa</span></div><div class="metric-list"><div class="metric-row"><span>Escala predeterminada</span><strong>0.05 cm/px</strong></div><div class="metric-row"><span>Tamaño máximo de archivo</span><strong>10 MB</strong></div><div class="metric-row"><span>Tiempo máximo simulado</span><strong>60 s</strong></div></div><button class="btn btn-secondary btn-block" style="margin-top:18px" onclick="toast('Valores predeterminados restaurados')">Restaurar valores</button></article>
    </section></main>`,"Administración");
}

function activityPage(){
  return shell(`<main class="page">${pageHead("Registro de actividad","Consulta las acciones realizadas por los usuarios del sistema.",`<button class="btn btn-secondary" onclick="toast('Registro exportado como CSV')">Exportar registro</button>`)}
    <section class="grid kpi-grid">${kpi("≡","Eventos hoy","42","En todos los módulos")}${kpi("♙","Usuarios activos","8","Durante la última hora")}${kpi("✓","Accesos correctos","19","Sin bloqueos")}${kpi("!","Eventos de atención","2","Cambios administrativos")}</section>
    <section class="card"><div class="filters"><input placeholder="Buscar usuario o acción"><select><option>Todos los módulos</option><option>Acceso</option><option>Análisis</option><option>Usuarios</option></select><input type="date" value="2026-09-29"><button class="btn btn-secondary" onclick="toast('Registro filtrado')">Filtrar</button></div>
      <div class="activity-list">
        <article><span class="activity-dot teal"></span><time>16:45</time><div><strong>Carlos Murillo inició sesión</strong><p>Perfil Operador · Equipo PLANTA-03</p></div><span class="chip chip-blue">Acceso</span></article>
        <article><span class="activity-dot orange"></span><time>16:38</time><div><strong>María Torres revisó una alerta</strong><p>LOTE-2026-0929-06 · Perfil Supervisor</p></div><span class="chip chip-amber">Alertas</span></article>
        <article><span class="activity-dot green"></span><time>16:21</time><div><strong>Análisis guardado correctamente</strong><p>LOTE-2026-0929-02 · 53 ejemplares</p></div><span class="chip chip-green">Análisis</span></article>
        <article><span class="activity-dot navy"></span><time>15:54</time><div><strong>Luis Andrade actualizó un usuario</strong><p>Se modificó el rol de la cuenta OP-019</p></div><span class="chip chip-blue">Usuarios</span></article>
        <article><span class="activity-dot teal"></span><time>15:32</time><div><strong>Ana Ruiz descargó un reporte</strong><p>LOTE-2026-0927-01 · Formato PDF</p></div><span class="chip chip-blue">Reportes</span></article>
      </div></section></main>`,"Administración");
}

function profilePage(){return shell(`<main class="page">${pageHead("Mi perfil","Consulta y actualiza la información de tu cuenta.",`<button class="btn btn-primary" onclick="state.modal='profile-saved';render()">Guardar cambios</button>`)}<section class="profile-layout"><section class="card profile-summary"><div class="avatar" style="width:82px;height:82px;font-size:26px">${state.user.split(' ').map(n=>n[0]).slice(0,2).join('')}</div><h2>${state.user}</h2><p>${state.role[0].toUpperCase()+state.role.slice(1)}</p><span class="chip chip-green">Cuenta activa</span><hr><small>Último acceso</small><strong>29/09/2026 · 16:45</strong></section><section class="card"><div class="card-head"><div><h2>Información personal</h2><p>Los cambios son simulados para este prototipo.</p></div></div><div class="form-grid"><div class="field"><label>Nombre completo</label><input value="${state.user}"></div><div class="field"><label>Correo institucional</label><input value="${state.user.toLowerCase().replace(' ','.')}@smartshrimp.edu.ec"></div><div class="field"><label>Rol asignado</label><input value="${state.role}" disabled></div><div class="field"><label>Teléfono</label><input value="+593 98 456 1200"></div></div><div class="card-head profile-security"><div><h2>Seguridad</h2><p>Actualiza tus credenciales de acceso.</p></div><button class="btn btn-secondary" onclick="toast('Solicitud de cambio de contraseña enviada')">Cambiar contraseña</button></div></section></section></main>`)}

function modalMarkup(){
  if(!state.modal)return "";
  if(state.modal==="saved")return `<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true"><div class="modal-icon">✓</div><h2>Lote guardado correctamente</h2><p>Los resultados de ${DATA.activeLot} ya están disponibles en el historial.</p><div class="modal-actions"><button class="btn btn-secondary" onclick="state.modal=null;navigate('reports')">Ver reporte</button><button class="btn btn-primary" onclick="state.modal=null;navigate('dashboard')">Volver al inicio</button></div></section></div>`;
  if(state.modal==="exit")return `<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true"><div class="modal-icon" style="background:#fff3e7;color:var(--orange)">!</div><h2>¿Salir sin guardar?</h2><p>Los resultados actuales se perderán si abandonas esta pantalla.</p><div class="modal-actions"><button class="btn btn-secondary" onclick="state.modal=null;render()">Cancelar</button><button class="btn btn-danger" onclick="state.modal=null;navigate('dashboard')">Salir sin guardar</button></div></section></div>`;
  if(state.modal==="lot")return `<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true"><h2>${state.selectedLot}</h2><p>47 camarones analizados · 81% sin daño · 10.3 g de peso promedio aproximado.</p>${approximationNotice()}<div class="modal-actions"><button class="btn btn-secondary" onclick="state.modal=null;render()">Cerrar</button><button class="btn btn-primary" onclick="toast('Descarga simulada del reporte PDF')">Descargar PDF</button></div></section></div>`;
  if(state.modal==="new-user")return `<div class="modal-backdrop"><form class="modal" onsubmit="event.preventDefault();state.modal='user-created';render()"><h2>Nuevo usuario</h2><p>Crea una cuenta y asigna el nivel de acceso correspondiente.</p><div class="form-grid"><div class="field"><label>Nombre completo</label><input required></div><div class="field"><label>Correo</label><input type="email" required></div><div class="field"><label>Rol</label><select><option>Operador</option><option>Supervisor</option><option>Administrador</option></select></div><div class="field"><label>Contraseña temporal</label><input value="Smart-2026" required></div></div><div class="modal-actions"><button type="button" class="btn btn-secondary" onclick="state.modal=null;render()">Cancelar</button><button class="btn btn-primary">Crear usuario</button></div><button type="button" class="link-btn" onclick="state.modal='email-error';render()">Simular correo registrado</button></form></div>`;
  if(state.modal==="email-error")return `<div class="modal-backdrop"><section class="modal"><div class="alert alert-error"><span>✕</span><span><strong>El correo ya está registrado.</strong><br>Verifica la dirección o utiliza otro correo.</span></div><div class="modal-actions"><button class="btn btn-primary" onclick="state.modal='new-user';render()">Corregir correo</button></div></section></div>`;
  if(state.modal==="user-created")return `<div class="modal-backdrop"><section class="modal"><div class="modal-icon">✓</div><h2>Usuario creado correctamente</h2><p>La cuenta ya puede ingresar con la contraseña temporal.</p><div class="modal-actions"><button class="btn btn-primary" onclick="state.modal=null;render()">Volver a usuarios</button></div></section></div>`;
  if(state.modal==="alert-reviewed")return `<div class="modal-backdrop"><section class="modal"><div class="modal-icon">✓</div><h2>Alerta marcada como revisada</h2><p>La revisión se agregó al registro de actividad del prototipo.</p><div class="modal-actions"><button class="btn btn-primary" onclick="state.modal=null;render()">Continuar</button></div></section></div>`;
  if(state.modal==="role-saved")return `<div class="modal-backdrop"><section class="modal"><div class="modal-icon">✓</div><h2>Permisos actualizados</h2><p>La matriz de permisos se guardó correctamente en esta simulación.</p><div class="modal-actions"><button class="btn btn-primary" onclick="state.modal=null;render()">Aceptar</button></div></section></div>`;
  if(state.modal==="parameters-saved")return `<div class="modal-backdrop"><section class="modal"><div class="modal-icon">✓</div><h2>Parámetros guardados</h2><p>Los nuevos valores ya aparecen como configuración activa del prototipo.</p><div class="modal-actions"><button class="btn btn-primary" onclick="state.modal=null;render()">Aceptar</button></div></section></div>`;
  if(state.modal==="profile-saved")return `<div class="modal-backdrop"><section class="modal"><div class="modal-icon">✓</div><h2>Perfil actualizado</h2><p>Los cambios de la cuenta se guardaron correctamente en el prototipo.</p><div class="modal-actions"><button class="btn btn-primary" onclick="state.modal=null;render()">Aceptar</button></div></section></div>`;
  return "";
}

function drawerMarkup(){
  if(!state.drawer)return ""; const s=DATA.shrimp.find(x=>x.id===state.drawer);
  return `<aside class="drawer" aria-label="Detalle del camarón"><button class="drawer-close" onclick="state.drawer=null;render()">✕</button><p class="chip chip-blue">Detalle individual</p><h2>Camarón #${s.id}</h2><img class="drawer-photo" src="${imagePath}" alt="Recorte visual del camarón ${s.id}"><div class="detail-grid"><div class="detail-item"><small>Tamaño</small><strong>${s.size}</strong></div><div class="detail-item"><small>Condición</small><strong>${s.condition}</strong></div><div class="detail-item"><small>Peso aprox.</small><strong>${s.weight}</strong></div><div class="detail-item"><small>Longitud aprox.</small><strong>${s.length}</strong></div><div class="detail-item"><small>Confianza</small><strong>${s.confidence}</strong></div></div><div style="margin-top:18px">${approximationNotice()}</div></aside>`;
}

function render(){
  const screens={
    profiles:profilesPage,login:loginPage,dashboard:operatorDashboard,identify:identifyPage,capture:capturePage,"image-analysis":imageAnalysisPage,
    loading:loadingPage,calibration:calibrationPage,realtime:realtimePage,results:resultsPage,history:historyPage,reports:reportsPage,
    supervisor:supervisorDashboard,"supervisor-lots":historyPage,operators:operatorsPage,compare:comparePage,alerts:alertsPage,
    admin:adminDashboard,users:usersPage,roles:rolesPage,"global-lots":historyPage,"global-reports":reportsPage,
    parameters:parametersPage,activity:activityPage,profile:profilePage
  };
  app.innerHTML=(screens[state.screen]||loginPage)();
}

render();
