// Utilitaires
let criteria = [];
let alternatives = [];
let scores = []; // scores[critère][alternative]
let pairwiseMatrix = [];

function addCriterion() {
    const input = document.getElementById('criterionInput');
    const name = input.value.trim();
    if (name && !criteria.includes(name)) {
        criteria.push(name);
        input.value = '';
        renderCriteriaList();
    }
}

function renderCriteriaList() {
    const container = document.getElementById('criteriaList');
    container.innerHTML = criteria.map((c, i) => `
        <div class="item">
            <span>${c}</span>
            <button onclick="removeCriterion(${i})" class="btn-danger">🗑️</button>
        </div>
    `).join('');
    
    const btn = document.getElementById('nextToAlternativesBtn');
    btn.disabled = criteria.length < 2;
}

function removeCriterion(index) {
    criteria.splice(index, 1);
    renderCriteriaList();
}

function addAlternative() {
    const input = document.getElementById('alternativeInput');
    const name = input.value.trim();
    if (name && !alternatives.includes(name)) {
        alternatives.push(name);
        input.value = '';
        renderAlternativesList();
    }
}

function renderAlternativesList() {
    const container = document.getElementById('alternativesList');
    container.innerHTML = alternatives.map((a, i) => `
        <div class="item">
            <span>${a}</span>
            <button onclick="removeAlternative(${i})" class="btn-danger">🗑️</button>
        </div>
    `).join('');
    
    const btn = document.getElementById('nextToScoresBtn');
    btn.disabled = alternatives.length < 2;
}

function removeAlternative(index) {
    alternatives.splice(index, 1);
    renderAlternativesList();
}

function nextToAlternatives() {
    if (criteria.length >= 2) {
        document.getElementById('alternativesSection').classList.remove('hidden');
        document.getElementById('alternativesSection').scrollIntoView({ behavior: 'smooth' });
    }
}

function nextToScores() {
    if (alternatives.length >= 2) {
        initScoresMatrix();
        document.getElementById('scoresSection').classList.remove('hidden');
        document.getElementById('scoresSection').scrollIntoView({ behavior: 'smooth' });
    }
}

function initScoresMatrix() {
    scores = Array(criteria.length).fill().map(() => Array(alternatives.length).fill(5));
    renderScoresMatrix();
}

function renderScoresMatrix() {
    const container = document.getElementById('scoresMatrix');
    let html = '<table><thead><tr><th>Critère \\ Alternative</th>';
    alternatives.forEach(a => html += `<th>${a}</th>`);
    html += '</tr></thead><tbody>';
    
    criteria.forEach((c, i) => {
        html += `<tr><td><strong>${c}</strong></td>`;
        alternatives.forEach((a, j) => {
            html += `<td><input type="number" min="1" max="10" value="${scores[i][j]}" onchange="updateScore(${i}, ${j}, this.value)"></td>`;
        });
        html += '</tr>';
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}

function updateScore(criterionIdx, alternativeIdx, value) {
    scores[criterionIdx][alternativeIdx] = parseInt(value);
}

function nextToPairwise() {
    initPairwiseMatrix();
    document.getElementById('pairwiseSection').classList.remove('hidden');
    document.getElementById('pairwiseSection').scrollIntoView({ behavior: 'smooth' });
}

function initPairwiseMatrix() {
    pairwiseMatrix = Array(criteria.length).fill().map(() => Array(criteria.length).fill(1));
    for (let i = 0; i < criteria.length; i++) {
        pairwiseMatrix[i][i] = 1;
    }
    renderPairwiseMatrix();
}

function renderPairwiseMatrix() {
    const container = document.getElementById('pairwiseMatrix');
    let html = '<table><thead><tr><th></th>';
    criteria.forEach(c => html += `<th>${c}</th>`);
    html += '</tr></thead><tbody>';
    
    for (let i = 0; i < criteria.length; i++) {
        html += `<tr><td><strong>${criteria[i]}</strong></td>`;
        for (let j = 0; j < criteria.length; j++) {
            if (i === j) {
                html += `<td>1</td>`;
            } else if (i < j) {
                html += `<td><input type="number" step="1" min="1" max="9" value="${pairwiseMatrix[i][j]}" onchange="updatePairwise(${i}, ${j}, this.value)"></td>`;
            } else {
                html += `<td>1/${pairwiseMatrix[j][i]}</td>`;
            }
        }
        html += '</tr>';
    }
    html += '</tbody></table>';
    container.innerHTML = html;
}

function updatePairwise(i, j, value) {
    let val = parseInt(value);
    if (val < 1) val = 1;
    if (val > 9) val = 9;
    pairwiseMatrix[i][j] = val;
    pairwiseMatrix[j][i] = 1 / val;
    renderPairwiseMatrix();
}

function resetApp() {
    criteria = [];
    alternatives = [];
    scores = [];
    pairwiseMatrix = [];
    location.reload();
}

function exportData() {
    const data = { criteria, alternatives, scores, pairwiseMatrix };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ahp-data.json';
    a.click();
    URL.revokeObjectURL(url);
}