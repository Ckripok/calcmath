document.getElementById('solve-svd-button').addEventListener('click', () => {
  const coefficientsInput = document.getElementById('coefficients-matrix-svd').value.trim();
  const constantsInput = document.getElementById('constants-column-svd').value.trim();
  const solutionDiv = document.getElementById('system-solution-svd');
  const codeBlock = document.getElementById('code-block-svd');

  if (!coefficientsInput || !constantsInput) {
    solutionDiv.innerHTML = "<p>Пожалуйста, введите матрицу коэффициентов и столбец свободных членов.</p>";
    return;
  }

  const coefficients = parseMatrix(coefficientsInput);
  const constants = parseMatrix(constantsInput);

  if (!coefficients || !constants || coefficients.length !== constants.length) {
    solutionDiv.innerHTML = "<p>Ошибка: размеры матрицы и столбца не совпадают.</p>";
    return;
  }

  try {
    const { result, steps } = solveSystemWithSVD(coefficients, constants);

    solutionDiv.innerHTML = `
            <h2>Решение</h2>
            <p>${formatResult(result)}</p>
            <h3>Шаги решения:</h3>
            <ul>${steps.map(step => `<li>${step}</li>`).join('')}</ul>`;

    codeBlock.innerHTML = solveSystemWithSVD;
  } catch (error) {
    solutionDiv.innerHTML = `<p>Ошибка: ${error.message}</p>`;
  }
});

function parseMatrix(input) {
  try {
    return input.split('\n').map(row => row.trim().split(/\s+/).map(num => parseFloat(num)));
  } catch (error) {
    return null;
  }
}

function formatResult(result) {
  if (typeof result === 'number') return result.toString();
  if (Array.isArray(result)) {
    return result.map(val => val.toFixed(4)).join(', ');
  }
  return JSON.stringify(result);
}

function solveSystemWithSVD(coefficients, constants) {
  const steps = [];

  const A = numeric.clone(coefficients);
  const b = numeric.clone(constants).flat();

  steps.push(`<b>Исходная матрица A:</b> <pre>${formatMatrix(A)}</pre>`);
  steps.push(`<b>Вектор правых частей b:</b> <pre>${formatMatrix([b])}</pre>`);

  // Сингулярное разложение
  const svd = numeric.svd(A);
  const U = svd.U;
  const S = svd.S;
  const VT = svd.V;

  steps.push(`<h2>SVD разложение:</h2>`);
  steps.push(`<b>U (левая ортогональная матрица):</b> <pre>${formatMatrix(U)}</pre>`);
  steps.push(`<b>S (сингулярные значения):</b> ${S.join(', ')}`);
  steps.push(`<b>V^T (правая ортогональная матрица):</b> <pre>${formatMatrix(VT)}</pre>`);

  // Построение псевдообратной матрицы
  const S_inv = numeric.diag(S.map(s => (s > 1e-10 ? 1 / s : 0)));
  const pseudoInverse = numeric.dotMMbig(VT, numeric.dotMMbig(S_inv, numeric.transpose(U)));

  steps.push(`<b>Псевдообратная матрица A+:</b> <pre>${formatMatrix(pseudoInverse)}</pre>`);

  // Решение
  const x = numeric.dot(pseudoInverse, b);
  steps.push(`<b>Решение системы x:</b> ${x.map(val => val.toFixed(4)).join(', ')}`);

  return { result: x, steps };
}

function formatMatrix(matrix) {
  return matrix.map(row => row.map(val => val.toFixed(4)).join('\t')).join('\n');
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
