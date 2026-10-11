/* The atlas retains its accessible DOM controls; planets are actual lit 3D meshes. */
window.GalaxyWebGLRenderer = class {
  constructor(atlas) { this.atlas=atlas; this.ready=false; this.dead=false; this.meshes=new Map(); this.start(); }
  async start() {
    try {
      const T=await import('./vendor/three.module.js'); if(this.dead)return; this.T=T;
      this.renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
      this.renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));
      this.renderer.setClearColor(0,0); this.renderer.outputColorSpace=T.SRGBColorSpace;
      this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.1;
      this.renderer.domElement.className='galaxy-webgl';this.renderer.domElement.setAttribute('aria-hidden','true');
      this.atlas.stage.insertBefore(this.renderer.domElement,this.atlas.nodes);
      this.scene=new T.Scene();this.camera=new T.OrthographicCamera(-1,1,1,-1,.1,10000);
      this.renderer.domElement.addEventListener('webglcontextlost',event=>{if(this.dead)return;event.preventDefault();this.ready=false;this.renderer.domElement.hidden=true;this.atlas.stage.dataset.renderer='canvas';this.atlas.labelKey=null;this.atlas.draw();});
      this.scene.add(new T.AmbientLight(0x91acd4,.38));
      const sun=new T.DirectionalLight(0xffe7bf,2.4);sun.position.set(-1700,1000,800);this.scene.add(sun);
      const rim=new T.DirectionalLight(0x5386ff,.65);rim.position.set(1400,-600,-400);this.scene.add(rim);
      const sphere=new T.SphereGeometry(1,32,20); this.sharedGeometry=sphere;
      for(const loc of this.atlas.locations){
        if(loc.id==='maw'||loc.rim==='station')continue;
        const seed=[...loc.id].reduce((s,c)=>(Math.imul(s,31)+c.charCodeAt(0))>>>0,7);
        const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;
        const ctx=canvas.getContext('2d'),hue=[196,22,144,265,40,220][seed%6];
        ctx.fillStyle=`hsl(${hue} 32% 30%)`;ctx.fillRect(0,0,512,256);
        let rand=seed;const random=()=>((rand=Math.imul(rand,1664525)+1013904223>>>0)/4294967296);
        for(let i=0;i<240;i++){ctx.fillStyle=`hsla(${hue+random()*25} ${20+random()*45}% ${20+random()*45}% / ${.1+random()*.5})`;ctx.beginPath();ctx.ellipse(random()*512,random()*256,8+random()*70,2+random()*14,random()*2,0,Math.PI*2);ctx.fill();}
        const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
        const material=new T.MeshStandardMaterial({map:texture,roughness:.86,metalness:.08});
        const mesh=new T.Mesh(sphere,material);mesh.userData.seed=seed;mesh.userData.loc=loc;
        const halo=new T.Mesh(sphere,new T.ShaderMaterial({transparent:true,side:T.BackSide,depthWrite:false,uniforms:{color:{value:new T.Color(0x76bfff)}},vertexShader:'varying vec3 n;varying vec3 v;void main(){vec4 p=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);v=normalize(-p.xyz);gl_Position=projectionMatrix*p;}',fragmentShader:'uniform vec3 color;varying vec3 n;varying vec3 v;void main(){float a=pow(1.-abs(dot(normalize(n),normalize(v))),3.)*.35;gl_FragColor=vec4(color,a);}'}));halo.scale.setScalar(1.09);mesh.add(halo);
        if(seed%7===1){const ring=new T.Mesh(new T.RingGeometry(1.4,1.85,64),new T.MeshBasicMaterial({color:0xa2acae,transparent:true,opacity:.5,side:T.DoubleSide,depthWrite:false}));ring.rotation.x=1.1;mesh.add(ring);}
        this.scene.add(mesh);this.meshes.set(loc.id,mesh);
      }
      this.ready=true;this.atlas.stage.dataset.renderer='webgl';this.atlas.labelKey=null;this.atlas.draw();
    } catch(error) { this.atlas.stage.dataset.renderer='canvas';this.renderer?.dispose();this.renderer?.domElement.remove(); }
  }
  syncCamera(){
    if(!this.ready)return;const a=this.atlas,T=this.T,s=a.base*a.zoom;
    const tilt=a.chart?1:(a.orbitTilt??(a.width<700?.78:.59)),rot=a.chart?0:(a.orbitYaw??-.12);
    this.tilt=tilt;this.rot=rot;
    this.camera.left=-a.width*.48/s;this.camera.right=a.width*.52/s;this.camera.top=a.height*.52/s;this.camera.bottom=-a.height*.48/s;
    const target=new T.Vector3(-a.pan.x,a.pan.y/tilt,0);
    this.camera.position.copy(target).add(new T.Vector3(0,Math.sqrt(1-tilt*tilt)*2500,tilt*2500));
    this.camera.lookAt(target);this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld();
  }
  point(v){const c=Math.cos(this.rot),s=Math.sin(this.rot);return new this.T.Vector3(v.x*c-v.y*s,-(v.x*s+v.y*c),0);}
  project(v){const p=this.point(v).project(this.camera);return {x:(p.x+1)*this.atlas.width/2,y:(1-p.y)*this.atlas.height/2,depth:v.y/1100};}
  render(){
    if(!this.ready||this.dead)return;const a=this.atlas;
    if(this.width!==a.width||this.height!==a.height){this.width=a.width;this.height=a.height;this.renderer.setSize(a.width,a.height,false);}
    this.renderer.domElement.hidden=a.chart;
    if(a.chart)return;
    for(const [id,mesh] of this.meshes){const p=a.positions.get(id);mesh.visible=!!p;if(!p)continue;
      const loc=mesh.userData.loc,angle=(loc.angle-90)*Math.PI/180;
      const v=loc.x!=null?{x:loc.x-1000,y:loc.y-1000}:{x:Math.cos(angle)*loc.radius,y:Math.sin(angle)*loc.radius};
      mesh.position.copy(this.point(v));mesh.scale.setScalar(p.radius/(a.base*a.zoom));
      mesh.rotation.y=a.motion?a.time*.00006+(mesh.userData.seed%9):mesh.userData.seed%9;
    }
    this.renderer.render(this.scene,this.camera);
  }
  destroy(){this.dead=true;this.scene?.traverse(o=>{if(o.material){o.material.map?.dispose();o.material.dispose();}if(o.geometry&&o.geometry!==this.sharedGeometry)o.geometry.dispose();});this.sharedGeometry?.dispose();this.renderer?.dispose();this.renderer?.forceContextLoss();this.renderer?.domElement.remove();}
};
