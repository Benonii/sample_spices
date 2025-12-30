import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from '@tanstack/react-router';
import { authClient } from '@/lib/authClient';
import { useCart } from '@/hooks/useCart';
import {
  ShoppingCart,
  Package,
  User,
  LogOut,
  Menu,
  X,
  FileText
} from 'lucide-react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { cn } from '@/lib/utils';
import { EthiopianFlagIcon } from './EthiopianFlagIcon';
import { SpiceIcon } from './SpiceIcon';

export const Header: React.FC = () => {
  const { data: sessionData } = authClient.useSession();
  const session = sessionData?.session;
  const user = sessionData?.user;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { cartTotals } = useCart(user?.id || null);

  const handleSignOut = async () => {
    await authClient.signOut();
    navigate({ to: '/' });
  };

  const navItems = [
    { label: 'Spices', href: '/products', icon: Package },
    { label: 'Orders', href: '/orders', icon: FileText },
    { label: 'Cart', href: '/cart', icon: ShoppingCart },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isActivePage = (href: string) => {
    return location.pathname === href;
  };

  return (
    <>
      {/* Header */}
      <header className="sticky top-4 z-50 mx-auto glass backdrop-blur-md dark:glass-dark border-orange-200/50 dark:border-orange-500/20 shadow-lg rounded-2xl w-[80%] transition-all duration-300 hover:shadow-xl">
        <div className="mx-auto max-w-full px-8 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative float">
                <SpiceIcon className="h-16 w-16 text-orange-600 dark:text-orange-400 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3" />
                <EthiopianFlagIcon className="absolute -top-1 -right-1 w-5 h-5 opacity-70" />
                {/* Subtle glow effect on hover */}
                <div className="absolute inset-0 rounded-full bg-orange-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-foreground/80 font-medium group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  Authentic Ethiopian Spices
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-2 text-foreground/70 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-300 font-medium relative group",
                    isActivePage(item.href) && "text-orange-600 dark:text-orange-400"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5 transition-colors duration-300",
                    isActivePage(item.href) ? "text-orange-600 dark:text-orange-400" : "text-foreground/60 group-hover:text-orange-600 dark:group-hover:text-orange-400"
                  )} />
                  <span>{item.label}</span>

                  {/* Cart Badge */}
                  {item.href === '/cart' && user && cartTotals.itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-gradient-to-br from-orange-500 to-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg animate-pulse">
                      {cartTotals.itemCount > 99 ? '99+' : cartTotals.itemCount}
                    </span>
                  )}

                  {/* Active Page Gradient Underline */}
                  <div className={cn(
                    "absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 transform transition-all duration-300 rounded-full",
                    isActivePage(item.href) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  )} />
                </Link>
              ))}

              {session ? (
                <div className="flex items-center space-x-4 glass rounded-xl px-4 py-2">
                  <span className="text-xs text-foreground/70 bg-orange-50 dark:bg-orange-950/30 px-3 py-1.5 rounded-full font-medium border border-orange-200/50 dark:border-orange-500/20">
                    Welcome, {user?.name}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 border-orange-300/50 dark:border-orange-500/30 text-foreground/70 hover:bg-orange-50/50 dark:hover:bg-orange-950/30 hover:border-orange-400 dark:hover:border-orange-500/50 transition-all duration-300 hover:scale-105"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </Button>
                </div>
              ) : (
                <Link to="/login">
                  <Button
                    size="sm"
                    className="flex items-center space-x-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <User className="h-4 w-4" />
                    <span>Login</span>
                  </Button>
                </Link>
              )}
            </nav>

            {/* Tablet Navigation (Icons Only) */}
            <nav className="hidden sm:flex xl:hidden items-center space-x-4">
              {navItems.map((item) => (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link
                      to={item.href}
                      className={cn(
                        "p-3 text-foreground/70 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50/50 dark:hover:bg-orange-950/30 rounded-xl transition-all duration-300 relative hover:scale-110",
                        isActivePage(item.href) && "text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-950/30"
                      )}
                    >
                      <item.icon className={cn(
                        "h-5 w-5",
                        isActivePage(item.href) ? "text-orange-600 dark:text-orange-400" : "text-foreground/60"
                      )} />
                      {/* Active indicator */}
                      {isActivePage(item.href) && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full" />
                      )}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              ))}

              {session ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleSignOut}
                      className="border-orange-300/50 dark:border-orange-500/30 text-orange-700 dark:text-orange-400 hover:bg-orange-50/50 dark:hover:bg-orange-950/30 hover:border-orange-400 dark:hover:border-orange-500/50 transition-all duration-300"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Logout</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to="/login">
                      <Button
                        variant="default"
                        size="icon"
                        className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300"
                      >
                        <User className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Login</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden text-orange-700 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 hover:bg-orange-50/50 dark:hover:bg-orange-950/30 transition-all duration-300"
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-80 glass dark:glass-dark shadow-2xl transform transition-transform duration-500 ease-out sm:hidden border-l border-orange-200/50 dark:border-orange-500/20",
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-20 items-center justify-between px-6 border-b border-orange-200/50 dark:border-orange-500/20 bg-gradient-to-r from-orange-50/50 to-red-50/50 dark:from-orange-950/30 dark:to-red-950/30">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <SpiceIcon className="h-10 w-10 text-orange-600 dark:text-orange-400" />
                <EthiopianFlagIcon className="absolute -top-0.5 -right-0.5 w-3 h-3 opacity-70" />
              </div>
              <h2 className="text-lg font-semibold gradient-text-orange">Menu</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              aria-label="Close mobile menu"
              className="text-foreground/70 hover:text-foreground hover:bg-orange-100/50 dark:hover:bg-orange-900/30 transition-all duration-300"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-6 py-6 space-y-2 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center space-x-3 p-3 text-foreground/70 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50/50 dark:hover:bg-orange-950/30 rounded-xl transition-all duration-300 relative group",
                  isActivePage(item.href) && "text-orange-600 dark:text-orange-400 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/50 dark:to-red-950/50 border-l-4 border-orange-500"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <item.icon className={cn(
                  "h-5 w-5 transition-transform duration-300 group-hover:scale-110",
                  isActivePage(item.href) ? "text-orange-600 dark:text-orange-400" : "text-foreground/60"
                )} />
                <span className="font-medium">{item.label}</span>

                {/* Cart Badge for Mobile */}
                {item.href === '/cart' && user && cartTotals.itemCount > 0 && (
                  <span className="ml-auto bg-gradient-to-br from-orange-500 to-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg">
                    {cartTotals.itemCount > 99 ? '99+' : cartTotals.itemCount}
                  </span>
                )}

                {isActivePage(item.href) && (
                  <div className="ml-auto w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-lg" />
                )}
              </Link>
            ))}
          </nav>

          {/* User Section */}
          <div className="border-t border-orange-200/50 dark:border-orange-500/20 px-6 py-6 bg-gradient-to-r from-orange-50/30 to-red-50/30 dark:from-orange-950/20 dark:to-red-950/20">
            {session ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 glass rounded-xl border border-orange-200/50 dark:border-orange-500/20">
                  <div className="h-10 w-10 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">User</p>
                    <p className="text-sm text-foreground/60">Logged in</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-center border-orange-300/50 dark:border-orange-500/30 text-foreground/70 hover:bg-orange-50/50 dark:hover:bg-orange-950/30 hover:border-orange-400 dark:hover:border-orange-500/50 transition-all duration-300"
                  onClick={() => {
                    handleSignOut();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button
                  variant="default"
                  className="w-full justify-center bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <User className="h-4 w-4 mr-2" />
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm sm:hidden transition-all duration-300"
          onClick={toggleMobileMenu}
        />
      )}
    </>
  );
};
