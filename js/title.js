document.getElementById('calculate-button').addEventListener('click', () => {
    const matrixInput = document.getElementById('matrix').value.trim();
    const solutionDiv = document.getElementById('solution');
    const codeBlock = document.getElementById('code-block');

    if (!matrixInput) {
        solutionDiv.innerHTML = "<p>Пожалуйста, введите матрицу.</p>";
        return;
    }

    // Тут логика обработки матрицы
    // Например, считаем определитель:
    const matrix = matrixInput.split('\n').map(row => row.split(' ').map(Number));
    const determinant = calculateDeterminant(matrix);

    solutionDiv.innerHTML = `<h2>Результат</h2><p>Определитель: ${determinant}</p>`;
    codeBlock.textContent = `function calculateDeterminant(matrix) {
  // ...твой код
}`;
});

// Пример функции для вычисления определителя
function calculateDeterminant(matrix) {
    if (matrix.length !== matrix[0].length) return 'Матрица должна быть квадратной';
    // Пример простой реализации...
    return 'Детали решения зависят от твоего кода.';
}
