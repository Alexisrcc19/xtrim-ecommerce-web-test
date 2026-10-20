// One-shot debounce: there is no timer until an event invalidates the view.
export function createLeadUpdates(
  refresh: () => void,
  canRefresh: () => boolean,
) {
  let revision = "";
  let dirty = false;
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  function flush() {
    if (stopped || !dirty || timer !== undefined || !canRefresh()) return;
    timer = setTimeout(() => {
      timer = undefined;
      if (stopped || !canRefresh()) return;
      dirty = false;
      refresh();
    }, 300);
  }
  return {
    changed(next: string) {
      if (!next || next === revision || stopped) return;
      revision = next;
      dirty = true;
      flush();
    },
    flush,
    stop() {
      stopped = true;
      if (timer !== undefined) clearTimeout(timer);
    },
  };
}
