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
