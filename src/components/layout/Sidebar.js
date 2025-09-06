"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, 
  Activity, 
  Users, 
  Stethoscope, 
  Baby, 
  Calendar, 
  BarChart3, 
  UserCheck, 
  Settings, 
  LogOut,
  X,
  Phone,
  ChevronRight,
  Heart
} from 'lucide-react';
import { useAuth } from '@/hooks/auth';

const Sidebar = ({
  user = { name: 'Lulla Devi', role: 'Dept Admin', avatar: '/images/avatar-placeholder.jpg' },
  isOpen,
  onClose
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout } = useAuth();

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await logout();
    } catch (err) {
      // ignore error, still redirect
    } finally {
      router.push('/login');
    }
  };

  // Vérifier si l'utilisateur est un responsable
  const isResponsable = currentUser?.role === 'responsable';

  // ✅ Correction : utilisation des icônes Lucide
  const baseMenuItems = [
    { name: 'Tableau de Bord', href: '/dashboard', icon: Home },
    { name: 'Patientes', href: '/dashboard/patients', icon: Users },
    { name: 'CPN', href: '/dashboard/cpn', icon: Stethoscope },
    { name: 'Accouchements', href: '/dashboard/accouchements', icon: Baby },
    { name: 'Planification', href: '/dashboard/planification', icon: Calendar },
    { name: 'Rapports', href: '/dashboard/rapports', icon: BarChart3 },
    { name: 'Paramètres', href: '/dashboard/parametres', icon: Settings },
  ];

  // Ajouter le menu Utilisateurs seulement pour les responsables
  const menuItems = isResponsable 
    ? [...baseMenuItems.slice(0, 6), { name: 'Utilisateurs', href: '/dashboard/utilisateurs', icon: UserCheck }, ...baseMenuItems.slice(6)]
    : baseMenuItems;

  return (
    <>
      {/* Overlay pour mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-30 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          
          {/* Header avec logo */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                  <Baby className="w-10 h-10 text-white" />
                </div>
                <span className="text-xl font-bold" style={{color:'#1E88E5'}}>MaterniBénin</span>

              </div>
              
              <button
                onClick={onClose}
                className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Profile Section */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white">
                <Heart className="w-6 h-6" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-semibold text-gray-800">{currentUser?.displayName || currentUser?.firstName + ' ' + currentUser?.lastName || user.name}</p>
                <p className="text-xs text-gray-500">{currentUser?.role || user.role}</p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href || (item.active && pathname === '/dashboard');
                const IconComponent = item.icon;
                
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center justify-between px-4 py-3 text-sm rounded-lg transition-all duration-200 group ${
                        isActive
                          ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-500'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                      }`}
                    >
                      <div className="flex items-center">
                        <IconComponent 
                          className={`w-5 h-5 mr-3 ${
                            isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-600'
                          }`} 
                        />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      {item.hasSubmenu && (
                        <ChevronRight className={`w-4 h-4 transition-transform ${
                          isActive ? 'text-blue-500' : 'text-gray-400'
                        }`} />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Emergency Contact */}
          <div className="p-4 border-t border-gray-100">
            <div className="bg-green-500 rounded-lg p-4 text-white">
              <div className="flex items-center">
                <Phone className="w-5 h-5 mr-2" />
                <div>
                  <p className="text-sm font-semibold">Emergency Contact</p>
                  <p className="text-sm font-bold">0987654321</p>
                </div>
              </div>
            </div>
          </div>

          {/* Logout */}
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-left text-sm text-red-500 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              <span className="font-medium">Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
