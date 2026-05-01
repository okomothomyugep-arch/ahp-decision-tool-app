function calculateAHP() {
    // 1. Vérifier la cohérence de la matrice des critères
    const consistencyResult = checkConsistency(pairwiseMatrix);
    
    if (!consistencyResult.isConsistent) {
        showInconsistency(consistencyResult);
        return;
    }
    
    // 2. Calculer les poids des critères
    const criteriaWeights = calculatePriorityVector(pairwiseMatrix);
    
    // 3. Pour chaque critère, calculer les poids des alternatives
    const alternativeWeights = Array(alternatives.length).fill(0);
    
    for (let c = 0; c < criteria.length; c++) {
        // Construire la matrice de comparaison pour ce critère
        const altMatrix = buildAlternativeMatrixForCriterion(c);
        const altWeights = calculatePriorityVector(altMatrix);
        
        // Ajouter pondéré
        for (let a = 0; a < alternatives.length; a++) {
            alternativeWeights[a] += criteriaWeights[c] * altWeights[a];
        }
    }
    
    // 4. Afficher les résultats
    showResults(criteriaWeights, alternativeWeights);
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

function calculatePriorityVector(matrix) {
    const n = matrix.length;
    // Normaliser la matrice
    let colSums = Array(n).fill(0);
    for (let j = 0; j < n; j++) {
        for (let i = 0; i < n; i++) {
            colSums[j] += matrix[i][j];
        }
    }
    
    const normMatrix = Array(n).fill().map(() => Array(n).fill(0));
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            normMatrix[i][j] = matrix[i][j] / colSums[j];
        }
    }
    
    // Moyenne des lignes = vecteur prioritaire
    const weights = Array(n).fill(0);
    for (let i = 0; i < n; i++) {
        let sum = 0;
        for (let j = 0; j < n; j++) {
            sum += normMatrix[i][j];
        }
        weights[i] = sum / n;
    }
    
    return weights;
}

function checkConsistency(matrix) {
    const n = matrix.length;
    const weights = calculatePriorityVector(matrix);
    
    // Calculer λmax
    let lambdaMax = 0;
    for (let i = 0; i < n; i++) {
        let sum = 0;
        for (let j = 0; j < n; j++) {
            sum += matrix[i][j] * weights[j];
        }
        lambdaMax += sum / weights[i];
    }
    lambdaMax /= n;
    
    const CI = (lambdaMax - n) / (n - 1);
    
    // Indices aléatoires (RI) pour n jusqu'à 10
    const RI = [0, 0, 0.58, 0.90, 1.12, 1.24, 1.32, 1.41, 1.45, 1.49];
    const CR = CI / RI[n];
    
    return {
        isConsistent: CR < 0.1,
        CR: CR,
        CI: CI,
        lambdaMax: lambdaMax,
        n: n
    };
}

function showInconsistency(result) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        <div class="inconsistency">
            <h3> Matrice Incohérente</h3>
            <p><strong>Rapport de cohérence (CR) :</strong> ${result.CR.toFixed(4)}</p>
            <p><strong>Seuil acceptable :</strong> CR < 0.1</p>
            <p><strong>λmax :</strong> ${result.lambdaMax.toFixed(4)}</p>
            <p><strong>IC :</strong> ${result.CI.toFixed(4)}</p>
            <p><strong>Cause probable :</strong> Les jugements ne sont pas assez cohérents. Vérifiez la transitivité de vos comparaisons (ex: si A > B et B > C, alors A devrait être > C).</p>
            <p><strong>Recommandation :</strong> Ajustez les valeurs de la matrice pour améliorer la cohérence.</p>
        </div>
    `;
    
    document.getElementById('resultsSection').classList.remove('hidden');
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
}

function showResults(criteriaWeights, alternativeWeights) {
    // Trouver la meilleure alternative
    let bestIdx = 0;
    for (let i = 1; i < alternativeWeights.length; i++) {
        if (alternativeWeights[i] > alternativeWeights[bestIdx]) bestIdx = i;
    }
    
    let criteriaHtml = '<h3>Poids des critères :</h3><ul>';
    criteria.forEach((c, i) => {
        criteriaHtml += `<li>${c} : ${(criteriaWeights[i] * 100).toFixed(2)}%</li>`;
    });
    criteriaHtml += '</ul>';
    
    let alternativesHtml = '<h3>Score global des alternatives :</h3><ul>';
    alternatives.forEach((a, i) => {
        alternativesHtml += `<li>${a} : ${(alternativeWeights[i] * 100).toFixed(2)}%</li>`;
    });
    alternativesHtml += '</ul>';
    
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        <div class="result-card">
            ${criteriaHtml}
            ${alternativesHtml}
            <div class="best-alternative">
                 Meilleure alternative : <strong>${alternatives[bestIdx]}</strong> avec ${(alternativeWeights[bestIdx] * 100).toFixed(2)}%
            </div>
        </div>
    `;
    
    document.getElementById('resultsSection').classList.remove('hidden');
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
}