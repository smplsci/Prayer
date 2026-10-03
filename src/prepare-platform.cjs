const fs=require('fs'),path=require('path'),dir=__dirname,root=path.basename(dir)==='src'?path.dirname(dir):path.join(dir,'منصة-مدار');
const build=path.join(dir,'build-exercises.cjs');let builder=fs.readFileSync(build,'utf8');if(!builder.includes("'platform-polish.js'")){builder=builder.replace("fs.readFileSync(path.join(__dirname,'scene-zoom.js'),'utf8')","fs.readFileSync(path.join(__dirname,'scene-zoom.js'),'utf8')+'\\n'+fs.readFileSync(path.join(__dirname,'platform-polish.js'),'utf8')");fs.writeFileSync(build,builder)}
require('./build-exercises.cjs');
fs.mkdirSync(path.join(root,'docs'),{recursive:true});fs.mkdirSync(path.join(root,'.github','workflows'),{recursive:true});
let html=fs.readFileSync(path.join(dir,'تمارين-مدار.html'),'utf8');
html=html.replace('</head>','<script src="cloud-config.js"></script></head>').replace('</body>','<script src="cloud-access.js?v=20261003-rings7"></script></body>');
html=html.replace("KEY='madar-exercises-v1'","KEY=window.MADAR_PACK?'madar-course-'+window.MADAR_PACK.id:'madar-exercises-v1'");
html=html.replace('let current=null,filter=',"if(window.MADAR_PACK&&!state.courseLoaded){state.tasks=structuredClone(window.MADAR_PACK.tasks);state.settings={...DEFAULTS,...window.MADAR_PACK.settings};state.courseLoaded=true;}\nlet current=null,filter=");
html=html.replace('<script>\n\'use strict\';','<!--COURSE_DATA--><script>\n\'use strict\';');
const safeSource=JSON.stringify(html).replace(/</g,'\\u003c');
const author=html.replace('<!--COURSE_DATA-->',()=>`<script>window.MADAR_SOURCE=${safeSource};<\/script>`);
fs.writeFileSync(path.join(root,'docs','teacher.html'),author);
fs.writeFileSync(path.join(root,'docs','exercises.html'),html.replace('<!--COURSE_DATA-->','<script>window.MADAR_LEARNER=true;<\/script>'));
for(const[src,dest]of [['مدار-للطلاب.html','display.html'],['مدار-للمعلم.html','display-teacher.html']]){let display=fs.readFileSync(path.join(dir,src),'utf8');display=display.replace('</head>','<style>.timeline>input,input[type=range][id*=time],input[type=range][id*=Time]{direction:rtl!important}.platform-home{display:inline-block;padding:9px 14px;color:#176b60;background:white;border-radius:10px;margin:10px;text-decoration:none}</style></head>').replace('<body>','<body><a class="platform-home" href="index.html">← الرئيسية</a>');fs.writeFileSync(path.join(root,'docs',dest),display)}
fs.writeFileSync(path.join(root,'docs','.nojekyll'),'');
const landing=fs.readFileSync(path.join(dir,'platform-home.html'),'utf8');
let publicScreen=fs.readFileSync(path.join(root,'docs','display.html'),'utf8');
publicScreen=publicScreen.replace('<span>مدار<small>رحلة الشمس ومواقيت الصلاة</small></span>','<span><span id="publicBrand">مدار</span><small id="publicTagline">الشمس والظل ومواقيت الصلاة</small></span>');
publicScreen=publicScreen.replace('</head>','<style>[data-panel="quiz"],[data-panel="teacher"],#quiz,#teacher,.platform-home,#fullscreen,.student-next-step{display:none!important}.public-banner{padding:10px 4%;background:#edf4ef;display:flex;gap:16px;justify-content:space-between;align-items:center;flex-wrap:wrap;color:#176b60;font-size:14px}.public-banner a{white-space:nowrap}</style></head>');
publicScreen=publicScreen.replace('</header>','</header><div class="public-banner"><span id="publicAnnouncement">تعرّف على علامات مواقيت الصلاة، وحرّك الوقت لمشاهدة تغير الشمس والظل.</span><a class="public-education" href="education.html" hidden>انتقل إلى مساحة التعليم والتدريب</a></div>');
publicScreen=publicScreen.replace('عرض للطلاب ⛶','تكبير المشهد ⛶').replace('</body>','<script>const publicOldPanel=panel;panel=function(id){if(id===\'quiz\'||id===\'teacher\')return;publicOldPanel(id)};panel(\'explore\');document.getElementById(\'use-current-time\')?.click();<\/script></body>');
fs.writeFileSync(path.join(root,'docs','index.html'),publicScreen);
fs.writeFileSync(path.join(root,'docs','education.html'),landing);
const readme=fs.readFileSync(path.join(dir,'platform-readme.md'),'utf8');
fs.writeFileSync(path.join(root,'README.md'),readme);fs.writeFileSync(path.join(root,'.gitignore'),'node_modules/\n*.zip\nreports/\n.DS_Store\n');
for(const name of ['index.html','education.html','display.html','display-teacher.html']){const dest=path.join(root,'docs',name);let content=fs.readFileSync(dest,'utf8');content=content.replace('</head>','<script src="cloud-config.js"></script></head>').replace('</body>','<script src="cloud-access.js?v=20261003-rings7"></script></body>');fs.writeFileSync(dest,content)}
for(const name of ['cloud-config.js','cloud-access.js'])fs.copyFileSync(path.join(dir,name),path.join(root,'docs',name));
const publicDest=path.join(root,'docs','index.html');fs.writeFileSync(publicDest,fs.readFileSync(publicDest,'utf8').replace('</body>','<script src="gps-welcome.js?v=20261003-gps1"></script></body>'));
const assets={'docs/gps-welcome.js':fs.readFileSync(path.join(dir,'gps-welcome.js'),'utf8'),'docs/index.html':fs.readFileSync(path.join(root,'docs','index.html'),'utf8'),'docs/education.html':fs.readFileSync(path.join(root,'docs','education.html'),'utf8'),'docs/display.html':fs.readFileSync(path.join(root,'docs','display.html'),'utf8'),'docs/cloud-config.js':fs.readFileSync(path.join(dir,'cloud-config.js'),'utf8'),'docs/cloud-access.js':fs.readFileSync(path.join(dir,'cloud-access.js'),'utf8'),'README.md':readme};
fs.writeFileSync(path.join(root,'docs','teacher.html'),author.replace('<script>window.MADAR_SOURCE=',()=>`<script>window.MADAR_ASSETS=${JSON.stringify(assets).replace(/</g,'\\u003c')};window.MADAR_SOURCE=`));
const adminHtml=author.replace('<script>window.MADAR_SOURCE=',()=>`<script>window.MADAR_ADMIN=true;window.MADAR_ASSETS=${JSON.stringify(assets).replace(/</g,'\\u003c')};window.MADAR_SOURCE=`);
fs.writeFileSync(path.join(root,'docs','admin.html'),adminHtml);
console.log(root);
for(const name of ['reset-password.html','reset-password.js'])fs.copyFileSync(path.join(dir,name),path.join(root,'docs',name));
fs.copyFileSync(path.join(dir,'gps-welcome.js'),path.join(root,'docs','gps-welcome.js'));







fs.copyFileSync(path.join(dir,'live-classroom.js'),path.join(root,'docs','live-classroom.js'));
for(const [dest,source] of [['live-teacher.html','display-teacher.html'],['live-student.html','display.html']]){let live=fs.readFileSync(path.join(root,'docs',source),'utf8').replace('</body>','<script src="live-classroom.js?v=live1"></script></body>');live=live.replace('</head>','<style>[data-panel="quiz"],[data-panel="teacher"],#quiz,#teacher,.student-next-step,#fullscreen{display:none!important}</style></head>');fs.writeFileSync(path.join(root,'docs',dest),live)}

{const dest=path.join(root,'docs','reset-password.html');let html=fs.readFileSync(dest,'utf8');html=html.replace('</html>','<script src="cloud-access.js?v=20261003-rings7"></script></html>');fs.writeFileSync(dest,html)}
