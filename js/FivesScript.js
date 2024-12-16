document.getElementById('solve-system-button').addEventListener('click', () => {
  const coefficientsInput = document.getElementById('coefficients-matrix').value.trim();
  const constantsInput = document.getElementById('constants-column').value.trim();
  const method = document.getElementById('method').value;
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
    solutionDiv.innerHTML = "<p>Ошибка: размеры матрицы и столбца не совпадают или матрица некорректна.</p>";
    return;
  }

  try {
    let result, steps;

    if (method === 'monteCarlo') {
      const { solution, error, trace } = monteCarloSolve(coefficients, constants);
      result = solution;
      steps = trace;
    } else if (method === 'orthogonalization') {
      const { solution, trace } = gramSchmidt(coefficients, constants);
      result = solution;
      steps = trace;
    } else {
      throw new Error("Неизвестный метод решения");
    }

    // Вывод результата и шагов
    solutionDiv.innerHTML = `
      <h2>Решение</h2>
      <p>${formatResult(result)}</p>
      <h3>Шаги решения:</h3>
      <ul>${steps.map(step => `<li>${step}</li>`).join('')}</ul>`;

    codeBlock.innerHTML = formatCode(method);
  } catch (error) {
    solutionDiv.innerHTML = `<p>Ошибка: ${error.message}</p>`;
  }
});

// Генерация шагов для метода Монте-Карло
function monteCarloSolve(coefficients, constants, iterations = 1000) {
  const n = coefficients.length;
  let solution = Array(n).fill(0);
  let bestSolution = Array(n).fill(0);
  let bestError = Infinity;
  let trace = [];  // для хранения шагов

  for (let iter = 0; iter < iterations; iter++) {
    solution = Array(n).fill(0).map(() => Math.random() * 10);
    trace.push(`Шаг ${iter + 1}: Начальное приближение = [${solution.join(', ')}]`);

    // Вычисление нового решения
    for (let i = 0; i < n; i++) {
      let sum = constants[i][0];
      for (let j = 0; j < n; j++) {
        if (i !== j) sum -= coefficients[i][j] * solution[j];
      }
      solution[i] = sum / coefficients[i][i];
    }

    trace.push(`Шаг ${iter + 1}: Обновленное решение = [${solution.join(', ')}]`);

    // Вычисление ошибки
    let error = calculateError(coefficients, constants, solution);
    trace.push(`Шаг ${iter + 1}: Ошибка = ${error.toFixed(3)}`);

    if (error < bestError) {
      bestError = error;
      bestSolution = [...solution];
      trace.push(`Шаг ${iter + 1}: Новое лучшее решение = [${bestSolution.join(', ')}], ошибка = ${bestError.toFixed(3)}`);
    }
  }

  return { solution: bestSolution, error: bestError, trace };
}

// Функция для проверки числовых ошибок и корректировки решений
function normalizeSolution(solution, tolerance = 1e-10) {
  return solution.map(value => Math.abs(value) < tolerance ? 0 : value);
}


// Генерация шагов для метода Грамма-Шмидта
function gramSchmidt(coefficients, constants) {
  const n = coefficients.length;
  let A = coefficients.map(row => [...row]);
  let b = [...constants];
  let trace = [];

  trace.push("Начальная матрица коэффициентов:");
  trace.push(formatMatrix(A));

  for (let k = 0; k < n; k++) {
    // Шаг 1: Ортогонализация
    for (let i = 0; i < k; i++) {
      let factor = dotProduct(A[i], A[k]) / dotProduct(A[i], A[i]);
      for (let j = 0; j < n; j++) {
        A[k][j] -= factor * A[i][j];
      }
      // Коррекция правой части
      b[k] -= factor * b[i];
    }

    // Шаг 2: Нормализация
    let norm = Math.sqrt(dotProduct(A[k], A[k]));
    if (Math.abs(norm) < 1e-10) {
      throw new Error(`Невозможно нормализовать вектор ${k + 1}, слишком малая длина`);
    }
    for (let j = 0; j < n; j++) {
      A[k][j] /= norm;
    }
    b[k] /= norm;

    trace.push(`Шаг ${k + 1}: Ортогонализированный и нормализованный вектор ${k + 1}: <pre>${formatMatrix(A)}</pre>`);
  }

  // Решаем систему методом Гаусса
  const solution = gaussianElimination(A, b, trace);
  return { solution: normalizeSolution(solution), trace }; // Применяем нормализацию
}

// Гауссово исключение с шагами
function gaussianElimination(A, b, trace) {
  const n = A.length;
  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) {
        maxRow = k;
      }
    }
    [A[i], A[maxRow]] = [A[maxRow], A[i]];
    [b[i], b[maxRow]] = [b[maxRow], b[i]];

    trace.push(`Шаг ${i + 1}: Обмен строк ${i + 1} и ${maxRow + 1}: <pre>${formatMatrix(A)}</pre>`);

    let pivot = A[i][i];
    if (Math.abs(pivot) < 1e-10) {
      // Обработка случая, когда элемент слишком мал для деления
      throw new Error(`Малый элемент на диагонали (пивот) в строке ${i + 1}`);
    }

    for (let j = i; j < n; j++) {
      A[i][j] /= pivot;
    }
    b[i] /= pivot;

    trace.push(`Шаг ${i + 1}: Нормализация строки ${i + 1}: <pre>${formatMatrix(A)}</pre>`);

    for (let k = i + 1; k < n; k++) {
      let factor = A[k][i];
      for (let j = i; j < n; j++) {
        A[k][j] -= factor * A[i][j];
      }
      b[k] -= factor * b[i];
    }

    trace.push(`Шаг ${i + 1}: Обнуление элемента [${i + 1}, ${i + 1}]: <pre>${formatMatrix(A)}</pre>`);
  }

  let solution = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    solution[i] = b[i];
    for (let j = i + 1; j < n; j++) {
      solution[i] -= A[i][j] * solution[j];
    }
  }

  trace.push(`Финальное решение: [${solution.join(', ')}]`);
  return normalizeSolution(solution); // Применяем нормализацию
}

function dotProduct(v1, v2) {
  return v1.reduce((sum, val, idx) => sum + val * v2[idx], 0);
}

function formatMatrix(matrix) {
  return matrix.map(row => row.map(val => val.toFixed(4)).join('\t')).join('\n');
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

// Форматирование кода для отображения
function formatCode(method) {
  if (method === 'monteCarlo') {
    return monteCarloSolve;
  } else {
    return gramSchmidt;
  }
  // Пример для другого метода
}

function parseMatrix(input) {
  try {
    const matrix = input
    .split('\n')
    .map(row => row.trim().split(/\s+/).map(num => {
      const parsed = parseFloat(num);
      if (isNaN(parsed)) throw new Error("Некорректный ввод");
      return parsed;
    }));

    // Проверка, чтобы все строки имели одинаковую длину
    const rowLength = matrix[0].length;
    if (!matrix.every(row => row.length === rowLength)) {
      throw new Error("Строки матрицы должны быть одинаковой длины");
    }

    return matrix;
  } catch (error) {
    console.error("Ошибка парсинга матрицы:", error.message);
    return null;
  }
}


function calculateError(coefficients, constants, solution) {
  let error = 0;
  for (let i = 0; i < coefficients.length; i++) {
    let sum = 0;
    for (let j = 0; j < coefficients[i].length; j++) {
      sum += coefficients[i][j] * solution[j];
    }
    error += Math.abs(sum - constants[i][0]);
  }
  return error;
}

// Открытие и закрытие модального окна
document.addEventListener('DOMContentLoaded', () => {
  const hiddenButton = document.getElementById('hidden-button');
  const modal = document.getElementById('modal');
  const closeModalButton = document.getElementById('close-modal');

  hiddenButton.addEventListener('click', () => {
    modal.classList.add('show');
  });

  closeModalButton.addEventListener('click', () => {
    modal.classList.remove('show');
  });

  // Закрытие модального окна по клику вне его
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('show');
    }
  });
});


