(()=>{
  const D=window.RESEARCH_DATA;
  if(!D)return;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const pct=v=>(Number(v)*100).toFixed(2)+'%';
  const date=()=>new Date().toLocaleDateString('zh-CN',{year:'numeric',month:'2-digit',day:'2-digit'}).replaceAll('/','-');
  const actionRows=c=>c.class==='高风险'?[
    ['P1','复核应收账款、现金流、研发投入及重大事项','财务/风控','30日'],
    ['P1','回看文本来源与章节语境，确认风险事实','法务/合规','15日'],
    ['P2','形成整改任务，纳入季度动态复评','业务负责人','季度']
  ]:c.class==='中风险'?[
    ['P2','核验主要概率驱动因素及近期变化','财务/业务','45日'],
    ['P2','持续扫描异常事件和披露变化','法务/合规','持续'],
    ['P3','更新风险台账并安排半年度复评','风控负责人','半年']
  ]:[
    ['P3','维持年度数据更新与常规核验','数据/风控','年度'],
    ['P3','保留原始来源、锚点和版本记录','合规','持续'],
    ['P3','发生重大事件时立即升级复核','业务负责人','事件触发']
  ];

  function currentCompany(){
    const name=document.querySelector('.company-page .company-identity h2')?.textContent?.trim();
    return D.companies.find(c=>c.name===name);
  }
  function triggerRows(c,evidence){
    const cs=D.cases[c.code];
    const mismatch=evidence.filter(e=>!e.correct).length;
    const incomplete=evidence.filter(e=>!e.url||!e.anchor).length;
    const divergence=cs&&((cs.score>=D.metrics.thresholds.scoreP90&&c.pHigh<D.metrics.thresholds.probP50)||(cs.score<D.metrics.thresholds.scoreP50&&c.pHigh>=D.metrics.thresholds.probP75));
    return [
      [c.pHigh>=D.metrics.thresholds.probP75,'前瞻概率触发',`高风险概率 ${pct(c.pHigh)}；P75参考线 ${(D.metrics.thresholds.probP75*100).toFixed(1)}%`],
      [mismatch>0,'模型—人工标签不一致',`${mismatch}条模型预测与二审终标不一致，需回看误判原因`],
      [Boolean(divergence),'三引擎信号背离',divergence?'当期画像与前瞻信号方向不同，需区分结构压力与趋势变化':'当前公开案例信息未发现明确背离信号'],
      [incomplete>0,'证据链不完整',incomplete?`${incomplete}条缺少来源URL或章节锚点`:'来源URL与章节锚点完整；重大事件仍需人工持续核验']
    ];
  }
  function enhanceReport(){
    const sheet=document.querySelector('.company-page .report-sheet.print-only');
    const c=currentCompany();
    if(!sheet||!c||sheet.dataset.company===c.code)return;
    const ev=D.evidence.filter(e=>e.code===c.code);
    const cs=D.cases[c.code];
    const triggers=triggerRows(c,ev);
    const need=triggers.some(x=>x[0]);
    const rank=[...D.companies].sort((a,b)=>b.riskIndex-a.riskIndex).findIndex(x=>x.code===c.code)+1;
    const current=cs?`${cs.score.toFixed(2)}（样本第${cs.scoreRank}）`:'未在公开案例层披露';
    sheet.dataset.company=c.code;
    sheet.classList.add('enhanced-report');
    sheet.innerHTML=`
      <div class="rr-header"><div><div class="report-brand">数智观险 · 一页式企业风险研判报告</div><h1>${esc(c.name)}（${esc(c.code)}）</h1><small>${esc(c.type)} · 2025年特征预测2026年风险</small></div><div><small>报告日期</small><b>${date()}</b><small>数据/模型版本：2025 / RF-2026</small></div></div>
      <div class="rr-meta"><div><span>报告用途</span><b>风险筛查与人工研判</b></div><div><span>样本范围</span><b>80家企业</b></div><div><span>指标体系</span><b>四维19项</b></div><div><span>证据二审</span><b class="rr-status">${ev.length}条已完成</b></div></div>
      <h2>一、风险概览</h2><div class="rr-kpis"><div><span>2025当期组合得分</span><b>${current}</b></div><div><span>2026前瞻等级</span><b>${esc(c.class)}</b></div><div><span>高风险概率</span><b>${pct(c.pHigh)}</b></div><div><span>加权指数 / 排名</span><b>${c.riskIndex.toFixed(2)} · ${rank}/80</b></div></div>
      <h2>二、四维研究口径</h2><table><thead><tr><th>风险维度</th><th>组合权重</th><th>对应引擎与解释</th></tr></thead><tbody>${D.weights.map(w=>`<tr><td>${esc(w.name)}</td><td>${w.value.toFixed(2)}%</td><td>${w.name.includes('经营')?'结构化指标进入当期画像与前瞻预测':'AHP-熵权解释当期结构；NLP补充软信息证据'}</td></tr>`).join('')}</tbody></table>
      <h2>三、人工二审触发判断</h2><table><thead><tr><th>触发规则</th><th>判断</th><th>本企业情况</th></tr></thead><tbody>${triggers.map(t=>`<tr><td>${esc(t[1])}</td><td><span class="${t[0]?'rr-trigger':'rr-pass'}">${t[0]?'触发复核':'未触发'}</span></td><td>${esc(t[2])}</td></tr>`).join('')}</tbody></table>
      <h2>四、经二审确认的文本证据</h2><table><thead><tr><th>类别</th><th>语义凝练</th><th>来源锚点</th><th>二审</th></tr></thead><tbody>${ev.map(e=>`<tr><td>${esc(e.final)}</td><td class="rr-evidence">${esc(e.summary)}</td><td>${esc(e.year)}年${esc(e.sourceType)}<br>${esc(e.anchor)}</td><td class="rr-status">已完成</td></tr>`).join('')}</tbody></table>
      <h2>五、建议动作</h2><table><thead><tr><th>优先级</th><th>行动</th><th>责任部门</th><th>期限</th></tr></thead><tbody>${actionRows(c).map(r=>`<tr>${r.map(x=>`<td>${esc(x)}</td>`).join('')}</tr>`).join('')}</tbody></table>
      <p class="rr-disclaimer">研判状态：${need?'已触发人工核验条件':'维持常规人工复核'}。本报告由研究原型自动生成。NLP结果仅反映候选语义单元三分类；2026年真实结果尚不可观测。文本为语义凝练，不是年报逐字原文。报告仅供竞赛研究和风险筛查，不构成监管认定、信用评级或投资建议，处置前必须回到原始披露进行人工核验。</p><footer><small>模型筛查 → 人工核验 → 分层处置 → 动态复评</small><small>经办/复核人：____________</small></footer>`;
  }

  function addTriggerPanel(){
    const layout=document.querySelector('.evidence-layout');
    if(!layout||document.querySelector('.hitl-trigger-panel'))return;
    const panel=document.createElement('article');
    panel.className='panel hitl-trigger-panel';
    panel.innerHTML=`<div class="hitl-trigger-head"><div><span class="section-kicker">HUMAN REVIEW TRIGGER</span><h2>人工二审触发机制</h2><p>模型先筛查，人工再确认。只有完成来源、语义和标签复核后，证据才进入冻结验证集或管理处置。</p></div><div class="hitl-summary"><b>320 / 320</b> 二审已完成</div></div>
      <div class="hitl-trigger-grid"><div class="hitl-trigger-item"><i>01</i><b>低置信或标签冲突</b><span>模型置信不足，或模型预测与人工初标不一致。</span></div><div class="hitl-trigger-item"><i>02</i><b>三引擎信号背离</b><span>当期画像与前瞻概率方向明显不同，需解释风险结构。</span></div><div class="hitl-trigger-item"><i>03</i><b>证据链不完整</b><span>来源URL、年份、章节锚点或语义凝练存在缺失或歧义。</span></div><div class="hitl-trigger-item"><i>04</i><b>重大事件触发</b><span>监管处罚、数据事件、诉讼或经营异常经核实后启动升级。</span></div></div>
      <div class="hitl-review-flow"><span><b>触发任务</b>记录触发原因</span><i>→</i><span><b>来源核验</b>回看披露与锚点</span><i>→</i><span><b>语义复核</b>确认类别和边界</span><i>→</i><span><b>形成终标</b>确认或修订标签</span><i>→</i><span><b>冻结留痕</b>进入验证与复评</span></div>
      <p class="hitl-note"><b>本轮执行情况：</b>320条候选语义单元均完成二审，初标与终标一致；模型分类正确272条、误判48条。该流程属于人工二审复核，不表述为双盲独立双标，也不报告 Cohen's κ。</p>`;
    layout.insertAdjacentElement('beforebegin',panel);
  }
  let queued=false;
  const run=()=>{queued=false;enhanceReport();addTriggerPanel()};
  const observer=new MutationObserver(()=>{if(!queued){queued=true;requestAnimationFrame(run)}});
  observer.observe(document.body,{childList:true,subtree:true});
  run();
})();
