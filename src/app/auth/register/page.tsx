'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { UserPlus, Eye, EyeOff, Cpu, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const registerSchema = z
  .object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
      .regex(/[0-9]/, 'Debe contener al menos un número'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password', '');
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasMinLength = password.length >= 8;

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'Error al crear la cuenta');
        return;
      }

      router.push('/auth/login?registered=true');
    } catch {
      setError('Ocurrió un error. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-void-950 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('/patterns/grid-cyber.svg')] opacity-5" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-plasma-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/3 -left-32 w-96 h-96 bg-cyber-500/10 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyber-400 to-plasma-500 flex items-center justify-center">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <span className="font-display text-2xl font-bold text-ink-100">
            Hyper<span className="text-cyber-400">-Logic</span>
          </span>
        </Link>

        {/* Card */}
        <div className="bg-white shadow-card-hover border border-void-700 rounded-2xl p-8">
          <div className="text-center mb-6">
            <h1 className="font-display text-2xl font-bold text-ink-100 mb-2">
              Crear Cuenta
            </h1>
            <p className="text-ink-400 text-sm">
              Únete a la comunidad Hyper-Logic
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 p-3 rounded-lg bg-danger-500/10 border border-danger-500/20 mb-6"
            >
              <AlertTriangle className="w-4 h-4 text-danger-400 shrink-0" />
              <p className="text-sm text-danger-300">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink-300 mb-1.5">
                Nombre completo
              </label>
              <Input
                type="text"
                placeholder="Juan Pérez"
                {...register('name')}
                error={errors.name?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-300 mb-1.5">
                Email
              </label>
              <Input
                type="email"
                placeholder="tu@email.com"
                {...register('email')}
                error={errors.email?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-300 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                  error={errors.password?.message}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {/* Password strength indicators */}
              {password && (
                <div className="mt-2 space-y-1">
                  <PasswordRule met={hasMinLength} text="Mínimo 8 caracteres" />
                  <PasswordRule met={hasUppercase} text="Al menos una mayúscula" />
                  <PasswordRule met={hasNumber} text="Al menos un número" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-300 mb-1.5">
                Confirmar contraseña
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                {...register('confirmPassword')}
                error={errors.confirmPassword?.message}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creando cuenta...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Crear Cuenta
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-ink-400 text-sm">
              ¿Ya tienes cuenta?{' '}
              <Link
                href="/auth/login"
                className="text-cyber-400 hover:text-cyber-300 font-medium transition-colors"
              >
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-ink-600 text-xs font-mono">
            {"// USER_REG v2.0 — AES-256 encrypted"}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function PasswordRule({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <CheckCircle
        className={`w-3 h-3 ${met ? 'text-volt-400' : 'text-ink-600'}`}
      />
      <span
        className={`text-xs ${met ? 'text-volt-400' : 'text-ink-500'}`}
      >
        {text}
      </span>
    </div>
  );
}
