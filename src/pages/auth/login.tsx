import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/lib/auth'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icons } from '@/components/ui/icons'
import { LanguageSwitcher } from '@/components/ui/language-switcher'

export function LoginPage() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await login({ email, password })
      toast.success(t('auth.welcome'))
      navigate({ to: '/dashboard' })
    } catch (error) {
      console.error('Login error:', error)
      toast.error(t('auth.errors.invalidCredentials'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle()
      toast.success(t('auth.welcome'))
      navigate({ to: '/dashboard' })
    } catch (error) {
      console.error('Google login error:', error)
      toast.error(t('auth.errors.googleLoginFailed'))
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side - Hero section */}
      <div className="relative hidden lg:flex flex-col bg-gradient-to-br from-neptunic-blue via-neptunic-blue to-neptunic-dark p-12">
        <div className="relative z-20 flex items-center justify-between text-lg font-medium text-white">
          <div className="flex items-center">
            <Icons.logo className="mr-2 h-8 w-8 text-neptunic-light-green" />
            <span className="text-2xl">{t('app.title')}</span>
          </div>
          <LanguageSwitcher />
        </div>
        
        {/* Decorative background pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(116,233,212,0.15)_25%,transparent_25%,transparent_50%,rgba(116,233,212,0.15)_50%,rgba(116,233,212,0.15)_75%,transparent_75%,transparent)] bg-[length:64px_64px]">
          <div className="absolute inset-0 bg-gradient-to-t from-neptunic-dark/50 via-transparent to-transparent"></div>
        </div>
        
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-xl font-medium leading-relaxed text-white drop-shadow-md">
              {t('auth.hero.tagline')}
            </p>
            <footer className="mt-4 text-neptunic-light-green font-medium">
              {t('auth.hero.team')}
            </footer>
          </blockquote>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex items-center justify-center p-8 bg-gradient-to-b from-gray-900 to-gray-950">
        <div className="mx-auto w-full max-w-md space-y-8 bg-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/20">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              {t('auth.title')}
            </h1>
            <p className="text-sm text-gray-400">
              {t('auth.subtitle')}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-300">
                  {t('auth.form.email')}
                </Label>
                <Input
                  id="email"
                  placeholder={t('auth.form.emailPlaceholder')}
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-neptunic-light-green focus:ring-2 focus:ring-neptunic-light-green/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-300">
                  {t('auth.form.password')}
                </Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-neptunic-light-green focus:ring-2 focus:ring-neptunic-light-green/20"
                />
              </div>
            </div>

            <Button 
              disabled={isLoading}
              type="submit"
              className="w-full h-11 bg-neptunic-light-green hover:bg-neptunic-light-green/90 text-gray-900 font-medium"
            >
              {isLoading ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {t('auth.form.signIn')}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-transparent px-2 text-gray-400">
                {t('auth.form.orContinueWith')}
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            type="button"
            disabled={isLoading}
            onClick={handleGoogleLogin}
            className="w-full h-11 bg-white/10 border-white/20 text-white hover:bg-neptunic-light-green/20 hover:border-neptunic-light-green/50"
          >
            {isLoading ? (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icons.google className="mr-2 h-4 w-4" />
            )}
            {t('auth.form.google')}
          </Button>

          <p className="text-center text-sm text-gray-400">
            {t('auth.terms.agreement')}{" "}
            <a href="/terms" className="text-neptunic-light-green hover:text-neptunic-light-green/80 underline underline-offset-4">
              {t('auth.terms.termsOfService')}
            </a>{" "}
            {t('auth.terms.and')}{" "}
            <a href="/privacy" className="text-neptunic-light-green hover:text-neptunic-light-green/80 underline underline-offset-4">
              {t('auth.terms.privacyPolicy')}
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}