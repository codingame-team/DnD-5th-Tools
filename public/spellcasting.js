(() => {
  const sheetBg = document.getElementById('sheetBg')
  const svgFile = document.getElementById('svgFile')
  const toggleLayout = document.getElementById('toggleLayout')
  const saveLayout = document.getElementById('saveLayout')
  const loadLayout = document.getElementById('loadLayout')
  const saveData = document.getElementById('saveData')
  const loadData = document.getElementById('loadData')
  const printBtn = document.getElementById('printBtn')
  const overlay = document.getElementById('overlay')
  const saveBtn = document.getElementById('saveBtn')
  const loadBtn = document.getElementById('loadBtn')

  let layoutMode = false
  let dragging = null

  // load svg from file input
  svgFile.addEventListener('change', (ev) => {
    const f = ev.target.files && ev.target.files[0]
    if (!f) return
    const url = URL.createObjectURL(f)
    sheetBg.src = url
    localStorage.setItem('spellcasting-svg-name', f.name)
  })

  toggleLayout.addEventListener('click', () => {
    layoutMode = !layoutMode
    document.body.classList.toggle('layout-mode', layoutMode)
    toggleLayout.textContent = layoutMode ? 'Quitter mode positionnement' : 'Mode positionnement'
    overlay.style.pointerEvents = layoutMode ? 'auto' : 'none'
    // make fields draggable only in layout mode
    document.querySelectorAll('.overlay .field').forEach(makeDraggable)
  })

  function makeDraggable(el) {
    el.classList.add('field')
    el.style.touchAction = 'none'
    let startX=0, startY=0, origX=0, origY=0
    el.addEventListener('pointerdown', (e) => {
      if (!layoutMode) return
      dragging = el
      el.setPointerCapture(e.pointerId)
      el.classList.add('dragging')
      startX = e.clientX; startY = e.clientY
      const rect = el.getBoundingClientRect()
      const containerRect = document.getElementById('sheet').getBoundingClientRect()
      origX = rect.left - containerRect.left
      origY = rect.top - containerRect.top
    })
    el.addEventListener('pointermove', (e) => {
      if (!dragging) return
      const dx = e.clientX - startX
      const dy = e.clientY - startY
      el.style.left = (origX + dx) + 'px'
      el.style.top = (origY + dy) + 'px'
    })
    el.addEventListener('pointerup', (e) => {
      if (!dragging) return
      dragging.classList.remove('dragging')
      dragging = null
    })
  }

  // Export layout -> JSON of positions
  saveLayout.addEventListener('click', () => {
    const fields = Array.from(document.querySelectorAll('.overlay .field'))
    const containerRect = document.getElementById('sheet').getBoundingClientRect()
    const layout = fields.map(f => {
      const r = f.getBoundingClientRect()
      return {name: f.name || f.className, left: Math.round(r.left - containerRect.left), top: Math.round(r.top - containerRect.top), width: Math.round(r.width), height: Math.round(r.height)}
    })
    downloadJSON(layout, 'spell-layout.json')
  })

  loadLayout.addEventListener('click', async () => {
    const file = await pickFile()
    if (!file) return
    const txt = await file.text()
    try {
      const layout = JSON.parse(txt)
      applyLayout(layout)
    } catch(e) { alert('JSON invalide') }
  })

  function applyLayout(layout) {
    const container = document.getElementById('sheet').getBoundingClientRect()
    layout.forEach(item => {
      const el = document.querySelector(`[name="${item.name}"]`)
      if (!el) return
      el.style.left = item.left + 'px'
      el.style.top = item.top + 'px'
      el.style.width = item.width + 'px'
      el.style.height = item.height + 'px'
    })
  }

  saveData.addEventListener('click', () => {
    const data = formDataToObject(document.getElementById('overlay'))
    downloadJSON(data, 'spell-data.json')
  })

  loadData.addEventListener('click', async () => {
    const file = await pickFile()
    if (!file) return
    const txt = await file.text()
    try {
      const data = JSON.parse(txt)
      Object.entries(data).forEach(([k,v]) => {
        const el = document.querySelector(`[name="${k}"]`)
        if (el) el.value = v
      })
    } catch(e) { alert('JSON invalide') }
  })

  saveBtn.addEventListener('click', () => {
    const data = formDataToObject(document.getElementById('overlay'))
    downloadJSON(data, 'spell-data.json')
  })
  loadBtn.addEventListener('click', async () => {
    const file = await pickFile()
    if (!file) return
    const txt = await file.text()
    try {
      const data = JSON.parse(txt)
      Object.entries(data).forEach(([k,v]) => {
        const el = document.querySelector(`[name="${k}"]`)
        if (el) el.value = v
      })
    } catch(e){ alert('JSON invalide') }
  })

  printBtn.addEventListener('click', () => window.print())

  function formDataToObject(form) {
    const fd = new FormData(form)
    const obj = {}
    for (const [k,v] of fd.entries()) obj[k]=v
    return obj
  }

  function downloadJSON(obj, filename){
    const blob = new Blob([JSON.stringify(obj, null, 2)],{type:'application/json'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url)
  }

  function pickFile(){
    return new Promise(resolve => {
      const inp = document.createElement('input'); inp.type='file'; inp.accept='application/json'
      inp.onchange = () => resolve(inp.files && inp.files[0])
      inp.click()
    })
  }

  // Initialize: allow dragging when toggled
  document.querySelectorAll('.overlay .field').forEach(makeDraggable)

})();
