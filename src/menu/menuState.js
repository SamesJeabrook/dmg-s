export function getNodeAtPath(root, path = []) {
  let current = root;

  for (const segment of path) {
    const nextNode = current?.children?.find((child) => child.id === segment);
    if (!nextNode) {
      return root;
    }
    current = nextNode;
  }

  return current ?? root;
}

export function createMenuState(config) {
  const state = {
    path: [],
    activeIndex: 0,
  };

  return {
    state,
    getCurrentNode() {
      return getNodeAtPath(config, state.path);
    },
    getVisibleItems() {
      const current = this.getCurrentNode();
      return current?.children ?? [];
    },
    move(delta) {
      const items = this.getVisibleItems();
      if (!items.length) {
        return;
      }

      state.activeIndex = (state.activeIndex + delta + items.length) % items.length;
    },
    goBack() {
      if (!state.path.length) {
        return false;
      }

      state.path.pop();
      state.activeIndex = 0;
      return true;
    },
    enter() {
      const items = this.getVisibleItems();
      const currentItem = items[state.activeIndex];
      if (!currentItem) {
        return null;
      }

      if (currentItem.isBackOption || currentItem.type === 'back') {
        this.goBack();
        return { type: 'back', node: currentItem };
      }

      if (currentItem.children && currentItem.children.length) {
        state.path.push(currentItem.id);
        state.activeIndex = 0;
        return { type: 'open', node: currentItem };
      }

      return { type: 'action', node: currentItem };
    },
    getPathLabel() {
      return state.path.length ? state.path.join(' / ') : 'root';
    },
    reset() {
      state.path = [];
      state.activeIndex = 0;
    },
  };
}
