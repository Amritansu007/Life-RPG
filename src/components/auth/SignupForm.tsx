import { useState, type FormEvent } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface SignupFormProps {
  onSubmit: (email: string, password: string, username: string) => Promise<void>;
  onSwitchToLogin: () => void;
}

export function SignupForm({ onSubmit, onSwitchToLogin }: SignupFormProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');

    if (!username.trim()) {
      setError('Every hero needs a name.');
      return;
    }
    if (username.trim().length < 2) {
      setError('Your name must be at least 2 characters — even legends have proper names.');
      return;
    }
    if (!email.trim()) {
      setError('An email is needed to bind your identity scroll.');
      return;
    }
    if (!password) {
      setError('A passphrase is required to protect your realm access.');
      return;
    }
    if (password.length < 6) {
      setError('Your passphrase must be at least 6 characters. Fortify your defenses.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(email, password, username);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'The inscription failed. Try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <Input
        label="Hero Name"
        type="text"
        value={username}
        onChange={e => setUsername(e.target.value)}
        placeholder="Aethon the Bold"
        autoComplete="username"
        disabled={loading}
        required
      />
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
        autoComplete="new-password"
        disabled={loading}
        required
      />

      {error && (
        <p className="text-sm text-crimson font-body" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" loading={loading} disabled={loading} className="w-full">
        {loading ? 'Inscribing Scroll...' : 'Begin Your Journey'}
      </Button>

      <p className="text-center text-sm text-bone/60 font-body">
        Already inscribed?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          disabled={loading}
          className="text-gold hover:text-gold-bright underline underline-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
        >
          Return to the gates
        </button>
      </p>
    </form>
  );
}
