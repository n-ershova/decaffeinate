// App-wide toast: any component calls `toast("Logged")`; <Toaster /> in AppShell shows it.
type Listener = (message: string) => void;
const listeners = new Set<Listener>();

export function toast(message: string): void {
  listeners.forEach((fn) => fn(message));
}

export function onToast(fn: Listener): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}
