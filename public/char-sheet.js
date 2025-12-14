(() => {
  const form = document.getElementById('characterForm');
  const saveBtn = document.getElementById('saveBtn');
  const loadBtn = document.getElementById('loadBtn');
  const printBtn = document.getElementById('printBtn');

  function collect() {
    const data = {};
    new FormData(form).forEach((v, k) => (data[k] = v));
    return data;
  }

  function populate(data) {
    for (const k of Object.keys(data)) {
      const el = form.elements[k];
      if (el) el.value = data[k];
    }
  }

  saveBtn.addEventListener('click', () => {
    const data = collect();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (data.character_name || 'character') + '.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });

  loadBtn.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = () => {
      const file = input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          populate(data);
        } catch (err) {
          alert('Erreur JSON: ' + err.message);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  });

  printBtn.addEventListener('click', () => window.print());

  // Load example from localStorage if exists
  const saved = localStorage.getItem('character-draft');
  if (saved) {
    try { populate(JSON.parse(saved)); } catch (e) { /* ignore */ }
  }

  // autosave draft
  window.addEventListener('beforeunload', () => {
    localStorage.setItem('character-draft', JSON.stringify(collect()));
  });
})();
