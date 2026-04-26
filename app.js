const state = {
  tournamentName: "",
  format: "round-robin",
  startDate: "",
  teams: [],
  fixtures: [],
};

const $ = (id) => document.getElementById(id);
const tournamentNameEl = $("tournamentName");
const formatEl = $("format");
const startDateEl = $("startDate");
const teamNameEl = $("teamName");
const teamsListEl = $("teamsList");
const fixturesContainerEl = $("fixturesContainer");
const summaryEl = $("summary");
const fixtureTemplate = $("fixtureTemplate");

function addTeam() {
  const name = teamNameEl.value.trim();
  if (!name) return;
  if (state.teams.includes(name)) {
    alert("Ese equipo ya existe.");
    return;
  }
  state.teams.push(name);
  teamNameEl.value = "";
  renderTeams();
}

function removeTeam(name) {
  state.teams = state.teams.filter((team) => team !== name);
  renderTeams();
}

function renderTeams() {
  teamsListEl.innerHTML = "";
  state.teams.forEach((team) => {
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.textContent = team;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Quitar";
    removeBtn.className = "remove-btn";
    removeBtn.addEventListener("click", () => removeTeam(team));

    li.append(span, removeBtn);
    teamsListEl.appendChild(li);
  });
}

function toDateText(date) {
  return date.toLocaleDateString("es-ES", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function generateRoundRobin(teams, startDate) {
  const list = [...teams];
  if (list.length % 2 !== 0) list.push("DESCANSA");

  const rounds = list.length - 1;
  const half = list.length / 2;
  const fixtures = [];

  for (let round = 0; round < rounds; round++) {
    for (let i = 0; i < half; i++) {
      const home = list[i];
      const away = list[list.length - 1 - i];
      if (home !== "DESCANSA" && away !== "DESCANSA") {
        const date = new Date(startDate);
        date.setDate(date.getDate() + round * 7);
        fixtures.push({
          date: toDateText(date),
          match: `${home} vs ${away}`,
          phase: `Jornada ${round + 1}`,
        });
      }
    }

    list.splice(1, 0, list.pop());
  }

  return fixtures;
}

function generateKnockout(teams, startDate) {
  const powerOfTwo = 2 ** Math.floor(Math.log2(teams.length));
  const selected = teams.slice(0, powerOfTwo);
  const fixtures = [];

  for (let i = 0; i < selected.length; i += 2) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + 7);
    fixtures.push({
      date: toDateText(date),
      match: `${selected[i]} vs ${selected[i + 1]}`,
      phase: "Primera ronda",
    });
  }

  return fixtures;
}

function generateFixtures() {
  state.tournamentName = tournamentNameEl.value.trim();
  state.format = formatEl.value;
  state.startDate = startDateEl.value;

  if (!state.tournamentName || !state.startDate) {
    alert("Completa nombre del torneo y fecha de inicio.");
    return;
  }

  if (state.teams.length < 2) {
    alert("Agrega al menos 2 equipos.");
    return;
  }

  state.fixtures =
    state.format === "round-robin"
      ? generateRoundRobin(state.teams, state.startDate)
      : generateKnockout(state.teams, state.startDate);

  renderFixtures();
}

function renderFixtures() {
  fixturesContainerEl.innerHTML = "";

  summaryEl.textContent = `${state.tournamentName} · ${state.teams.length} equipos · ${state.fixtures.length} partidos`;

  state.fixtures.forEach((fixture) => {
    const node = fixtureTemplate.content.cloneNode(true);
    node.querySelector(".date").textContent = `${fixture.phase} · ${fixture.date}`;
    node.querySelector(".match").textContent = fixture.match;
    fixturesContainerEl.appendChild(node);
  });
}

function saveData() {
  localStorage.setItem("soccer_planner", JSON.stringify(state));
  alert("Torneo guardado localmente.");
}

function loadData() {
  const raw = localStorage.getItem("soccer_planner");
  if (!raw) {
    alert("No hay datos guardados.");
    return;
  }

  const loaded = JSON.parse(raw);
  Object.assign(state, loaded);

  tournamentNameEl.value = state.tournamentName;
  formatEl.value = state.format;
  startDateEl.value = state.startDate;

  renderTeams();
  renderFixtures();
}

function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${state.tournamentName || "torneo"}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function resetAll() {
  if (!confirm("¿Seguro que quieres borrar todo?")) return;

  state.tournamentName = "";
  state.format = "round-robin";
  state.startDate = "";
  state.teams = [];
  state.fixtures = [];

  tournamentNameEl.value = "";
  formatEl.value = "round-robin";
  startDateEl.value = "";

  renderTeams();
  renderFixtures();
}

$("addTeamBtn").addEventListener("click", addTeam);
$("generateBtn").addEventListener("click", generateFixtures);
$("saveBtn").addEventListener("click", saveData);
$("loadBtn").addEventListener("click", loadData);
$("exportBtn").addEventListener("click", exportData);
$("resetBtn").addEventListener("click", resetAll);

teamNameEl.addEventListener("keydown", (event) => {
  if (event.key === "Enter") addTeam();
});

renderTeams();
renderFixtures();
