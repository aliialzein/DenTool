'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { adminApi } from '@/lib/api/admin';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function AdminLoginPage() {
	const router = useRouter();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	async function submit(event: React.FormEvent) {
		event.preventDefault();
		if (!/^\S+@\S+\.\S+$/.test(email) || !password) {
			setError('Enter a valid email address and password.');
			return;
		}

		setLoading(true);
		setError('');
		try {
			const user = await adminApi.login(email, password);
			if (user.role !== 'ADMIN') throw new Error('Administrator access is required.');
			router.replace('/admin');
		} catch {
			setError('Invalid email or password. Check your details and try again.');
		} finally {
			setLoading(false);
		}
	}

	return (
		<main className="grid min-h-screen place-items-center bg-slate-50 p-5">
			<form onSubmit={submit} className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
				<h1 className="text-2xl font-bold text-slate-950">
					Den<span className="text-blue-600">Tool</span> Admin
				</h1>
				<p className="mt-2 text-sm text-slate-500">Sign in to manage your catalog.</p>
				{error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
				<div className="mt-5 space-y-4">
					<Input label="Email" value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" />
					<Input label="Password" value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" />
				</div>
				<Button type="submit" disabled={loading} className="mt-6 w-full">
					{loading ? 'Signing in…' : 'Sign in'}
				</Button>
			</form>
		</main>
	);
}
