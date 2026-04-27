import { useState, useEffect, useRef } from "react";

function FontLoader() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@300;400;500&family=Instrument+Serif:ital@0;1&display=swap";
    document.head.appendChild(link);
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.cursor = "none";
    document.body.style.overflowX = "hidden";
  }, []);
  return null;
}

function Cursor() {
  const dot = useRef(null);
  const ring = useRef(null);
  const pos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const hovered = useRef(false);

  useEffect(() => {
    const move = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (dot.current) dot.current.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 4}px)`;
    };
    const over = (e) => { hovered.current = e.target.closest("a,button,[data-hover]") != null; };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    let raf;
    const lerp = (a, b, t) => a + (b - a) * t;
    const loop = () => {
      ringPos.current.x = lerp(ringPos.current.x, pos.current.x, 0.1);
      ringPos.current.y = lerp(ringPos.current.y, pos.current.y, 0.1);
      if (ring.current) {
        const sc = hovered.current ? 2.2 : 1;
        ring.current.style.transform = `translate(${ringPos.current.x - 18}px, ${ringPos.current.y - 18}px) scale(${sc})`;
        ring.current.style.borderColor = hovered.current ? "#D4873A" : "rgba(212,135,58,0.5)";
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseover", over); cancelAnimationFrame(raf); };
  }, []);

  return (
    <>
      <div ref={dot} style={{ position:"fixed",top:0,left:0,width:8,height:8,borderRadius:"50%",background:"#D4873A",pointerEvents:"none",zIndex:9999,mixBlendMode:"difference" }} />
      <div ref={ring} style={{ position:"fixed",top:0,left:0,width:36,height:36,borderRadius:"50%",border:"1.5px solid rgba(212,135,58,0.5)",pointerEvents:"none",zIndex:9998,transition:"transform 0.08s ease, border-color 0.2s" }} />
    </>
  );
}

function TiltCard({ children, style, intensity = 16 }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * intensity;
    const y = -((e.clientY - r.top) / r.height - 0.5) * intensity;
    el.style.transform = `perspective(900px) rotateX(${y}deg) rotateY(${x}deg) translateZ(14px)`;
  };
  const onLeave = () => { if (ref.current) ref.current.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0px)"; };
  return <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} style={{ transition:"transform 0.15s ease", transformStyle:"preserve-3d", ...style }}>{children}</div>;
}

function WireframeCube({ size = 80, color = "rgba(212,135,58,0.3)", speed = 8 }) {
  const id = useRef(`c${Math.random().toString(36).slice(2,7)}`).current;
  useEffect(() => {
    const s = document.createElement("style");
    s.id = id + "-style";
    s.textContent = `@keyframes ${id}{from{transform:rotateX(0deg) rotateY(0deg)}to{transform:rotateX(360deg) rotateY(360deg)}}.${id}{animation:${id} ${speed}s linear infinite}`;
    document.head.appendChild(s);
    return () => { const el = document.getElementById(id + "-style"); if(el) el.remove(); };
  }, []);
  const h = size / 2;
  const face = (tf) => ({ position:"absolute",width:size,height:size,border:`1px solid ${color}`,transform:tf });
  return (
    <div style={{ width:size,height:size,perspective:600 }}>
      <div className={id} style={{ width:size,height:size,position:"relative",transformStyle:"preserve-3d" }}>
        <div style={face(`rotateY(0deg) translateZ(${h}px)`)} />
        <div style={face(`rotateY(90deg) translateZ(${h}px)`)} />
        <div style={face(`rotateY(180deg) translateZ(${h}px)`)} />
        <div style={face(`rotateY(-90deg) translateZ(${h}px)`)} />
        <div style={face(`rotateX(90deg) translateZ(${h}px)`)} />
        <div style={face(`rotateX(-90deg) translateZ(${h}px)`)} />
      </div>
    </div>
  );
}

function ParticleField() {
  const canvas = useRef(null);
  useEffect(() => {
    const c = canvas.current; if (!c) return;
    const ctx = c.getContext("2d");
    const resize = () => { c.width = c.offsetWidth; c.height = c.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    const pts = Array.from({ length: 55 }, () => ({
      x: Math.random() * c.width, y: Math.random() * c.height,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.4 + 0.4,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > c.width) p.vx *= -1;
        if (p.y < 0 || p.y > c.height) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(212,135,58,0.45)"; ctx.fill();
      });
      pts.forEach((a, i) => pts.slice(i + 1).forEach(b => {
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 110) {
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(212,135,58,${0.1 * (1 - d / 110)})`; ctx.lineWidth = 0.5; ctx.stroke();
        }
      }));
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvas} style={{ position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none" }} />;
}

function SkillOrb({ label, icon, delay = 0 }) {
  const id = `orb${delay}`;
  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = `@keyframes ${id}{0%,100%{transform:translateY(0px)}50%{transform:translateY(-10px)}}.${id}{animation:${id} ${3 + delay * 0.3}s ease-in-out ${delay * 0.25}s infinite}`;
    document.head.appendChild(s);
  }, []);
  return (
    <div className={id} style={{ width:76,height:76,borderRadius:"50%",background:"linear-gradient(135deg,#1a1610 0%,#252015 100%)",border:"1px solid rgba(212,135,58,0.22)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,boxShadow:"0 8px 20px rgba(0,0,0,0.5),inset 0 1px 0 rgba(212,135,58,0.08)" }}>
      <span style={{ fontSize:18 }}>{icon}</span>
      <span style={{ fontFamily:"'DM Mono',monospace",fontSize:7,color:"#D4873A",letterSpacing:1,textAlign:"center" }}>{label}</span>
    </div>
  );
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const fn = () => setScrolled(window.scrollY > 50); window.addEventListener("scroll", fn); return () => window.removeEventListener("scroll", fn); }, []);
  return (
    <nav style={{ position:"fixed",top:0,left:0,right:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 52px",background:scrolled?"rgba(10,10,10,0.95)":"transparent",backdropFilter:scrolled?"blur(16px)":"none",borderBottom:scrolled?"1px solid rgba(212,135,58,0.07)":"none",transition:"all 0.4s ease" }}>
      <div style={{ display:"flex",alignItems:"center",gap:10 }}>
        <WireframeCube size={26} color="rgba(212,135,58,0.5)" speed={6} />
        <span style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:20,letterSpacing:4,color:"#D4873A" }}>ZR</span>
      </div>
      <div style={{ display:"flex",gap:32,alignItems:"center" }}>
        {["Projects","Events","Certificates","Contact"].map(n => (
          <a key={n} href={`#${n.toLowerCase()}`} data-hover style={{ color:"#4a4a4a",textDecoration:"none",fontSize:11,fontFamily:"'DM Mono',monospace",letterSpacing:2,textTransform:"uppercase",transition:"color 0.2s" }}
            onMouseEnter={e=>e.target.style.color="#D4873A"} onMouseLeave={e=>e.target.style.color="#4a4a4a"}>{n}</a>
        ))}
        <a href="#contact" data-hover style={{ fontFamily:"'DM Mono',monospace",fontSize:11,letterSpacing:2,textTransform:"uppercase",color:"#0A0A0A",background:"#D4873A",textDecoration:"none",padding:"9px 18px",borderRadius:2,transition:"opacity 0.2s" }}
          onMouseEnter={e=>e.target.style.opacity="0.82"} onMouseLeave={e=>e.target.style.opacity="1"}>Hire Me</a>
      </div>
    </nav>
  );
}

function Hero() {
  const [mouse, setMouse] = useState({ x:0, y:0 });
  const [typed, setTyped] = useState("");
  const roles = ["Blue Team Analyst","IoT Developer","SOC Enthusiast","Embedded Systems Builder","Cybersecurity Student"];
  const rI = useRef(0), cI = useRef(0), del = useRef(false);

  useEffect(() => {
    const fn = (e) => setMouse({ x: e.clientX/window.innerWidth - 0.5, y: e.clientY/window.innerHeight - 0.5 });
    window.addEventListener("mousemove", fn);
    return () => window.removeEventListener("mousemove", fn);
  }, []);

  useEffect(() => {
    let t;
    const tick = () => {
      const role = roles[rI.current];
      if (!del.current) {
        setTyped(role.slice(0, cI.current + 1)); cI.current++;
        if (cI.current === role.length) { del.current = true; t = setTimeout(tick, 1600); return; }
      } else {
        setTyped(role.slice(0, cI.current - 1)); cI.current--;
        if (cI.current === 0) { del.current = false; rI.current = (rI.current + 1) % roles.length; }
      }
      t = setTimeout(tick, del.current ? 38 : 75);
    };
    t = setTimeout(tick, 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <section style={{ minHeight:"100vh",display:"flex",alignItems:"center",padding:"0 52px",position:"relative",overflow:"hidden",background:"#0A0A0A" }}>
      <ParticleField />
      <div style={{ position:"absolute",inset:0,opacity:0.032,pointerEvents:"none",backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,backgroundSize:"180px" }} />
      <div style={{ position:"absolute",width:700,height:700,borderRadius:"50%",background:"radial-gradient(circle,rgba(212,135,58,0.055) 0%,transparent 65%)",right:"5%",top:"50%",transform:`translate(${mouse.x*-40}px,${mouse.y*-40-350}px)`,transition:"transform 0.4s ease",pointerEvents:"none" }} />
      {[{t:28,l:28,bT:"1px solid rgba(212,135,58,0.3)",bL:"1px solid rgba(212,135,58,0.3)"},{t:28,r:28,bT:"1px solid rgba(212,135,58,0.3)",bR:"1px solid rgba(212,135,58,0.3)"},{b:28,l:28,bB:"1px solid rgba(212,135,58,0.3)",bL:"1px solid rgba(212,135,58,0.3)"},{b:28,r:28,bB:"1px solid rgba(212,135,58,0.3)",bR:"1px solid rgba(212,135,58,0.3)"}].map((s,i)=>(
        <div key={i} style={{ position:"absolute",width:30,height:30,top:s.t,bottom:s.b,left:s.l,right:s.r,borderTop:s.bT,borderBottom:s.bB,borderLeft:s.bL,borderRight:s.bR }} />
      ))}

      <div style={{ maxWidth:1200,width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",gap:60,position:"relative",zIndex:2 }}>
        <div style={{ flex:1 }}>
          <p style={{ fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:4,color:"#D4873A",textTransform:"uppercase",marginBottom:18 }}>Hello, I'm</p>
          <h1 style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(62px,8.5vw,108px)",lineHeight:0.9,color:"#F0EDE8",margin:"0 0 10px",letterSpacing:2 }}>
            Ziaur<br />
            <span style={{ WebkitTextStroke:"1px rgba(212,135,58,0.55)",color:"transparent" }}>Rahaman</span>
            <span style={{ color:"#D4873A" }}>.</span>
          </h1>
          <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:18,height:26 }}>
            <span style={{ fontFamily:"'DM Mono',monospace",fontSize:13,color:"#D4873A" }}>{typed}</span>
            <span style={{ width:2,height:16,background:"#D4873A",display:"inline-block",animation:"blink 1s step-end infinite" }} />
          </div>
          <p style={{ fontFamily:"'Instrument Serif',serif",fontSize:17,color:"#5a5a5a",maxWidth:480,lineHeight:1.75,marginBottom:34 }}>
            B.Tech student at KIIT University building real-world cyber defenses — honeypots, SIEMs, firewall labs, and award-winning IoT systems.
          </p>
          <div style={{ display:"flex",gap:14,alignItems:"center",flexWrap:"wrap",marginBottom:32 }}>
            <button data-hover style={{ background:"#D4873A",color:"#0A0A0A",border:"none",padding:"13px 28px",fontFamily:"'DM Mono',monospace",fontSize:11,letterSpacing:2,textTransform:"uppercase",cursor:"pointer",borderRadius:2,fontWeight:700,transition:"all 0.2s" }}
              onMouseEnter={e=>{e.target.style.background="#bf7830";e.target.style.transform="translateY(-2px)"}} onMouseLeave={e=>{e.target.style.background="#D4873A";e.target.style.transform="none"}}>View My Work</button>
            <button data-hover style={{ background:"transparent",color:"#F0EDE8",border:"1px solid rgba(240,237,232,0.16)",padding:"13px 28px",fontFamily:"'DM Mono',monospace",fontSize:11,letterSpacing:2,textTransform:"uppercase",cursor:"pointer",borderRadius:2,transition:"all 0.2s" }}
              onMouseEnter={e=>{e.target.style.borderColor="#D4873A";e.target.style.color="#D4873A"}} onMouseLeave={e=>{e.target.style.borderColor="rgba(240,237,232,0.16)";e.target.style.color="#F0EDE8"}}>Get in Touch</button>
          </div>
          <div style={{ display:"flex",gap:18,alignItems:"center" }}>
            <span style={{ fontFamily:"'DM Mono',monospace",fontSize:10,color:"#303030",letterSpacing:1 }}>Kolkata, West Bengal</span>
            <span style={{ width:4,height:4,borderRadius:"50%",background:"#D4873A",display:"inline-block" }} />
            <span style={{ fontFamily:"'DM Mono',monospace",fontSize:10,color:"#3a3a3a",letterSpacing:1 }}>Open to Internships</span>
          </div>
        </div>

        {/* Hero card with floating cubes */}
        <div style={{ flexShrink:0,position:"relative",width:320 }}>
          <div style={{ position:"absolute",top:-36,right:-16,opacity:0.65 }}><WireframeCube size={52} color="rgba(212,135,58,0.4)" speed={7} /></div>
          <div style={{ position:"absolute",bottom:-18,left:-28,opacity:0.45 }}><WireframeCube size={36} color="rgba(212,135,58,0.28)" speed={11} /></div>
          <div style={{ position:"absolute",top:"38%",right:-38,opacity:0.35 }}><WireframeCube size={22} color="rgba(212,135,58,0.22)" speed={9} /></div>
          <TiltCard style={{ width:"100%" }}>
            <div style={{ width:"100%",height:390,borderRadius:4,background:"linear-gradient(145deg,#141210 0%,#0c0c0c 100%)",border:"1px solid rgba(212,135,58,0.14)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden",boxShadow:"0 28px 70px rgba(0,0,0,0.65)" }}>
              <div style={{ position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,transparent,#D4873A,transparent)" }} />
              <div style={{ position:"absolute",width:210,height:210,borderRadius:"50%",border:"1px dashed rgba(212,135,58,0.18)",animation:"spin-slow 18s linear infinite" }} />
              <div style={{ position:"absolute",width:168,height:168,borderRadius:"50%",border:"1px solid rgba(212,135,58,0.07)",animation:"spin-slow 12s linear infinite reverse" }} />
              <div style={{ width:136,height:136,borderRadius:"50%",background:"linear-gradient(135deg,#281d0e 0%,#181818 100%)",border:"2px solid rgba(212,135,58,0.28)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 36px rgba(212,135,58,0.1),inset 0 1px 0 rgba(212,135,58,0.08)",marginBottom:18,position:"relative",zIndex:1 }}>
                <span style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:46,color:"#D4873A",letterSpacing:3 }}>ZR</span>
              </div>
              <p style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:18,color:"#F0EDE8",letterSpacing:2,margin:"0 0 4px",zIndex:1 }}>ZIAUR RAHAMAN</p>
              <p style={{ fontFamily:"'DM Mono',monospace",fontSize:9,color:"#4a4a4a",letterSpacing:2,margin:"0 0 14px",zIndex:1 }}>BLUE TEAM · IOT · SOC</p>
              <div style={{ display:"flex",gap:18,zIndex:1 }}>
                {[["7.89","CGPA"],["2028","Grad"],["5+","Projects"]].map(([v,l])=>(
                  <div key={l} style={{ textAlign:"center" }}>
                    <p style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:"#D4873A",margin:0 }}>{v}</p>
                    <p style={{ fontFamily:"'DM Mono',monospace",fontSize:7,color:"#3a3a3a",margin:0,letterSpacing:1 }}>{l}</p>
                  </div>
                ))}
              </div>
              <div style={{ position:"absolute",bottom:14,right:14,fontFamily:"'DM Mono',monospace",fontSize:8,color:"#222",letterSpacing:2,textTransform:"uppercase" }}>In My Builder Era.</div>
              <div style={{ position:"absolute",bottom:0,left:0,right:0,height:1,background:"linear-gradient(90deg,transparent,rgba(212,135,58,0.18),transparent)" }} />
            </div>
          </TiltCard>
        </div>
      </div>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}@keyframes spin-slow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </section>
  );
}

function BuilderProfile() {
  const orbs = [
    {label:"Wazuh",icon:"🛡️"},{label:"Cowrie",icon:"🍯"},{label:"Python",icon:"🐍"},{label:"Docker",icon:"🐳"},
    {label:"ESP32",icon:"📡"},{label:"Bash",icon:"💻"},{label:"Kali",icon:"💀"},{label:"MITRE",icon:"🎯"},
  ];
  return (
    <section style={{ background:"#0D0D0D",padding:"80px 52px",borderTop:"1px solid #121212" }}>
      <TiltCard intensity={8} style={{ background:"linear-gradient(145deg,#0f0f0f 0%,#0c0c0c 100%)",border:"1px solid #1a1a1a",borderRadius:4,padding:"52px 56px",display:"flex",gap:72,alignItems:"center",maxWidth:1100,margin:"0 auto" }}>
        <div style={{ flex:1 }}>
          <p style={{ fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:4,color:"#D4873A",textTransform:"uppercase",marginBottom:10 }}>01 / Profile</p>
          <h2 style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:42,color:"#F0EDE8",margin:"0 0 14px",letterSpacing:1 }}>Builder Profile</h2>
          <p style={{ fontFamily:"'Instrument Serif',serif",fontSize:16,color:"#5a5a5a",lineHeight:1.78,marginBottom:26 }}>
            Blue Team enthusiast & IoT developer. Deploying Cowrie honeypots, integrating Wazuh SIEMs, hardening Linux firewalls, and building quadruped robots that win podiums — all through self-initiated projects. B.Tech Electronics & Telecommunication at KIIT, CGPA 7.89.
          </p>
          <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginBottom:30 }}>
            {["Wazuh SIEM","Cowrie Honeypot","Python","Docker","ESP32","Bash","Nmap","Wireshark"].map(t=>(
              <span key={t} style={{ fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:1,color:"#D4873A",border:"1px solid rgba(212,135,58,0.22)",padding:"5px 11px",borderRadius:2 }}>{t}</span>
            ))}
          </div>
          <button data-hover style={{ background:"transparent",color:"#D4873A",border:"1px solid #D4873A",padding:"11px 24px",fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:2,textTransform:"uppercase",cursor:"pointer",borderRadius:2,transition:"all 0.2s" }}
            onMouseEnter={e=>{e.target.style.background="#D4873A";e.target.style.color="#0A0A0A"}} onMouseLeave={e=>{e.target.style.background="transparent";e.target.style.color="#D4873A"}}>My Resume ↗</button>
        </div>
        <div style={{ width:248,flexShrink:0,display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
          {orbs.map((s,i)=><SkillOrb key={s.label} label={s.label} icon={s.icon} delay={i} />)}
        </div>
      </TiltCard>
    </section>
  );
}

const projects = [
  { 
    cat: "Security", 
    title: "Cowrie SSH Honeypot + Wazuh SIEM", 
    desc: "Deployed Cowrie on Raspberry Pi; iptables NAT redirect, Wazuh 4.7.0 via Docker, custom XML rules generating 76 alerts including 27 critical with MITRE ATT&CK mapping.", 
    tech: ["Raspberry Pi", "Wazuh", "Docker", "Hydra"],
    link: "https://github.com/blup-blup-spec/honeypot"
  },
  { 
    cat: "Security", 
    title: "RECON OPERATOR v3", 
    desc: "GUI-driven tactical network reconnaissance system for penetration testing. Automates Nmap methodology, port scanning, and OS fingerprinting for SOC teams.", 
    tech: ["Python", "Nmap", "GUI", "Socket"],
    link: "https://github.com/blup-blup-spec/Recon"
  },
  { 
    cat: "IoT", 
    title: "Ophidian – Snake Detection System", 
    desc: "Real-time venomous vs non-venomous snake detection using YOLOv8n optimized for Raspberry Pi 4. Achieving 15-22 FPS for wildlife safety.", 
    tech: ["YOLOv8", "Python", "Raspberry Pi", "OpenCV"],
    link: "https://github.com/blup-blup-spec/ophidian"
  },
  { 
    cat: "AI", 
    title: "SEIZURE – Epilepsy Prediction", 
    desc: "Deep learning system predicting epileptic seizures from EEG signals using MobileNetV2 and TFLite for real-time edge inference.", 
    tech: ["TFLite", "Keras", "MobileNetV2", "EEG"],
    link: "https://github.com/blup-blup-spec/SEIZURE"
  },
  { 
    cat: "IoT", 
    title: "HealthGuard – Smart Arm Band", 
    desc: "Smart Health Monitoring System using ESP32 and Flutter for real-time health metric tracking, featuring a sleek data visualization dashboard.", 
    tech: ["ESP32", "Flutter", "Firebase", "Sensors"],
    link: "https://github.com/blup-blup-spec/healthgaurd"
  },
  { 
    cat: "Robotics", 
    title: "LL1.0 – 12-DOF Quadruped Robot", 
    desc: "Inverse kinematics gait, ~50ms WebSocket control, voice commands, and CV-based detection. 3rd Place Kreativity 3.0 winner.", 
    tech: ["IK Gait", "WebSocket", "CV", "LoRa"],
    link: "https://github.com/blup-blup-spec/gesture"
  },
  { 
    cat: "Networking", 
    title: "Enterprise Network Design", 
    desc: "Multi-building campus network with VLAN segmentation, DHCP automation, ACLs, and SSH tunneling designed in Cisco Packet Tracer.", 
    tech: ["Cisco", "VLANs", "DHCP", "Security"],
    link: "https://github.com/blup-blup-spec/cisco-packet-tracer"
  },
  { 
    cat: "AI", 
    title: "Medico AI – AppMap", 
    desc: "AI-powered Flutter application for medical professionals that translates complex queries into interactive flowcharts using LLMs.", 
    tech: ["Flutter", "LLM", "Dart", "AI"],
    link: "https://github.com/blup-blup-spec/appmap"
  }
];
const cats = ["All", "Security", "AI", "IoT", "Robotics", "Networking"];

function Projects() {
  const [active, setActive] = useState("All");
  const filtered = active === "All" ? projects : projects.filter(p => p.cat === active);
  return (
    <section id="projects" style={{ background:"#0A0A0A",padding:"100px 52px" }}>
      <div style={{ maxWidth:1200,margin:"0 auto" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:44,flexWrap:"wrap",gap:20 }}>
          <div>
            <p style={{ fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:4,color:"#D4873A",textTransform:"uppercase",marginBottom:8 }}>02 / Work</p>
            <h2 style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:50,color:"#F0EDE8",margin:0,letterSpacing:1 }}>Projects</h2>
            <p style={{ fontFamily:"'Instrument Serif',serif",fontSize:15,color:"#3a3a3a",marginTop:4 }}>Deployed with confidence.</p>
          </div>
          <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
            {cats.map(c=>(
              <button key={c} data-hover onClick={()=>setActive(c)} style={{ background:active===c?"#D4873A":"transparent",color:active===c?"#0A0A0A":"#3a3a3a",border:`1px solid ${active===c?"#D4873A":"#1e1e1e"}`,padding:"7px 14px",fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:1,textTransform:"uppercase",cursor:"pointer",borderRadius:2,transition:"all 0.2s",fontWeight:active===c?700:400 }}>{c}</button>
            ))}
          </div>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14 }}>
          {filtered.map(p=>(
            <a key={p.title} href={p.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }} data-hover>
              <TiltCard intensity={14} style={{ background:"#0c0c0c",border:"1px solid #161616",borderRadius:4,padding:"26px 24px",cursor:"pointer",position:"relative",overflow:"hidden",transition:"border-color 0.25s",height:"100%" }}
                onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(212,135,58,0.25)"} onMouseLeave={e=>e.currentTarget.style.borderColor="#161616"}>
                <div style={{ position:"absolute",top:14,right:14,opacity:0.45 }}><WireframeCube size={20} color="rgba(212,135,58,0.35)" speed={10} /></div>
                <span style={{ fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:2,color:"#303030",background:"#111",padding:"4px 9px",borderRadius:2,textTransform:"uppercase",display:"inline-block",marginBottom:16 }}>{p.cat}</span>
                <h3 style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:"#F0EDE8",margin:"0 0 10px",letterSpacing:0.5,paddingRight:28 }}>{p.title}</h3>
                <p style={{ fontFamily:"'Instrument Serif',serif",fontSize:13,color:"#404040",lineHeight:1.65,marginBottom:18 }}>{p.desc}</p>
                <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginBottom:18 }}>
                  {p.tech.map(t=><span key={t} style={{ fontFamily:"'DM Mono',monospace",fontSize:8,color:"#D4873A",border:"1px solid rgba(212,135,58,0.16)",padding:"3px 7px",borderRadius:2 }}>{t}</span>)}
                </div>
                <div style={{ width:30,height:30,borderRadius:"50%",background:"#111",border:"1px solid #1e1e1e",display:"flex",alignItems:"center",justifyContent:"center",position:"absolute",bottom:24,right:24 }}>
                  <span style={{ color:"#D4873A",fontSize:12 }}>↗</span>
                </div>
              </TiltCard>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

const events = [
  { cat:"PROJECT EXPO", year:2025, title:"KIIT Project Expo – 2nd Place", desc:"Cyber-Physical Applications in Industrial IoT, School of Electrical Engineering, KIIT.", badge:"🥈" },
  { cat:"COMPETITION", year:2025, title:"Kreativity 3.0 – 3rd Place", desc:"Live robotics demonstration with LL1.0 Quadruped Disaster Surveillance Robot.", badge:"🥉" },
  { cat:"COMMUNITY", year:2025, title:"K-100 Cybersecurity Society", desc:"Active member – CTF challenges, Blue Team workshops, SOC-focused learning sessions at KIIT.", badge:"🛡️" },
  { cat:"CERTIFICATION", year:2026, title:"Cisco Networking Academy", desc:"Completed Intro to Cybersecurity & Networking Basics — both Credly verified.", badge:"🏅" },
];

function Events() {
  return (
    <section id="events" style={{ background:"#0D0D0D",padding:"100px 52px" }}>
      <div style={{ maxWidth:1200,margin:"0 auto" }}>
        <p style={{ fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:4,color:"#D4873A",textTransform:"uppercase",marginBottom:8 }}>03 / Highlights</p>
        <h2 style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:50,color:"#F0EDE8",margin:"0 0 6px",letterSpacing:1 }}>Events</h2>
        <p style={{ fontFamily:"'Instrument Serif',serif",fontSize:15,color:"#3a3a3a",marginBottom:44 }}>Competitions, communities, and workshops I've been part of.</p>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:18 }}>
          {events.map((ev,i)=>(
            <TiltCard key={i} intensity={10} style={{ background:"#0c0c0c",border:"1px solid #161616",borderRadius:4,overflow:"hidden" }}>
              <div style={{ height:150,background:`linear-gradient(135deg,#141414 0%,#${["1a1206","0a1206","06081a","1a0810"][i]}50 100%)`,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden" }}>
                <div style={{ position:"absolute",opacity:0.28 }}><WireframeCube size={88} color="rgba(212,135,58,0.4)" speed={7+i} /></div>
                <span style={{ fontSize:44,position:"relative",zIndex:1 }}>{ev.badge}</span>
              </div>
              <div style={{ padding:"22px 24px" }}>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:8 }}>
                  <span style={{ fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:2,color:"#D4873A",textTransform:"uppercase" }}>{ev.cat}</span>
                  <span style={{ fontFamily:"'DM Mono',monospace",fontSize:9,color:"#2a2a2a" }}>{ev.year}</span>
                </div>
                <h3 style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:"#F0EDE8",margin:"0 0 8px",letterSpacing:0.5 }}>{ev.title}</h3>
                <p style={{ fontFamily:"'Instrument Serif',serif",fontSize:13,color:"#404040",lineHeight:1.6,margin:0 }}>{ev.desc}</p>
              </div>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}

const timeline = [
  { year:"2020", label:"Class X – WBBSE | 88.6% | Kolkata" },
  { year:"2022", label:"Class XII – WBCHSE | 86.4%" },
  { year:"2024", label:"B.Tech – Electronics & Telecommunication – KIIT University", hi:true },
  { year:"2025", label:"2nd Place KIIT Project Expo · 3rd Place Kreativity 3.0 · K-100 Cybersecurity Society" },
  { year:"2026", label:"Cowrie+Wazuh SIEM Lab · Firewall Pen Testing Lab · Cisco Certifications" },
  { year:"Now", label:"Undergraduate Engineering Student – KIIT | CGPA: 7.89", active:true },
];
const skillBars = [
  {label:"Blue Team / SOC",val:85},{label:"Python & Bash",val:78},{label:"IoT / Embedded Systems",val:82},
  {label:"Networking (TCP/IP, VLANs)",val:80},{label:"Docker & Linux",val:76},{label:"C / C++",val:70},
];

function SkillsAndTimeline() {
  return (
    <section style={{ background:"#0A0A0A",padding:"100px 52px" }}>
      <div style={{ maxWidth:1200,margin:"0 auto",display:"grid",gridTemplateColumns:"1fr 1fr",gap:80 }}>
        <div>
          <p style={{ fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:4,color:"#D4873A",textTransform:"uppercase",marginBottom:8 }}>04 / Journey</p>
          <h2 style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:44,color:"#F0EDE8",margin:"0 0 38px",letterSpacing:1 }}>Experience Timeline</h2>
          <div style={{ position:"relative" }}>
            <div style={{ position:"absolute",left:88,top:0,bottom:0,width:1,background:"#161616" }} />
            {timeline.map((t,i)=>(
              <div key={i} style={{ display:"flex",gap:20,alignItems:"flex-start",marginBottom:12 }}>
                <div style={{ width:64,textAlign:"right",flexShrink:0,paddingTop:14 }}>
                  <span style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:"#D4873A",letterSpacing:1 }}>{t.year}</span>
                </div>
                <div style={{ width:11,height:11,borderRadius:"50%",flexShrink:0,marginLeft:-6,marginTop:16,zIndex:1,background:t.active?"#D4873A":"#181818",border:`2px solid ${t.active?"#D4873A":"#252525"}`,boxShadow:t.active?"0 0 12px rgba(212,135,58,0.5)":"none" }} />
                <div style={{ flex:1,background:"#0c0c0c",border:`1px solid ${t.hi||t.active?"rgba(212,135,58,0.18)":"#131313"}`,borderRadius:4,padding:"12px 16px",borderLeft:t.active?"2px solid #D4873A":undefined }}>
                  <p style={{ fontFamily:"'DM Mono',monospace",fontSize:10,color:t.active?"#b0b0b0":"#3a3a3a",margin:0,lineHeight:1.6 }}>{t.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p style={{ fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:4,color:"#D4873A",textTransform:"uppercase",marginBottom:8 }}>Skills</p>
          <h2 style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:44,color:"#F0EDE8",margin:"0 0 38px",letterSpacing:1 }}>Tech Stack</h2>
          <div style={{ display:"flex",flexDirection:"column",gap:18 }}>
            {skillBars.map(s=>(
              <div key={s.label}>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
                  <span style={{ fontFamily:"'DM Mono',monospace",fontSize:10,color:"#7a7a7a",letterSpacing:1 }}>{s.label}</span>
                  <span style={{ fontFamily:"'DM Mono',monospace",fontSize:10,color:"#D4873A" }}>{s.val}%</span>
                </div>
                <div style={{ height:2,background:"#111",borderRadius:2,overflow:"hidden" }}>
                  <div style={{ height:"100%",width:`${s.val}%`,background:"linear-gradient(90deg,#D4873A,#e8a04a)",borderRadius:2 }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:44,display:"flex",gap:14,alignItems:"center" }}>
            <WireframeCube size={42} color="rgba(212,135,58,0.38)" speed={6} />
            <WireframeCube size={28} color="rgba(212,135,58,0.22)" speed={9} />
            <WireframeCube size={50} color="rgba(212,135,58,0.28)" speed={12} />
            <WireframeCube size={22} color="rgba(212,135,58,0.18)" speed={7} />
            <p style={{ fontFamily:"'DM Mono',monospace",fontSize:9,color:"#2a2a2a",letterSpacing:2,textTransform:"uppercase",maxWidth:140,lineHeight:1.6 }}>Always learning.<br/>Always building.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

const certs = [
  { title:"Introduction to Cybersecurity", issuer:"Cisco Networking Academy", year:"Jan 2026", badge:"Credly Verified" },
  { title:"Networking Basics", issuer:"Cisco Networking Academy", year:"Jan 2026", badge:"Credly Verified" },
  { title:"Linux Fundamentals", issuer:"GeeksforGeeks", year:"2025", badge:"Completed" },
];

function Certificates() {
  const [idx, setIdx] = useState(0);
  return (
    <section id="certificates" style={{ background:"#0D0D0D",padding:"100px 52px",overflow:"hidden" }}>
      <div style={{ maxWidth:1200,margin:"0 auto" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:44 }}>
          <div>
            <p style={{ fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:4,color:"#D4873A",textTransform:"uppercase",marginBottom:8 }}>05 / Qualifications</p>
            <h2 style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:50,color:"#F0EDE8",margin:"0 0 4px",letterSpacing:1 }}>Certificates</h2>
            <p style={{ fontFamily:"'Instrument Serif',serif",fontSize:15,color:"#3a3a3a" }}>Not just vibes. Qualifications too.</p>
          </div>
          <div style={{ display:"flex",gap:8 }}>
            {[["←",-1],["→",1]].map(([arrow,dir])=>(
              <button key={arrow} data-hover onClick={()=>setIdx(i=>Math.max(0,Math.min(certs.length-1,i+dir)))} style={{ width:40,height:40,borderRadius:"50%",background:"transparent",border:"1px solid #1e1e1e",color:"#F0EDE8",fontSize:14,cursor:"pointer",transition:"all 0.2s" }}
                onMouseEnter={e=>{e.target.style.background="#D4873A";e.target.style.color="#0A0A0A";e.target.style.borderColor="#D4873A"}} onMouseLeave={e=>{e.target.style.background="transparent";e.target.style.color="#F0EDE8";e.target.style.borderColor="#1e1e1e"}}>{arrow}</button>
            ))}
          </div>
        </div>
        <div style={{ display:"flex",gap:18 }}>
          {certs.map((c,i)=>(
            <TiltCard key={c.title} intensity={14} style={{ flex:1,background:"#0c0c0c",border:`1px solid ${i===idx?"rgba(212,135,58,0.28)":"#131313"}`,borderRadius:4,padding:"26px 22px",minWidth:0,opacity:i===idx?1:0.45,transition:"opacity 0.3s,border-color 0.3s" }}>
              <div style={{ background:"#F8F6F2",borderRadius:2,padding:"18px",marginBottom:18,position:"relative",overflow:"hidden" }}>
                <div style={{ position:"absolute",top:0,left:0,right:0,height:3,background:"#D4873A" }} />
                <p style={{ fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:2,color:"#D4873A",marginBottom:7 }}>{c.issuer}</p>
                <p style={{ fontFamily:"'DM Mono',monospace",fontSize:7,color:"#888",marginBottom:3 }}>This certifies that</p>
                <p style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:15,color:"#1a1a1a",marginBottom:3,letterSpacing:1 }}>Ziaur Rahaman</p>
                <p style={{ fontFamily:"'DM Mono',monospace",fontSize:7,color:"#555",marginBottom:3 }}>successfully completed</p>
                <p style={{ fontFamily:"'DM Mono',monospace",fontSize:8,color:"#1a1a1a",fontWeight:700,lineHeight:1.4 }}>{c.title}</p>
                <p style={{ fontFamily:"'DM Mono',monospace",fontSize:7,color:"#aaa",marginTop:7,marginBottom:0 }}>{c.year}</p>
                <div style={{ position:"absolute",bottom:7,right:7,background:"#D4873A",borderRadius:2,padding:"2px 6px",fontFamily:"'DM Mono',monospace",fontSize:6,color:"#0A0A0A",letterSpacing:1 }}>{c.badge}</div>
              </div>
              <p style={{ fontFamily:"'Instrument Serif',serif",fontSize:13,color:"#4a4a4a",lineHeight:1.5 }}>{c.title} — {c.issuer}</p>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" style={{ background:"#0A0A0A",padding:"100px 52px" }}>
      <div style={{ maxWidth:1200,margin:"0 auto",display:"grid",gridTemplateColumns:"1fr 1fr",gap:80,alignItems:"start" }}>
        <div>
          <p style={{ fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:4,color:"#D4873A",textTransform:"uppercase",marginBottom:8 }}>06 / Contact</p>
          <h2 style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:50,color:"#F0EDE8",margin:"0 0 12px",letterSpacing:1,lineHeight:1 }}>Let's Build<br/>Something</h2>
          <p style={{ fontFamily:"'Instrument Serif',serif",fontSize:16,color:"#4a4a4a",lineHeight:1.75,marginBottom:28 }}>Looking for an internship to apply skills in cybersecurity, IoT, and embedded systems. Let's talk.</p>
          <div style={{ display:"flex",flexDirection:"column",gap:10,marginBottom:28 }}>
            {[["📧","2404154@kiit.ac.in"],["📱","+91 9681819189"],["📍","Kolkata, West Bengal"],["💼","linkedin.com/in/ziaur-rahaman-524588322"],["🐙","github.com/blup-blup-spec"]].map(([icon,val])=>(
              <div key={val} style={{ display:"flex",gap:12,alignItems:"center" }}>
                <span style={{ fontSize:14 }}>{icon}</span>
                <span style={{ fontFamily:"'DM Mono',monospace",fontSize:11,color:"#4a4a4a",letterSpacing:0.5 }}>{val}</span>
              </div>
            ))}
          </div>
          <div style={{ height:150,background:"#0c0c0c",borderRadius:4,border:"1px solid #161616",position:"relative",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center" }}>
            <div style={{ position:"absolute",inset:0,opacity:0.045 }}>
              {Array.from({length:7}).map((_,i)=><div key={i} style={{ position:"absolute",left:0,right:0,top:`${i*14}%`,height:1,background:"#D4873A" }} />)}
              {Array.from({length:11}).map((_,i)=><div key={i} style={{ position:"absolute",top:0,bottom:0,left:`${i*10}%`,width:1,background:"#D4873A" }} />)}
            </div>
            <div style={{ width:9,height:9,borderRadius:"50%",background:"#D4873A",boxShadow:"0 0 14px rgba(212,135,58,0.7)" }} />
            <div style={{ position:"absolute",top:9,left:9,fontFamily:"'DM Mono',monospace",fontSize:8,color:"#D4873A",background:"#111",padding:"4px 8px",borderRadius:2,letterSpacing:1 }}>KIIT University, Bhubaneswar ↗</div>
          </div>
        </div>
        <div style={{ display:"flex",flexDirection:"column",gap:11 }}>
          {["Your name","name@email.com"].map((ph,i)=>(
            <input key={i} placeholder={ph} style={{ background:"#0c0c0c",border:"1px solid #161616",borderRadius:4,padding:"15px 17px",fontFamily:"'DM Mono',monospace",fontSize:12,color:"#F0EDE8",outline:"none",transition:"border-color 0.2s" }}
              onFocus={e=>e.target.style.borderColor="rgba(212,135,58,0.32)"} onBlur={e=>e.target.style.borderColor="#161616"} />
          ))}
          <textarea placeholder="Write a Message..." rows={5} style={{ background:"#0c0c0c",border:"1px solid #161616",borderRadius:4,padding:"15px 17px",fontFamily:"'DM Mono',monospace",fontSize:12,color:"#F0EDE8",outline:"none",resize:"none",transition:"border-color 0.2s" }}
            onFocus={e=>e.target.style.borderColor="rgba(212,135,58,0.32)"} onBlur={e=>e.target.style.borderColor="#161616"} />
          <button data-hover style={{ background:"#D4873A",color:"#0A0A0A",border:"none",padding:"15px",fontFamily:"'DM Mono',monospace",fontSize:11,letterSpacing:2,textTransform:"uppercase",cursor:"pointer",borderRadius:4,fontWeight:700,transition:"all 0.2s" }}
            onMouseEnter={e=>{e.target.style.background="#bf7830";e.target.style.transform="translateY(-2px)"}} onMouseLeave={e=>{e.target.style.background="#D4873A";e.target.style.transform="none"}}>Send Message →</button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ background:"#050505",borderTop:"1px solid #111",padding:"26px 52px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
      <div style={{ display:"flex",alignItems:"center",gap:10 }}>
        <WireframeCube size={18} color="rgba(212,135,58,0.4)" speed={5} />
        <span style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:15,color:"#D4873A",letterSpacing:3 }}>ZIAUR RAHAMAN</span>
      </div>
      <span style={{ fontFamily:"'DM Mono',monospace",fontSize:9,color:"#222",letterSpacing:1 }}>© 2026 · Blue Team · IoT · SOC · KIIT</span>
    </footer>
  );
}

export default function App() {
  return (
    <div style={{ background:"#0A0A0A",minHeight:"100vh" }}>
      <FontLoader />
      <Cursor />
      <Nav />
      <Hero />
      <BuilderProfile />
      <Projects />
      <Events />
      <SkillsAndTimeline />
      <Certificates />
      <Contact />
      <Footer />
    </div>
  );
}
