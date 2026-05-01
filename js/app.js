// app.js - Logique principale de l'application AHP

// Variables globales
let criteria = [];
let alternatives = [];
let scores = [];
let pairwiseMatrix = [];
let currentStep = 1;

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Application AHP démarrée');
    setupEventListeners();
});

// Configuration des écouteurs d'événements
function setupEventListeners() {
    // Permettre d'ajouter un critère avec la touche Entrée
    const criterionInput = document.getElementById('criterionInput');
    if (criterionInput) {
        criterionInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') addCriterion();
        });
    }
    
    // Permettre d'ajouter une alternative avec la touche Entrée
    const alternativeInput = document.getElementById('alternativeInput');
    if (alternativeInput) {
        alternativeInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') addAlternative();
        });
    }
}

// ============ GESTION DES CRITÈRES ============

function addCriterion() {
    const input = document.getElementById('criterionInput');
    const name = input.value.trim();
    
    if (!name) {
        showNotification('Veuillez entrer un nom de critère', 'error');
        return;
    }
    
    if (criteria.length >= 9) {
        showNotification('Maximum 9 critères autorisés', 'error');
        return;
    }
    
    if (criteria.includes(name)) {
        showNotification('Ce critère existe déjà', 'error');
        return;
    }
    
    criteria.push(name);
    input.value = '';
    renderCriteriaList();
    showNotification(`Critère "${name}" ajouté`, 'success');
}

function renderCriteriaList() {
    const container = document.getElementById('criteriaList');
    
    if (!container) return;
    
    if (criteria.length === 0) {
        container.innerHTML = '<p class="empty-message">Aucun critère ajouté. Ajoutez au moins 2 critères.</p>';
    } else {
        container.innerHTML = criteria.map((c, i) => `
            <div class="item">
                <span>📌 <strong>${escapeHtml(c)}</strong></span>
                <button onclick="removeCriterion(${i})" class="btn-danger" title="Supprimer">🗑️</button>
            </div>
        `).join('');
    }
    
    const btn = document.getElementById('nextToAlternativesBtn');
    if (btn) {
        btn.disabled = criteria.length < 2;
        if (criteria.length >= 2) {
            btn.style.opacity = '1';
        } else {
            btn.style.opacity = '0.5';
        }
    }
}

function removeCriterion(index) {
    const removed = criteria[index];
    criteria.splice(index, 1);
    renderCriteriaList();
    showNotification(`Critère "${removed}" supprimé`, 'info');
}

// ============ GESTION DES ALTERNATIVES ============

function addAlternative() {
    const input = document.getElementById('alternativeInput');
    const name = input.value.trim();
    
    if (!name) {
        showNotification('Veuillez entrer un nom d\'alternative', 'error');
        return;
    }
    
    if (alternatives.length >= 9) {
        showNotification('Maximum 9 alternatives autorisées', 'error');
        return;
    }
    
    if (alternatives.includes(name)) {
        showNotification('Cette alternative existe déjà', 'error');
        return;
    }
    
    alternatives.push(name);
    input.value = '';
    renderAlternativesList();
    showNotification(`Alternative "${name}" ajoutée`, 'success');
}

function renderAlternativesList() {
    const container = document.getElementById('alternativesList');
    
    if (!container) return;
    
    if (alternatives.length === 0) {
        container.innerHTML = '<p class="empty-message">Aucune alternative ajoutée. Ajoutez au moins 2 alternatives.</p>';
    } else {
        container.innerHTML = alternatives.map((a, i) => `
            <div class="item">
                <span>🎯 <strong>${escapeHtml(a)}</strong></span>
                <button onclick="removeAlternative(${i})" class="btn-danger" title="Supprimer">🗑️</button>
            </div>
        `).join('');
    }
    
    const btn = document.getElementById('nextToScoresBtn');
    if (btn) {
        btn.disabled = alternatives.length < 2;
        if (alternatives.length >= 2) {
            btn.style.opacity = '1';
        } else {
            btn.style.opacity = '0.5';
        }
    }
}

function removeAlternative(index) {
    const removed = alternatives[index];
    alternatives.splice(index, 1);
    renderAlternativesList();
    showNotification(`Alternative "${removed}" supprimée`, 'info');
}

// ============ NAVIGATION ENTRE LES SECTIONS ============

function nextToAlternatives() {
    if (criteria.length < 2) {
        showNotification('Ajoutez au moins 2 critères pour continuer', 'error');
        return;
    }
    
    // Sauvegarder l'état actuel
    saveToLocalStorage();
    
    // Afficher la section suivante
    document.getElementById('alternativesSection').classList.remove('hidden');
    document.getElementById('alternativesSection').scrollIntoView({ behavior: 'smooth' });
    currentStep = 2;
}

function nextToScores() {
    if (alternatives.length < 2) {
        showNotification('Ajoutez au moins 2 alternatives pour continuer', 'error');
        return;
    }
    
    initScoresMatrix();
    document.getElementById('scoresSection').classList.remove('hidden');
    document.getElementById('scoresSection').scrollIntoView({ behavior: 'smooth' });
    currentStep = 3;
}

function initScoresMatrix() {
    // Initialiser la matrice des scores avec des valeurs par défaut (5)
    scores = Array(criteria.length).fill().map(() => Array(alternatives.length).fill(5));
    renderScoresMatrix();
}

function renderScoresMatrix() {
    const container = document.getElementById('scoresMatrix');
    if (!container) return;
    
    let html = `
        <div class="score-matrix-container">
            <p class="info">📝 Notez chaque alternative de 1 à 10 (1 = Très mauvais, 10 = Excellent)</p>
            <table class="score-table">
                <thead>
                    <tr>
                        <th>Critère / Alternative</th>
    `;
    
    alternatives.forEach(a => {
        html += `<th>${escapeHtml(a)}</th>`;
    });
    
    html += `
                    </tr>
                </thead>
                <tbody>
    `;
    
    criteria.forEach((c, i) => {
        html += `
            <tr>
                <td class="criterion-cell"><strong>${escapeHtml(c)}</strong></td>
        `;
        alternatives.forEach((a, j) => {
            html += `
                <td>
                    <input type="number" 
                           min="1" 
                           max="10" 
                           value="${scores[i][j]}" 
                           onchange="updateScore(${i}, ${j}, this.value)"
                           class="score-input">
                </td>
            `;
        });
        html += '</tr>';
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = html;
}

function updateScore(criterionIdx, alternativeIdx, value) {
    let val = parseInt(value);
    if (isNaN(val)) val = 5;
    val = Math.max(1, Math.min(10, val));
    scores[criterionIdx][alternativeIdx] = val;
}

function nextToPairwise() {
    // Vérifier que tous les scores sont valides
    let allValid = true;
    for (let i = 0; i < criteria.length; i++) {
        for (let j = 0; j < alternatives.length; j++) {
            if (scores[i][j] < 1 || scores[i][j] > 10) {
                allValid = false;
                break;
            }
        }
    }
    
    if (!allValid) {
        showNotification('Veuillez entrer des scores valides entre 1 et 10', 'error');
        return;
    }
    
    initPairwiseMatrix();
    document.getElementById('pairwiseSection').classList.remove('hidden');
    document.getElementById('pairwiseSection').scrollIntoView({ behavior: 'smooth' });
    currentStep = 4;
}

function initPairwiseMatrix() {
    const n = criteria.length;
    pairwiseMatrix = Array(n).fill().map(() => Array(n).fill(1));
    
    // Initialiser la diagonale à 1
    for (let i = 0; i < n; i++) {
        pairwiseMatrix[i][i] = 1;
    }
    
    // Initialiser les valeurs hors diagonale par défaut à 1 (égalité)
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            pairwiseMatrix[i][j] = 1;
            pairwiseMatrix[j][i] = 1;
        }
    }
    
    renderPairwiseMatrix();
}

function renderPairwiseMatrix() {
    const container = document.getElementById('pairwiseMatrix');
    if (!container) return;
    
    let html = `
        <div class="pairwise-container">
            <p class="info">
                🔢 Échelle de Saaty :<br>
                1 = Également important | 3 = Modérément plus important | 5 = Fortement plus important<br>
                7 = Très fortement plus important | 9 = Extrêmement plus important
            </p>
            <table class="pairwise-table">
                <thead>
                    <tr>
                        <th></th>
    `;
    
    criteria.forEach(c => {
        html += `<th>${escapeHtml(c)}</th>`;
    });
    
    html += `
                    </tr>
                </thead>
                <tbody>
    `;
    
    for (let i = 0; i < criteria.length; i++) {
        html += `
            <tr>
                <td class="criterion-cell"><strong>${escapeHtml(criteria[i])}</strong></td>
        `;
        for (let j = 0; j < criteria.length; j++) {
            if (i === j) {
                html += `<td class="diagonal-cell">1</td>`;
            } else if (i < j) {
                html += `
                    <td>
                        <select onchange="updatePairwise(${i}, ${j}, this.value)" class="pairwise-select">
                            ${generateSaatyOptions(pairwiseMatrix[i][j])}
                        </select>
                    </td>
                `;
            } else {
                html += `<td class="inverse-cell">1/${pairwiseMatrix[j][i]}</td>`;
            }
        }
        html += '</tr>';
    }
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = html;
}

function generateSaatyOptions(selectedValue) {
    const options = [
        { value: 1, label: '1 - Également important' },
        { value: 2, label: '2 - Entre égal et modéré' },
        { value: 3, label: '3 - Modérément plus important' },
        { value: 4, label: '4 - Entre modéré et fort' },
        { value: 5, label: '5 - Fortement plus important' },
        { value: 6, label: '6 - Entre fort et très fort' },
        { value: 7, label: '7 - Très fortement plus important' },
        { value: 8, label: '8 - Entre très fort et extrême' },
        { value: 9, label: '9 - Extrêmement plus important' }
    ];
    
    let html = '';
    for (let opt of options) {
        const selected = (selectedValue == opt.value) ? 'selected' : '';
        html += `<option value="${opt.value}" ${selected}>${opt.label}</option>`;
    }
    return html;
}

function updatePairwise(i, j, value) {
    let val = parseInt(value);
    if (isNaN(val)) val = 1;
    val = Math.max(1, Math.min(9, val));
    
    pairwiseMatrix[i][j] = val;
    pairwiseMatrix[j][i] = 1 / val;
    
    renderPairwiseMatrix();
}

// ============ CALCUL ET RÉSULTATS ============

function calculateAHP() {
    showLoading(true);
    
    // Simuler un petit délai pour l'effet visuel
    setTimeout(() => {
        try {
            // 1. Vérifier la cohérence de la matrice des critères
            const consistencyResult = checkConsistency(pairwiseMatrix);
            
            if (!consistencyResult.isConsistent) {
                showInconsistency(consistencyResult);
                showLoading(false);
                return;
            }
            
            // 2. Calculer les poids des critères
            const criteriaWeights = calculatePriorityVector(pairwiseMatrix);
            
            // 3. Pour chaque critère, calculer les poids des alternatives
            const alternativeWeights = Array(alternatives.length).fill(0);
            
            for (let c = 0; c < criteria.length; c++) {
                const altMatrix = buildAlternativeMatrixForCriterion(c);
                const altWeights = calculatePriorityVector(altMatrix);
                
                for (let a = 0; a < alternatives.length; a++) {
                    alternativeWeights[a] += criteriaWeights[c] * altWeights[a];
                }
            }
            
            // 4. Normaliser les poids des alternatives (pourcentage)
            const total = alternativeWeights.reduce((sum, w) => sum + w, 0);
            for (let i = 0; i < alternativeWeights.length; i++) {
                alternativeWeights[i] = alternativeWeights[i] / total;
            }
            
            // 5. Afficher les résultats
            showResults(criteriaWeights, alternativeWeights, consistencyResult);
            
        } catch (error) {
            console.error('Erreur lors du calcul:', error);
            showNotification('Une erreur est survenue lors du calcul', 'error');
        }
        
        showLoading(false);
    }, 300);
}

function buildAlternativeMatrixForCriterion(criterionIdx) {
    const n = alternatives.length;
    const matrix = Array(n).fill().map(() => Array(n).fill(1));
    
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            const scoreI = scores[criterionIdx][i];
            const scoreJ = scores[criterionIdx][j];
            const ratio = scoreI / scoreJ;
            matrix[i][j] = ratio;
            matrix[j][i] = 1 / ratio;
        }
    }
    
    return matrix;
}

function showResults(criteriaWeights, alternativeWeights, consistencyResult) {
    // Trouver la meilleure alternative
    let bestIdx = 0;
    for (let i = 1; i < alternativeWeights.length; i++) {
        if (alternativeWeights[i] > alternativeWeights[bestIdx]) bestIdx = i;
    }
    
    // Trier les alternatives par poids décroissant
    const sortedAlternatives = alternatives.map((alt, idx) => ({
        name: alt,
        weight: alternativeWeights[idx],
        percentage: (alternativeWeights[idx] * 100).toFixed(2)
    })).sort((a, b) => b.weight - a.weight);
    
    // Trier les critères par poids décroissant
    const sortedCriteria = criteria.map((c, idx) => ({
        name: c,
        weight: criteriaWeights[idx],
        percentage: (criteriaWeights[idx] * 100).toFixed(2)
    })).sort((a, b) => b.weight - a.weight);
    
    let html = `
        <div class="result-card">
            <div class="consistency-info">
                <h3>📐 Vérification de cohérence</h3>
                <p>✅ Matrice cohérente (CR = ${consistencyResult.CR.toFixed(4)} &lt; 0.1)</p>
            </div>
            
            <div class="criteria-results">
                <h3>📊 Poids des critères (classés par importance)</h3>
                <div class="weights-list">
    `;
    
    for (let c of sortedCriteria) {
        html += `
            <div class="weight-item">
                <span class="weight-name">${escapeHtml(c.name)}</span>
                <div class="weight-bar-container">
                    <div class="weight-bar" style="width: ${c.percentage}%; background: linear-gradient(90deg, #667eea, #764ba2);">
                        <span class="weight-value">${c.percentage}%</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    html += `
                </div>
            </div>
            
            <div class="alternatives-results">
                <h3>🏆 Score global des alternatives</h3>
                <div class="weights-list">
    `;
    
    for (let a of sortedAlternatives) {
        const isBest = a === sortedAlternatives[0];
        html += `
            <div class="weight-item ${isBest ? 'best' : ''}">
                <span class="weight-name">${escapeHtml(a.name)} ${isBest ? '👑' : ''}</span>
                <div class="weight-bar-container">
                    <div class="weight-bar" style="width: ${a.percentage}%; background: ${isBest ? 'linear-gradient(90deg, #48bb78, #38a169)' : 'linear-gradient(90deg, #a0aec0, #718096)'};">
                        <span class="weight-value">${a.percentage}%</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    html += `
                </div>
            </div>
            
            <div class="best-alternative">
                🎯 <strong>Décision recommandée : ${escapeHtml(sortedAlternatives[0].name)}</strong> avec ${sortedAlternatives[0].percentage}%
            </div>
            
            <div class="action-buttons">
                <button onclick="exportResults()" class="btn-secondary">📥 Exporter les résultats (JSON)</button>
                <button onclick="exportData()" class="btn-secondary">💾 Exporter toutes les données</button>
                <button onclick="resetApp()" class="btn-secondary">🔄 Nouvelle analyse</button>
            </div>
        </div>
    `;
    
    const resultsDiv = document.getElementById('results');
    if (resultsDiv) {
        resultsDiv.innerHTML = html;
    }
    
    document.getElementById('resultsSection').classList.remove('hidden');
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
    
    // Sauvegarder les résultats dans localStorage
    saveResultsToLocalStorage(sortedAlternatives, sortedCriteria, consistencyResult);
}

function showInconsistency(result) {
    const resultsDiv = document.getElementById('results');
    
    let html = `
        <div class="inconsistency">
            <h3>⚠️ Matrice Incohérente</h3>
            <p><strong>Rapport de cohérence (CR) :</strong> ${result.CR.toFixed(4)}</p>
            <p><strong>Seuil acceptable :</strong> CR < 0.1</p>
            <p><strong>λmax :</strong> ${result.lambdaMax.toFixed(4)}</p>
            <p><strong>Indice de cohérence (CI) :</strong> ${result.CI.toFixed(4)}</p>
            <p><strong>Indice aléatoire (RI) pour n=${result.n} :</strong> ${getRI(result.n)}</p>
            
            <div class="inconsistency-reasons">
                <h4>🔍 Causes possibles :</h4>
                <ul>
                    <li>Transitivité non respectée : Si A > B et B > C, alors A devrait être > C</li>
                    <li>Valeurs extrêmes trop nombreuses (7, 8, 9)</li>
                    <li>Inversion de préférence dans les comparaisons</li>
                </ul>
            </div>
            
            <div class="recommendations">
                <h4>💡 Recommandations :</h4>
                <ul>
                    <li>Vérifiez la cohérence de vos jugements</li>
                    <li>Privilégiez des valeurs entre 1 et 5 pour plus de cohérence</li>
                    <li>Refaites la matrice en vous assurant de la transitivité</li>
                </ul>
            </div>
            
            <div class="action-buttons">
                <button onclick="goBackToPairwise()" class="btn-primary">✏️ Modifier la matrice</button>
                <button onclick="resetApp()" class="btn-secondary">🔄 Nouvelle analyse</button>
            </div>
        </div>
    `;
    
    if (resultsDiv) {
        resultsDiv.innerHTML = html;
    }
    
    document.getElementById('resultsSection').classList.remove('hidden');
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
}

function goBackToPairwise() {
    document.getElementById('resultsSection').classList.add('hidden');
    document.getElementById('pairwiseSection').scrollIntoView({ behavior: 'smooth' });
}

function getRI(n) {
    const RI = [0, 0, 0.58, 0.90, 1.12, 1.24, 1.32, 1.41, 1.45, 1.49];
    return RI[n] || 1.49;
}

// ============ FONCTIONS UTILITAIRES ============

function showNotification(message, type = 'info') {
    // Créer une notification temporaire
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === 'error' ? '#f56565' : type === 'success' ? '#48bb78' : '#4299e1'};
        color: white;
        border-radius: 8px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function showLoading(show) {
    let loader = document.getElementById('loadingOverlay');
    
    if (show) {
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'loadingOverlay';
            loader.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 2000;
                color: white;
                font-size: 1.2rem;
            `;
            loader.innerHTML = `
                <div style="text-align: center;">
                    <div class="spinner"></div>
                    <p>Calcul en cours...</p>
                </div>
            `;
            document.body.appendChild(loader);
            
            // Ajouter les styles du spinner
            if (!document.querySelector('#spinnerStyles')) {
                const style = document.createElement('style');
                style.id = 'spinnerStyles';
                style.textContent = `
                    .spinner {
                        width: 50px;
                        height: 50px;
                        border: 5px solid rgba(255,255,255,0.3);
                        border-top-color: white;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin: 0 auto 15px;
                    }
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                    @keyframes slideIn {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                    @keyframes slideOut {
                        from { transform: translateX(0); opacity: 1; }
                        to { transform: translateX(100%); opacity: 0; }
                    }
                `;
                document.head.appendChild(style);
            }
        }
    } else if (loader) {
        loader.remove();
    }
}

function saveToLocalStorage() {
    const data = {
        criteria,
        alternatives,
        scores,
        pairwiseMatrix,
        currentStep,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem('ahpAppData', JSON.stringify(data));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('ahpAppData');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            criteria = data.criteria || [];
            alternatives = data.alternatives || [];
            scores = data.scores || [];
            pairwiseMatrix = data.pairwiseMatrix || [];
            currentStep = data.currentStep || 1;
            
            if (criteria.length > 0) renderCriteriaList();
            if (alternatives.length > 0) renderAlternativesList();
            if (scores.length > 0 && alternatives.length > 0) renderScoresMatrix();
            if (pairwiseMatrix.length > 0) renderPairwiseMatrix();
            
            showNotification('Données chargées depuis la session précédente', 'info');
        } catch (e) {
            console.error('Erreur lors du chargement:', e);
        }
    }
}

function saveResultsToLocalStorage(alternatives, criteria, consistency) {
    const results = {
        alternatives,
        criteria,
        consistency,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem('ahpLastResults', JSON.stringify(results));
}

function exportResults() {
    const results = localStorage.getItem('ahpLastResults');
    if (results) {
        const blob = new Blob([results], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ahp-results-${new Date().toISOString().slice(0,19)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showNotification('Résultats exportés avec succès', 'success');
    } else {
        showNotification('Aucun résultat à exporter', 'error');
    }
}

function exportData() {
    const data = {
        criteria,
        alternatives,
        scores,
        pairwiseMatrix,
        exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ahp-complete-data-${new Date().toISOString().slice(0,19)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Données exportées avec succès', 'success');
}

function resetApp() {
    if (confirm('Êtes-vous sûr de vouloir tout réinitialiser ? Toutes les données seront perdues.')) {
        criteria = [];
        alternatives = [];
        scores = [];
        pairwiseMatrix = [];
        currentStep = 1;
        localStorage.removeItem('ahpAppData');
        location.reload();
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Charger les données sauvegardées au démarrage
window.addEventListener('load', () => {
    loadFromLocalStorage();
    // Ajouter les styles CSS supplémentaires
    const additionalStyles = document.createElement('style');
    additionalStyles.textContent = `
        .empty-message {
            text-align: center;
            color: #a0aec0;
            padding: 20px;
            font-style: italic;
        }
        .score-input, .pairwise-select {
            width: 100%;
            padding: 8px;
            text-align: center;
            font-size: 14px;
        }
        .diagonal-cell, .inverse-cell {
            text-align: center;
            background: #f7fafc;
            font-weight: bold;
        }
        .criterion-cell {
            background: #edf2f7;
            font-weight: bold;
        }
        .weight-item {
            margin: 15px 0;
        }
        .weight-name {
            display: inline-block;
            width: 120px;
            font-weight: bold;
        }
        .weight-bar-container {
            display: inline-block;
            width: calc(100% - 130px);
            background: #e2e8f0;
            border-radius: 10px;
            overflow: hidden;
            height: 30px;
            position: relative;
        }
        .weight-bar {
            height: 100%;
            position: relative;
            transition: width 0.5s ease;
            border-radius: 10px;
        }
        .weight-value {
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            color: white;
            font-size: 12px;
            font-weight: bold;
        }
        .weight-item.best .weight-name {
            color: #48bb78;
        }
        .action-buttons {
            margin-top: 20px;
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        .consistency-info, .criteria-results, .alternatives-results {
            margin-bottom: 25px;
        }
        .inconsistency-reasons, .recommendations {
            margin-top: 20px;
            padding: 15px;
            background: #fff5f5;
            border-radius: 8px;
        }
        table {
            width: 100%;
            overflow-x: auto;
            display: block;
        }
        @media (max-width: 768px) {
            .weight-name {
                width: 100%;
                margin-bottom: 5px;
            }
            .weight-bar-container {
                width: 100%;
            }
            .action-buttons button {
                width: 100%;
            }
        }
    `;
    document.head.appendChild(additionalStyles);
});