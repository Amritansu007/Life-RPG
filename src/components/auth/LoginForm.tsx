import { useState, type FormEvent } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  onSwitchToSignup: () => void;
}

export function LoginForm({ onSubmit, onSwitchToSignup }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');

    if (!email.trim()) {
      setError('Your identity scroll requires an email.');
      return;
    }
    if (!password) {
      setError('A passphrase is required to enter the realm.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(email, password);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'The realm rejected your entry. Try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="adventurer@realm.io"
        autoComplete="email"
        disabled={loading}
        required
      />
      <Input
        label="Passphrase"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="••••••••"
        autoComplete="current-password"
        disabled={loading}
        required
      />

      {error && (
        <p className="text-sm text-crimson font-body" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" loading={loading} disabled={loading} className="w-full">
        {loading ? 'Entering Realm...' : 'Enter the Realm'}
      </Button>

      <p className="text-center text-sm text-bone/60 font-body">
        No scroll yet?{' '}
        <button
          type="button"
          onClick={onSwitchToSignup}
          disabled={loading}
          className="text-gold hover:text-gold-bright underline underline-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
        >
          Inscribe your name
        </button>
      </p>
    </form>
  );
}
