// IseeYOU - SUGGESTIONS + PRÉDICTIONS ✅
console.log('🚀 IseeYOU chargé');

let myHand = JSON.parse(localStorage.getItem('iseeyou_hand')) || [];
let playedTiles = JSON.parse(localStorage.getItem('iseeyou_played')) || [];
let stream = null;
let model = null;
let video = document.getElementById('video');
let canvas = document.getElementById('canvas');

function addRandomTile() {
    if(myHand.length >= 7) return;
    const nums = [0,1,2,3,4,5,6];
    const a = nums[Math.floor(Math.random()*7)];
    const b = nums[Math.floor(Math.random()*7)];
    const tile = a <= b ? [a,b] : [b,a];
    if(!myHand.some(t=>t[0]===tile[0]&&t[1]===tile[1])) {
        myHand.push(tile);
    }
    renderAll();
    saveData();
}

function removeTile() {
    myHand.pop();
    renderAll();
    saveData();
}

function setQuickTile() {
    const select = document.getElementById('quickTile');
    if(!select.value || myHand.length >= 7) return;
    const [a,b] = select.value.split('-').map(Number);
    myHand.push([a,b]);
    select.value = '';
    renderAll();
    saveData();
}

function clearHand() {
    myHand = [];
    renderAll();
    saveData();
}

function addTableTile() {
    const input = document.getElementById('tableTiles').value.trim();
    if(!input) return;
    
    // Parse 3-5 ou 3|5
    const nums = input.split(/[-|]/).map(n => parseInt(n)).filter(n => n>=0 && n<=6);
    if(nums.length === 2) {
        const [a,b] = nums;
        playedTiles.push([a,b]);
        document.getElementById('tableTiles').value = '';
        renderAll();
        saveData();
    }
}

function removeSpecific(a,b) {
    myHand = myHand.filter(t => !(t[0]===a && t[1]===b));
    renderAll();
    saveData();
}

// 🎯 RENDU COMPLÈT
function renderAll() {
    renderHand();
    renderPlayed();
    renderSuggestions();
    renderPredictions();
}

function renderHand() {
    const grid = document.getElementById('myHand');
    grid.innerHTML = myHand.map(([a,b]) => 
        `<div class="tile" onclick="removeSpecific(${a},${b})">${a}|${b}</div>`
    ).join('');
}

function renderPlayed() {
    const grid = document.getElementById('playedTiles');
    grid.innerHTML = playedTiles.map(([a,b]) => 
        `<div class="tile played" onclick="removeTableTile(${a},${b})">${a}|${b}</div>`
    ).join('');
}

function removeTableTile(a,b) {
    playedTiles = playedTiles.filter(t => !(t[0]===a && t[1]===b));
    renderAll();
    saveData();
}

function renderSuggestions() {
     const suggEl = document.getElementById('suggestions');
    if(!suggEl || myHand.length === 0) return;
    
    // 🎯 BOUTS TABLE
    const tableEnds = playedTiles.length ? 
        [playedTiles[0][0], playedTiles[playedTiles.length-1][1]] : [0,0];
    
    // ALGO CHAMPION
    const moves = myHand.map(tile => {
        const [a,b] = tile;
        let score = 0;
        
        // 1️⃣ DOUBLE (garde fin) = 50pts
        if(a === b) score += 50;
        
        // 2️⃣ CONTRÔLE 1 bout = 60pts ⭐
        const matchLeft = (a === tableEnds[0] || b === tableEnds[0]);
        const matchRight = (a === tableEnds[1] || b === tableEnds[1]);
        if(matchLeft !== matchRight) score += 60;
        
        // 3️⃣ DOUBLE MATCH = 40pts
        if(matchLeft && matchRight) score += 40;
        
        return { tile, score, left: matchLeft, right: matchRight };
    }).filter(m => playedTiles.length === 0 || 
        m.tile[0] === tableEnds[0] || m.tile[0] === tableEnds[1] || 
        m.tile[1] === tableEnds[0] || m.tile[1] === tableEnds[1]
    ).sort((a,b) => b.score - a.score);
    
    if(moves.length === 0) {
        suggEl.innerHTML = '⏭️ <strong>PASSEZ</strong>';
    } else {
        const top = moves[0];
        suggEl.innerHTML = `
            <strong>🎯 ${moves.length} coups:</strong><br>
            <span style="color:#4CAF50;font-size:18px">
                1️⃣ ${top.tile[0]}|${top.tile[1]} (${top.score}pts)
                ${top.left?'[L]':'[R]'}
            </span>
        `;
    }
}
function renderPredictions() {
    // TUILES RESTANTES
    const totalTiles = 28;
    const used = myHand.length + playedTiles.length;
    const remaining = totalTiles - used;
    
    // TUILES PROBABLES ADVERSAIRE (match avec table)
    const probable = [];
    for(let [a,b] of playedTiles) {
        for(let x=0; x<=6; x++) {
            if(!myHand.some(t=>t[0]===x||t[1]===x) && !playedTiles.some(t=>t[0]===x||t[1]===x)) {
                probable.push([x,a]);
                break;
            }
        }
    }
    
    const predEl = document.getElementById('predictions');
    predEl.innerHTML = `
        <strong>${remaining} tuiles</strong> restantes<br>
        <small>🔮 Probables: ${probable.slice(0,3).map(t=>`${t[0]}|${t[1]}`).join(', ') || 'Aucune'}</small>
    `;
}

function saveData() {
    localStorage.setItem('iseeyou_hand', JSON.stringify(myHand));
    localStorage.setItem('iseeyou_played', JSON.stringify(playedTiles));
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOM prêt');
    
    // Tous les boutons
    document.getElementById('addTile').onclick = addRandomTile;
    document.getElementById('removeTile').onclick = removeTile;
    document.getElementById('clearHand').onclick = clearHand;
    document.getElementById('setQuickTile').onclick = setQuickTile;
    document.getElementById('updateTable').onclick = addTableTile;
    
    renderAll();
    // 🎯 "J'AI JOUÉ" - SUPPRIME DE LA MAIN + AJOUTE À LA TABLE
function playSuggestedMove() {
    if(myHand.length === 0) return;
    
    const tableEnds = playedTiles.length ? 
        [playedTiles[0][0], playedTiles[playedTiles.length-1][1]] : [0,0];
    
    const bestMove = myHand.map(tile => {
        const [a,b] = tile;
        let score = (a === b ? 50 : 0);
        const matchLeft = (a === tableEnds[0] || b === tableEnds[0]);
        const matchRight = (a === tableEnds[1] || b === tableEnds[1]);
        if(matchLeft !== matchRight) score += 60;
        return { tile, score };
    }).filter(m => playedTiles.length === 0 || 
        m.tile[0] === tableEnds[0] || m.tile[0] === tableEnds[1] || 
        m.tile[1] === tableEnds[0] || m.tile[1] === tableEnds[1]
    ).sort((a,b) => b.score - a.score)[0]?.tile;
    
    if(bestMove) {
        myHand = myHand.filter(t => !(t[0]===bestMove[0] && t[1]===bestMove[1]));
        playedTiles.push(bestMove);
        renderAll();
        saveData();
    }
}

document.getElementById('playedBtn').onclick = playSuggestedMove;
document.getElementById('clearTable').onclick = () => {
    playedTiles = [];
    renderAll();
    saveData();
};
// 🕐 GESTION TOURS
let currentTurn = 1;
let passesCount = 0;

document.getElementById('passTurn').onclick = () => {
    passesCount++;
    currentTurn++;
    document.getElementById('turnNumber').textContent = currentTurn;
    document.getElementById('suggestions').innerHTML = '⏭️ <strong>Votre tour passé</strong>';
    console.log(`Tour ${currentTurn} - Vous passez (${passesCount} passes)`);
};

document.getElementById('opponentPass').onclick = () => {
    passesCount++;
    currentTurn++;
    document.getElementById('turnNumber').textContent = currentTurn;
    document.getElementById('predictions').innerHTML += '<br><small>👤 Adversaire passé</small>';
    console.log(`Tour ${currentTurn} - Adversaire passe (${passesCount} passes)`);
    
    // ALERTE BLOQUAGE
    if(passesCount >= 4) {
        document.getElementById('suggestions').innerHTML = '⚠️ <strong>BLOQUAGE ! 4 passes</strong>';
    }
};
});