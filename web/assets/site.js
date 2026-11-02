/* ============================================================
   MERIDIAN — shared chrome, shell, icons, demo data
   ============================================================ */
(function(){
  "use strict";
  var API_BASE = (location.port === "3001" || location.protocol === "file:") ? "" : "http://localhost:3001";
  var body = document.body;
  var shell = body.getAttribute("data-shell") || "public"; // public | app
  var page = body.getAttribute("data-page") || "";

  /* ---- surface any uncaught error so a dead button is never silent ---- */
  window.addEventListener("error", function(ev){
    try{ console.error("[Meridian] uncaught:", (ev.error&&ev.error.stack)||ev.message);
      if(window.toast) toast("Script error: "+((ev.error&&ev.error.message)||ev.message||"see console (F12)"),"err"); }catch(_){}
  });
  window.addEventListener("unhandledrejection", function(ev){
    try{ console.error("[Meridian] unhandled promise rejection:", ev.reason); }catch(_){}
  });

  /* ---- fonts ---- */
  var pc1=document.createElement("link"); pc1.rel="preconnect"; pc1.href="https://fonts.googleapis.com"; document.head.appendChild(pc1);
  var pc2=document.createElement("link"); pc2.rel="preconnect"; pc2.href="https://fonts.gstatic.com"; pc2.crossOrigin="anonymous"; document.head.appendChild(pc2);
  var f = document.createElement("link"); f.rel = "stylesheet";
  f.href = "https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500&family=Inter:wght@400;500;600;700;800&display=swap";
  document.head.appendChild(f);

  /* ---- favicon + theme ---- */
  var FAV = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='7' fill='#161524' stroke='#272641'/><path d='M6 22 L13 15 L17 18 L26 9' fill='none' stroke='#5b54e6' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'/><circle cx='26' cy='9' r='2.6' fill='#5b54e6'/></svg>";
  var fv = document.createElement("link"); fv.rel="icon"; fv.type="image/svg+xml"; fv.href="data:image/svg+xml,"+encodeURIComponent(FAV); document.head.appendChild(fv);
  var tc = document.createElement("meta"); tc.name="theme-color"; tc.content="#0B0A12"; document.head.appendChild(tc);

  var MARK = "<svg class='mk' viewBox='0 0 24 24' fill='none'><path d='M3 17 L9 11 L13 14 L21 6' stroke='#5b54e6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/><circle cx='21' cy='6' r='2.3' fill='#5b54e6'/><circle cx='3' cy='17' r='1.5' fill='#6D6691'/></svg>";

  /* ---- icons (lucide-ish) ---- */
  var P = {
    grid:"M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
    trend:"M3 17l6-6 4 4 8-8M15 7h6v6",
    layers:"M12 2l9 5-9 5-9-5 9-5zM3 12l9 5 9-5M3 17l9 5 9-5",
    store:"M3 9l1-5h16l1 5M4 9v11h16V9M4 9h16M9 20v-6h6v6",
    filecheck:"M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M9 15l2 2 4-4",
    shield:"M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6zM9 12l2 2 4-4",
    activity:"M22 12h-4l-3 9L9 3l-3 9H2",
    chart:"M3 3v18h18M7 14v4M12 9v9M17 5v13",
    code:"M16 18l6-6-6-6M8 6l-6 6 6 6",
    settings:"M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z",
    zap:"M13 2L3 14h9l-1 8 10-12h-9z",
    check:"M20 6L9 17l-5-5",
    x:"M18 6L6 18M6 6l12 12",
    pause:"M6 4h4v16H6zM14 4h4v16h-4z", play:"M7 4l13 8-13 8z",
    ext:"M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3",
    copy:"M20 9h-9a2 2 0 00-2 2v9a2 2 0 002 2h9a2 2 0 002-2v-9a2 2 0 00-2-2zM5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1",
    arrow:"M5 12h14M12 5l7 7-7 7",
    coins:"M8 14a6 6 0 100-12 6 6 0 000 12zM16 22a6 6 0 100-12 6 6 0 000 12zM8 8h.01M16 16h.01",
    book:"M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 006.5 22H20V2H6.5A2.5 2.5 0 004 4.5z",
    bell:"M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0",
    chevL:"M15 18l-6-6 6-6", chevR:"M9 18l6-6-6-6",
    bot:"M12 8V4H8M4 8h16v12H4zM2 14h2M20 14h2M9 13v2M15 13v2"
  };
  function ico(n,cls){ return "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round'"+(cls?" class='"+cls+"'":"")+"><path d='"+(P[n]||"")+"'/></svg>"; }
  window.ico = ico;

  /* ============ PUBLIC NAV + FOOTER ============ */
  var PUB = [["marketplace.html","platform","Platform"],["how-it-works.html","how","How It Works"],["security.html","security","Security"],["developers.html","developers","Developers"]];
  function publicNav(){
    return "<header class='nav'><div class='container inner'>"
      + "<a class='brand' href='index.html'>"+MARK+"<span>MERIDIAN</span></a>"
      + "<nav class='navmenu'>"+PUB.map(function(n){return "<a href='"+n[0]+"'"+(n[1]===page?" class='active'":"")+">"+n[2]+"</a>";}).join("")+"</nav>"
      + "<div class='navright'>"
      +   "<span class='netstat' id='netstat'><span class='dot'></span> Connecting…</span>"
      +   "<a href='docs.html' class='small t2'>Docs</a>"
      +   "<a class='btn btn-accent btn-sm' href='app.html'>Launch App</a>"
      +   "<button class='btn btn-ghost btn-icon navtoggle' id='navtoggle'>"+ico("grid")+"</button>"
      + "</div></div>"
      + "<div class='mobilemenu' id='mobmenu' style='display:none;border-top:1px solid var(--border);background:var(--bg-2)'>"
      +   PUB.map(function(n){return "<a href='"+n[0]+"' style='display:block;padding:13px 24px;border-bottom:1px solid var(--border-2);color:var(--text-2)'>"+n[2]+"</a>";}).join("")
      +   "<a href='app.html' style='display:block;padding:13px 24px;color:var(--accent)'>Launch App →</a></div>"
      + "</header>";
  }
  function footer(){
    var col=function(h,items){ return "<div><h4>"+h+"</h4><ul>"+items.map(function(i){return "<li><a href='"+i[1]+"'>"+i[0]+"</a></li>";}).join("")+"</ul></div>"; };
    return "<footer class='footer'><div class='container'>"
      + "<div class='cols'>"
      +  "<div><a class='brand' href='index.html'>"+MARK+"<span>MERIDIAN</span></a>"
      +    "<p class='about'>Agent-native finance infrastructure. Intelligence has a price, execution has limits, and every payment is verifiable on HSK Chain.</p>"
      +    "<div style='margin-top:16px' class='label'>Built for the HSK Chain Horizon Hackathon</div></div>"
      +  col("Platform",[["Overview","app.html"],["Trading Terminal","app-trading.html"],["Agent Marketplace","app-agents.html"],["Policy Vault","app-vault.html"]])
      +  col("Developers",[["Documentation","docs.html"],["Developer Portal","developers.html"],["MCP Servers","developers.html#mcp"],["Architecture","how-it-works.html"]])
      +  col("Security",[["Security Model","security.html"],["PolicyVault","app-vault.html"],["Attestations","app-performance.html"],["Activity Explorer","app-activity.html"]])
      +  col("Resources",[["How It Works","how-it-works.html"],["Marketplace","marketplace.html"],["HSK Explorer ↗","https://testnet-explorer.hskchain.net"],["Status","#"]])
      + "</div>"
      + "<div class='bottom'><span>© 2026 Meridian · Fictional product built for a hackathon. Not financial advice.</span><span class='demo-note'><span class='badge demo'><span class='dot'></span>Demo</span> No live transactions are sent from these pages.</span></div>"
      + "</div></footer>";
  }

  /* ============ APP SHELL ============ */
  var SB = [
    ["OVERVIEW",[["app.html","overview","Overview","grid"],["app-trading.html","trading","Trading Terminal","trend"],["app-positions.html","positions","Positions","layers"],["app-performance.html","performance","Performance & PnL","chart"]]],
    ["NETWORK",[["app-agents.html","agents","Agent Marketplace","store"],["app-mandates.html","mandates","Payment Mandates","filecheck"],["app-vault.html","vault","Policy Vault","shield"],["app-activity.html","activity","Activity Explorer","activity"]]],
    ["SYSTEM",[["developers.html","dev","Developer Tools","code"],["app-settings.html","settings","Settings","settings"]]]
  ];
  var TITLES = { overview:"Overview", trading:"Trading Terminal", positions:"Positions", performance:"Performance & PnL", agents:"Agent Marketplace", mandates:"Payment Mandates", vault:"Policy Vault", activity:"Activity Explorer", settings:"Settings", mandate:"Mandate Detail", agent:"Agent Detail" };
  function sidebar(){
    var nav = SB.map(function(sec){
      return "<div class='sb-sec'>"+sec[0]+"</div>"+sec[1].map(function(i){
        return "<a href='"+i[0]+"'"+(i[1]===page?" class='active'":"")+">"+ico(i[3])+"<span>"+i[2]+"</span></a>";
      }).join("");
    }).join("");
    return "<aside class='sidebar'>"
      + "<div class='sb-top'><a class='brand' href='index.html' style='font-size:16px'>"+MARK+"<span>MERIDIAN</span></a></div>"
      + "<nav class='scrolly'>"+nav+"</nav>"
      + "<div class='sb-bottom'><div class='walletcard' id='walletcard'><div>"+ico("coins")+"</div><div><div class='wa' id='wa'>Connect wallet</div><div class='ws' id='ws'>HSK Chain Testnet · 133</div></div><span class='wd' id='wd'></span></div></div>"
      + "</aside>";
  }
  function topbar(){
    var t = TITLES[page] || "Meridian";
    return "<div class='topbar'>"
      + "<button class='btn btn-ghost btn-icon mobnav' id='mobsb' data-tip='Menu' aria-label='Open menu'>"+ico("grid")+"</button>"
      + "<div class='crumbs'><a href='app.html'>App</a><span>/</span><span class='cur'>"+t+"</span></div>"
      + "<div class='tr'>"
      +   "<span class='badge' id='netbadge'><span class='dot'></span>Connecting…</span>"
      +   "<button class='btn btn-ghost btn-icon' data-tip='Notifications' aria-label='Notifications'>"+ico("bell")+"</button>"
      +   "<button class='btn btn-accent btn-sm' id='connectbtn'>Connect Wallet</button>"
      + "</div></div>";
  }

  /* ---- wallet state (declared early so shell injection can use appContentEl) ---- */
  var account=null, activeProvider=null, appContentEl=null, providers=[];

  /* ---- inject chrome ---- */
  var host = document.getElementById("shell");
  if (shell === "app" && host){
    host.insertAdjacentHTML("beforebegin", ""); // noop
    var wrap = document.createElement("div"); wrap.className="app";
    wrap.innerHTML = sidebar() + "<div class='appmain'>"+topbar()+"<div class='appbody scrolly' id='appbody'></div></div>";
    host.replaceWith(wrap);
    var ab = document.getElementById("appbody");
    var content = document.getElementById("app-content");
    if (content){ ab.appendChild(content); content.style.display="block"; appContentEl=content; showGate(); }
  } else {
    var nh = document.getElementById("site-nav"); if (nh) nh.outerHTML = publicNav();
    var fh = document.getElementById("site-footer"); if (fh) fh.outerHTML = footer();
  }

  /* ---- nav interactions ---- */
  var mt = document.getElementById("navtoggle"), mm = document.getElementById("mobmenu");
  if (mt && mm) mt.addEventListener("click", function(){ mm.style.display = mm.style.display==="none"?"block":"none"; });

  /* ---- mobile sidebar drawer (app) ---- */
  var mobsb = document.getElementById("mobsb"), sb = document.querySelector(".sidebar");
  if (mobsb && sb){
    var scrim = document.createElement("div"); scrim.className="scrim"; document.body.appendChild(scrim);
    function openSb(o){ sb.classList.toggle("open",o); scrim.classList.toggle("on",o); }
    mobsb.addEventListener("click", function(){ openSb(!sb.classList.contains("open")); });
    scrim.addEventListener("click", function(){ openSb(false); });
    sb.querySelectorAll("a").forEach(function(a){ a.addEventListener("click", function(){ openSb(false); }); });
    document.addEventListener("keydown", function(e){ if(e.key==="Escape") openSb(false); });
  }

  /* ---- carousel rails ---- */
  document.querySelectorAll(".carousel").forEach(function(c){
    var rail = c.querySelector(".rail"); if(!rail) return;
    var prev = c.querySelector("[data-dir='prev']"), next = c.querySelector("[data-dir='next']");
    if(prev && !prev.innerHTML.trim()) prev.innerHTML = ico("chevL");
    if(next && !next.innerHTML.trim()) next.innerHTML = ico("chevR");
    function step(){ var it=rail.firstElementChild; return it? it.getBoundingClientRect().width+16 : 300; }
    if(prev) prev.addEventListener("click", function(){ rail.scrollBy({left:-step(),behavior:"smooth"}); });
    if(next) next.addEventListener("click", function(){ rail.scrollBy({left:step(),behavior:"smooth"}); });
    function upd(){ if(prev) prev.disabled = rail.scrollLeft<=2; if(next) next.disabled = rail.scrollLeft >= rail.scrollWidth-rail.clientWidth-2; }
    rail.addEventListener("scroll", upd); setTimeout(upd,60); window.addEventListener("resize", upd);
  });

  /* ---- product walkthrough ---- */
  document.querySelectorAll("[data-walk]").forEach(function(w){
    w.querySelectorAll(".walk-tabs button").forEach(function(b){
      b.addEventListener("click", function(){
        w.querySelectorAll(".walk-tabs button").forEach(function(x){ x.classList.remove("on"); }); b.classList.add("on");
        var s=b.getAttribute("data-slide");
        w.querySelectorAll(".walk-slide").forEach(function(sl){ sl.classList.toggle("on", sl.getAttribute("data-slide")===s); });
      });
    });
  });

  /* ---- reveal ---- */
  var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); } }); }, { threshold:.14, rootMargin:"0px 0px -6% 0px" });
  function obsv(){ document.querySelectorAll(".rv:not(.in)").forEach(function(el){ io.observe(el); }); }
  obsv(); window.MERIDIAN_reveal = obsv;

  /* ---- copy ---- */
  document.addEventListener("click", function(e){
    var cb = e.target.closest(".copybtn, [data-copy]"); if (!cb) return;
    var txt = cb.getAttribute("data-copy") || (cb.closest(".code")||{}).querySelector && cb.closest(".code").querySelector("pre").innerText || "";
    try { navigator.clipboard.writeText(txt); toast("Copied to clipboard","ok"); var o=cb.textContent; cb.textContent="Copied"; setTimeout(function(){cb.textContent=o;},1200); } catch(_){ toast("Copy failed","err"); }
  });

  /* ---- toast ---- */
  var tc2 = document.createElement("div"); tc2.className="toasts"; document.body.appendChild(tc2);
  function toast(msg, kind){ var t=document.createElement("div"); t.className="toast "+(kind||""); t.textContent=msg; tc2.appendChild(t); setTimeout(function(){ t.style.opacity="0"; t.style.transition="opacity .3s"; setTimeout(function(){t.remove();},300); }, 2600); }
  window.toast = toast;

  /* ---- generic tabs ---- */
  document.querySelectorAll("[data-tabs]").forEach(function(group){
    group.querySelectorAll(".tabs button").forEach(function(b){ b.addEventListener("click", function(){
      group.querySelectorAll(".tabs button").forEach(function(x){x.classList.remove("on");}); b.classList.add("on");
      var tgt=b.getAttribute("data-tab"); group.querySelectorAll("[data-panel]").forEach(function(p){ p.style.display = p.getAttribute("data-panel")===tgt?"block":"none"; });
    }); });
  });

  /* ---- wallet: EIP-6963 multi-wallet discovery + HSK + dashboard gate ---- */
  var HSK={ cid:"0x85", id:133, name:"HashKey Chain Testnet", rpc:"https://testnet.hsk.xyz", exp:"https://testnet-explorer.hskchain.net", cur:{name:"HSK",symbol:"HSK",decimals:18} };
  // (account, activeProvider, appContentEl, providers are declared above the shell injection block)
  function short(a){ return a.slice(0,6)+"…"+a.slice(-4); }

  // discover injected wallets (EIP-6963)
  function addProvider(detail){ if(!detail||!detail.provider) return; if(providers.some(function(p){return p.info&&detail.info&&p.info.rdns===detail.info.rdns;})) return; providers.push(detail); }
  window.addEventListener("eip6963:announceProvider", function(e){ addProvider(e.detail); });
  window.dispatchEvent(new Event("eip6963:requestProvider"));
  function allProviders(){
    var list=providers.slice();
    if(window.ethereum && !list.some(function(p){return p.provider===window.ethereum;})){
      var e=window.ethereum, nm=e.isMetaMask?"MetaMask":(e.isCoinbaseWallet?"Coinbase Wallet":(e.isRabby?"Rabby":(e.isTrust?"Trust Wallet":(e.isBraveWallet?"Brave Wallet":"Browser Wallet"))));
      list.push({ info:{ name:nm, rdns:"injected", icon:"" }, provider:e });
    }
    return list;
  }

  function setWallet(a,ok){
    account=a; var wa=document.getElementById("wa"),ws=document.getElementById("ws"),wd=document.getElementById("wd"),cb=document.getElementById("connectbtn"),nb=document.getElementById("netbadge");
    if(a){ if(wa)wa.textContent=short(a); if(ws)ws.textContent=ok?"HashKey Chain · 133":"Wrong network — switch to HSK"; if(wd)wd.style.background=ok?"var(--pos)":"var(--warn)"; if(cb){cb.textContent=short(a);cb.className="btn btn-solid btn-sm";}
      if(nb){ nb.className="badge "+(ok?"ok":"warn"); nb.innerHTML="<span class='dot'></span>"+(ok?"HSK · Connected":"Wrong network"); }
      try{ localStorage.setItem("mrd_wallet", a); }catch(_){}
    } else {
      if(wa)wa.textContent="Connect wallet"; if(cb){cb.textContent="Connect Wallet";cb.className="btn btn-accent btn-sm";} if(wd)wd.style.background="var(--warn)";
      try{ localStorage.removeItem("mrd_wallet"); localStorage.removeItem("mrd_rdns"); }catch(_){}
      if(shell==="app") showGate();
    }
    try{ document.dispatchEvent(new CustomEvent("meridian:wallet",{ detail:{ account:a, onHsk:!!ok } })); }catch(_){}
  }
  async function ensureHsk(eth){
    try{ await eth.request({method:"wallet_switchEthereumChain",params:[{chainId:HSK.cid}]}); return true; }
    catch(err){ var c=err&&(err.code||(err.data&&err.data.originalError&&err.data.originalError.code));
      if(c===4902||c===-32603){ try{ await eth.request({method:"wallet_addEthereumChain",params:[{chainId:HSK.cid,chainName:HSK.name,nativeCurrency:HSK.cur,rpcUrls:[HSK.rpc],blockExplorerUrls:[HSK.exp]}]}); return true; }catch(e){ return false; } }
      return false; }
  }
  async function connectWith(detail){
    var eth=detail.provider; activeProvider=eth; window.__mProvider=eth;
    try{
      var ac=await eth.request({method:"eth_requestAccounts"});
      await ensureHsk(eth);
      var cid=await eth.request({method:"eth_chainId"});
      try{ localStorage.setItem("mrd_rdns", detail.info.rdns||""); }catch(_){}
      setWallet(ac[0], cid===HSK.cid); if(shell==="app") revealApp(); closeWalletModal();
      toast("Connected · "+(detail.info.name||"wallet"),"ok");
      // [M-2 FIX] Re-query chainId at the time accounts change (stale cid closure causes wrong-network state)
      eth.on&&eth.on("accountsChanged",function(x){
        if(x&&x.length){ eth.request({method:"eth_chainId"}).then(function(c){ setWallet(x[0],c===HSK.cid); }).catch(function(){ setWallet(x[0],false); }); }
        else { setWallet(null); }
      });
      eth.on&&eth.on("chainChanged",function(c){ setWallet(account,c===HSK.cid); });
    }catch(e){ toast("Connection rejected","err"); }
  }

  /* ---- WalletConnect v2 (mobile / QR / any wallet) — verified CDN globals ---- */
  // SDK UMD global is window["@walletconnect/ethereum-provider"].EthereumProvider (verified).
  var WC_SRC="https://cdn.jsdelivr.net/npm/@walletconnect/ethereum-provider@2.11.2/dist/index.umd.js";
  var QR_SRC="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
  // ▼▼▼ PASTE YOUR WALLETCONNECT / REOWN PROJECT ID HERE (free at https://cloud.reown.com) ▼▼▼
  var WC_PROJECT_ID = "";
  // ▲▲▲ or set window.MERIDIAN_WC_PROJECT_ID before site.js. Blank = extension wallets only ▲▲▲
  var wcProvider=null, wcInitP=null;
  function wcProjectId(){ return (window.MERIDIAN_WC_PROJECT_ID||WC_PROJECT_ID||"").trim(); }
  function wcEnabled(){ return !!wcProjectId(); }
  function loadScript(src){ return new Promise(function(res,rej){ if(document.querySelector('script[data-src="'+src+'"]')){ res(); return; } var s=document.createElement("script"); s.src=src; s.async=true; s.setAttribute("data-src",src); s.onload=function(){res();}; s.onerror=function(){rej(new Error("failed to load "+src));}; document.head.appendChild(s); }); }

  async function getWC(){
    if(wcProvider) return wcProvider;
    if(wcInitP) return wcInitP;
    var pid=wcProjectId();
    if(!pid) throw new Error("WalletConnect needs a project id — paste one in web/assets/site.js (free at cloud.reown.com).");
    wcInitP=(async function(){
      var ns=window["@walletconnect/ethereum-provider"];
      if(!ns){ await loadScript(WC_SRC); ns=window["@walletconnect/ethereum-provider"]; }
      var EP=ns&&(ns.EthereumProvider||ns.default||ns);
      if(!EP||!EP.init) throw new Error("WalletConnect SDK failed to initialise.");
      var rpcMap={}; rpcMap[HSK.id]=HSK.rpc;
      var p=await EP.init({ projectId:pid, chains:[HSK.id], optionalChains:[HSK.id], showQrModal:false, rpcMap:rpcMap,
        metadata:{ name:"Meridian", description:"Agent-native finance on HSK Chain", url:location.origin, icons:[location.origin+"/favicon.svg"] } });
      p.on("display_uri", showWcQr);
      p.on("disconnect", function(){ if(activeProvider===p){ wcProvider=null; activeProvider=null; window.__mProvider=null; setWallet(null); } });
      wcProvider=p; return p;
    })();
    try{ return await wcInitP; } finally { wcInitP=null; }
  }

  // Our own QR modal (the SDK's bundled modal is unreliable). Always offer copy + deep-link.
  function showWcQr(uri){
    closeWcQr();
    var back=document.createElement("div"); back.className="wmodal-back"; back.id="wcqrback";
    back.innerHTML="<div class='wmodal' style='text-align:center'><h3>Scan with your wallet <span class='x' id='wcqrx'>✕</span></h3>"
      +"<div id='wcqrbox' style='display:flex;justify-content:center;margin:12px auto 14px;min-height:220px;align-items:center'><span class='wr'>Generating QR…</span></div>"
      +"<div class='row' style='justify-content:center;gap:8px'><a class='btn btn-accent btn-sm' href='"+uri+"' id='wcopen'>Open in wallet app</a>"
      +"<button class='btn btn-ghost btn-sm' id='wccopy'>Copy link</button></div></div>";
    document.body.appendChild(back);
    back.addEventListener("click",function(e){ if(e.target.id==="wcqrback"||e.target.id==="wcqrx") closeWcQr(); });
    document.getElementById("wccopy").addEventListener("click",function(){ try{ navigator.clipboard.writeText(uri).then(function(){ toast("Link copied","ok"); }); }catch(_){ toast("Copy failed — select the link","err"); } });
    loadScript(QR_SRC).then(function(){
      var box=document.getElementById("wcqrbox"); if(box&&window.QRCode){ box.innerHTML=""; new window.QRCode(box,{ text:uri, width:220, height:220, correctLevel:(window.QRCode.CorrectLevel||{}).M }); }
    }).catch(function(){ var box=document.getElementById("wcqrbox"); if(box) box.innerHTML="<span class='wr'>Use “Open in wallet app” or copy the link.</span>"; });
  }
  function closeWcQr(){ var b=document.getElementById("wcqrback"); if(b) b.remove(); }

  async function connectWalletConnect(){
    closeWalletModal();
    if(!wcEnabled()){ toast("Add a WalletConnect project id in site.js (free at cloud.reown.com)","err"); return; }
    try{
      toast("Starting WalletConnect…","");
      var wc=await getWC();
      if(!(wc.accounts&&wc.accounts.length)){ await wc.connect(); } // emits display_uri → our QR modal
      closeWcQr();
      await connectWith({ provider:wc, info:{ name:"WalletConnect", rdns:"walletconnect", icon:"" } });
    }catch(e){ closeWcQr(); toast((e&&(e.message||e.reason))||"WalletConnect error","err"); }
  }

  // Silently restore a prior WalletConnect session on reload (if one exists).
  async function restoreWalletConnect(){
    if(!wcEnabled()) return false;
    var has=false; try{ for(var i=0;i<localStorage.length;i++){ if((localStorage.key(i)||"").indexOf("wc@2")===0){ has=true; break; } } }catch(_){}
    if(!has) return false;
    try{ var wc=await getWC(); if(wc.accounts&&wc.accounts.length){ await connectWith({ provider:wc, info:{ name:"WalletConnect", rdns:"walletconnect", icon:"" } }); return true; } }catch(_){}
    return false;
  }

  function openWalletModal(){
    var list=allProviders(), inner;
    var wcRow="<div class='witem' id='wc-item'><div class='wph' style='background:#3b99fc;color:#fff'>WC</div><div><div class='wn'>WalletConnect</div><div class='wr'>Mobile · QR · any wallet</div></div></div>";
    if(!list.length){ inner="<div class='wlist'>"+wcRow+"</div><div class='wnone' style='margin-top:12px'>No browser-extension wallet detected — use WalletConnect above, or install <a class='acc' href='https://metamask.io/download/' target='_blank' style='text-decoration:underline'>MetaMask ↗</a> (or Rabby, Coinbase, Trust) and reload.</div>"; }
    else { inner="<div class='wlist'>"+list.map(function(p,i){
      var icon=p.info.icon?("<img src='"+p.info.icon+"' alt=''/>"):("<div class='wph'>"+(p.info.name||"W").slice(0,2).toUpperCase()+"</div>");
      return "<div class='witem' data-wi='"+i+"'>"+icon+"<div><div class='wn'>"+(p.info.name||"Wallet")+"</div><div class='wr'>"+(p.info.rdns||"injected")+"</div></div>"+((account&&p.provider===activeProvider)?"<span class='badge ok' style='margin-left:auto'><span class='dot'></span>Connected</span>":"")+"</div>";
    }).join("")+wcRow+"</div>"; }
    var header = account
      ? "<div class='witem' style='margin-bottom:10px'><div class='wph' style='background:var(--pos);color:#fff'>✓</div><div style='flex:1'><div class='wn'>Connected</div><div class='wr'>"+short(account)+"</div></div><button class='btn btn-ghost btn-sm' id='wcdisc'>Disconnect</button></div>"
      : "";
    var back=document.createElement("div"); back.className="wmodal-back"; back.id="wmodalback";
    back.innerHTML="<div class='wmodal'><h3>"+(account?"Wallet":"Connect a wallet")+" <span class='x' id='wmx'>✕</span></h3>"+header+inner+"</div>";
    document.body.appendChild(back);
    back.addEventListener("click",function(e){ if(e.target.id==="wmodalback"||e.target.id==="wmx") closeWalletModal(); });
    back.querySelectorAll(".witem[data-wi]").forEach(function(el){ el.addEventListener("click",function(){ connectWith(list[+el.getAttribute("data-wi")]); }); });
    var wi=document.getElementById("wc-item"); if(wi) wi.addEventListener("click", connectWalletConnect);
    var dc=document.getElementById("wcdisc"); if(dc) dc.addEventListener("click",function(){ disconnect(); closeWalletModal(); toast("Wallet disconnected","ok"); setTimeout(openWalletModal,120); });
  }
  function closeWalletModal(){ var b=document.getElementById("wmodalback"); if(b) b.remove(); }
  function disconnect(){
    try{ if(activeProvider&&typeof activeProvider.disconnect==="function") activeProvider.disconnect(); }catch(_){}
    wcProvider=null; activeProvider=null; window.__mProvider=null;
    // Fully purge persisted state so no stale wallet auto-reconnects next load.
    try{ localStorage.removeItem("mrd_wallet"); localStorage.removeItem("mrd_rdns");
      var rm=[]; for(var i=0;i<localStorage.length;i++){ var key=localStorage.key(i); if(key&&(key.indexOf("wc@2")===0||key.toLowerCase().indexOf("walletconnect")>-1)) rm.push(key); }
      rm.forEach(function(key){ try{ localStorage.removeItem(key); }catch(_){} });
    }catch(_){}
    setWallet(null);
  }
  // getProvider exposes the EXACT EIP-6963 provider the user connected, so the
  // client-side signing layer (web3.js) signs with that wallet and no other.
  window.MERIDIAN_wallet={ open:openWalletModal, disconnect:disconnect, getProvider:function(){ return activeProvider; }, getAccount:function(){ return account; } };
  document.addEventListener("click", function(e){
    if(e.target.closest("#connectbtn")||e.target.closest("#walletcard")||e.target.closest("[data-connect]")){ e.preventDefault(); openWalletModal(); }
  });

  // ---- dashboard gate: no wallet, no dashboard ----
  function gateHTML(){
    return "<div class='wgate-card'>"
      + "<div class='mk'>"+MARK+"</div>"
      + "<h1>Connect your wallet</h1>"
      + "<p>Connect an EVM wallet on HashKey Chain to launch the Meridian terminal. Your wallet signs — agents never hold your keys.</p>"
      + "<button class='btn btn-accent btn-lg' data-connect style='width:100%'>Connect Wallet</button>"
      + "<div class='feats'>"
      +   "<div class='feat'>"+ico("shield")+"Policy-bound execution, enforced on-chain</div>"
      +   "<div class='feat'>"+ico("filecheck")+"HSP agent-to-agent payments</div>"
      +   "<div class='feat'>"+ico("chart")+"Verifiable, Auditor-signed performance</div>"
      + "</div>"
      + "<div class='net'><span class='dot' style='display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--accent)'></span> HashKey Chain Testnet · id 133</div>"
      + "</div>";
  }
  // overlay gate: dashboard stays rendered underneath; the gate just covers it until connected
  function showGate(){ if(shell!=="app") return; var g=document.getElementById("wgate"); if(!g){ g=document.createElement("div"); g.id="wgate"; g.className="wgate"; document.body.appendChild(g); } g.innerHTML=gateHTML(); g.style.display="flex"; }
  function revealApp(){ var g=document.getElementById("wgate"); if(g) g.remove(); if(appContentEl) appContentEl.style.display="block"; if(window.MERIDIAN_reveal) window.MERIDIAN_reveal(); }

  async function initWalletGate(){
    if(shell!=="app") return;
    await new Promise(function(r){ setTimeout(r, 320); }); // let EIP-6963 providers announce
    var list=allProviders(); if(!list.length){ if(!(await restoreWalletConnect())) showGate(); return; }
    var want=null; try{ want=localStorage.getItem("mrd_rdns"); }catch(_){}
    if(want==="walletconnect"){ if(await restoreWalletConnect()) return; }
    var ordered=list.slice().sort(function(a,b){ return ((a.info.rdns===want)?0:1)-((b.info.rdns===want)?0:1); });
    for(var i=0;i<ordered.length;i++){
      try{ var accts=await ordered[i].provider.request({method:"eth_accounts"});
        if(accts&&accts.length){ activeProvider=ordered[i].provider; window.__mProvider=ordered[i].provider;
          var cid=await ordered[i].provider.request({method:"eth_chainId"});
          setWallet(accts[0], cid===HSK.cid); revealApp();
          ordered[i].provider.on&&ordered[i].provider.on("accountsChanged",function(x){ x&&x.length?setWallet(x[0],true):setWallet(null); });
          ordered[i].provider.on&&ordered[i].provider.on("chainChanged",function(c){ setWallet(account,c===HSK.cid); });
          return; }
      }catch(_){}
    }
    if(!(await restoreWalletConnect())) showGate();
  }
  initWalletGate();

  /* ---- demo data (shared) ---- */
  window.MERIDIAN = {
    API_BASE: API_BASE, ico: ico, toast: toast, connect: openWalletModal,
    agents: [
      { id:"strategist", av:"ST", nm:"Strategist", ty:"User-owned · Coordinator", owned:true, price:"—", rep:"—", attest:"—", status:"Active", desc:"Your agent. Compiles natural-language policy, coordinates signal/risk/execution, and authorizes HSP payments within your limits." },
      { id:"alphaflow", av:"SG", nm:"AlphaFlow Signal", ty:"Signal · Market intelligence", price:"0.05 USDT / call", rep:890, attest:342, status:"Available", desc:"Cross-pool spread, arbitrage and on-chain flow intelligence with confidence scoring and expected slippage." },
      { id:"sentinel", av:"RK", nm:"Sentinel Risk", ty:"Risk · Evaluation", price:"0.02 USDT / check", rep:940, attest:410, status:"Available", desc:"Evaluates slippage, liquidity depth, exposure and token risk. Can resize or veto a proposed trade before execution." },
      { id:"flashroute", av:"EX", nm:"FlashRoute Execution", ty:"Execution · Routing", price:"5 bps of notional", rep:915, attest:289, status:"Available", desc:"Plans multi-hop routes and order splitting across pools to reduce execution cost and MEV exposure." },
      { id:"veritas", av:"AU", nm:"Veritas Auditor", ty:"Auditor · Verification", price:"1.00 USDT / epoch", rep:980, attest:85, status:"Available", desc:"Reviews trade records and produces signed epoch performance attestations that back verifiable reporting." }
    ],
    mandates: [
      { id:"MND-7F3A21", payer:"Vault", payee:"AlphaFlow", purpose:"Signal request", amount:"0.05", token:"USDT", expiry:"in 58s", status:"Settled", tx:"0x9c2f…a41b" },
      { id:"MND-7F3A1E", payer:"Vault", payee:"Sentinel", purpose:"Risk check", amount:"0.02", token:"USDT", expiry:"in 61s", status:"Settled", tx:"0x3ab8…7d02" },
      { id:"MND-7F3A0C", payer:"Vault", payee:"FlashRoute", purpose:"Execution fee", amount:"0.11", token:"USDT", expiry:"in 44s", status:"Pending", tx:"—" },
      { id:"MND-7F39F7", payer:"Vault", payee:"Veritas", purpose:"Epoch attestation", amount:"1.00", token:"USDT", expiry:"expired", status:"Rejected", tx:"—" },
      { id:"MND-7F39E2", payer:"Vault", payee:"AlphaFlow", purpose:"Signal request", amount:"0.05", token:"USDT", expiry:"in 59s", status:"Settled", tx:"0x1f7c…9e55" }
    ],
    activity: [
      { k:"acc", ic:"zap", t:"<b>Signal requested</b> from AlphaFlow Signal", m:["Strategist","0.05 USDT","0x9c2f…a41b"], time:"12s ago" },
      { k:"ok", ic:"shield", t:"<b>Risk assessment completed</b> — APPROVED", m:["Sentinel Risk","slippage 0.4%"], time:"11s ago" },
      { k:"acc", ic:"filecheck", t:"<b>Payment mandate authorized</b>", m:["MND-7F3A21","nonce 412"], time:"10s ago" },
      { k:"ok", ic:"check", t:"<b>HSP settlement confirmed</b>", m:["0x9c2f…a41b","HSK Chain"], time:"9s ago" },
      { k:"ok", ic:"trend", t:"<b>Swap executed</b> HSK → USDT", m:["FlashRoute","+12.4 USDT"], time:"8s ago" },
      { k:"acc", ic:"chart", t:"<b>Auditor attestation recorded</b>", m:["Epoch 42","Veritas"], time:"2m ago" },
      { k:"err", ic:"x", t:"<b>Trade rejected</b> — exceeds per-trade cap", m:["PolicyVault","requested 640 USDT"], time:"6m ago" }
    ]
  };

  /* ---- shared render helpers ---- */
  window.MERIDIAN.curve = function(el, pts, h){
    if(!el) return; var w=600; h=h||170;
    var max=Math.max.apply(0,pts), min=Math.min.apply(0,pts), rng=(max-min)||1, sx=w/(pts.length-1);
    var d=pts.map(function(p,i){ return (i?"L":"M")+(i*sx).toFixed(1)+" "+(h-10-((p-min)/rng)*(h-26)).toFixed(1); }).join(" ");
    var up=pts[pts.length-1]>=pts[0], col=up?"#12805c":"#c23b2b";
    el.innerHTML="<svg viewBox='0 0 "+w+" "+h+"' preserveAspectRatio='none' style='height:"+h+"px;width:100%'>"
      +"<defs><linearGradient id='grad' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='"+col+"' stop-opacity='.22'/><stop offset='1' stop-color='"+col+"' stop-opacity='0'/></linearGradient></defs>"
      +"<path d='"+d+" L"+w+" "+h+" L0 "+h+" Z' fill='url(#grad)'/><path d='"+d+"' fill='none' stroke='"+col+"' stroke-width='1.6'/></svg>";
  };
  window.MERIDIAN.renderFeed = function(el, items){
    if(!el) return; el.innerHTML = items.map(function(e){
      return "<div class='ev "+e.k+"'><div class='ic'>"+ico(e.ic)+"</div><div class='body'><div class='t'>"+e.t+"</div><div class='m'>"+e.m.map(function(x){return x.indexOf('0x')===0?"<span class='hash'>"+x+"</span>":x;}).join(" · ")+"</div></div><div class='time'>"+e.time+"</div></div>";
    }).join("");
  };
  window.MERIDIAN.stBadge = function(s){ var m={Settled:"ok",Pending:"warn",Rejected:"err",Available:"ok",Active:"live",Approved:"ok",Veto:"err"}; return "<span class='badge "+(m[s]||"muted")+"'><span class='dot'></span>"+s+"</span>"; };

  /* ============ BACKEND DATA LAYER ============ */
  var M = window.MERIDIAN;
  M.online = false;
  M.fetchJSON = function(path, opts){ return fetch(API_BASE+path, Object.assign({ headers:{ "Content-Type":"application/json" } }, opts||{})).then(function(r){ if(!r.ok) throw new Error(r.status); return r.json(); }); };
  function num(n){ return (Math.round(n*100)/100).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2}); }
  M.fmt = num;

  var roleMap = { SIGNAL:{av:"SG",ty:"Signal · Market intelligence",desc:"Cross-pool spread, arbitrage and on-chain flow intelligence."},
    RISK:{av:"RK",ty:"Risk · Evaluation",desc:"Evaluates slippage, liquidity depth, exposure and token risk; can resize or veto."},
    EXECUTION:{av:"EX",ty:"Execution · Routing",desc:"Plans multi-hop routes and order splitting to reduce execution cost and MEV."},
    AUDITOR:{av:"AU",ty:"Auditor · Verification",desc:"Reviews trade records and produces signed epoch performance attestations."},
    STRATEGIST:{av:"ST",ty:"User-owned · Coordinator",desc:"Your agent. Compiles policy and authorizes payments within your limits."} };
  function mapAgent(a){ var r=roleMap[a.role]||{av:(a.name||"AG").slice(0,2).toUpperCase(),ty:a.role,desc:a.pricingDescription||""};
    return { id:(a.address||a.name||"").slice(0,10).replace(/^0x/,"")||a.role, av:r.av, nm:a.name, ty:r.ty, price:a.pricingDescription||"—", rep:a.score, attest:a.tasksCompleted, status:a.isActive?"Available":"Offline", desc:r.desc, address:a.address }; }
  function mapMandate(m){ var exp = m.settledAt? "settled" : "—"; var tok = (m.token||"").indexOf("usdt")>-1?"USDT":(m.token||"USDT");
    return { id:(m.orderId||m.mandateHash||"MND").slice(0,10), payer:"Vault", payee:(m.payee||"").slice(0,8), purpose:"Agent payment", amount:(Number(m.amount||0)/1e6).toFixed(2), token:tok, expiry:exp, status:({SETTLED:"Settled",PENDING:"Pending",FAILED:"Rejected"})[m.status]||m.status||"Settled", tx:m.txHash||"—" }; }
  var evMap = { SIGNAL_GENERATED:["acc","zap","<b>Signal requested</b>"], RISK_ASSESSED:["ok","shield","<b>Risk assessment completed</b>"],
    MANDATE_SETTLED:["ok","filecheck","<b>Payment mandate settled</b>"], TRADE_EXECUTED:["ok","trend","<b>Swap executed</b>"],
    ATTESTATION_PUBLISHED:["acc","chart","<b>Auditor attestation recorded</b>"], POLICY_UPDATED:["acc","shield","<b>Policy updated</b>"],
    LOOP_STATUS:["acc","activity","<b>Trade loop</b>"] };
  function mapEvent(e){ var d=evMap[e.type]||["acc","activity","<b>"+(e.type||"Event").replace(/_/g," ").toLowerCase()+"</b>"];
    var m=[]; var p=e.payload||{}; if(p.txHash)m.push(p.txHash.slice(0,10)+"…"); if(p.payee)m.push(String(p.payee).slice(0,10)); if(p.amount)m.push((Number(p.amount)/1e6).toFixed(2)+" USDT"); if(p.pair)m.push(p.pair);
    var ago = e.timestamp? Math.max(1,Math.round((Date.now()-e.timestamp)/1000)) : 0;
    return { k:d[0], ic:d[1], t:d[2], m:m.length?m:["Meridian"], time: ago? (ago<60?ago+"s ago":Math.round(ago/60)+"m ago"):"" }; }

  M.getAgents = function(){ return M.fetchJSON("/api/agents").then(function(l){ if(!Array.isArray(l)||!l.length) throw 0; return [M.agents[0]].concat(l.map(mapAgent)); }).catch(function(){ return M.agents; }); };
  M.getMandates = function(){ return M.fetchJSON("/api/mandates").then(function(l){ return (Array.isArray(l)&&l.length)? l.map(mapMandate) : M.mandates; }).catch(function(){ return M.mandates; }); };
  M.getActivity = function(){ return M.fetchJSON("/api/events?limit=25").then(function(l){ return (Array.isArray(l)&&l.length)? l.map(mapEvent) : M.activity; }).catch(function(){ return M.activity; }); };
  M.getPnl = function(){ return M.fetchJSON("/api/pnl").catch(function(){ return null; }); };
  M.getPositions = function(){ return M.fetchJSON("/api/positions").catch(function(){ return null; }); };
  M.getPolicy = function(){ return M.fetchJSON("/api/policy").catch(function(){ return null; }); };
  M.chat = function(msg){ return M.fetchJSON("/api/chat",{ method:"POST", body:JSON.stringify({ message:msg }) }); };
  M.loop = function(path){ return M.fetchJSON(path,{ method:"POST", body:"{}" }); };

  function setStatus(online){
    M.online = online;
    var nb=document.getElementById("netbadge"), ns=document.getElementById("netstat");
    if(nb && !account){ nb.className="badge "+(online?"ok":"warn"); nb.innerHTML="<span class='dot'></span>"+(online?"HSK · Connected":"Backend offline"); }
    if(ns){ ns.innerHTML="<span class='dot' style='background:"+(online?"var(--accent)":"var(--warn)")+"'></span> "+(online?"Network live · HSK Chain":"Backend offline"); }
    document.dispatchEvent(new CustomEvent("meridian:status",{ detail:{ online:online } }));
  }
  M.fetchJSON("/api/health").then(function(){ setStatus(true); connectWS(); }).catch(function(){ setStatus(false); });

  /* ---- live WebSocket feed ---- */
  var wsListeners=[];
  M.onEvent = function(cb){ wsListeners.push(cb); };
  function connectWS(){
    try{
      var proto = location.protocol==="https:"?"wss:":"ws:";
      var host = API_BASE ? API_BASE.replace(/^https?:/,proto) : proto+"//"+location.host;
      var ws = new WebSocket(host.replace(/\/$/,"")+"/ws");
      ws.onmessage = function(m){ try{ var d=JSON.parse(m.data); var ev=mapEvent({ type:d.type, payload:d.data, timestamp:d.timestamp||Date.now() }); wsListeners.forEach(function(cb){ cb(ev,d); }); }catch(_){} };
      ws.onclose = function(){ setTimeout(connectWS, 5000); };
    }catch(e){}
  }
})();
