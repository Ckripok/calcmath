document.getElementById('solve-system-button').addEventListener('click', () => {
    const coefficientsInput = document.getElementById('coefficients-matrix').value.trim();
    const constantsInput = document.getElementById('constants-column').value.trim();
    const solutionDiv = document.getElementById('system-solution');
  const codeBlock = document.getElementById('code-block');

    if (!coefficientsInput || !constantsInput) {
        solutionDiv.innerHTML = "<p>Пожалуйста, введите матрицу коэффициентов и столбец свободных членов.</p>";
        return;
    } 

    // Парсим матрицы
    const coefficients = parseMatrix(coefficientsInput);
    const constants = parseMatrix(constantsInput);

    if (!coefficients || !constants || coefficients.length !== constants.length) {
        solutionDiv.innerHTML = "<p>Ошибка: размеры матрицы и столбца не совпадают.</p>";
        return;
    }

    try {
        const { result, steps } = solveLinearSystem(coefficients, constants);

        // Вывод результата и шагов
        solutionDiv.innerHTML = `
            <h2>Решение</h2>
            <p>${formatResult(result)}</p>
            <h3>Шаги решения:</h3>
            <ul>${steps.map(step => `<li>${step}</li>`).join('')}</ul>`;
      codeBlock.innerHTML = `<b>// Решение СЛУ методом Гаусса
function solveLinearSystem(coefficients, constants) {
    const steps = [];
    const n = coefficients.length;
    // Создаем расширенную матрицу
    const augmentedMatrix = coefficients.map((row, i) => [...row, constants[i][0]]);
    steps.push('Начальная расширенная матрица: ' + JSON.stringify(augmentedMatrix));
    // Прямой ход
    for (let i = 0; i < n; i++) {
        // Пивотизация<l style="color: #8f2c83;">
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(augmentedMatrix[k][i]) > Math.abs(augmentedMatrix[maxRow][i])) {
                maxRow = k;
            }
        }
        [augmentedMatrix[i], augmentedMatrix[maxRow]] = [augmentedMatrix[maxRow], augmentedMatrix[i]];
        steps.push("Обмен строк $(i + 1) и $(maxRow + 1) " + JSON.stringify(augmentedMatrix));\
        </l>
        // Нормализация строки <l style="color: #bf7419">
        const pivot = augmentedMatrix[i][i];
        if (pivot === 0) {
            throw new Error('Система не имеет уникального решения.');
        }
        for (let j = i; j <= n; j++) {
            augmentedMatrix[i][j] /= pivot;
        }
        steps.push("Нормализация строки $(i + 1): " + JSON.stringify(augmentedMatrix));</l>
        // Обнуление ниже текущей строки <l style="color: #338c91;">
        for (let k = i + 1; k < n; k++) {
            const factor = augmentedMatrix[k][i];
            for (let j = i; j <= n; j++) {
                augmentedMatrix[k][j] -= factor * augmentedMatrix[i][j];
            }
            steps.push("Обнуление элемента [$(k + 1), $(i + 1)]: " + JSON.stringify(augmentedMatrix));
        }</l>
    }
    // Обратный ход <l style="color: #398f2c">
    const solution = Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
        solution[i] = augmentedMatrix[i][n];
        for (let j = i + 1; j < n; j++) {
            solution[i] -= augmentedMatrix[i][j] * solution[j];
        }
        steps.push("Вычисление x[$(i + 1)] = $(solution[i])");
    }</l>
    return { result: solution, steps };
}</b>`;
    } catch (error) {
        solutionDiv.innerHTML = "<p>Ошибка: ${error.message}</p>";
    }
});

// Парсер для матриц
function parseMatrix(input) {
    try {
        return input
            .split('\n') // Разделяем строки
            .map(row => 
                row.trim().split(/\s+/).map(num => {
                    if (isNaN(num)) {
                        throw new Error(`Элемент "${num}" не является числом.`);
                    }
                    return parseFloat(num);
                })
            );
    } catch (error) {
        console.error("Ошибка при парсинге матрицы:", error);
        return null;
    }
}

// Форматирование результата
function formatResult(result) {
    if (typeof result === 'number') return result.toString();
    if (Array.isArray(result)) {
        return result
            .map(row => Array.isArray(row) ? row.join(' ') : row.toString())
            .join('<br>');
    }
    return JSON.stringify(result);
}

// Решение СЛУ методом Гаусса
function solveLinearSystem(coefficients, constants) {
    const steps = [];
    const n = coefficients.length;

    // Создаем расширенную матрицу
    const augmentedMatrix = coefficients.map((row, i) => [...row, constants[i][0]]);
    steps.push(`Начальная расширенная матрица: <pre>${formatMatrix(augmentedMatrix)}</pre>`);
    // Прямой ход
    for (let i = 0; i < n; i++) {
        // Пивотизация
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(augmentedMatrix[k][i]) > Math.abs(augmentedMatrix[maxRow][i])) {
                maxRow = k;
            }
        }
        [augmentedMatrix[i], augmentedMatrix[maxRow]] = [augmentedMatrix[maxRow], augmentedMatrix[i]];
        steps.push(`<spаn style=" font-family: arial; font-size: 20px; color: #8f2c83;"> 	&#9658;</spаn> Обмен строк ${i + 1} и ${maxRow + 1}: <pre>${formatMatrix(augmentedMatrix)}</pre>`);

        // Нормализация строки
        const pivot = augmentedMatrix[i][i];
        if (pivot === 0) {
            throw new Error('<spаn style=" font-family: arial; font-size: 20px; color: red ;"> 	&#9658;</spаn> Система не имеет уникального решения.');
        }
        for (let j = i; j <= n; j++) {
            augmentedMatrix[i][j] /= pivot;
        }
        steps.push(`<spаn style=" font-family: arial; font-size: 20px; color: #bf7419"> 	&#9658;</spаn> Нормализация строки ${i + 1}: <pre>${formatMatrix(augmentedMatrix)}</pre>`);
        // Обнуление ниже текущей строки
        for (let k = i + 1; k < n; k++) {
            const factor = augmentedMatrix[k][i];
            for (let j = i; j <= n; j++) {
                augmentedMatrix[k][j] -= factor * augmentedMatrix[i][j];
            }
            steps.push(`<span style="font-family: arial; font-size: 20px; color: #338c91;">&#9658;</span> Обнуление элемента [${k + 1}, ${i + 1}]: <pre>${formatMatrix(augmentedMatrix)}</pre>`);

        }
    }
  
function formatMatrix(matrix) {
    return matrix.map(row => row.map(val => val.toFixed(4)).join('\t')).join('\n');
}
  
    // Обратный ход
    const solution = Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
        solution[i] = augmentedMatrix[i][n];
        for (let j = i + 1; j < n; j++) {
            solution[i] -= augmentedMatrix[i][j] * solution[j];
        }
        steps.push(`<spаn style=" font-family: arial; font-size: 20px; color: #398f2c;"> 	&#9658;</spаn> Вычисление x[${i + 1}] = ${solution[i].toFixed(3)}`);
    }

    return { result: solution, steps };
}
