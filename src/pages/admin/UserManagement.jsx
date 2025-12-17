import { useState, useEffect } from 'react';
import {
    Card,
    Table,
    Tag,
    Button,
    Space,
    Modal,
    message,
    Input,
    Select,
    Avatar,
    Popconfirm,
    Tooltip
} from 'antd';
import {
    UserOutlined,
    DeleteOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    SearchOutlined,
    FilterOutlined,
    FileTextOutlined,
    EyeOutlined,
    DownloadOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchUsersStart,
    fetchUsersSuccess,
    fetchUsersFailure,
    fetchPendingDoctorsSuccess,
    approveDoctorStart,
    approveDoctorSuccess,
    approveDoctorFailure,
    deleteUserSuccess,
    selectAllUsers,
    selectPendingDoctors,
    selectAdminLoading
} from '../../store/slices/adminSlice';
import * as adminService from '../../api/adminService';

const { Search } = Input;
const { Option } = Select;

const UserManagement = () => {
    const dispatch = useDispatch();
    const users = useSelector(selectAllUsers);
    const pendingDoctors = useSelector(selectPendingDoctors);
    const loading = useSelector(selectAdminLoading);

    const [selectedRole, setSelectedRole] = useState('');
    const [searchText, setSearchText] = useState('');

    // Kullanıcıları yükle
    useEffect(() => {
        fetchUsers();
        fetchPendingDoctors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchUsers = async (role = '') => {
        try {
            dispatch(fetchUsersStart());
            let response;
            if (role) {
                response = await adminService.getUsersByRole(role);
            } else {
                response = await adminService.getAllUsers();
            }
            dispatch(fetchUsersSuccess(response.data || response));
        } catch (err) {
            dispatch(fetchUsersFailure(err.message));
            message.error('Kullanıcılar yüklenirken hata oluştu');
        }
    };

    const fetchPendingDoctors = async () => {
        try {
            const response = await adminService.getPendingDoctors();
            dispatch(fetchPendingDoctorsSuccess(response.data || response));
        } catch {
            message.error('Bekleyen doktorlar yüklenemedi');
        }
    };

    // Doktor onayla
    const handleApproveDoctor = async (doctorId) => {
        try {
            dispatch(approveDoctorStart());
            await adminService.approveDoctor(doctorId);
            dispatch(approveDoctorSuccess(doctorId));
            message.success('Doktor onaylandı');
            fetchUsers(); // Listeyi yenile
        } catch (err) {
            dispatch(approveDoctorFailure(err.message));
            message.error('Doktor onaylanamadı');
        }
    };

    // Kullanıcı sil
    const handleDeleteUser = async (userId) => {
        try {
            await adminService.deleteUser(userId);
            dispatch(deleteUserSuccess(userId));
            message.success('Kullanıcı silindi');
        } catch {
            message.error('Kullanıcı silinemedi');
        }
    };

    // Rol filtrele
    const handleRoleFilter = (role) => {
        setSelectedRole(role || '');
        if (!role) {
            fetchUsers(''); // Tümünü getir
        } else {
            fetchUsers(role);
        }
    };

    // Kullanıcı tablosu kolonları
    const userColumns = [
        {
            title: 'Kullanıcı',
            key: 'user',
            render: (record) => (
                <Space>
                    <Avatar icon={<UserOutlined />} src={record.avatar} />
                    <div>
                        <div>{record.name}</div>
                        <div className="text-gray-500 text-sm">{record.email}</div>
                    </div>
                </Space>
            )
        },
        {
            title: 'Rol',
            dataIndex: 'role',
            key: 'role',
            render: (role) => {
                const colors = {
                    admin: 'red',
                    doctor: 'blue',
                    patient: 'green'
                };
                const labels = {
                    admin: 'Admin',
                    doctor: 'Doktor',
                    patient: 'Hasta'
                };
                return <Tag color={colors[role]}>{labels[role]}</Tag>;
            }
        },
        {
            title: 'Durum',
            key: 'status',
            render: (record) => {
                // Sadece doktorlar için durum göster
                if (record.role === 'doctor') {
                    return record.isDoctorApproved ? (
                        <Tag color="green" icon={<CheckCircleOutlined />}>Onaylanmış</Tag>
                    ) : (
                        <Tag color="orange">Onay Bekliyor</Tag>
                    );
                }
                // Admin ve patient için durum gösterme
                return '-';
            }
        },
        {
            title: 'Kayıt Tarihi',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleDateString('tr-TR')
        },
        {
            title: 'İşlemler',
            key: 'actions',
            render: (record) => (
                <Space>
                    {record.role === 'doctor' && record.doctorDocuments && (
                        <Tooltip title="Doktor Belgesini Görüntüle">
                            <Button
                                type="default"
                                size="small"
                                icon={<DownloadOutlined />}
                                onClick={() => handleDownloadDocument(record.doctorId || record._id, record.name)
                                }
                            >
                                Belge
                            </Button>
                        </Tooltip>
                    )}
                    {record.role === 'doctor' && record.isApproved === false && (
                        <Tooltip title="Doktoru Onayla">
                            <Button
                                type="primary"
                                size="small"
                                icon={<CheckCircleOutlined />}
                                onClick={() => handleApproveDoctor(record.doctorId)}
                            >
                                Onayla
                            </Button>
                        </Tooltip>
                    )}
                    <Popconfirm
                        title="Kullanıcıyı silmek istediğinize emin misiniz?"
                        onConfirm={() => handleDeleteUser(record._id)}
                        okText="Evet"
                        cancelText="Hayır"
                    >
                        <Tooltip title="Kullanıcıyı Sil">
                            <Button
                                danger
                                size="small"
                                icon={<DeleteOutlined />}
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    // Arama filtresi
    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchText.toLowerCase())
    );

    // Belge indirme işlemini yapan yardımcı fonksiyon

    // UserManagement.jsx içinde handleDownloadDocument fonksiyonu

    const handleDownloadDocument = async (doctorId, doctorName) => {
        try {
            const response = await adminService.downloadDoctorDocument(doctorId);

            // KONTROL: Eğer response hiç gelmediyse işlemi durdur
            if (!response) {
                console.error("Hata: Sunucudan yanıt (response) alınamadı.");
                message.warning("Dosya indirilemedi, sunucu yanıt vermedi.");
                return;
            }

            // HATA ÇÖZÜMÜ: response?.data diyerek güvenli erişim sağlıyoruz
            // Eğer data yoksa response'un kendisini (muhtemelen blob) kullanır.
            const fileData = response?.data || response;

            const blob = new Blob([fileData], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const fileName = `doktor-belgesi-${doctorName || 'doktor'}.pdf`;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error("Belge indirme hatası:", error);
            message.error('Belge indirilirken bir hata oluştu.');
        }
    };

    return (
        <div className='max-w-[1400px] mx-auto'>
            {/* Bekleyen Doktorlar */}
            {pendingDoctors && pendingDoctors.length > 0 && (
                <Card
                    className="mb-6"
                    title={
                        <span>
                            <CheckCircleOutlined className="mr-2 text-orange-500" />
                            Onay Bekleyen Doktorlar {pendingDoctors.length}
                        </span>
                    }
                >
                    <Space direction="vertical" className="w-full">
                        {pendingDoctors.map((doctor) => (
                            <Card key={doctor._id} size="small">
                                <div className="flex justify-between items-center">
                                    <Space>
                                        <Avatar icon={<UserOutlined />} src={doctor.user?.avatar} />
                                        <div>
                                            <div className="font-semibold">
                                                Dr. {doctor.user?.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {doctor.speciality}
                                            </div>
                                            {doctor.user?.doctorDocuments && (
                                                <div className="text-xs text-blue-500 mt-1">
                                                    <FileTextOutlined /> Belge yüklendi
                                                </div>
                                            )}
                                        </div>
                                    </Space>
                                    <Space>
                                        {doctor.user?.doctorDocuments && (
                                            <Tooltip title="Belgeyi Görüntüle">
                                                <Button
                                                    type="default"
                                                    size="small"
                                                    icon={<EyeOutlined />}
                                                    onClick={() => handleDownloadDocument(doctor.user._id, doctor.user?.name)}
                                                >
                                                    Belge
                                                </Button>
                                            </Tooltip>
                                        )}
                                        <Button
                                            type="primary"
                                            icon={<CheckCircleOutlined />}
                                            onClick={() => handleApproveDoctor(doctor.user._id)}
                                        >
                                            Onayla
                                        </Button>
                                    </Space>
                                </div>
                            </Card>
                        ))}
                    </Space>
                </Card>
            )}

            {/* Kullanıcı Listesi */}
            <Card
                title="Tüm Kullanıcılar"
                extra={
                    <Space wrap className="gap-2">
                        <Search
                            placeholder="Kullanıcı ara..."
                            onSearch={setSearchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            style={{ minWidth: 200, maxWidth: 250 }}
                            allowClear
                        />
                        <Select
                            placeholder="Rol filtrele"
                            style={{ minWidth: 120, width: 150 }}
                            value={selectedRole || undefined}
                            onChange={handleRoleFilter}
                            allowClear
                        >
                            <Option value="">Tümü</Option>
                            <Option value="admin">Admin</Option>
                            <Option value="doctor">Doktor</Option>
                            <Option value="patient">Hasta</Option>
                        </Select>
                    </Space>
                }
            >
                <Table
                    columns={userColumns}
                    dataSource={filteredUsers}
                    rowKey="_id"
                    loading={loading}
                    scroll={{ x: 1000 }}
                    pagination={{
                        pageSize: 10,
                        showTotal: (total) => `Toplam ${total} kullanıcı`,
                        responsive: true
                    }}
                />
            </Card>
        </div>
    );
};

export default UserManagement;
