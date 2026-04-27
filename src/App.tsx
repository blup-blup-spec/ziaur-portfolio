import{useState,useEffect,useRef,useCallback}from"react";
import{projects,certificates,achievements,PROJECT_CATS}from"./data";
import HeroGlobe from"./HeroGlobe";

/* ── Scroll Reveal Hook ── */
function useScrollReveal(threshold=0.15){
  const ref=useRef<HTMLDivElement>(null);
  const[visible,setVisible]=useState(false);
  useEffect(()=>{
    const el=ref.current;if(!el)return;
    const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting){setVisible(true);obs.disconnect();}},{threshold});
    obs.observe(el);return()=>obs.disconnect();
  },[threshold]);
  return{ref,visible};
}
function Reveal({children,className="reveal",delay=0,style={},...props}:any){
  const{ref,visible}=useScrollReveal(0.12);
  return <div ref={ref} className={`${className}${visible?" visible":""}`} style={{transitionDelay:`${delay}s`,...style}} {...props}>{children}</div>;
}

/* ── Count-Up Hook ── */
function useCountUp(target:number,duration=2000){
  const[count,setCount]=useState(0);
  const[started,setStarted]=useState(false);
  const ref=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const el=ref.current;if(!el)return;
    const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting){setStarted(true);obs.disconnect();}},{threshold:0.5});
    obs.observe(el);return()=>obs.disconnect();
  },[]);
  useEffect(()=>{
    if(!started)return;
    let start=0;const step=(ts:number)=>{if(!start)start=ts;const p=Math.min((ts-start)/duration,1);setCount(Math.floor(p*target));if(p<1)requestAnimationFrame(step);};
    requestAnimationFrame(step);
  },[started,target,duration]);
  return{ref,count};
}

/* ── Intro Screen ── */
function IntroScreen({done}:{done:boolean}){
  return(
    <div className={`intro-screen${done?" hidden":""}`}>
      <div className="intro-logo"><SciFiLogo size={120} color="#EAE2DD"/></div>
      <div className="intro-text" style={{fontFamily:"Inter,sans-serif",fontSize:28,color:"#EAE2DD",marginTop:24,letterSpacing:"-0.5px",fontWeight:600}}>ZIAUR RAHAMAN</div>
      <div className="intro-bar"><div className="intro-bar-fill"/></div>
    </div>
  );
}

/* ── Back To Top ── */
function BackToTop(){
  const[show,setShow]=useState(false);
  useEffect(()=>{const fn=()=>setShow(window.scrollY>500);window.addEventListener("scroll",fn);return()=>window.removeEventListener("scroll",fn);},[]);
  return <button className={`back-to-top${show?" show":""}`} onClick={()=>window.scrollTo({top:0,behavior:"smooth"})} aria-label="Back to top">↑</button>;
}

/* ── Stats Section ── */
function Stats(){
  const s1=useCountUp(12);const s2=useCountUp(5);const s3=useCountUp(3);const s4=useCountUp(4);
  return(
    <Reveal style={{padding:"40px 52px 0"}}>
      <div style={{maxWidth:1200,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(4,1fr)",background:"linear-gradient(145deg,#18080C,#0C0608)",border:"1px solid #33151A",borderRadius:12,overflow:"hidden"}}>
        {[{ref:s1.ref,count:s1.count,suffix:"+",label:"Projects Built"},{ref:s2.ref,count:s2.count,suffix:"",label:"Certifications"},{ref:s3.ref,count:s3.count,suffix:"",label:"Awards Won"},{ref:s4.ref,count:s4.count,suffix:"+",label:"Domains"}].map((s,i)=>(
          <div key={i} ref={s.ref} className="stat-item">
            <div style={{fontFamily:"Inter,sans-serif",fontSize:48,fontWeight:700,color:"#FFFFFF",letterSpacing:"-2px"}}>{s.count}{s.suffix}</div>
            <div style={{fontFamily:"Inter,sans-serif",fontSize:14,color:"#A49B95",marginTop:6,letterSpacing:"-0.5px"}}>{s.label}</div>
          </div>
        ))}
      </div>
    </Reveal>
  );
}


function useTypewriter(words){
  const[text,setText]=useState("");
  const i=useRef(0),c=useRef(0),del=useRef(false);
  useEffect(()=>{
    let t;
    const tick=()=>{
      const w=words[i.current];
      if(!del.current){setText(w.slice(0,c.current+1));c.current++;if(c.current===w.length){del.current=true;t=setTimeout(tick,1600);return;}}
      else{setText(w.slice(0,c.current-1));c.current--;if(c.current===0){del.current=false;i.current=(i.current+1)%words.length;}}
      t=setTimeout(tick,del.current?45:90);
    };
    t=setTimeout(tick,500);return()=>clearTimeout(t);
  },[]);
  return text;
}

function Cursor(){
  const dot=useRef(null),ring=useRef(null),pos=useRef({x:-100,y:-100}),rp=useRef({x:-100,y:-100});
  useEffect(()=>{
    const mv=e=>{pos.current={x:e.clientX,y:e.clientY};if(dot.current)dot.current.style.transform=`translate(${e.clientX-4}px,${e.clientY-4}px)`;};
    window.addEventListener("mousemove",mv);
    let raf;
    const loop=()=>{
      rp.current.x+=(pos.current.x-rp.current.x)*0.15;
      rp.current.y+=(pos.current.y-rp.current.y)*0.15;
      if(ring.current)ring.current.style.transform=`translate(${rp.current.x-18}px,${rp.current.y-18}px)`;
      raf=requestAnimationFrame(loop);
    };
    raf=requestAnimationFrame(loop);
    return()=>{window.removeEventListener("mousemove",mv);cancelAnimationFrame(raf);};
  },[]);
  return(<>
    <div ref={dot} style={{position:"fixed",top:0,left:0,width:8,height:8,borderRadius:"50%",background:"#C81D33",pointerEvents:"none",zIndex:9999}}/>
    <div ref={ring} style={{position:"fixed",top:0,left:0,width:36,height:36,borderRadius:"50%",border:"1.5px solid rgba(200,29,51,0.4)",pointerEvents:"none",zIndex:9998}}/>
  </>);
}

function SciFiLogo({size=26, color="#EAE2DD"}){
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" style={{transform:"rotate(-10deg)"}}>
      <circle cx="50" cy="50" r="16" stroke={color} strokeWidth="3" strokeDasharray="4 2"/>
      <circle cx="50" cy="50" r="8" fill="transparent" stroke="#C81D33" strokeWidth="2"/>
      <circle cx="50" cy="50" r="3" fill="#C81D33"/>
      <path d="M50 25 C 65 5, 90 10, 95 15 L 75 28 C 65 22, 55 25, 50 34 Z" fill={color}/>
      <path d="M28 63 C 10 75, 10 95, 15 100 L 30 82 C 22 75, 28 65, 36 58 Z" fill={color}/>
      <path d="M72 63 C 90 75, 90 95, 85 100 L 70 82 C 78 75, 72 65, 64 58 Z" fill={color}/>
      <circle cx="82" cy="18" r="4" fill="#C81D33"/>
      <circle cx="22" cy="85" r="4" fill="#C81D33"/>
      <circle cx="78" cy="85" r="4" fill="#C81D33"/>
    </svg>
  );
}

function GithubIcon({size=24, color="#FFFFFF"}){
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{transition: "fill 0.2s"}}>
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  );
}

function ParticleField(){
  const cv=useRef(null);
  useEffect(()=>{
    const c=cv.current;if(!c)return;
    const ctx=c.getContext("2d");
    const resize=()=>{c.width=c.offsetWidth;c.height=c.offsetHeight;};
    resize();window.addEventListener("resize",resize);
    const pts=Array.from({length:35},()=>({x:Math.random()*c.width,y:Math.random()*c.height,vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3,r:Math.random()*1.2+.4}));
    let raf;
    const draw=()=>{
      ctx.clearRect(0,0,c.width,c.height);
      pts.forEach(p=>{
        p.x+=p.vx;p.y+=p.vy;
        if(p.x<0||p.x>c.width)p.vx*=-1;
        if(p.y<0||p.y>c.height)p.vy*=-1;
        ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle="rgba(200,29,51,0.2)";ctx.fill();
      });
      pts.forEach((a,i)=>pts.slice(i+1).forEach(b=>{
        const d=Math.hypot(a.x-b.x,a.y-b.y);
        if(d<110){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle=`rgba(200,29,51,${.07*(1-d/110)})`;ctx.lineWidth=.5;ctx.stroke();}
      }));
      raf=requestAnimationFrame(draw);
    };
    draw();return()=>{cancelAnimationFrame(raf);window.removeEventListener("resize",resize);};
  },[]);
  return<canvas ref={cv} style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}}/>;
}

function Modal({item,onClose}){
  if(!item)return null;
  const[mounted,setMounted]=useState(false);
  useEffect(()=>{setTimeout(()=>setMounted(true),10);},[]);
  const S={
    overlay:{position:"fixed",inset:0,background:"rgba(10,5,8,0.4)",backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)",zIndex:3000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,opacity:mounted?1:0,transition:"opacity 0.3s"},
    box:{background:"rgba(18, 13, 15, 0.4)",border:"1px solid #22181B",borderRadius:30,maxWidth:820,width:"100%",maxHeight:"90vh",overflowY:"auto",padding:"50px 55px",position:"relative",transform:mounted?"perspective(1200px) translateZ(0) scale(1)":"perspective(1200px) translateZ(-200px) scale(0.85)",transition:"transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",boxShadow:"0 60px 120px rgba(0,0,0,0.9)"},
  };
  return(
    <div style={S.overlay} onClick={onClose}>
      <div style={S.box} onClick={e=>e.stopPropagation()}>
        <button onClick={onClose} style={{position:"absolute",top:24,right:28,background:"none",border:"none",color:"#EAE2DD",fontSize:30,cursor:"pointer",lineHeight:1}}>×</button>
        <span style={{fontFamily:"Inter, sans-serif",fontSize:15,color:"#EAE2DD",letterSpacing:"-1.5px",}}>{item.cat||item.issuer||"Achievement"}</span>
        <h2 style={{fontFamily:"Inter, sans-serif",fontWeight:600,fontSize:38,margin:"10px 0 28px",color:"#A3A3A3",letterSpacing:"-1px",lineHeight:1}}>{item.title}</h2>

        {item.why&&<><h4 style={{fontFamily:"Inter, sans-serif",fontSize:15,color:"#A49B95",letterSpacing:"-1.5px",margin:"0 0 8px"}}>Why I Built This</h4><p style={{fontFamily:"'Inter',sans-serif",fontWeight:400,fontSize:16,color:"#EAE2DD",lineHeight:1.75,margin:"0 0 28px"}}>{item.why}</p></>}
        {item.what&&<><h4 style={{fontFamily:"Inter, sans-serif",fontSize:15,color:"#A49B95",letterSpacing:"-1.5px",margin:"0 0 8px"}}>What I Built</h4><p style={{fontFamily:"'Inter',sans-serif",fontWeight:400,fontSize:16,color:"#EAE2DD",lineHeight:1.75,margin:"0 0 28px"}}>{item.what}</p></>}
        {item.learned&&<><h4 style={{fontFamily:"Inter, sans-serif",fontSize:15,color:"#A49B95",letterSpacing:"-1.5px",margin:"0 0 8px"}}>What I Learned</h4><p style={{fontFamily:"'Inter',sans-serif",fontWeight:400,fontSize:16,color:"#EAE2DD",lineHeight:1.75,margin:"0 0 28px"}}>{item.learned}</p></>}
        {item.desc&&<p style={{fontFamily:"'Inter',sans-serif",fontWeight:400,fontSize:17,color:"#EAE2DD",lineHeight:1.75,margin:"0 0 28px"}}>{item.desc}</p>}

        {item.tech&&<div style={{marginBottom:36}}>
          <h4 style={{fontFamily:"Inter, sans-serif",fontSize:15,color:"#EAE2DD",letterSpacing:"-1.5px",margin:"0 0 14px"}}>Tech Stack</h4>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {item.tech.map(t=><span key={t} style={{fontFamily:"Inter, sans-serif",fontSize:15,color:"#A3A3A3",background:"#22181B",border:"1px solid #242424",padding:"6px 14px",borderRadius:30}}>{t}</span>)}
          </div>
        </div>}

        {item.img&&<div style={{textAlign:"center",marginBottom:32}}><img src={item.img} alt={item.title} style={{maxWidth:"100%",maxHeight:"50vh",objectFit:"contain",borderRadius:30,border:"1px solid #22181B"}}/></div>}
        {item.link&&<a href={item.link} target="_blank" rel="noopener noreferrer" style={{display:"inline-block",background:"#C81D33",color:"#0A0708",textDecoration:"none",padding:"14px 32px",fontFamily:"Inter, sans-serif",fontSize:14,fontWeight:600,letterSpacing:"-1.5px",borderRadius:30}}>View on GitHub ↗</a>}
      </div>
    </div>
  );
}

function Nav(){
  const[sc,setSc]=useState(false);
  const[active,setActive]=useState("");
  const[menuOpen,setMenuOpen]=useState(false);
  useEffect(()=>{
    const fn=()=>{
      setSc(window.scrollY>50);
      const secs=["contact","achievements","certificates","events","projects","education"];
      for(const id of secs){const el=document.getElementById(id);if(el&&el.getBoundingClientRect().top<300){setActive(id);break;}}
    };
    window.addEventListener("scroll",fn);return()=>window.removeEventListener("scroll",fn);
  },[]);
  const links=["projects","education","events","certificates","achievements","contact"];
  return(
    <>
    <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:1000,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 52px",background:sc?"rgba(10,10,10,0.95)":"transparent",backdropFilter:sc?"blur(16px)":"none",borderBottom:sc?"1px solid rgba(200,29,51,0.1)":"none",transition:"all 0.4s"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}><SciFiLogo size={42} color="#EAE2DD"/><span style={{fontFamily:"Inter, sans-serif",fontWeight:600,fontSize:28,letterSpacing:"-1px",color:"#EAE2DD"}}>ZR</span></div>
      <div className="desktop-nav-links" style={{display:"flex",gap:28,alignItems:"center"}}>
        {links.map(n=>(
          <a key={n} href={`#${n}`} style={{color:active===n?"#C81D33":"#A49B95",textDecoration:"none",fontSize:14,fontFamily:"Inter, sans-serif",letterSpacing:"0px",transition:"color 0.2s",fontWeight:active===n?600:400}}
            onMouseEnter={e=>e.currentTarget.style.color="#EAE2DD"} onMouseLeave={e=>e.currentTarget.style.color=active===n?"#C81D33":"#A49B95"}>{n}</a>
        ))}
      </div>
      <button className={`hamburger${menuOpen?" open":""}`} onClick={()=>setMenuOpen(!menuOpen)}><span/><span/><span/></button>
    </nav>
    <div className={`mobile-nav${menuOpen?" open":""}`}>
      {links.map(n=><a key={n} href={`#${n}`} onClick={()=>setMenuOpen(false)}>{n}</a>)}
    </div>
    </>
  );
}


function MagneticBtn({children,style={},onClick=undefined}:any){
  const ref=useRef<HTMLButtonElement>(null);
  const handleMove=useCallback((e:React.MouseEvent)=>{
    const btn=ref.current;if(!btn)return;
    const r=btn.getBoundingClientRect();
    const x=(e.clientX-r.left-r.width/2)*0.2;
    const y=(e.clientY-r.top-r.height/2)*0.2;
    btn.style.transform=`translate(${x}px,${y}px)`;
  },[]);
  const handleLeave=useCallback(()=>{if(ref.current)ref.current.style.transform="";},[]);
  return <button ref={ref} className="magnetic-btn" style={style} onClick={onClick} onMouseMove={handleMove} onMouseLeave={handleLeave}>{children}</button>;
}

function Hero(){
  const[parallaxY,setParallaxY]=useState(0);
  useEffect(()=>{const fn=()=>setParallaxY(window.scrollY*0.3);window.addEventListener("scroll",fn);return()=>window.removeEventListener("scroll",fn);},[]);
  return(
    <section style={{minHeight:"100vh",display:"flex",alignItems:"center",padding:"0 52px",position:"relative",overflow:"hidden"}}>
      <ParticleField/>
      <HeroGlobe/>
      <div style={{position:"absolute",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,rgba(200,29,51,0.05) 0%,transparent 70%)",right:"8%",top:"50%",transform:`translateY(calc(-50% + ${parallaxY*0.2}px))`,pointerEvents:"none"}}/>
      <div className="hero-content-wrapper" style={{maxWidth:1200,width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",gap:60,position:"relative",zIndex:2}}>
        <Reveal className="reveal-left" style={{flex:1}}>
          <p style={{fontFamily:"'Space Mono',monospace",fontSize:15,letterSpacing:"2px",color:"#EAE2DD",textTransform:"uppercase",marginBottom:18}}>Hello, I am</p>
          <h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:"clamp(50px,8vw,85px)",lineHeight:1.0,color:"#B4A9A4",margin:"0 0 16px",letterSpacing:0}}>Ziaur<br/><span style={{WebkitTextStroke:"1.5px rgba(200,29,51,0.7)",color:"transparent",textShadow:"0 0 40px rgba(200,29,51,0.5), 0 0 80px rgba(200,29,51,0.2)"}}>Rahaman</span><span style={{color:"#C81D33"}}>.</span></h1>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:24,height:28}}>
            <span style={{fontFamily:"Inter, sans-serif",fontSize:18,color:"#EAE2DD"}}>Embedded & IoT | Cybersecurity Enthusiast</span>
          </div>
          <p style={{fontFamily:"'Inter',sans-serif",fontWeight:400,fontSize:17,color:"#A3A3A3",maxWidth:480,lineHeight:1.75,marginBottom:40}}>Specializing in the intersection of hardware and security. From architecting autonomous IoT systems to deploying live threat detection pipelines, I build technologies designed to operate securely in the real world.</p>
          <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
            <MagneticBtn onClick={()=>document.getElementById("projects")?.scrollIntoView({behavior:"smooth"})} style={{background:"#C81D33",color:"#0A0708",border:"none",padding:"14px 32px",fontFamily:"Inter, sans-serif",fontSize:14,letterSpacing:"-1.5px",cursor:"pointer",borderRadius:30,fontWeight:600}}>Explore Work</MagneticBtn>
          </div>
        </Reveal>
        <Reveal className="reveal-right hero-photo-wrapper" style={{flexShrink:0,width:260,position:"relative",marginRight:200}}>
          <div style={{position:"absolute",top:-30,right:-10,opacity:.5,animation:"float 4s ease-in-out infinite"}}><SciFiLogo size={55} color="rgba(200,29,51,0.4)"/></div>
          <div style={{width:"100%",height:430,borderRadius:30,background:"rgba(18, 13, 15, 0.4)",border:"1px solid rgba(200,29,51,0.12)",overflow:"hidden",boxShadow:"0 30px 80px rgba(0,0,0,0.8)",position:"relative"}}>
            <img src="/mine/ziaur2.jpg" alt="Ziaur" style={{width:"100%",height:"100%",objectFit:"cover",filter:"grayscale(0.7) contrast(1.1)"}}/>
            <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,#0A0708 5%,transparent 45%)"}}/>
          </div>
        </Reveal>
      </div>
      <style>{`@keyframes blink{50%{opacity:0}}`}</style>
    </section>
  );
}


function TiltCard({children,style={},onClick=undefined}:any){
  const ref=useRef<HTMLDivElement>(null);
  const handleMove=useCallback((e:React.MouseEvent)=>{
    const el=ref.current;if(!el)return;
    const r=el.getBoundingClientRect();
    const x=((e.clientX-r.left)/r.width-0.5)*12;
    const y=((e.clientY-r.top)/r.height-0.5)*-12;
    el.style.transform=`perspective(800px) rotateY(${x}deg) rotateX(${y}deg) translateY(-6px)`;
  },[]);
  const handleLeave=useCallback(()=>{if(ref.current)ref.current.style.transform="";},[]);
  return <div ref={ref} className="tilt-card" style={style} onClick={onClick} onMouseMove={handleMove} onMouseLeave={handleLeave}>{children}</div>;
}

function Slider({id,title,label,data,cats,onSel,dark,isSmall=false}){
  const[cat,setCat]=useState("All");
  const filtered=cats&&cat!=="All"?data.filter(d=>d.cat===cat):data;
  const[idx,setIdx]=useState(0);
  useEffect(()=>setIdx(0),[cat]);
  const N=isSmall?4:3,max=Math.max(0,filtered.length-N);
  const bg=dark?"transparent":"rgba(18, 13, 15, 0.3)";
  const itemHeight=isSmall?280:(data[0]&&data[0].img?420:380);
  const imgHeight=isSmall?180:240;

  return(
    <section id={id} style={{background:bg,padding:"110px 52px",overflow:"hidden"}}>
      <Reveal>
      <div style={{maxWidth:1200,margin:"0 auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:52,flexWrap:"wrap",gap:20}}>
          <div>
            <p style={{fontFamily:"Inter, sans-serif",fontSize:15,letterSpacing:"-1.5px",color:"#EAE2DD",marginBottom:8}}>{label}</p>
            <h2 style={{fontFamily:"Inter, sans-serif",fontWeight:600,fontSize:42,color:"#A3A3A3",margin:0,letterSpacing:"-1px"}}>{title}</h2>
          </div>
          {cats&&<div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {cats.map(c=><button key={c} onClick={()=>setCat(c)} style={{background:cat===c?"#FFFFFF":"transparent",color:cat===c?"#000000":"#FFFFFF",border:`1px solid ${cat===c?"#FFFFFF":"rgba(255,255,255,0.4)"}`,padding:"8px 18px",fontFamily:"Inter, sans-serif",fontSize:14,fontWeight:cat===c?700:400,letterSpacing:"-1px",cursor:"pointer",borderRadius:30,transition:"all .2s"}}>{c}</button>)}
          </div>}
        </div>

        <div style={{overflow:"hidden"}}>
          <div className="slider-items" style={{display:"flex",gap:22,transition:"transform .5s ease",transform:`translateX(calc(-${idx*(100/N)}% - ${idx*(22/N)}px))`}}>
            {filtered.map(item=>(
              <div key={item.title} onClick={()=>onSel(item)} style={{flex:`0 0 calc(${100/N}% - ${22*(N-1)/N}px)`,minWidth:isSmall?220:280,cursor:"pointer"}}>
                <TiltCard style={{height:itemHeight,background:"linear-gradient(145deg, #18080C, #0C0608)",border:"1px solid #33151A",borderRadius:8,overflow:"hidden",boxShadow:"0 10px 30px rgba(0,0,0,0.5)",transition:"border-color .3s, transform .15s ease-out"}}>
                  {item.img?(
                    <>
                      <div style={{height:imgHeight,overflow:"hidden"}}><img src={item.img} alt={item.title} style={{width:"100%",height:"100%",objectFit:"cover",opacity:.8,transition:"opacity .3s"}} onMouseEnter={e=>(e.target as HTMLImageElement).style.opacity="1"} onMouseLeave={e=>(e.target as HTMLImageElement).style.opacity="0.8"}/></div>
                      <div style={{padding:isSmall?16:24}}>
                        <span style={{fontFamily:"Inter, sans-serif",fontSize:13,color:"#FFFFFF",border:"1px solid rgba(255,255,255,0.4)",padding:"4px 10px",borderRadius:30,display:"inline-block"}}>{item.issuer||"Award"}</span>
                        <h3 style={{fontFamily:"Inter, sans-serif",fontWeight:600,fontSize:isSmall?20:24,color:"#FFFFFF",margin:"12px 0 0",letterSpacing:.5,lineHeight:1.2}}>{item.title}</h3>
                        {!isSmall&&<p style={{fontFamily:"'Inter',sans-serif",fontWeight:400,fontSize:14,color:"#D4CDC8",marginTop:12}}>Click to view details</p>}
                      </div>
                    </>
                  ):(
                    <div style={{padding:30,height:"100%",boxSizing:"border-box",display:"flex",flexDirection:"column"}}>
                      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
                        {item.tech&&item.tech.slice(0,3).map(t=><span key={t} style={{fontFamily:"Inter, sans-serif",fontSize:13,color:"#FFFFFF",border:"1px solid rgba(255,255,255,0.4)",padding:"4px 10px",borderRadius:30}}>{t}</span>)}
                      </div>
                      <h3 style={{fontFamily:"Inter, sans-serif",fontWeight:600,fontSize:24,color:"#FFFFFF",margin:"0 0 16px",letterSpacing:.5,lineHeight:1.2}}>{item.title}</h3>
                      <p style={{fontFamily:"'Inter',sans-serif",fontWeight:400,fontSize:16,color:"#D4CDC8",lineHeight:1.65,margin:0,flex:1,overflow:"hidden",display:"-webkit-box",WebkitBoxOrient:"vertical",WebkitLineClamp:4}}>{item.why||item.desc}</p>
                      <div style={{marginTop:20,opacity:0.6}}><GithubIcon size={22} color="#FFFFFF"/></div>
                    </div>
                  )}
                </TiltCard>
              </div>
            ))}
          </div>
        </div>

        {filtered.length>N&&<div style={{display:"flex",justifyContent:"center",gap:20,marginTop:36}}>
          <button onClick={()=>setIdx(i=>Math.max(i-1,0))} disabled={idx===0} style={{background:idx===0?"#222":"#FFFFFF",color:idx===0?"#555":"#000000",border:"none",width:54,height:54,borderRadius:"50%",fontSize:22,cursor:idx===0?"default":"pointer",transition:".3s",boxShadow:idx===0?"none":"0 4px 15px rgba(255,255,255,0.2)"}}>←</button>
          <button onClick={()=>setIdx(i=>Math.min(i+1,max))} disabled={idx>=max} style={{background:idx>=max?"#222":"#FFFFFF",color:idx>=max?"#555":"#000000",border:"none",width:54,height:54,borderRadius:"50%",fontSize:22,cursor:idx>=max?"default":"pointer",transition:".3s",boxShadow:idx>=max?"none":"0 4px 15px rgba(255,255,255,0.2)"}}>→</button>
        </div>}
      </div>
      </Reveal>
    </section>
  );
}


function BuilderProfile(){
  const sections = [
    { title: "Security & Monitoring", items: ["Wazuh SIEM", "Cowrie Honeypot", "Nmap", "Wireshark", "Burp Suite", "Fail2ban", "UFW", "iptables NAT", "Metasploit (basic)", "VirusTotal", "OSINT", "Log Analysis"] },
    { title: "Blue Team / SOC", items: ["SIEM (Wazuh 4.7.0)", "Honeypot Architecture", "Identity & Access Management", "MFA", "Least Privilege", "Incident Response", "Threat Detection", "MITRE ATT&CK"] },
    { title: "Networking", items: ["TCP/IP", "DNS", "DHCP", "HTTP/HTTPS", "VLANs", "ACLs", "SSH Tunneling", "Subnetting", "Cisco Packet Tracer"] },
    { title: "Programming & Tools", items: ["Python", "C", "Bash Scripting", "Docker", "Git/GitHub", "Firebase", "ESP32", "Arduino"] },
    { title: "Operating Systems", items: ["Kali Linux", "Ubuntu", "Raspberry Pi OS", "Windows"] },
    { title: "Generative AI & MCP", items: ["Claude AI (Anthropic)", "Gemini API", "Kimi2.5", "Prompt Engineering", "MCP (Model Context Protocol)", "OpenClaw automation"] }
  ];

  return(
    <section id="resume" style={{background:"transparent",padding:"80px 52px"}}>
      <Reveal>
      <div className="profile-wrapper" style={{maxWidth:1200,margin:"0 auto",background:"linear-gradient(145deg, #18080C, #0C0608)",borderRadius:12,padding:"60px",border:"1px solid #33151A",boxShadow:"0 20px 60px rgba(0,0,0,0.6)",display:"flex",flexWrap:"wrap",gap:60}}>
        
        <div style={{flex:"1 1 350px"}}>
          <p style={{fontFamily:"Inter, sans-serif",fontSize:15,letterSpacing:"-1.5px",color:"#EAE2DD",marginBottom:12}}>Professional Profile</p>
          <h2 style={{fontFamily:"Inter, sans-serif",fontWeight:600,fontSize:42,color:"#FFFFFF",margin:"0 0 30px",letterSpacing:"-1px"}}>About Me</h2>
          
          <div style={{fontFamily:"'Inter',sans-serif",fontSize:16,color:"#D4CDC8",lineHeight:1.7,display:"flex",flexDirection:"column",gap:16}}>
            <p style={{margin:0}}>I'm an Electronics & Telecommunication Engineering student with a deep passion for IoT, Embedded Systems, and Cybersecurity — not just as academic pursuits, but as tools to solve real-world problems that actually matter.</p>
            <p style={{margin:0}}>I believe the best technology is the kind you don't notice — it just works, stays secure, and makes life better. Whether it's designing embedded solutions, building connected systems, or exploring vulnerabilities before the wrong people do, I'm driven by the challenge of turning complex problems into clean, purposeful outcomes.</p>
            <p style={{margin:0}}>If you're working on something meaningful, or simply want to exchange ideas and grow together — let's connect on LinkedIn.</p>
          </div>

          <div style={{marginTop:40}}>
            <a href="https://www.linkedin.com/in/ziaur-rahaman-524588322" target="_blank" rel="noopener noreferrer" style={{display:"inline-block",background:"transparent",color:"#FFFFFF",border:"1px solid rgba(255,255,255,0.4)",textDecoration:"none",padding:"14px 28px",fontFamily:"Inter, sans-serif",fontWeight:600,fontSize:14,letterSpacing:"-1.5px",borderRadius:30,transition:"all 0.3s"}} onMouseEnter={e=>{e.currentTarget.style.background="#FFFFFF";e.currentTarget.style.color="#000"}} onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#FFFFFF"}}>Connect on LinkedIn ↗</a>
          </div>
        </div>

        <div style={{flex:"2 1 500px"}}>
          <h2 style={{fontFamily:"Inter, sans-serif",fontWeight:600,fontSize:42,color:"#FFFFFF",margin:"0 0 30px",letterSpacing:"-1px"}}>Technical Skills</h2>
          
          <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:"30px"}}>
            {sections.map(s => (
              <div key={s.title}>
                <h4 style={{fontFamily:"Inter, sans-serif",fontSize:14,color:"#EAE2DD",letterSpacing:"-1px",marginBottom:14,borderBottom:"1px solid #33151A",paddingBottom:8}}>{s.title}</h4>
                <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                  {s.items.map(t=>(
                    <span key={t} style={{fontFamily:"Inter, sans-serif",fontSize:13,color:"#FFFFFF",padding:"4px 10px",borderRadius:30,border:"1px solid rgba(255,255,255,0.2)",background:"rgba(255,255,255,0.03)"}}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{marginTop:50}}>
            <a href="/CV/Ziaur_Rahaman_Resume_v2_2.pdf" target="_blank" rel="noopener noreferrer" style={{display:"inline-block",background:"#C81D33",color:"#0A0708",textDecoration:"none",padding:"16px 40px",fontFamily:"Inter, sans-serif",fontWeight:600,fontSize:14,letterSpacing:"-1.5px",borderRadius:30,boxShadow:"0 10px 30px rgba(200,29,51,0.3)",transition:"all 0.3s"}} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 15px 40px rgba(200,29,51,0.5)"}} onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 10px 30px rgba(200,29,51,0.3)"}}>View Full Resume ↗</a>
          </div>
        </div>
      </div>
      </Reveal>
    </section>
  );
}

function Education(){
  const edu = [
    {
      year: "2024 — 2028",
      degree: "B.Tech — Electronics & Telecommunication Engineering",
      inst: "KIIT University, Bhubaneswar",
      details: "CGPA: 7.89 | Active Member — K-100 Cybersecurity Society",
      coursework: "Digital & Analog Electronics, Microprocessors & Embedded Systems, Communication Systems & Techniques"
    },
    {
      year: "2022",
      degree: "Senior Secondary Education (Class XII — WBCHSE)",
      inst: "Nangi High School",
      details: "Percentage: 86.4% (432/500)"
    },
    {
      year: "2020",
      degree: "Secondary Education (Class X — WBBSE)",
      inst: "Nangi High School",
      details: "Percentage: 88.6% (620/700)"
    }
  ];

  return(
    <section id="education" style={{background:"transparent",padding:"60px 52px 110px"}}>
      <Reveal>
      <div style={{maxWidth:1200,margin:"0 auto"}}>
        <p style={{fontFamily:"Inter, sans-serif",fontSize:15,letterSpacing:"-1.5px",color:"#EAE2DD",marginBottom:12}}>Academic Foundation</p>
        <h2 style={{fontFamily:"Inter, sans-serif",fontWeight:600,fontSize:42,color:"#A3A3A3",margin:"0 0 50px",letterSpacing:"-1px"}}>Education Journey</h2>
        
        <div style={{display:"flex",flexDirection:"column",gap:24,position:"relative"}}>
          <div style={{position:"absolute",left:24,top:0,bottom:0,width:1,background:"linear-gradient(to bottom, transparent, #C81D33 10%, #C81D33 90%, transparent)"}}/>
          {edu.map((e,i)=>(
            <div key={i} style={{position:"relative",paddingLeft:70,perspective:1000}}>
              <div style={{position:"absolute",left:18,top:32,width:12,height:12,borderRadius:"50%",background:"#C81D33",boxShadow:"0 0 15px #C81D33",zIndex:2}}/>
              <div style={{background:"rgba(18, 13, 15, 0.4)",border:"1px solid #22181B",padding:"32px 40px",borderRadius:30,transition:"all 0.4s ease",cursor:"default"}}
                onMouseEnter={el=>{el.currentTarget.style.transform="translateX(10px) rotateY(-5deg)";el.currentTarget.style.borderColor="#C81D3333";el.currentTarget.style.background="#0e0e0e";}}
                onMouseLeave={el=>{el.currentTarget.style.transform="translateX(0) rotateY(0)";el.currentTarget.style.borderColor="#22181B";el.currentTarget.style.background="rgba(18, 13, 15, 0.5)";}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10,marginBottom:14}}>
                   <h3 style={{fontFamily:"Inter, sans-serif",fontWeight:600,fontSize:24,color:"#A3A3A3",margin:0,letterSpacing:"-1px"}}>{e.degree}</h3>
                   <span style={{fontFamily:"Inter, sans-serif",fontSize:15,color:"#EAE2DD",background:"rgba(200,29,51,0.1)",padding:"4px 12px",borderRadius:30}}>{e.year}</span>
                </div>
                <p style={{fontFamily:"'Inter',sans-serif",fontSize:16,color:"#A3A3A3",fontWeight:500,margin:"0 0 8px"}}>{e.inst}</p>
                <p style={{fontFamily:"Inter, sans-serif",fontSize:15,color:"#A49B95",margin:"0 0 16px",lineHeight:1.6}}>{e.details}</p>
                {e.coursework && (
                  <div style={{borderTop:"1px solid #22181B",paddingTop:16,marginTop:8}}>
                    <span style={{fontFamily:"Inter, sans-serif",fontSize:14,color:"#EAE2DD",letterSpacing:"-1.5px",display:"block",marginBottom:8}}>Relevant Coursework</span>
                    <p style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:"#A49B95",lineHeight:1.6,margin:0}}>{e.coursework}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      </Reveal>
    </section>
  );
}

function Events(){
  const events = [
    {
      title: "Kreativity 3.0 — Robotics Exhibition",
      project: "LL1.0 Quadruped Robot",
      img: "/event/kreativity/kre-1.jpeg",
      desc: "Presented and demonstrated LL1.0, a 12-DOF Quadruped Disaster Surveillance Robot designed for hazardous environments. Showcased real-world robotics, live control, and intelligent features.",
      result: "Secured 3rd Position among 116 teams in the exhibition.",
      features: [
        "12 Degrees of Freedom for terrain-adaptive locomotion",
        "Inverse Kinematics-based gait control",
        "Real-time WebSocket control & Vision-based detection"
      ],
      stack: ["Python", "C++", "WebSockets", "Computer Vision"],
      label: "Exhibition — 3rd Place"
    },
    {
      title: "Pragati — The Bengal Hackfest 2026",
      project: "Autonomous Snake Detection System",
      img: "/event/pragati/WhatsApp Image 2026-04-23 at 9.56.58 PM.jpeg",
      desc: "Led the team as both Team Lead and Tech Lead at Jadavpur University. Built an Autonomous Snake Detection System using a custom YOLO model to identify 4 categories of venomous snakes. Designed a biomimetic trap combining Trifecta lure, AI vision, and an automated door-locking response system.",
      result: "Selected among the Top 8 teams at Pragati Hackathon.",
      experience: "We missed out in the final business round due to unclear pitching. That experience taught me something important: a strong project needs equally strong communication.",
      stack: ["YOLO", "OpenCV", "Flask", "Raspberry Pi", "Arduino C++"],
      label: "Hackathon — Top 8 Finalist"
    }
  ];

  return(
    <section id="events" style={{background:"transparent",padding:"110px 52px"}}>
      <Reveal>
      <div style={{maxWidth:1200,margin:"0 auto"}}>
        <p style={{fontFamily:"Inter, sans-serif",fontSize:15,letterSpacing:"-1.5px",color:"#EAE2DD",marginBottom:12}}>Milestones</p>
        <h2 style={{fontFamily:"Inter, sans-serif",fontWeight:600,fontSize:42,color:"#A3A3A3",margin:"0 0 60px",letterSpacing:"-1px"}}>Major Events</h2>
        
        <div className="events-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(450px, 1fr))",gap:40}}>
          {events.map((ev,i)=>(
            <div key={i} style={{background:"linear-gradient(145deg, #18080C, #0C0608)",border:"1px solid #33151A",borderRadius:8,overflow:"hidden",display:"flex",flexDirection:"column",transition:"all 0.4s ease",boxShadow:"0 10px 30px rgba(0,0,0,0.5)"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="#C81D33";e.currentTarget.style.transform="translateY(-10px)"}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="#33151A";e.currentTarget.style.transform="translateY(0)"}}>
              <div style={{height:400,overflow:"hidden",position:"relative"}}>
                <img src={ev.img} alt={ev.title} style={{width:"100%",height:"100%",objectFit:"cover",opacity:0.7,transition:"opacity 0.3s"}} onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=0.7}/>
                <div style={{position:"absolute",top:20,right:20,background:"#C81D33",color:"#0A0708",fontFamily:"Inter, sans-serif",fontSize:14,fontWeight:600,padding:"6px 14px",borderRadius:30,}}>{ev.label}</div>
              </div>
              <div style={{padding:40,flex:1,display:"flex",flexDirection:"column"}}>
                <span style={{fontFamily:"Inter, sans-serif",fontSize:14,color:"#EAE2DD",letterSpacing:"-1.5px",}}>{ev.project}</span>
                <h3 style={{fontFamily:"Inter, sans-serif",fontWeight:600,fontSize:28,color:"#FFFFFF",margin:"12px 0 20px",letterSpacing:"-1px"}}>{ev.title}</h3>
                <p style={{fontFamily:"'Inter',sans-serif",fontSize:16,color:"#D4CDC8",lineHeight:1.7,marginBottom:24}}>{ev.desc}</p>
                
                {ev.experience && <p style={{fontFamily:"'Inter',sans-serif",fontSize:15,color:"#EAE2DD",fontStyle:"italic",lineHeight:1.6,marginBottom:24,borderLeft:"2px solid #C81D33",paddingLeft:16}}>"{ev.experience}"</p>}
                {ev.result && <div style={{marginBottom:24,fontFamily:"Inter, sans-serif",fontSize:14,color:"#D4CDC8",background:"rgba(200,29,51,0.1)",padding:"10px 16px",borderRadius:30}}>🏆 {ev.result}</div>}
                
                <div style={{marginTop:"auto"}}>
                  <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:24}}>
                    {ev.stack.map(s=><span key={s} style={{fontFamily:"Inter, sans-serif",fontSize:13,color:"#FFFFFF",border:"1px solid rgba(255,255,255,0.4)",padding:"4px 10px",borderRadius:30}}>{s}</span>)}
                  </div>
                  <div style={{opacity:0.6}}><GithubIcon size={22} color="#FFFFFF"/></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      </Reveal>
    </section>
  );
}

function Contact(){
  return(
    <section id="contact" style={{background:"transparent",padding:"120px 52px"}}>
      <Reveal>

      <div style={{maxWidth:1100,margin:"0 auto"}}>
        <p style={{fontFamily:"Inter, sans-serif",fontSize:15,letterSpacing:"-1.5px",color:"#EAE2DD",marginBottom:24,textAlign:"center"}}>Reach Out</p>
        
        <div className="contact-container contact-grid" style={{background:"rgba(18, 13, 15, 0.4)",borderRadius:304,padding:"50px 60px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:60,alignItems:"center",border:"1px solid #22181B",boxShadow:"0 40px 100px rgba(0,0,0,0.5)"}}>
          
          <div>
            <h2 style={{fontFamily:"Inter, sans-serif",fontSize:42,fontWeight:600,color:"#FFFFFF",margin:"0 0 12px",letterSpacing:"1px",}}>Let's Build Something</h2>
            <p style={{fontFamily:"'Inter',sans-serif",fontSize:16,color:"#D4CDC8",margin:"0 0 32px",lineHeight:1.6}}>Ready to collaborate on your next product? Let's talk.</p>
            
            <div style={{position:"relative",width:"100%",height:260,borderRadius:12,overflow:"hidden",border:"1px solid #222"}}>
              <iframe 
                src="https://maps.google.com/maps?q=KIIT+University+KP-5+Hostel&t=&z=16&ie=UTF8&iwloc=&output=embed" 
                width="100%" height="100%" style={{border:0,filter:"invert(90%) hue-rotate(180deg) contrast(1.1) grayscale(20%)"}} 
                allowFullScreen="" loading="lazy">
              </iframe>
              <a href="https://www.google.com/maps/search/?api=1&query=KIIT+University+KP-5+Hostel" target="_blank" rel="noopener noreferrer" 
                 style={{position:"absolute",top:16,left:16,background:"rgba(10,10,10,0.85)",backdropFilter:"blur(8px)",color:"#e0e0e0",padding:"8px 14px",borderRadius:6,fontFamily:"'Inter',sans-serif",fontSize:15,textDecoration:"none",border:"1px solid #333",display:"flex",alignItems:"center",gap:6,transition:"background 0.2s"}}
                 onMouseEnter={e=>e.currentTarget.style.background="#000"} onMouseLeave={e=>e.currentTarget.style.background="rgba(10,10,10,0.85)"}>
                Open in Maps ↗
              </a>
            </div>
            
            <div style={{display:"flex",gap:20,marginTop:24}}>
              {[["Email","2404154@kiit.ac.in"],["GitHub","blup-blup-spec"]].map(([l,v])=>(
                <div key={l}>
                  <span style={{fontFamily:"Inter, sans-serif",fontSize:13,color:"#A49B95",display:"block",marginBottom:4}}>{l}</span>
                  <span style={{fontFamily:"'Inter',sans-serif",fontSize:16,color:"#FFFFFF",fontWeight:500}}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <input placeholder="Your name" style={{background:"transparent",border:"1px solid #33151A",padding:"18px 24px",color:"#FFFFFF",outline:"none",fontFamily:"'Inter',sans-serif",fontSize:16,borderRadius:12,width:"100%",boxSizing:"border-box",transition:"border-color 0.2s"}} onFocus={e=>e.target.style.borderColor="#C81D33"} onBlur={e=>e.target.style.borderColor="#33151A"}/>
            <input placeholder="name@email.com" style={{background:"transparent",border:"1px solid #33151A",padding:"18px 24px",color:"#FFFFFF",outline:"none",fontFamily:"'Inter',sans-serif",fontSize:16,borderRadius:12,width:"100%",boxSizing:"border-box",transition:"border-color 0.2s"}} onFocus={e=>e.target.style.borderColor="#C81D33"} onBlur={e=>e.target.style.borderColor="#33151A"}/>
            <textarea placeholder="Write a Message..." rows={6} style={{background:"transparent",border:"1px solid #33151A",padding:"20px 24px",color:"#FFFFFF",outline:"none",fontFamily:"'Inter',sans-serif",fontSize:16,borderRadius:12,resize:"none",width:"100%",boxSizing:"border-box",transition:"border-color 0.2s"}} onFocus={e=>e.target.style.borderColor="#C81D33"} onBlur={e=>e.target.style.borderColor="#33151A"}/>
            
            <MagneticBtn style={{background:"#C81D33",color:"#0A0708",border:"none",padding:"16px 32px",fontFamily:"Inter, sans-serif",fontSize:14,fontWeight:600,letterSpacing:"-1.5px",cursor:"pointer",borderRadius:30,alignSelf:"flex-start",marginTop:8}}>Send Message</MagneticBtn>
          </div>
          
        </div>
      </div>
      </Reveal>
    </section>
  );
}

export default function App(){
  const[sel,setSel]=useState(null);
  const[introDone,setIntroDone]=useState(false);
  const[bgY,setBgY]=useState(0);
  useEffect(()=>{
    document.body.style.margin="0";
    document.body.style.cursor="none";
    document.body.style.overflowX="hidden";
    const lk=document.createElement("link");
    lk.rel="stylesheet";
    lk.href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono&display=swap";
    document.head.appendChild(lk);
    // End intro after animation
    setTimeout(()=>setIntroDone(true),2000);
    // Parallax scroll for BG
    const onScroll=()=>setBgY(window.scrollY*0.15);
    window.addEventListener("scroll",onScroll);
    return()=>window.removeEventListener("scroll",onScroll);
  },[]);
  return(
    <div style={{background:"transparent",minHeight:"100vh"}}>
      <IntroScreen done={introDone}/>
      {/* Parallax Red Marble Texture Layer */}
      <div style={{position:"fixed",inset:0,zIndex:-1,background:"url('/bg.png') no-repeat center center",backgroundSize:"cover",filter:"blur(8px) brightness(0.85)",transform:`scale(1.05) translateY(${bgY}px)`}}/>
      <Cursor/>
      <Nav/>
      <Hero/>
      <BuilderProfile/>
      <Education/>
      <Slider id="projects" title="Projects" label="Work" data={projects} cats={PROJECT_CATS} onSel={setSel} dark={false}/>
      <Events/>
      <Slider id="certificates" title="Certificates" label="Credentials" data={certificates} onSel={setSel} dark={true} isSmall={true}/>
      <Slider id="achievements" title="Achievements" label="Recognition" data={achievements} onSel={setSel} dark={false}/>
      <Contact/>
      <Modal item={sel} onClose={()=>setSel(null)}/>
      <footer style={{padding:"36px 52px",textAlign:"center",borderTop:"1px solid rgba(200,29,51,0.15)"}}>
        <span style={{fontFamily:"Inter, sans-serif",fontSize:14,color:"#A49B95",letterSpacing:"-0.5px"}}>© 2026 Ziaur Rahaman · Cybersecurity Enthusiast</span>
      </footer>
      <BackToTop/>
    </div>
  );
}
