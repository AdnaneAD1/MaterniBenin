"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Eye, EyeOff, Baby } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Button  from '@/components/ui/Button';
import { useAuth } from '@/hooks/auth';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fullText = "Bienvenue dans l'espace professionnel des sage-femmes";
  
  const { login, loading, error, currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < fullText.length) {
        setTypedText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 80);

    return () => clearInterval(timer);
  }, []);

  // Rediriger si l'utilisateur est déjà connecté
  useEffect(() => {
    if (currentUser) {
      router.push('/dashboard');
    }
  }, [currentUser, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      console.error('Erreur de connexion:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black relative p-4 lg:p-8">
      
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("https://thumbs.dreamstime.com/b/infirmi%C3%A8re-comprim%C3%A9-m%C3%A9dical-et-femme-noire-%C3%A0-l-h%C3%B4pital-travaillant-tard-dans-la-recherche-en-t%C3%A9l%C3%A9sant%C3%A9-ou-consultation-267731904.jpg")`,
        }}></div>
      </div>
      
      {/* Login Card */}
      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden min-h-[600px] lg:min-h-[700px]">
          
          {/* Main Content Container */}
          <div className="flex flex-col lg:flex-row h-full">
            
            {/* Left Side - Form */}
            <div className="w-full lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center">
              
              {/* Logo */}
              <div className="flex items-center mb-12">
                <div className="w-8 h-8 bg-[#1E88E5] rounded-lg flex items-center justify-center mr-3">
                  
                    <Baby className="w-10 h-10 text-white" />
                </div>
                <span className="text-xl font-bold" style={{color:'#1E88E5'}}>MaterniBénin</span>
              </div>

              {/* Welcome Text */}
              <div className="mb-12">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight min-h-[120px] lg:min-h-[140px]">
                  {typedText}
                  <span className="animate-pulse">|</span>
                </h1>
                <p className="text-gray-500 text-base lg:text-lg">Connectez-vous pour accéder à votre tableau de bord</p>
              </div>

              {/* Form */}
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-base font-medium text-gray-700 mb-3">
                    Adresse email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Entrez votre adresse email"
                    className="w-full h-14 border border-gray-200 rounded-xl px-4 focus:ring-2 focus:ring-[#1E88E5] focus:border-transparent bg-gray-50 text-base"
                    required
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-base font-medium text-gray-700 mb-3">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-14 border border-gray-200 rounded-xl px-4 pr-12 focus:ring-2 focus:ring-[#1E88E5] focus:border-transparent bg-gray-50 text-base"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Forgot Password */}
                <div className="text-left mb-2">
                  <Link href="#" className="text-base text-[#1E88E5] hover:text-[#1565C0] font-medium">
                    mot de passe oublié?
                  </Link>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                {/* Login Button */}
                <Button 
                  type="submit"
                  disabled={isSubmitting || loading || !email || !password}
                  className="w-full h-14 bg-[#1E88E5] hover:bg-[#1565C0] text-white font-semibold rounded-xl transition-colors duration-200 mt-8 text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting || loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Connexion...
                    </>
                  ) : (
                    'Se connecter'
                  )}
                </Button>

                {/* Sign Up Link */}
                <p className="text-center text-base text-gray-600 mt-6">
                  Vous n&apos;avez pas de compte?{' '}
                  <Link href="#" className="text-[#1E88E5] hover:text-[#1565C0] font-medium">
                    S&apos;inscrire
                  </Link>
                </p>

                {/* OR Divider */}
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-base">
                    <span className="px-4 bg-white text-gray-500">OU</span>
                  </div>
                </div>

                {/* Google Login */}
                <Button
                  variant="outline"
                  className="w-full h-14 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors duration-200 text-base"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continuer avec Google
                </Button>
              </form>
            </div>

            {/* Right Side - Medical Image */}
            <div className="hidden lg:flex lg:w-1/2 bg-cover bg-center bg-no-repeat relative min-h-[400px] lg:min-h-full"
                 style={{ backgroundImage: "url('https://plus.unsplash.com/premium_photo-1726797673877-fa90e45602e8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTI5fHxzYWdlJTIwZmVtbWUlMjBiZWJlfGVufDB8fDB8fHww')" }}>
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#1E88E5]/10"></div>
              <div className="absolute inset-0 flex items-center justify-center p-16">
                <div className="text-center text-white">
                  <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-12 backdrop-blur-sm border border-white/30">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <Baby className="w-10 h-10 text-[#1E88E5]" />
                    </div>
                  </div>
                  <div className="max-w-sm text-white">
  <h2 className="text-2xl font-bold mb-6 drop-shadow-lg !text-white">
    Santé maternelle et infantile
  </h2>
  <p className="text-lg opacity-90 font-medium drop-shadow-md">
    Au service des mères et des enfants
  </p>
</div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}