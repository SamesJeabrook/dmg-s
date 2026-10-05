export function bindKeyboardControls(state, onRender, onAction, options = {}) {
  const isBusy = options.isBusy ?? (() => false);
  const isEnabled = options.isEnabled ?? (() => true);

  const handleKeydown = (event) => {
    const isNavigationKey = event.key === 'ArrowDown' || event.key === 'ArrowUp';
    const isConfirmationKey = event.key === 'Enter'
      || event.key === 'Delete'
      || event.key === 'Backspace';

    if ((isNavigationKey || isConfirmationKey) && !isEnabled()) {
      event.preventDefault();
      return;
    }

    if (event.key === 'ArrowDown') {
      state.move(1);
      onRender();
      event.preventDefault();
      return;
    }

    if (event.key === 'ArrowUp') {
      state.move(-1);
      onRender();
      event.preventDefault();
      return;
    }

    if (event.key === 'Enter') {
      if (isBusy()) {
        event.preventDefault();
        return;
      }

      const result = state.enter();
      onAction?.(result);
      onRender();
      event.preventDefault();
      return;
    }

    if (event.key === 'Delete' || event.key === 'Backspace') {
      if (isBusy()) {
        event.preventDefault();
        return;
      }

      const result = state.goBack();
      if (result) {
        onAction?.({ type: 'back' });
        onRender();
      }
      event.preventDefault();
    }
  };

  window.addEventListener('keydown', handleKeydown);

  return () => {
    window.removeEventListener('keydown', handleKeydown);
  };
}
