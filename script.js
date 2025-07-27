document.addEventListener("DOMContentLoaded", () => {
  const refs = {
    menuBtn:       document.getElementById("menu-btn"),
    menu:          document.getElementById("menu"),
    addProject:    document.getElementById("add-project"),
    addTask:       document.getElementById("add-task"),
    backBtn:       document.getElementById("back-to-projects"),
    pageTitle:     document.getElementById("page-title"),
    projList:      document.getElementById("project-list"),
    taskList:      document.getElementById("task-list"),
    projView:      document.getElementById("project-view"),
    taskView:      document.getElementById("task-view"),
    editMenu:      document.getElementById("m-edit"),
    searchMenu:    document.getElementById("m-search"),
    sortMenu:      document.getElementById("m-sort"),
    exportMenu:    document.getElementById("m-export"),
    importMenu:    document.getElementById("m-import")
  };

  let projects = JSON.parse(localStorage.getItem("projects") || "[]");
  let currentProjectIndex = null;
  let sortAsc = true;

  const save = () =>
    localStorage.setItem("projects", JSON.stringify(projects));

  const getProjIdxs = () => projects.map((_,i) => i);
  const getTaskIdxs = () =>
    projects[currentProjectIndex].tasks.map((_,i) => i);

  function renderProjects(idxs) {
    refs.pageTitle.textContent = "AllProjectApp";
    refs.backBtn.classList.add("hidden");
    refs.addProject.classList.remove("hidden");
    refs.addTask.classList.add("hidden");
    refs.projView.classList.remove("hidden");
    refs.taskView.classList.add("hidden");

    refs.projList.innerHTML = "";
    idxs.forEach(i => {
      const p = projects[i];
      const card = document.createElement("div");
      card.className = "task-card";
      card.onclick = () => {
        currentProjectIndex = i;
        renderTasks(getTaskIdxs());
      };

      const span = document.createElement("span");
      span.textContent = `${p.name} (${p.tasks.length})`;
      card.appendChild(span);

      const eb = document.createElement("button");
      eb.innerText = "✏️";
      eb.onclick = e => {
        e.stopPropagation();
        const n = prompt("New Name:", p.name);
        if (n!==null) { p.name = n; save(); renderProjects(getProjIdxs()); }
      };
      card.appendChild(eb);

      const db = document.createElement("button");
      db.innerText = "🗑️";
      db.onclick = e => {
        e.stopPropagation();
        if (confirm(`Delete "${p.name}"?`)) {
          projects.splice(i,1);
          save();
          renderProjects(getProjIdxs());
        }
      };
      card.appendChild(db);

      refs.projList.appendChild(card);
    });
  }

  function renderTasks(idxs) {
    const p = projects[currentProjectIndex];
    refs.pageTitle.textContent = p.name;
    refs.backBtn.classList.remove("hidden");
    refs.addProject.classList.add("hidden");
    refs.addTask.classList.remove("hidden");
    refs.projView.classList.add("hidden");
    refs.taskView.classList.remove("hidden");

    refs.taskList.innerHTML = "";
    idxs.forEach(i => {
      const t = p.tasks[i];
      const card = document.createElement("div");
      card.className = "task-card";

      const chk = document.createElement("input");
      chk.type = "checkbox";
      chk.checked = t.tracking;
      chk.onchange = () => {
        t.tracking = chk.checked;
        if (!chk.checked) t.progress = 0;
        save();
        renderTasks(getTaskIdxs());
      };
      card.appendChild(chk);

      if (t.mark) {
        const dot = document.createElement("span");
        dot.className = "mark-icon";
        dot.innerText = "●";
        dot.style.color = t.mark;
        card.appendChild(dot);
      }

      const txt = document.createElement("span");
      txt.innerHTML = t.title +
        (t.datetime
          ? ` — <small>${new Date(t.datetime).toLocaleString()}</small>`
          : "");
      card.appendChild(txt);

      const et = document.createElement("button");
      et.innerText = "✏️";
      et.onclick = () => {
        const nt = prompt("Title:", t.title);
        const dp = t.datetime
          ? new Date(t.datetime).toISOString().slice(0,16).replace("T","")
          : "";
        const nd = prompt("Date/time:", dp);
        const cp = t.mark || "";
        const nc = prompt("Cor:", cp);
        if (nt!==null) t.title = nt;
        if (nd!==null) t.datetime = nd ? new Date(nd).toISOString() : null;
        if (nc!==null) t.mark = nc.trim() === "" ? null : nc.trim();
        save();
        renderTasks(getTaskIdxs());
      };
      card.appendChild(et);

      if (t.tracking) {
        const pr = document.createElement("progress");
        pr.className = "progress-bar";
        pr.max = 100; pr.value = t.progress;
        card.appendChild(pr);

        const up = document.createElement("button");
        up.innerText = "📈";
        up.onclick = () => {
          const v = parseInt(prompt("Prog (0–100):", t.progress),10);
          if (!isNaN(v)) {
            t.progress = Math.min(100, Math.max(0, v));
            save();
            renderTasks(getTaskIdxs());
          }
        };
        card.appendChild(up);
      }

      const dt = document.createElement("button");
      dt.innerText = "🗑️";
      dt.onclick = () => {
        if (confirm(`Delete "${t.title}"?`)) {
          p.tasks.splice(i,1);
          save();
          renderTasks(getTaskIdxs());
        }
      };
      card.appendChild(dt);

      refs.taskList.appendChild(card);
    });
  }

  // init
  renderProjects(getProjIdxs());

  // actions
  refs.addProject.onclick = () => {
    const n = prompt("Name of New Project:");
    if (n) { projects.push({ name:n, tasks:[] }); save(); renderProjects(getProjIdxs()); }
  };
  refs.backBtn.onclick = () => {
    currentProjectIndex = null;
    renderProjects(getProjIdxs());
  };
  refs.addTask.onclick = () => {
    const t = prompt("Title:"); if (!t) return;
    const dt = prompt("Day/time or blank:");
    const mk = prompt("Color or blank:");
    const p = projects[currentProjectIndex];
    p.tasks.push({
      title:t,
      datetime: dt ? new Date(dt).toISOString() : null,
      tracking:false,
      progress:0,
      mark:mk||null
    });
    save();
    renderTasks(getTaskIdxs());
  };

  // menu global
  refs.editMenu.onclick   = () => alert("Use ✏️ at cards.");
  refs.searchMenu.onclick = () => {
    const term = prompt("Search:").toLowerCase();
    if (currentProjectIndex===null) {
      renderProjects(getProjIdxs().filter(i=>
        projects[i].name.toLowerCase().includes(term)
      ));
    } else {
      renderTasks(getTaskIdxs().filter(i=>
        projects[currentProjectIndex].tasks[i].title.toLowerCase().includes(term)
      ));
    }
  };
  refs.sortMenu.onclick = () => {
    if (currentProjectIndex===null) {
      let idxs = getProjIdxs();
      idxs.sort((a,b)=>
        sortAsc
          ? projects[a].name.localeCompare(projects[b].name,undefined,{numeric:true})
          : projects[b].name.localeCompare(projects[a].name,undefined,{numeric:true})
      );
      renderProjects(idxs);
    } else {
      let idxs = getTaskIdxs();
      idxs.sort((a,b)=>
        sortAsc
          ? projects[currentProjectIndex].tasks[a].title.localeCompare(
              projects[currentProjectIndex].tasks[b].title,undefined,{numeric:true}
            )
          : projects[currentProjectIndex].tasks[b].title.localeCompare(
              projects[currentProjectIndex].tasks[a].title,undefined,{numeric:true}
            )
      );
      renderTasks(idxs);
    }
    sortAsc = !sortAsc;
  };
  refs.exportMenu.onclick = () => {
    refs.menu.classList.remove("visible");
    let csv="";
    if (currentProjectIndex===null) {
      csv="project,task,datetime,progress\n"+projects.flatMap(p=>
        p.tasks.map(t=>`"${p.name}","${t.title}",${t.datetime||""},${t.progress||0}`)
      ).join("\n");
    } else {
      csv="task,datetime,progress\n"+projects[currentProjectIndex].tasks.map(t=>
        `"${t.title}",${t.datetime||""},${t.progress||0}`
      ).join("\n");
    }
    const blob=new Blob([csv],{type:"text/csv"}), a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download=currentProjectIndex===null?"allprojects.csv":`project_${projects[currentProjectIndex].name}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };
  refs.importMenu.onclick = () => alert("Waiting import.");
});

