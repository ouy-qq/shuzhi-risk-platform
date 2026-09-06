(()=>{
const D=window.RESEARCH_DATA;
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const pct=(v,d=1)=>(v*100).toFixed(d)+'%';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const riskClass=r=>r==='高风险'?'risk-high':r==='中风险'?'risk-mid':'risk-low';
const shortType=t=>String(t).split(' ')[0]+'类 · '+String(t).replace(/^[A-D]\s*/,'');
const toast=t=>{const e=$('#toast');e.textContent=t;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),2200)};

const titles={dashboard:'风险驾驶舱',research:'研究框架',company:'企业画像',cases:'决策模拟',review:'人工二审',report:'报告生成中心',model:'模型卡与边界'};
function goto(id){$$('.page').forEach(x=>x.classList.toggle('active',x.id===id));$$('#nav button').forEach(x=>x.classList.toggle('active',x.dataset.page===id));$('#pageTitle').textContent=titles[id];scrollTo(0,0);$('.sidebar').classList.remove('open');if(id==='report')renderReport()}
$$('[data-page]').forEach(b=>b.onclick=()=>goto(b.dataset.page));$$('[data-goto]').forEach(b=>b.onclick=()=>goto(b.dataset.goto));$('#menu').onclick=()=>$('.sidebar').classList.toggle('open');

function initDashboard(){
 const stats=[['80','A股样本企业'],['320','企业—年度主观测'],['19','四维核心指标'],['240','前瞻监督样本']];
 $('#headlineStats').innerHTML=stats.map(([n,t])=>`<div class="stat"><b>${n}</b><span>${t}</span></div>`).join('');
 const counts=['低风险','中风险','高风险'].map(k=>[k,D.companies.filter(c=>c.class===k).length]);
 const colors={'低风险':'#22c7a9','中风险':'#f6b74c','高风险':'#ff667a'};
 $('#riskDistribution').innerHTML=counts.map(([k,n])=>`<div class="dist-card" style="--c:${colors[k]}"><b>${n}</b><span>${k} · ${(n/80*100).toFixed(1)}%</span></div>`).join('');
 $('#metricCards').innerHTML=[['0.8453','NLP Macro-F1'],['0.9788','NLP Macro ROC-AUC'],['0.9048','RF 测试AUC'],['0.8269','RF 5折OOF']].map(x=>`<div class="metric"><b>${x[0]}</b><span>${x[1]}</span></div>`).join('');
}
function initResearch(){
 const c=D.metrics.cleaning;$('#cleaning').innerHTML=[[c.missing,'缺失值填补'],[c.winsor,'缩尾处理'],[c.boundary,'理论边界修正']].map(x=>`<div><b>${x[0]}</b><span>${x[1]}（单元格）</span></div>`).join('');
 $('#indicatorList').innerHTML=D.indicators.map(i=>`<div class="indicator-item"><b>${i.code}</b>${esc(i.name)}</div>`).join('');
 $('#weightBars').innerHTML=D.weights.map(w=>bar(w.name,w.value,w.color)).join('');
 $('#importanceBars').innerHTML=D.importance.slice(0,10).map(i=>bar(i.name,i.mdi*100,'#4c8dff')).join('');
}
function bar(name,value,color){return `<div class="bar-line"><span>${esc(name)}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.min(value*2.3,100)}%;--bar:${color}"></div></div><b>${value.toFixed(2)}%</b></div>`}

function fillCompanySelects(){
 const opts=D.companies.slice().sort((a,b)=>a.name.localeCompare(b.name,'zh-CN')).map(c=>`<option value="${c.code}">${c.name}（${c.code}）</option>`).join('');
 $('#companySelect').innerHTML=opts;$('#reportCompany').innerHTML=opts;$('#companySelect').value='603881';$('#reportCompany').value='603881';
 $('#companySelect').onchange=renderCompany;$('#reportCompany').onchange=renderReport;
}
function actionFor(c){
 if(c.class==='高风险')return ['优先复核','核验应收账款、现金流、研发投入与文本证据；明确责任部门，建议季度复评。'];
 if(c.class==='中风险')return ['持续监测','关注概率靠近阈值的驱动因素，建议半年度复评；出现重大事件时升级。'];
 return ['常规跟踪','维持年度复评，保留证据来源与版本；低风险不等于无风险。'];
}
function renderCompany(){
 const c=D.companies.find(x=>x.code===$('#companySelect').value)||D.companies[0], ev=D.evidence.filter(e=>e.code===c.code), cs=D.cases[c.code];
 const [act,desc]=actionFor(c);
 const current=cs?`<b>${cs.score.toFixed(2)}</b><span>2025当期风险得分 · 第${cs.scoreRank}名</span>`:`<b>—</b><span>公开案例层未披露当期组合得分</span>`;
 $('#companyView').innerHTML=`<div class="company-summary"><article class="panel company-id"><span class="eyebrow">${esc(shortType(c.type))}</span><h3>${esc(c.name)}</h3><p>${c.code} · 2025特征 → 2026预测</p><span class="chip ${riskClass(c.class).replace('risk-','')}">${c.class}</span></article><article class="panel risk-number">${current}</article><article class="panel risk-number"><b class="${riskClass(c.class)}">${pct(c.pHigh,2)}</b><span>下一年度高风险概率</span></article><article class="panel risk-number"><b>${c.riskIndex.toFixed(2)}</b><span>概率加权风险指数 · 第${c.rank}名</span></article></div>
 <div class="grid two"><article class="panel"><div class="panel-title"><div><span class="eyebrow">FORECAST PROBABILITY</span><h3>三类风险概率</h3></div><span class="tag warning">未验证预测</span></div><div class="prob-stack"><span style="width:${c.pLow*100}%"></span><span style="width:${c.pMid*100}%"></span><span style="width:${c.pHigh*100}%"></span></div><div class="prob-legend"><span>低 ${pct(c.pLow)}</span><span>中 ${pct(c.pMid)}</span><span>高 ${pct(c.pHigh)}</span></div>${cs?`<div class="action-box" style="margin-top:18px"><b>${esc(cs.title)}</b><div style="margin-top:6px;color:#9fb5cf">${esc(cs.detail)}</div></div>`:''}</article><article class="panel"><div class="panel-title"><div><span class="eyebrow">MANAGEMENT ACTION</span><h3>${act}</h3></div></div><p style="color:#a9bad0;line-height:1.8">${desc}</p><button class="primary" data-report="${c.code}">生成该企业报告</button></article></div>
 <article class="panel"><div class="panel-title"><div><span class="eyebrow">TRACEABLE EVIDENCE</span><h3>经二审确认的文本证据（${ev.length}条）</h3></div><span class="tag">来源可追溯</span></div><div class="evidence-mini">${ev.map(e=>`<div class="evidence-card"><header><span class="chip">${esc(e.final)}</span><span class="chip good">${esc(e.status)}</span></header><p>${esc(e.summary)}</p><a href="${esc(e.url)}" target="_blank" rel="noopener">${esc(e.sourceType)} · ${e.year} · ${esc(e.anchor)} ↗</a></div>`).join('')}</div></article>`;
 $('[data-report]', $('#companyView')).onclick=e=>{$('#reportCompany').value=e.target.dataset.report;goto('report')};
}
function initCases(){
 $('#caseCards').innerHTML=['603881','300353'].map(code=>{const c=D.companies.find(x=>x.code===code),k=D.cases[code];return `<article class="case-card"><span class="eyebrow">${esc(shortType(c.type))}</span><h3>${c.name} <small>${c.code}</small></h3><div class="signal-pair"><div><b>${k.score.toFixed(2)}</b><span>2025当期风险得分 · 第${k.scoreRank}名</span></div><div><b class="${riskClass(c.class)}">${pct(k.pHigh,2)}</b><span>2026高风险概率 · ${c.class}</span></div></div><p>${esc(k.detail)}</p><div class="action-box"><b>${esc(k.title)}</b></div></article>`}).join('');
}

let ePage=1;const pageSize=20;
function filteredEvidence(){const q=$('#evidenceSearch').value.trim().toLowerCase(),cat=$('#categoryFilter').value,ok=$('#correctFilter').value;return D.evidence.filter(e=>(!q||[e.id,e.code,e.name,e.summary].join(' ').toLowerCase().includes(q))&&(!cat||e.final===cat)&&(ok===''||String(Number(e.correct))===ok))}
function renderEvidence(){const all=filteredEvidence(),pages=Math.max(1,Math.ceil(all.length/pageSize));ePage=Math.min(ePage,pages);const rows=all.slice((ePage-1)*pageSize,ePage*pageSize);$('#evidenceRows').innerHTML=rows.map(e=>`<tr><td>${e.id}</td><td><b>${esc(e.name)}</b><br><small>${e.code}</small></td><td><span class="chip">${esc(e.final)}</span></td><td>${esc(e.model)}</td><td><span class="chip ${e.correct?'good':'bad'}">${e.correct?'正确':'误判'}</span></td><td>${esc(e.status)}</td><td><button class="table-btn" data-eid="${e.id}">查看证据</button></td></tr>`).join('');$('#evidencePager').innerHTML=`<button id="prevE" ${ePage===1?'disabled':''}>上一页</button><span>${all.length}条 · ${ePage}/${pages}页</span><button id="nextE" ${ePage===pages?'disabled':''}>下一页</button>`;$('#prevE').onclick=()=>{ePage--;renderEvidence()};$('#nextE').onclick=()=>{ePage++;renderEvidence()};$$('[data-eid]').forEach(b=>b.onclick=()=>openEvidence(b.dataset.eid))}
function initReview(){
 const m=D.metrics.nlp;$('#reviewStats').innerHTML=[[320,'二审已完成'],[320,'初标与终标一致'],[m.correct,'模型分类正确'],[m.wrong,'模型误判待分析']].map(x=>`<div class="stat"><b>${x[0]}</b><span>${x[1]}</span></div>`).join('');
 ['#evidenceSearch','#categoryFilter','#correctFilter'].forEach(s=>$(s).addEventListener('input',()=>{ePage=1;renderEvidence()}));renderEvidence();
 $('#exportReview').onclick=exportReviewLog;
}
function openEvidence(id){const e=D.evidence.find(x=>x.id===id),logs=JSON.parse(localStorage.getItem('reviewDemoLogs')||'{}'),saved=logs[id]||{};$('#evidenceDetail').innerHTML=`<span class="eyebrow">EVIDENCE ${e.id}</span><h2>${esc(e.name)} · ${esc(e.final)}</h2><div class="detail-grid"><div><span>AI初始标签</span><b>${esc(e.initial)}</b></div><div><span>模型预测</span><b>${esc(e.model)}</b></div><div><span>二审结论</span><b>${esc(e.final)}</b></div></div><h3>语义凝练文本</h3><div class="detail-text">${esc(e.summary)}</div><h3>来源与锚点</h3><p><a href="${esc(e.url)}" target="_blank" rel="noopener" style="color:#6bbdff">${esc(e.sourceType)} · ${e.year} ↗</a><br><small style="color:#8297b4">${esc(e.anchor)}</small></p><h3>模型概率</h3><div class="detail-grid"><div><span>数据安全</span><b>${pct(e.pData)}</b></div><div><span>算法治理</span><b>${pct(e.pAlgo)}</b></div><div><span>绿色ESG</span><b>${pct(e.pGreen)}</b></div></div><div class="review-demo"><b>本地复核演示记录</b><p style="color:#7e93b0;font-size:11px">仅保存在本浏览器，不覆盖研究报告中已冻结的320条金标准。</p><textarea id="demoNote" placeholder="补充核验备注">${esc(saved.note||'')}</textarea><button class="primary" id="saveDemo" style="margin-top:8px">保存本地记录</button></div>`;$('#evidenceDialog').showModal();$('#saveDemo').onclick=()=>{logs[id]={note:$('#demoNote').value,time:new Date().toISOString(),sample:id};localStorage.setItem('reviewDemoLogs',JSON.stringify(logs));toast('本地复核记录已保存')}}
$('.dialog-close').onclick=()=>$('#evidenceDialog').close();
function exportReviewLog(){const logs=Object.values(JSON.parse(localStorage.getItem('reviewDemoLogs')||'{}'));if(!logs.length)return toast('暂无本地复核记录');const csv='样本ID,记录时间,本地备注\n'+logs.map(x=>[x.sample,x.time,'"'+String(x.note).replace(/"/g,'""')+'"'].join(',')).join('\n');download('人工二审_本地复核日志.csv','\ufeff'+csv,'text/csv')}

function managementRows(c){const [level,desc]=actionFor(c);return c.class==='高风险'?[['P1','核验应收账款、现金流与研发投入变化','财务/风控','30日'],['P1','回看NLP证据来源与原文语境','法务/合规','15日'],['P2','更新风险台账并安排季度复评','风控负责人','季度']]:c.class==='中风险'?[['P2','核验主要概率驱动因素','财务/业务','45日'],['P2','跟踪异常事件与披露变化','法务/合规','持续'],['P3','安排半年度复评','风控负责人','半年']]:[['P3','维持年度数据更新与常规核验','数据/风控','年度'],['P3','保留来源锚点和版本记录','合规','持续'],['P3','重大事件发生时触发升级','业务负责人','事件触发']]}
function buildReport(c){
 const ev=D.evidence.filter(e=>e.code===c.code), cs=D.cases[c.code], reviewer=$('#reportReviewer').value||'待填写', audience=$('#reportAudience').value, date=$('#reportDate').value||new Date().toISOString().slice(0,10), includeE=$('#includeEvidence').checked, includeM=$('#includeMethods').checked, includeA=$('#includeActions').checked;
 const current=cs?`${cs.score.toFixed(2)}（样本第${cs.scoreRank}）`:'未在公开案例层披露';
 return `<div class="r-head"><div><span class="r-brand">数智观险</span><h2>${esc(c.name)}一页式风险画像报告</h2></div><div style="text-align:right"><small>研究预演仿真原型</small><b>${date}</b></div></div><div class="r-meta"><div><small>证券代码</small><b>${c.code}</b></div><div><small>企业类型</small><b>${esc(String(c.type).split(' ')[0])}</b></div><div><small>使用场景</small><b>${esc(audience)}</b></div><div><small>人工复核</small><b class="r-review">证据二审已完成</b></div></div><h3>一、风险概览</h3><div class="r-kpis"><div class="r-kpi"><small>2025当期组合得分</small><b>${current}</b></div><div class="r-kpi"><small>2026高风险概率</small><b>${pct(c.pHigh,2)}</b></div><div class="r-kpi"><small>前瞻风险等级 / 排名</small><b>${c.class} · ${c.rank}/80</b></div></div><table><thead><tr><th>低风险概率</th><th>中风险概率</th><th>高风险概率</th><th>概率加权指数</th></tr></thead><tbody><tr><td>${pct(c.pLow,2)}</td><td>${pct(c.pMid,2)}</td><td>${pct(c.pHigh,2)}</td><td>${c.riskIndex.toFixed(2)}</td></tr></tbody></table>
 ${includeE?`<h3>二、经人工二审确认的文本证据</h3><table><thead><tr><th>类别</th><th>来源与锚点</th><th>语义凝练</th><th>状态</th></tr></thead><tbody>${ev.map(e=>`<tr><td>${esc(e.final)}</td><td>${e.year}${esc(e.sourceType)}<br>${esc(e.anchor)}</td><td>${esc(e.summary)}</td><td>已完成</td></tr>`).join('')}</tbody></table>`:''}
 ${includeA?`<h3>三、建议行动</h3><table><thead><tr><th>优先级</th><th>行动</th><th>责任部门</th><th>复评期限</th></tr></thead><tbody>${managementRows(c).map(r=>`<tr>${r.map(x=>`<td>${esc(x)}</td>`).join('')}</tr>`).join('')}</tbody></table>`:''}
 ${includeM?`<h3>四、模型与复核口径</h3><p style="font-size:11px;line-height:1.6">NLP用于候选语义单元三分类和证据整理；AHP-熵权用于当期风险结构解释；随机森林用于下一年度高风险排序。320条证据经过人工二审复核，但并非双盲独立双标。2026年真实结果尚不可观测。</p>`:''}<p class="r-disclaimer">经办/复核人：${esc(reviewer)}。本报告仅供竞赛研究与风险筛查参考，不构成监管认定、信用评级或投资建议。文本为语义凝练，不是披露文件逐字原文；采取管理措施前必须回到来源文件进行人工核验。</p>`;
}
function renderReport(){const c=D.companies.find(x=>x.code===$('#reportCompany').value)||D.companies[0];$('#reportPreview').innerHTML=buildReport(c)}
function initReport(){$('#reportDate').value=new Date().toISOString().slice(0,10);['#reportAudience','#reportReviewer','#includeEvidence','#includeMethods','#includeActions'].forEach(s=>$(s).addEventListener('input',renderReport));$('#refreshReport').onclick=()=>{renderReport();toast('报告预览已更新')};$('#printReport').onclick=()=>window.print();$('#downloadHtml').onclick=()=>{const c=D.companies.find(x=>x.code===$('#reportCompany').value);const html=`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>${esc(c.name)}风险报告</title><style>body{font:14px Arial,'Microsoft YaHei';color:#162a44;max-width:900px;margin:30px auto;padding:30px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccd7e4;padding:9px;text-align:left}th{background:#eaf2fb}.r-head,.r-meta,.r-kpis{display:flex;gap:10px;justify-content:space-between}.r-meta>div,.r-kpi{flex:1;background:#eff5fc;padding:10px}small{display:block;color:#60728b}h3{color:#1d4f8f;border-left:3px solid #4b8eea;padding-left:8px}.r-disclaimer{font-size:11px;color:#718196}</style>${$('#reportPreview').innerHTML}</html>`;download(`${c.name}_风险画像报告.html`,html,'text/html')};$('#downloadJson').onclick=()=>{const c=D.companies.find(x=>x.code===$('#reportCompany').value),obj={generatedAt:new Date().toISOString(),company:c,evidence:D.evidence.filter(e=>e.code===c.code),case:D.cases[c.code]||null,actions:managementRows(c),disclaimer:'研究筛查用途；非评级、非投资建议；需人工核验'};download(`${c.name}_风险报告底稿.json`,JSON.stringify(obj,null,2),'application/json')};renderReport()}
function download(name,content,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([content],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}

initDashboard();initResearch();fillCompanySelects();renderCompany();initCases();initReview();initReport();
})();
