import { useState, type FormEvent } from 'react';
import { login } from '@/firebase/auth';

const ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'Email o contraseña incorrectos.',
  'auth/wrong-password': 'Email o contraseña incorrectos.',
  'auth/user-not-found': 'Email o contraseña incorrectos.',
  'auth/invalid-email': 'Ese email no es válido.',
  'auth/user-disabled': 'Esta cuenta fue deshabilitada.',
  'auth/too-many-requests': 'Demasiados intentos fallidos. Esperá unos minutos e intentá de nuevo.',
  'auth/network-request-failed': 'Error de conexión. Revisá tu internet e intentá de nuevo.',
  'auth/unauthorized-domain': 'Este dominio no está autorizado en Firebase todavía.',
};

function describeAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code;
  if (code && ERROR_MESSAGES[code]) return ERROR_MESSAGES[code];
  return code ? `Error al iniciar sesión (${code}).` : 'Error al iniciar sesión.';
}

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(describeAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-border bg-panel p-8 text-center shadow-xl shadow-black/40"
      >
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gold-bg text-2xl">
          <span aria-hidden>⚙️</span>
        </div>
        <h1 className="font-heading text-2xl font-bold text-gold">RULO Admin</h1>
        <p className="mt-1 mb-6 text-sm text-muted">Ingresá con tu cuenta</p>

        <div className="flex flex-col gap-3 text-left">
          <input
            type="email"
            required
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-base text-text outline-none focus:border-gold"
          />
          <input
            type="password"
            required
            autoComplete="current-password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-base text-text outline-none focus:border-gold"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full rounded-xl bg-gold py-3 font-heading font-semibold text-bg transition hover:bg-gold-light disabled:opacity-60"
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>

        {error && <p className="mt-3 text-sm text-danger">{error}</p>}
      </form>
    </div>
  );
}
