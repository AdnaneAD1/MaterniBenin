import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock } from '@fortawesome/free-solid-svg-icons';

export default function Login() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(120deg,_#F5FAFF_0%,_#E3F0FF_50%,_#ffffff_100%)] backdrop-blur-sm py-8 px-2 sm:px-6 lg:px-8">
            <div className="max-w-4xl w-full flex flex-col md:flex-row shadow-2xl rounded-3xl overflow-hidden bg-white/90">
                {/* Left Side - Form */}
                <div className="w-full md:w-1/2 flex flex-col justify-center p-10 md:p-14">
                    <div className="mb-8 text-center">
                        <Link href="/" className="inline-block mb-2">
                            <span className="text-[2rem] font-extrabold" style={{color:'#1E88E5'}}>MaterniBénin</span>
                        </Link>
                        <h2 className="mt-4 text-2xl md:text-3xl font-extrabold text-gray-900 text-center">Bienvenue dans l&apos;espace professionnel des sage-femmes</h2>
                        <p className="mt-2 text-gray-500 text-center">Connectez-vous pour accéder à votre tableau de bord</p>
                    </div>

                    <form className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">Email / Identifiant</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FontAwesomeIcon icon={faUser} className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 
                           focus:outline-none focus:ring-primary focus:border-primary"
                                    placeholder="Entrez votre email ou identifiant"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">Mot de passe</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FontAwesomeIcon icon={faLock} className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 
                           focus:outline-none focus:ring-primary focus:border-primary"
                                    placeholder="Entrez votre mot de passe"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                    Se souvenir de moi
                                </label>
                            </div>

                            <div className="text-sm">
                                <a href="#" className="font-medium text-primary hover:text-primary-dark">
                                    Mot de passe oublié ?
                                </a>
                            </div>
                        </div>

                        <div>
                            <Link
                                href="/dashboard"
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow text-base font-bold text-white bg-[#1E88E5] hover:bg-[#1565C0] transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E88E5]"
                            >
                                Se connecter
                            </Link>
                        </div>
                    </form>
                </div>

                {/* Right Side - Illustration */}
                <div className="hidden md:flex md:w-1/2 items-center justify-center bg-white relative">
                    <div className="w-full flex flex-col items-center justify-center p-10">
                        <div className="mb-8 flex items-center justify-center">
                            <div className="h-32 w-32 rounded-full bg-white shadow-lg flex items-center justify-center">
                                <span className="text-7xl">👩‍⚕️</span>
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2 text-center">Au service des mères et des enfants</h3>
                    </div>
                </div>
            </div>
        </div>
    );
}
