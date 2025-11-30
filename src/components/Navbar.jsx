import { useState } from 'react';
import { Button, Dropdown, Avatar, Badge, Drawer } from 'antd';
import {
    HeartOutlined,
    UserOutlined,
    LoginOutlined,
    LogoutOutlined,
    MenuOutlined,
    CloseOutlined,
    CalendarOutlined,
    TeamOutlined,
    MedicineBoxOutlined,
    SettingOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, selectIsAuthenticated, logout } from '../store/slices/authSlice';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Redux'tan kullanıcı bilgilerini al
    const user = useSelector(selectUser);
    const isLoggedIn = useSelector(selectIsAuthenticated);

    // LocalStorage'dan direkt avatar okuma - her render'da kontrol et
    const getUserAvatar = () => {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                return parsedUser.avatar || null;
            }
        } catch (e) {
            console.error('Avatar parse error:', e);
        }
        return null;
    };

    const currentAvatar = getUserAvatar();

    // Navigation items
    const navItems = [
        { key: '/', label: 'Ana Sayfa', icon: <HeartOutlined /> },
        { key: '/doctors', label: 'Doktorlar', icon: <TeamOutlined /> },
        { key: '/about', label: 'Hakkımızda', icon: <MedicineBoxOutlined /> },
    ];

    // User menu items
    const getDashboardPath = () => {
        if (!user?.role) return '/dashboard';
        return `/dashboard/${user.role}`;
    };

    const userMenuItems = [
        {
            key: 'profile',
            label: 'Profilim',
            icon: <UserOutlined />,
            onClick: () => navigate(getDashboardPath())
        },
        {
            key: 'appointments',
            label: 'Randevularım',
            icon: <CalendarOutlined />,
            onClick: () => {
                if (user?.role === 'patient') {
                    navigate('/dashboard/patient/appointments');
                } else if (user?.role === 'doctor') {
                    navigate('/dashboard/doctor/appointments');
                } else {
                    navigate('/dashboard');
                }
            }
        },
        {
            key: 'settings',
            label: 'Ayarlar',
            icon: <SettingOutlined />,
            onClick: () => navigate('/settings')
        },
        {
            type: 'divider'
        },
        {
            key: 'logout',
            label: 'Çıkış Yap',
            icon: <LogoutOutlined />,
            danger: true,
            onClick: () => {
                // Redux'tan logout yap
                dispatch(logout());
                navigate('/login');
            }
        }
    ];

    const isActivePath = (path) => {
        return location.pathname === path;
    };

    return (
        <>
            <nav className='bg-white shadow-md sticky top-0 z-50'>
                <div className='container mx-auto px-4'>
                    <div className='flex items-center justify-between h-16'>
                        {/* Logo */}
                        <div
                            className='flex items-center gap-2 cursor-pointer group'
                            onClick={() => navigate('/')}
                        >
                            <div className='w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200'>
                                <HeartOutlined className='text-white text-xl' />
                            </div>
                            <span className='text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-600'>
                                HealthApp
                            </span>
                        </div>

                        {/* Desktop Navigation */}
                        <div className='hidden md:flex items-center gap-6'>
                            {navItems.map((item) => {
                                // Eğer item protected ise ve kullanıcı giriş yapmamışsa gösterme
                                if (item.protected && !isLoggedIn) return null;

                                return (
                                    <button
                                        key={item.key}
                                        onClick={() => navigate(item.key)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer ${isActivePath(item.key)
                                            ? 'text-blue-600 bg-blue-50'
                                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        {item.icon}
                                        <span>{item.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Desktop Right Section */}
                        <div className='hidden md:flex items-center gap-4'>
                            {isLoggedIn ? (
                                <>
                                    {/* User Menu */}
                                    <Dropdown
                                        menu={{ items: userMenuItems }}
                                        placement="bottomRight"
                                        arrow
                                    >
                                        <div className='flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-all duration-200'>
                                            {(currentAvatar || user?.avatar) ? (
                                                <img
                                                    src={currentAvatar || user?.avatar}
                                                    alt="avatar"
                                                    className="w-8 h-8 rounded-full object-cover"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            ) : (
                                                <Avatar
                                                    size="default"
                                                    icon={<UserOutlined />}
                                                    style={{ background: 'linear-gradient(to right, #3b82f6, #10b981)' }}
                                                />
                                            )}
                                            <div className='hidden lg:block text-left'>
                                                <div className='text-sm font-semibold text-gray-800'>
                                                    {user?.name || 'Kullanıcı'}
                                                </div>
                                                <div className='text-xs text-gray-500 capitalize'>
                                                    {user?.role === 'patient' ? 'Hasta' : user?.role === 'doctor' ? 'Doktor' : 'Admin'}
                                                </div>
                                            </div>
                                        </div>
                                    </Dropdown>
                                </>
                            ) : (
                                <>
                                    <Button
                                        type="text"
                                        icon={<LoginOutlined />}
                                        className='font-semibold text-gray-700 hover:text-blue-600'
                                        onClick={() => navigate('/login')}
                                    >
                                        Giriş Yap
                                    </Button>
                                    <Button
                                        type="primary"
                                        className='bg-gradient-to-r from-blue-500 to-green-500 border-0 font-semibold shadow-md hover:shadow-lg transition-all duration-200'
                                        onClick={() => navigate('/register')}
                                    >
                                        Hesap Oluştur
                                    </Button>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <div className='md:hidden'>
                            <Button
                                type="text"
                                icon={<MenuOutlined className='text-xl' />}
                                onClick={() => setMobileMenuOpen(true)}
                            />
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Drawer Menu */}
            <Drawer
                title={
                    <div className='flex items-center gap-2'>
                        <div className='w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center'>
                            <HeartOutlined className='text-white' />
                        </div>
                        <span className='font-bold text-lg'>HealthApp</span>
                    </div>
                }
                placement="right"
                onClose={() => setMobileMenuOpen(false)}
                open={mobileMenuOpen}
                closeIcon={<CloseOutlined />}
                width={280}
            >
                <div className='flex flex-col gap-2'>
                    {/* User Info (Mobile) */}
                    {isLoggedIn && (
                        <div className='mb-4 pb-4 border-b border-gray-200'>
                            <div className='flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg'>
                                {(currentAvatar || user?.avatar) ? (
                                    <img
                                        src={currentAvatar || user?.avatar}
                                        alt="avatar"
                                        className="w-16 h-16 rounded-full object-cover"
                                    />
                                ) : (
                                    <Avatar
                                        size="large"
                                        icon={<UserOutlined />}
                                        style={{ background: 'linear-gradient(to right, #3b82f6, #10b981)' }}
                                    />
                                )}
                                <div>
                                    <div className='font-semibold text-gray-800'>{user?.name || 'Kullanıcı'}</div>
                                    <div className='text-xs text-gray-500 capitalize'>
                                        {user?.role === 'patient' ? 'Hasta' : user?.role === 'doctor' ? 'Doktor' : 'Admin'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Items */}
                    {navItems.map((item) => {
                        if (item.protected && !isLoggedIn) return null;

                        return (
                            <Button
                                key={item.key}
                                type="text"
                                block
                                icon={item.icon}
                                className={`text-left justify-start h-12 ${isActivePath(item.key)
                                    ? 'text-blue-600 bg-blue-50 font-semibold'
                                    : 'text-gray-700'
                                    }`}
                                onClick={() => {
                                    navigate(item.key);
                                    setMobileMenuOpen(false);
                                }}
                            >
                                {item.label}
                            </Button>
                        );
                    })}

                    {/* Divider */}
                    {isLoggedIn && <div className='my-2 border-t border-gray-200' />}

                    {/* User Menu Items or Auth Buttons */}
                    {isLoggedIn ? (
                        <>
                            {userMenuItems.map((item) => {
                                if (item.type === 'divider') {
                                    return <div key="divider" className='my-2 border-t border-gray-200' />;
                                }
                                return (
                                    <Button
                                        key={item.key}
                                        type="text"
                                        block
                                        icon={item.icon}
                                        danger={item.danger}
                                        className='text-left justify-start h-12'
                                        onClick={() => {
                                            item.onClick();
                                            setMobileMenuOpen(false);
                                        }}
                                    >
                                        {item.label}
                                    </Button>
                                );
                            })}
                        </>
                    ) : (
                        <>
                            <Button
                                type="text"
                                block
                                icon={<LoginOutlined />}
                                className='text-left justify-start h-12 font-semibold'
                                onClick={() => {
                                    navigate('/login');
                                    setMobileMenuOpen(false);
                                }}
                            >
                                Giriş Yap
                            </Button>
                            <Button
                                type="primary"
                                block
                                className='bg-gradient-to-r from-blue-500 to-green-500 border-0 font-semibold h-12 mt-2'
                                onClick={() => {
                                    navigate('/register');
                                    setMobileMenuOpen(false);
                                }}
                            >
                                Hesap Oluştur
                            </Button>
                        </>
                    )}
                </div>
            </Drawer>
        </>
    );
};

export default Navbar;