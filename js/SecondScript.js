document.getElementById('calculate-button').addEventListener('click', () => {
  const matrix1Input = document.getElementById('matrix1').value.trim();
  const operation = document.getElementById('operation').value;
  const solutionDiv = document.getElementById('solution');
  const codeBlock = document.getElementById('code-block');

  if (!matrix1Input) {
    solutionDiv.innerHTML = "<p>Пожалуйста, введите матрицу.</p>";
    return;
  }

  // Парсим матрицу
  const matrix1 = parseMatrix(matrix1Input);

  if (!matrix1) {
    solutionDiv.innerHTML = "<p>Ошибка в формате ввода матрицы.</p>";
    return;
  }

  let result, steps;
  try {
            switch (operation) {
            case 'rank':
                ({ result, steps } = rankMatrixWithSteps(matrix1));
                codeBlock.textContent = rankMatrixWithSteps;
                break;
            case 'inverse':
                ({ result, steps } = inverseMatrixWithSteps(matrix1));
                codeBlock.textContent = inverseMatrixWithSteps;
                break;
            case 'transpose':
                ({ result, steps } = transposeMatrixWithSteps(matrix1));
                codeBlock.textContent = transposeMatrixWithSteps;
                break;
            case 'determinant':
                ({ result, steps } = determinantWithSteps(matrix1));
                codeBlock.textContent = determinantWithSteps;
                break;
            default:
                throw new Error('Неизвестная операция');
        }

    // Вывод результата и шагов
    solutionDiv.innerHTML = `
            <h2>Результат</h2>
            <p>${formatResult(result)}</p>
            <h3>Шаги решения:</h3>
            <ul>${steps.map(step => `<li>${step}</li>`).join('')}</ul>`;
  } catch (error) {
    solutionDiv.innerHTML = `<p>Ошибка: ${error.message}</p>`;
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

// Форматирование результата
function formatResult(result) {
  if (typeof result === 'number') return result;
  if (Array.isArray(result)) return result.map(row => row.join(' ')).join('<br>');
  return JSON.stringify(result);
}

// Детерминант с шагами
function determinantWithSteps(matrix) {
  const steps = [];
  function det(matrix) {
    if (matrix.length === 1) return matrix[0][0];
    if (matrix.length === 2) {
      return (
        matrix[0][0] * matrix[1][1] -
        matrix[0][1] * matrix[1][0]
      );
    }
    let determinant = 0;
    for (let i = 0; i < matrix[0].length; i++) {
      const subMatrix = matrix.slice(1).map(row =>
                                            row.filter((_, j) => j !== i)
                                           );
      const sign = i % 2 === 0 ? 1 : -1;
      determinant += sign * matrix[0][i] * det(subMatrix);
      steps.push(`Добавляем минор элемента [1, ${i + 1}]: ${determinant}`);
    }
    return determinant;
  }
  const result = det(matrix);
  steps.push(`Определитель матрицы: ${result}`);
  return { result, steps };
}

// Операции с матрицами
function rankMatrixWithSteps(matrix) {
  const steps = [];
  const rref = matrix.map(row => [...row]); // Копируем матрицу
  let rank = 0;

  for (let row = 0; row < rref.length; row++) {
    if (rref[row][row] === 0) {
      for (let i = row + 1; i < rref.length; i++) {
        if (rref[i][row] !== 0) {
          [rref[row], rref[i]] = [rref[i], rref[row]];
          steps.push(`Строка ${row + 1} обменяна со строкой ${i + 1}`);
          break;
        }
      }
    }
    if (rref[row][row] !== 0) {
      for (let i = 0; i < rref.length; i++) {
        if (i !== row) {
          const factor = rref[i][row] / rref[row][row];
          for (let j = row; j < rref[0].length; j++) {
            rref[i][j] -= factor * rref[row][j];
          }
          steps.push(`Обновлена строка ${i + 1}: вычитание строки ${row + 1}`);
        }
      }
      rank++;
    }
  }
  steps.push(`Итоговый ранг: ${rank}`);
  return { result: rank, steps };
}

// Обратная матрица с шагами
function inverseMatrixWithSteps(matrix) {
  const steps = [];
  const n = matrix.length;
  if (!matrix.every(row => row.length === n)) {
    throw new Error('Матрица должна быть квадратной');
  }

  const identity = matrix.map((row, i) =>
                              row.map((_, j) => (i === j ? 1 : 0))
                             );
  const augmented = matrix.map((row, i) => [...row, ...identity[i]]);
  steps.push('Создана расширенная матрица: ' + JSON.stringify(augmented));

  for (let i = 0; i < n; i++) {
    // Находим главный элемент
    let pivot = augmented[i][i];
    if (pivot === 0) {
      // Ищем ненулевой элемент ниже по столбцу и меняем строки
      let rowSwap = i + 1;
      while (rowSwap < n && augmented[rowSwap][i] === 0) {
        rowSwap++;
      }
      if (rowSwap === n) throw new Error('Матрица необратима');
      [augmented[i], augmented[rowSwap]] = [augmented[rowSwap], augmented[i]];
      steps.push(`Обмен строк ${i + 1} и ${rowSwap + 1}`);
      pivot = augmented[i][i];
    }

    // Нормализуем текущую строку
    for (let j = 0; j < augmented[i].length; j++) {
      augmented[i][j] /= pivot;
    }
    steps.push(`Нормализуем строку ${i + 1}: ${JSON.stringify(augmented[i])}`);

    // Обнуляем элементы в текущем столбце, кроме ведущей строки
    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = augmented[k][i];
        for (let j = 0; j < augmented[k].length; j++) {
          augmented[k][j] -= factor * augmented[i][j];
        }
        steps.push(`Обнуляем элемент [${k + 1}, ${i + 1}]`);
      }
    }
  }

  // Извлекаем обратную матрицу
  const inverse = augmented.map(row => row.slice(n));
  steps.push('Обратная матрица: ' + JSON.stringify(inverse));
  return { result: inverse, steps };
}

function transposeMatrixWithSteps(matrix) {
  const steps = [];
  const result = matrix[0].map((_, colIndex) =>
                               matrix.map(row => row[colIndex])
                              );
  steps.push('Транспонирование выполнено');
  return { result, steps };
}

function determinantWithSteps(matrix) {
  const steps = [];
  function det(matrix) {
    if (matrix.length === 1) return matrix[0][0];
    if (matrix.length === 2) {
      return (
        matrix[0][0] * matrix[1][1] -
        matrix[0][1] * matrix[1][0]
      );
    }
    let determinant = 0;
    for (let i = 0; i < matrix[0].length; i++) {
      const subMatrix = matrix.slice(1).map(row =>
                                            row.filter((_, j) => j !== i)
                                           );
      const sign = i % 2 === 0 ? 1 : -1;
      determinant += sign * matrix[0][i] * det(subMatrix);
      steps.push(`Добавляем минор элемента [1, ${i + 1}]: ${determinant}`);
    }
    return determinant;
  }
  const result = det(matrix);
  steps.push(`Определитель матрицы: ${result}`);
  return { result, steps };
}