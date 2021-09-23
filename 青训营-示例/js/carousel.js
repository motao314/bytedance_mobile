class Carousel {
    constructor(opt) {
        for(let s in opt){
            this[s] = opt[s];
        }
        let {wrap} = opt;
        this.parent = wrap.parentNode;
        this.viewWidth = this.parent.clientWidth;
        this.isAnimate = false;
        this.isMove = false;
        this.animateTime = 0;
        this.isBreak = false;
        this.initLayout();
        this.imgsLen = wrap.children.length;
        enableGesture(wrap);
        wrap.addEventListener("start", this.start);
        wrap.addEventListener("panstart", this.panstart);
        wrap.addEventListener("pan", this.move);
        wrap.addEventListener("panend", this.end);
        wrap.addEventListener("end", ()=>{
            if(this.isBreak){
                this.isBreak = false;
                this.end();
            }
            this.autoPlay();
        });
        wrap.querySelectorAll("img").forEach(item => {
            item.addEventListener("dragstart", event => event.preventDefault());
        });
        this.autoPlay();
    }
    start = ()=>{
        if(this.animateTime){
            clearInterval(this.animateTime);
            this.isBreak = true;
        } else {
            this.isBreak = false;
        }
        clearInterval(this.autoTimer);
    }
    panstart = (e) => {
        let dx = e.clientX - e.startX,dy = e.clientY - e.startY;
        if(Math.abs(dx) > Math.abs(dy)){
            this.isMove = true;
        }
        if(this.isMove){
            this.init();
            this.offsetX = this.x;
            e.stop();
        }
    };
    move = (e) => {
        if (this.isMove) {
            let disX = e.clientX - e.startX;
            this.x = this.offsetX + disX;
            this.setTransform();
            e.stop();
        }
    };
    end = (e) => {
        this.isMove = false;
        this.index = Math.round(-this.x/this.viewWidth);
        let targetX = -this.index*this.viewWidth;
        if(Math.abs(targetX - this.x)>20){
            this.animate(targetX);
        } else {
            this.x = targetX;
            this.setTransform();
        }
        this.setNavs();
    };
    initLayout(){
        const imgs = this.wrap.children;
        const fastChild  = imgs[0];
        const lastChild  = imgs[imgs.length-1];
        this.wrap.insertBefore(lastChild.cloneNode(true),fastChild);
        this.wrap.appendChild(fastChild.cloneNode(true));
        this.x = -this.viewWidth;
        this.index = 1;
        this.setTransform();
    }
    init() {
        if(this.index === 0||this.index===this.imgsLen-1){
            this.resetLayout();
        }
    }
    resetLayout(){
        let targetIndex = -this.index*this.viewWidth;
        let disX = targetIndex - this.x;
        if(this.index === 0){
            this.index = this.imgsLen - 2;
        } else if(this.index === this.imgsLen - 1){
            this.index = 1;
        }
        this.x = -this.index*this.viewWidth + disX;
        this.setTransform();
    }
    autoPlay(){
        this.autoTimer = setInterval(()=>{
            if(this.index === this.imgsLen-1){
                this.resetLayout();
            }
            this.index++;
            this.animate(-this.index*this.viewWidth);
            this.setNavs();
        },3000);
    }
    animate(targetX) {
        const time = Math.abs(targetX - this.x);
        let t = 0;
        let b = this.x;
        let c = targetX - this.x;
        let d = Math.ceil(time/(1000/60));
        clearTimeout(this.animateTime);
        this.animateTime = setInterval(()=>{
            t++;
            if(t === d){
                clearInterval(this.animateTime);
                this.animateTime = 0;
            }
            this.x = this.easeOut(t,b,c,d);
            this.setTransform();
        },1000/60); 
    }
    /*
    t: current time（当前时间）；
    b: beginning value（初始值）；
    c: change in value（变化量）；
    d: duration（持续时间）。
    */
    easeOut (t, b, c, d) {
        return -c *(t/=d)*(t-2) + b;
    }
    setTransform(){
        this.wrap.style.transform = `translate3d(${this.x}px,0,0)`;
    }
    setNavs() {
        if (!this.navs.length) {
            return;
        }
        this.navs.forEach(nav => {
            nav.className = ""
        });
        const nowIndex = this.index>0?(this.index - 1)%this.navs.length:this.navs.length-1;
        this.navs[nowIndex].className = "active";
    }
}