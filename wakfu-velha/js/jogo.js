// Jogo da velha: Yugo (X) contra Nox (O)

// Se as fotos não estiverem na pasta img/, aparece um desenho no lugar.
const DESENHO_YUGO = `<svg viewBox="0 0 100 100" aria-label="Yugo"><circle cx="50" cy="62" r="22" fill="#f2c9a0"/><path d="M10 56 Q50 -14 90 56 Q50 44 10 56Z" fill="#1d5fb8"/><circle cx="42" cy="64" r="3" fill="#222"/><circle cx="58" cy="64" r="3" fill="#222"/></svg>`;
const DESENHO_NOX = `<svg viewBox="0 0 100 100" aria-label="Nox"><circle cx="50" cy="50" r="38" fill="#2a1d4a" stroke="#f2b632" stroke-width="10" stroke-dasharray="10 6.8"/><line x1="50" y1="50" x2="50" y2="28" stroke="#f2b632" stroke-width="5"/><line x1="50" y1="50" x2="66" y2="58" stroke="#f2b632" stroke-width="5"/></svg>`;

const FIGURA = {
  X: `<img src="img/yugo.png" alt="Yugo" onerror="this.outerHTML=DESENHO_YUGO">`,
  O: `<img src="img/nox.png" alt="Nox" onerror="this.outerHTML=DESENHO_NOX">`
};
const NOMES = { X: "Yugo", O: "Nox" };
const LINHAS = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

let tabuleiro, atual, fim, modo = "2p", esperando = false;
const placar = { X: 0, O: 0, empates: 0 };

const elTab = document.getElementById("tabuleiro");
const elStatus = document.getElementById("status");

function novaPartida() {
  tabuleiro = Array(9).fill(null);
  atual = "X";
  fim = false;
  esperando = false;
  elTab.innerHTML = "";
  for (let i = 0; i < 9; i++) {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "casa";
    botao.setAttribute("aria-label", "Casa " + (i + 1) + ", vazia");
    botao.addEventListener("click", () => { if (!esperando) jogar(i); });
    elTab.appendChild(botao);
  }
  mostrarVez();
}

function vencedor() {
  for (const [a, b, c] of LINHAS) {
    if (tabuleiro[a] && tabuleiro[a] === tabuleiro[b] && tabuleiro[a] === tabuleiro[c]) {
      return { jogador: tabuleiro[a], linha: [a, b, c] };
    }
  }
  return null;
}

function jogar(i) {
  if (fim || tabuleiro[i]) return;
  tabuleiro[i] = atual;
  const casa = elTab.children[i];
  casa.innerHTML = FIGURA[atual];
  casa.disabled = true;
  casa.setAttribute("aria-label", "Casa " + (i + 1) + ", " + NOMES[atual]);

  const v = vencedor();
  if (v) {
    fim = true;
    placar[v.jogador]++;
    v.linha.forEach(n => elTab.children[n].classList.add("vitoria"));
    [...elTab.children].forEach(c => c.disabled = true);
    elStatus.textContent = NOMES[v.jogador] + " venceu!";
    mostrarPlacar();
    return;
  }
  if (tabuleiro.every(Boolean)) {
    fim = true;
    placar.empates++;
    elStatus.textContent = "Deu velha! Empate.";
    mostrarPlacar();
    return;
  }
  atual = atual === "X" ? "O" : "X";
  mostrarVez();
  if (modo === "cpu" && atual === "O") {
    esperando = true;
    setTimeout(jogadaDoNox, 450);
  }
}

// Computador: ganha se der, bloqueia se precisar, senão centro, canto ou qualquer casa livre
function jogadaDoNox() {
  esperando = false;
  if (fim) return;
  const livres = [];
  tabuleiro.forEach((v, i) => { if (!v) livres.push(i); });

  function acha(jogador) {
    return livres.find(i => {
      tabuleiro[i] = jogador;
      const ganhou = vencedor() !== null;
      tabuleiro[i] = null;
      return ganhou;
    });
  }

  let escolha = acha("O");
  if (escolha === undefined) escolha = acha("X");
  if (escolha === undefined) {
    if (!tabuleiro[4]) {
      escolha = 4;
    } else {
      const cantos = [0, 2, 6, 8].filter(i => !tabuleiro[i]);
      const opcoes = cantos.length > 0 ? cantos : livres;
      escolha = opcoes[Math.floor(Math.random() * opcoes.length)];
    }
  }
  jogar(escolha);
}

function mostrarVez() {
  elStatus.textContent = "Vez de " + NOMES[atual];
  document.getElementById("caixa-x").classList.toggle("ativo", atual === "X");
  document.getElementById("caixa-o").classList.toggle("ativo", atual === "O");
  mostrarPlacar();
}

function mostrarPlacar() {
  document.getElementById("pontos-x").textContent = placar.X;
  document.getElementById("pontos-o").textContent = placar.O;
  document.getElementById("pontos-e").textContent = placar.empates;
  if (fim) document.querySelectorAll(".caixa").forEach(c => c.classList.remove("ativo"));
}

function zerarPlacar() {
  placar.X = 0; placar.O = 0; placar.empates = 0;
}

document.getElementById("btn-novo").addEventListener("click", novaPartida);
document.getElementById("btn-zerar").addEventListener("click", () => { zerarPlacar(); novaPartida(); });
document.getElementById("modo").addEventListener("change", (e) => {
  modo = e.target.value;
  zerarPlacar();
  novaPartida();
});
document.getElementById("fig-x").innerHTML = FIGURA.X;
document.getElementById("fig-o").innerHTML = FIGURA.O;
novaPartida();
