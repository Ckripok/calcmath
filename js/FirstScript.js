document.getElementById('calculate-button').addEventListener('click', () => {
    const matrix1Input = document.getElementById('matrix1').value.trim();
    const matrix2Input = document.getElementById('matrix2').value.trim();
    const operation = document.getElementById('operation').value;
    const solutionDiv = document.getElementById('solution');
    const codeBlock = document.getElementById('code-block');

    if (!matrix1Input || !matrix2Input) {
        solutionDiv.innerHTML = "<p>Пожалуйста, введите обе матрицы.</p>";
        return;
    }

    // Парсим матрицы
    const matrix1 = parseMatrix(matrix1Input);
    const matrix2 = parseMatrix(matrix2Input);

    if (!matrix1 || !matrix2) {
        solutionDiv.innerHTML = '<p style="color: red">Ошибка в формате ввода матриц.</p>';
        return;
    }

    let result, steps;
    try {
        switch (operation) {
            case 'add':
                ({ result, steps } = addMatricesWithSteps(matrix1, matrix2));
                codeBlock.textContent = addMatricesWithSteps;
                break;
            case 'subtract':
                ({ result, steps } = subtractMatricesWithSteps(matrix1, matrix2));
                codeBlock.textContent = subtractMatricesWithSteps;
                break;
            case 'multiply':
                ({ result, steps } = multiplyMatricesWithSteps(matrix1, matrix2));
                codeBlock.textContent = multiplyMatricesWithSteps;
                break;
            default:
                throw new Error('Неизвестная операция');
        }

        // Вывод результата и шагов
        solutionDiv.innerHTML = `
            <h2>Результат</h2>
            <p>${formatMatrix(result)}</p>
            <h3>Шаги решения:</h3>
            <ul>${steps.map(step => `<li>${step}</li>`).join('')}</ul>`;
    } catch (error) {
        solutionDiv.innerHTML = `<p style= "color: red">Ошибка: ${error.message}</p>`;
    }
});

// Парсер для матрицы
function parseMatrix(input) {
    try {
        return input.split('\n').map(row => row.trim().split(/\s+/).map(Number));
    } catch {
        return null;
    }
}

// Форматирование матрицы
function formatMatrix(matrix) {
    return matrix.map(row => row.join(' ')).join('<br>');
}

// Сложение матриц с шагами
function addMatricesWithSteps(matrix1, matrix2) {
    if (matrix1.length !== matrix2.length || matrix1[0].length !== matrix2[0].length) {
        throw new Error('Размеры матриц не совпадают');
    }
    const steps = [];
    const result = matrix1.map((row, i) => 
        row.map((value, j) => {
            const sum = value + matrix2[i][j];
            steps.push(`Элемент [${i+1}, ${j+1}]: ${value} + ${matrix2[i][j]} = ${sum}`);
            return sum;
        })
    );
    return { result, steps };
}

// Вычитание матриц с шагами
function subtractMatricesWithSteps(matrix1, matrix2) {
    if (matrix1.length !== matrix2.length || matrix1[0].length !== matrix2[0].length) {
        throw new Error('Размеры матриц не совпадают');
    }
    const steps = [];
    const result = matrix1.map((row, i) => 
        row.map((value, j) => {
            const diff = value - matrix2[i][j];
            steps.push(`Элемент [${i+1}, ${j+1}]: ${value} - ${matrix2[i][j]} = ${diff}`);
            return diff;
        })
    );
    return { result, steps };
}

// Умножение матриц с шагами
function multiplyMatricesWithSteps(matrix1, matrix2) {
    const rowsA = matrix1.length, colsA = matrix1[0].length,
          rowsB = matrix2.length, colsB = matrix2[0].length;

    if (colsA !== rowsB) {
        throw new Error('Матрицы нельзя перемножить');
    }

    const steps = [];
    const result = Array.from({ length: rowsA }, () => Array(colsB).fill(0));
    for (let i = 0; i < rowsA; i++) {
        for (let j = 0; j < colsB; j++) {
            let sum = 0;
            for (let k = 0; k < colsA; k++) {
                steps.push(`[Элемент ${i+1}, ${j+1}]: ${matrix1[i][k]} * ${matrix2[k][j]} = ${matrix1[i][k] * matrix2[k][j]}`);
                sum += matrix1[i][k] * matrix2[k][j];
            }
            result[i][j] = sum;
        }
    }
    return { result, steps };
}
