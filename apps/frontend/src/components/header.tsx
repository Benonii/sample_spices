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
      <header className="sticky top-4 z-50 mx-auto bg-white/70 backdrop-blur-sm border-b border-green-200 shadow-sm rounded-xl w-[80%]">
        <div className="mx-auto max-w-full px-8 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group bg-transparent">
              <div className="relative">
                <SpiceIcon className="h-16 w-16 text-green-600 transition-transform duration-300 group-hover:scale-105" />
                <EthiopianFlagIcon className="absolute -top-1 -right-1 w-5 h-5 opacity-70" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-neutral-600 font-medium">Authentic Ethiopian Spices</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-2 text-neutral-700 hover:text-green-600 transition-colors duration-200 font-medium relative group",
                    isActivePage(item.href) && "text-green-600"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5 transition-colors duration-200",
                    isActivePage(item.href) ? "text-green-600" : "text-neutral-600 group-hover:text-green-600"
                  )} />
                  <span>{item.label}</span>
                  
                  {/* Cart Badge */}
                  {item.href === '/cart' && user && cartTotals.itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {cartTotals.itemCount > 99 ? '99+' : cartTotals.itemCount}
                    </span>
                  )}
                  
                  {/* Active Page Underline */}
                  <div className={cn(
                    "absolute -bottom-1 left-0 right-0 h-0.5 bg-green-500 transform transition-all duration-300",
                    isActivePage(item.href) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  )} />
                </Link>
              ))}

              {session ? (
                <div className="flex items-center space-x-4 bg-white/70 backdrop-blur-sm rounded-l">
                  <span className="text-xs text-neutral-700 bg-neutral-100 px-3 py-1 rounded-full font-medium">
                    Welcome, {user?.name}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 border-neutral-300 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </Button>
                </div>
              ) : (
                <Link to="/login">
                  <Button
                    size="sm"
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
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
                        "p-3 text-neutral-700 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all duration-200 relative",
                        isActivePage(item.href) && "text-green-700 bg-green-50"
                      )}
                    >
                      <item.icon className={cn(
                        "h-5 w-5",
                        isActivePage(item.href) ? "text-green-600" : "text-neutral-600"
                      )} />
                      {/* Active indicator for tablet */}
                      {isActivePage(item.href) && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full" />
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
                      className="border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400"
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
                        className="bg-green-600 hover:bg-green-700 text-white border-0 shadow-md hover:shadow-lg"
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
              className="sm:hidden text-green-700 hover:text-green-800 hover:bg-green-50"
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
          "fixed inset-y-0 right-0 z-50 w-80 bg-white/70 backdrop-blur-sm shadow-xl transform transition-transform duration-300 ease-in-out sm:hidden border-l border-green-200",
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-20 items-center justify-between px-6 border-b border-neutral-200 bg-neutral-50">
            <div className="flex items-center space-x-3 bg-white/70 backdrop-blur-sm rounded-lg">
              <div className="relative">
                <SpiceIcon className="h-10 w-10 text-green-600" />
                <EthiopianFlagIcon className="absolute -top-0.5 -right-0.5 w-3 h-3 opacity-70" />
              </div>
              <h2 className="text-lg font-semibold text-neutral-800">Menu</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              aria-label="Close mobile menu"
              className="text-neutral-700 hover:text-neutral-800 hover:bg-neutral-100"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-6 py-6 space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center space-x-3 p-3 text-neutral-700 hover:text-green-600 hover:bg-neutral-50 rounded-lg transition-all duration-200 relative",
                  isActivePage(item.href) && "text-green-600 bg-neutral-50 border-l-4 border-green-500"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <item.icon className={cn(
                  "h-5 w-5",
                  isActivePage(item.href) ? "text-green-600" : "text-neutral-600"
                )} />
                <span className="font-medium">{item.label}</span>
                
                {/* Cart Badge for Mobile */}
                {item.href === '/cart' && user && cartTotals.itemCount > 0 && (
                  <span className="ml-auto bg-green-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                    {cartTotals.itemCount > 99 ? '99+' : cartTotals.itemCount}
                  </span>
                )}
                
                {isActivePage(item.href) && (
                  <div className="ml-auto w-2 h-2 bg-green-500 rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* User Section */}
          <div className="border-t border-neutral-200 px-6 py-6 bg-neutral-50">
            {session ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-white/70 backdrop-blur-sm rounded-lg border border-neutral-200">
                  <div className="h-10 w-10 bg-neutral-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-neutral-600" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-800">User</p>
                    <p className="text-sm text-neutral-600">Logged in</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-center border-neutral-300 text-neutral-700 hover:bg-neutral-100 hover:border-neutral-400"
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
                  className="w-full justify-center bg-green-600 hover:bg-green-700 text-white border-0 shadow-md hover:shadow-lg"
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
          className="fixed inset-0 z-40 bg-black/20 sm:hidden"
          onClick={toggleMobileMenu}
        />
      )}
    </>
  );
};
