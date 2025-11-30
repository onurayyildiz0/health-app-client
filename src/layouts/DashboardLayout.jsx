import { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, Drawer } from 'antd';
import {
    DashboardOutlined,
    CalendarOutlined,
    UserOutlined,
    TeamOutlined,
    SettingOutlined,
    LogoutOutlined,
    HeartOutlined,
    MenuUnfoldOutlined,
    MedicineBoxOutlined,
    ClockCircleOutlined,
    StarOutlined,
    FileTextOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectUser } from '../store/slices/authSlice';
import authService from '../api/authService';


const { Header, Sider, Content } = Layout;

const DashboardLayout = ({ children, userRole = 'patient' }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const dispatch = useDispatch();

    // Redux'tan gerçek kullanıcı bilgisini al
    const user = useSelector(selectUser);

    // LocalStorage'dan direkt avatar okuma
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

    // Rol bazlı menü items
    const getMenuItems = () => {
        const basePath = `/dashboard/${userRole}`;

        const commonItems = [
            {
                key: basePath,
                icon: <DashboardOutlined />,
                label: 'Dashboard',
                onClick: () => navigate(basePath)
            }
        ];

        if (userRole === 'patient') {
            return [
                ...commonItems,
                {
                    key: `${basePath}/appointments`,
                    icon: <CalendarOutlined />,
                    label: 'Randevularım',
                    onClick: () => navigate(`${basePath}/appointments`)
                },
                {
                    key: `${basePath}/create-appointment`,
                    icon: <ClockCircleOutlined />,
                    label: 'Yeni Randevu',
                    onClick: () => navigate(`${basePath}/create-appointment`)
                },
                {
                    key: `${basePath}/doctors`,
                    icon: <TeamOutlined />,
                    label: 'Doktorlar',
                    onClick: () => navigate(`${basePath}/doctors`)
                },
                {
                    key: `${basePath}/favorites`,
                    icon: <StarOutlined />,
                    label: 'Favorilerim',
                    onClick: () => navigate(`${basePath}/favorites`)
                }
            ];
        }

        if (userRole === 'doctor') {
            return [
                ...commonItems,
                {
                    key: `${basePath}/appointments`,
                    icon: <CalendarOutlined />,
                    label: 'Randevularım',
                    onClick: () => navigate(`${basePath}/appointments`)
                },
                {
                    key: `${basePath}/schedule`,
                    icon: <ClockCircleOutlined />,
                    label: 'Çalışma Saatlerim',
                    onClick: () => navigate(`${basePath}/schedule`)
                },
                {
                    key: `${basePath}/timeoff`,
                    label: 'İzin Dönemlerim',
                    onClick: () => navigate(`${basePath}/timeoff`)
                }
            ];
        }

        if (userRole === 'admin') {
            return [
                ...commonItems,
                {
                    key: `${basePath}/users`,
                    icon: <TeamOutlined />,
                    label: 'Kullanıcı Yönetimi',
                    onClick: () => navigate(`${basePath}/users`)
                }
            ];
        }

        return commonItems;
    };

    // User dropdown menu
    const userMenuItems = [
        {
            key: 'settings',
            label: 'Profil Ayarları',
            icon: <SettingOutlined />,
            onClick: () => navigate(`/dashboard/${userRole}/settings`)
        },
        {
            type: 'divider'
        },
        {
            key: 'logout',
            label: 'Çıkış Yap',
            icon: <LogoutOutlined />,
            danger: true,
            onClick: async () => {
                try {
                    // 1. Backend'e logout isteği at (token'ı blacklist'e ekle)
                    await authService.logout();
                } catch {
                    // Hata olsa bile devam et
                } finally {
                    // 2. Redux'tan user ve token'ı temizle
                    dispatch(logout());

                    // 3. Login sayfasına yönlendir
                    navigate('/login');
                }
            }
        }
    ];

    const getRoleLabel = () => {
        switch (userRole) {
            case 'patient': return 'Hasta';
            case 'doctor': return 'Doktor';
            case 'admin': return 'Yönetici';
            default: return 'Kullanıcı';
        }
    };

    const getRoleColor = () => {
        switch (userRole) {
            case 'patient': return 'from-blue-500 to-cyan-500';
            case 'doctor': return 'from-green-500 to-teal-500';
            case 'admin': return 'from-purple-500 to-pink-500';
            default: return 'from-gray-500 to-gray-600';
        }
    };

    return (
        <Layout className='min-h-screen'>
            {/* Mobile Drawer */}
            <Drawer
                placement="left"
                onClose={() => setMobileDrawerOpen(false)}
                open={mobileDrawerOpen}
                className='lg:hidden'
                width={250}
                styles={{ body: { padding: 0 } }}
            >
                {/* Logo */}
                <div className='h-16 flex items-center justify-center border-b border-gray-200'>
                    <div className='flex items-center gap-2'>
                        <div className={`w-10 h-10 bg-gradient-to-r ${getRoleColor()} rounded-full flex items-center justify-center shadow-lg`}>
                            <HeartOutlined className='text-white text-xl' />
                        </div>
                        <span className='text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-600'>
                            HealthApp
                        </span>
                    </div>
                </div>

                {/* Menu */}
                <Menu
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={getMenuItems()}
                    className='border-0 mt-4'
                />
            </Drawer>

            {/* Desktop Sidebar */}
            <Sider
                trigger={null}
                className='!bg-white shadow-lg hidden lg:block'
                width={250}
                style={{
                    maxWidth: '280px',
                    minWidth: '240px',
                    flex: '0 0 250px'
                }}
            >
                {/* Logo */}
                <div className='h-16 flex items-center justify-center border-b border-gray-200'>
                    <div className='flex items-center gap-2'>
                        <div className={`w-10 h-10 bg-gradient-to-r ${getRoleColor()} rounded-full flex items-center justify-center shadow-lg`}>
                            <HeartOutlined className='text-white text-xl' />
                        </div>
                        <span className='text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-600'>
                            HealthApp
                        </span>
                    </div>
                </div>

                {/* Menu */}
                <Menu
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={getMenuItems()}
                    className='border-0 mt-4'
                />
            </Sider>

            {/* Main Layout */}
            <Layout>
                {/* Header */}
                <Header className='!bg-white shadow-sm !px-4 lg:!px-6 flex items-center justify-between'>
                    {/* Left Side - Mobile Menu Button */}
                    <div className='lg:hidden'>
                        {/* Mobile Menu Button - Only on mobile */}
                        <Button
                            type="text"
                            icon={<MenuUnfoldOutlined />}
                            onClick={() => setMobileDrawerOpen(true)}
                            className='text-lg'
                        />
                    </div>

                    {/* Right Side - ml-auto ensures it stays on the right on desktop */}
                    <div className='flex items-center gap-4 ml-auto'>
                        {/* User Dropdown */}
                        <Dropdown
                            menu={{ items: userMenuItems }}
                            placement="bottomRight"
                            arrow
                        >
                            <div className='flex items-center gap-3 cursor-pointer hover:bg-gray-50 px-4 py-2 rounded-lg transition-all duration-200'>
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
                                        className={`bg-gradient-to-r ${getRoleColor()}`}
                                    />
                                )}
                                <div className='hidden md:block text-left'>
                                    <div className='text-sm font-semibold text-gray-800'>
                                        {user.name}
                                    </div>
                                    <div className='text-xs text-gray-500'>
                                        {getRoleLabel()}
                                    </div>
                                </div>
                            </div>
                        </Dropdown>
                    </div>
                </Header>

                {/* Content */}
                <Content className='m-4 lg:m-6 p-4 lg:p-6 bg-gray-50 rounded-lg min-h-[calc(100vh-88px)]'>
                    <div className='max-w-[1600px] mx-auto'>
                        {children || <Outlet />}
                    </div>
                </Content>
            </Layout>
        </Layout >
    );
};

export default DashboardLayout;
