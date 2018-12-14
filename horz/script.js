(function(){
var IS_IE = ("ActiveXObject" in window);
var IS_EDGE = ("StyleMedia" in window) && !IS_IE;

/*var P1 = window['P1'],
    P2 = window['P2'],
    LOGO = window['LOGO'],
    T1 = window['T1'],
    T2 = window['T2'],
    L1 = window['L1'],
    WP = window['WP'],
    BU = window['BU'],
    FONTS = window['FONTS'];
*/
if(IS_IE){
    P1.setAttribute('class', 'ie-is-stupid');
    P2.setAttribute('class', 'ie-is-stupid');
    LOGO.setAttribute('class', 'ie-is-really-stupid');
} else {
    P1.setAttribute('class', 'page');
    P2.setAttribute('class', 'page');
}

var HAS_ANIM = document.createElement('div').style.animationName !== undefined;
var transform = HAS_ANIM ? 'transform' : '-ms-transform';
var FPS = 10,
    ORIGFPS=FPS;
var setStyle;

try {
    document.createElement('div').style.setProperty('opacity', 0.5);
    setStyle = function(e,s,v){
        e.style.setProperty(s,v);
    };
} catch (_) {
    setStyle = function(e,s,v){
        e.style[s]=v;
    };
}

function after(s, f) {
    function run(){
        setTimeout(f, s * 1000);
    }
    if(this.then)
        this.then(run);
    else
        run();
}

var anim_shim = (function() {
    function setOpa(e,v) {setStyle(e,'opacity',v);}
    var anims = {
        'fade': {start: 1, end: 0, set: setOpa},
        'appear': {start: 0, end: 1, set: setOpa},
        'rp1': {start: 9, end: 8, set: function(e,v){setStyle(e,transform, "rotate("+v+"deg)");}},
        'rp2': {start: 9, end: 11, set: function(e,v){setStyle(e,transform, "translate(2px,2.5px) rotate("+v+"deg)");}},
        'marktext': {start:0, end:1, set: function(e,v){e.setAttribute('transform', "scale("+v+" 1)");}},
        'slide': {start:0, end:1, set: function(e,v){setOpa(e,v);setStyle(e,transform, "translate("+(1-v)*20+"px,"+(1-v)*50+"px)");}},
        'slide-ie-edge': {start:0, end:1, set: function(e,v){setStyle(e,transform, "translate("+(1-v)*20+"px,"+(1-v)*50+"px) rotate(9deg)");}}
    };
    
    return function(e, n, l, s, d){
        s=s||0;
        var sv=anims[n].start,
            ev=anims[n].end,
            set=anims[n].set,
            step=(ev-sv)/(l*FPS),
            cb=false;
        
        function anim(){
          var iId = setInterval(function(){
              sv+=step;
              if((sv>ev && step>0)||(sv<ev && step<=0)){
                  sv=ev;
                  clearInterval(iId);
                  if(cb){
                      cb();
                  }
                  cb="done";
              }
              set(e,sv);
          }, 1000/FPS);
        }
        set(e, sv);
        if(s===0){
            anim();
        } else {
            setTimeout(anim, s*1000);
        }
        return { after: after, then: function(f){cb==='done'?f():cb=f;}};
    };
})();

var animate = !HAS_ANIM ? anim_shim : function(e, n, l, s, d){
    d=d||"linear";
    s=s||0;
    
    setStyle(e,'animation-name',n);
    setStyle(e,'animation-duration',l+'s');
    setStyle(e,'animation-timing-function',d);
    setStyle(e,'animation-delay',s+'s');
    setStyle(e,'animation-fill-mode','both');
    return { after: after, then: function(f) {
        function handle(ev) {
            if(ev.animationName === n)
                f();
        }
        e.addEventListener('animationend', handle);
    }};
};

function markText(){

    if (markText.run) {
      return;
    }
    markText.run = true;
    
    function get(e,i){return (e.contentDocument || e).getElementById(i);}

    var title = get(P1, 'TITLE'),
        cont = get(P1, 'CONTENT'),
        marks= get(P1, 'MARKS'),
        mark = get(P1, 'MARK'),
        head = get(P1, 'HEADING');

    function getWordAt(s, p){
        while(/\s/.test(s[p])) p--;    
        var l = s.slice(0, p + 1).search(/\S+\s*$/),
            r = s.slice(p).search(/\s/);
        return r < 0 ? [l, s.length - 1] : [l, r + p - 1];
    }

    function normStr(s){
        return s.replace(/\n\s+/g, "\n").trim();
    }

    function randomWord(s){
        s = normStr(s);
        var t=5,w;
        do {
            w = getWordAt(s, Math.floor(Math.random() * s.length));
        } while(t-->0&&w[1]-w[0]<5);
        return w;
    }

    /**
     * @param {!SVGTextContentElement} e
     * @param {!Element} t
     * @param {!Element} m
     * @param {number} d
     * @returns {!Element}
     */
    function markWord(e, t, m, d){
        var mc = m.cloneNode(true);
        var g = t.ownerDocument.createElementNS(t.namespaceURI, 'g'),
            c = randomWord(e.textContent).map(function(n){return e.getExtentOfChar(n);}),
            x = c[0].x,
            y = Math.min(c[0].y, c[1].y),
            w = c[1].width + c[1].x - x,
            h = Math.max(c[0].height, c[1].height);

        t.appendChild(g);
        g.setAttribute('transform', "translate("+x+" "+y+")");
        g.appendChild(mc);
        
        mc.setAttribute('height', h);
        mc.setAttribute('width', w);
        if (HAS_ANIM) FPS = 20;
        ((IS_IE || IS_EDGE) ? anim_shim : animate)(mc, 'marktext', 1, d, 'ease');
        FPS = ORIGFPS;
        return mc;
    }

    markWord(title, marks, mark, 0),
    markWord(head, marks, mark, 0.5),
    markWord(cont, marks, mark, 0.6),
    markWord(cont, marks, mark, 0.9),
    markWord(cont, marks, mark, 1);
    markWord(cont, marks, mark, 1);

    
    if(!HAS_ANIM){
        marks.setAttribute('transform','translate(0 -680) scale(3.4)');
    }

    animate(P1, 'rp1', 1, 0, 'ease-in');
    animate(P2, 'rp2', 1, 0, 'ease-in');
}

markText.run = false;

function showT1(){
    for(var i=0;i<T1.children.length;++i){
        setStyle(T1.children[i],'opacity',0);
        animate(T1.children[i], 'appear', 1, i/4);
    }
    setStyle(T1,'opacity',1);
    return animate(T1, 'fade', 1, 4);
}

function showLogo(){
    return animate(L1, 'appear', 1);
}

var animStart = false;

function showWP(){
    if (animStart) return;
    animStart = true;
    after(8, markText);
    
    function pages(){
        P1.addEventListener('load', showWP, 1);   
        function el() {document.removeEventListener('mousemove', el); markText();}
        document.addEventListener('mousemove', el);
    }
    if (IS_IE || IS_EDGE) {
        animate(P1, 'slide-ie-edge', 1.5);
        animate(P2, 'slide-ie-edge', 1.5);
        animate(WP, 'appear', 1.5).then(pages);
    } else {
        animate(WP, 'slide', 1.5);
        pages();
    }
}

function showT2(){
    after(0.5, showBU);
    return animate(T2, 'appear', 1);
}

function showBU(){
    return animate(BU, 'appear', 1);
}
showT1().after(0.5, showT2);
after(2, showLogo);
after(3.5, showWP);


P1.addEventListener('load', function(e){
    if(!(P1 instanceof BU.constructor)){
        var defs = e.target.contentDocument.getElementById('DEFS'),
            sty = e.target.contentDocument.createElementNS(defs.namespaceURI, 'style');
        sty.textContent = FONTS.textContent;
        defs.appendChild(sty);
    }
}, true);
})();
