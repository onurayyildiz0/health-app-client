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
    Tooltip,
    Form,
    Row,
    Col,
    Badge
} from 'antd';
import {
    UserOutlined,
    DeleteOutlined,
    CheckCircleOutlined,
    SearchOutlined,
    FileTextOutlined,
    EyeOutlined,
    DownloadOutlined,
    EditOutlined,
    SafetyCertificateOutlined
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

    // Filtreleme State'leri
    const [selectedRole, setSelectedRole] = useState('');
    const [searchText, setSearchText] = useState('');

    // Rol Düzenleme State'leri
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [roleForm] = Form.useForm();

    // Sayfa Yüklendiğinde
    useEffect(() => {
        fetchUsers();
        fetchPendingDoctors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Kullanıcıları Çek
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

    // Bekleyen Doktorları Çek
    const fetchPendingDoctors = async () => {
        try {
            const response = await adminService.getPendingDoctors();
            dispatch(fetchPendingDoctorsSuccess(response.data || response));
        } catch {
            message.error('Bekleyen doktorlar yüklenemedi');
        }
    };

    // Doktor Onayla
    const handleApproveDoctor = async (doctorId) => {
        try {
            dispatch(approveDoctorStart());
            await adminService.approveDoctor(doctorId); // userId veya doctorId
            dispatch(approveDoctorSuccess(doctorId));
            message.success('Doktor hesabı onaylandı');
            
            // Listeleri güncelle
            fetchPendingDoctors();
            fetchUsers();
        } catch (err) {
            dispatch(approveDoctorFailure(err.message));
            message.error('Onaylama işlemi başarısız');
        }
    };

    // Kullanıcı Sil
    const handleDeleteUser = async (userId) => {
        try {
            await adminService.deleteUser(userId);
            dispatch(deleteUserSuccess(userId));
            message.success('Kullanıcı başarıyla silindi');
        } catch {
            message.error('Silme işlemi başarısız');
        }
    };

    // Belge İndir
    const handleDownloadDocument = async (doctorId, doctorName) => {
        try {
            const response = await adminService.downloadDoctorDocument(doctorId);
            if (!response) {
                message.warning("Dosya sunucudan alınamadı.");
                return;
            }
            const fileData = response?.data || response;
            const blob = new Blob([fileData], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const fileName = `doktor-belge-${doctorName || 'doc'}.pdf`;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Belge hatası:", error);
            message.error('Belge indirilemedi. Dosya mevcut olmayabilir.');
        }
    };

    // Rol Filtreleme
    const handleRoleFilter = (role) => {
        setSelectedRole(role || '');
        fetchUsers(role || '');
    };

    // Rol Güncelleme Modalını Aç
    const openEditModal = (user) => {
        setEditingUser(user);
        roleForm.setFieldsValue({ role: user.role });
        setIsEditModalVisible(true);
    };

    // Rolü Güncelle (Backend'e İstek)
    const handleUpdateRole = async (values) => {
        try {
            await adminService.updateUserRole(editingUser.id, values.role);
            message.success(`Kullanıcı rolü "${values.role}" olarak güncellendi.`);
            setIsEditModalVisible(false);
            setEditingUser(null);
            fetchUsers(selectedRole); // Listeyi yenile
        } catch (error) {
            message.error(error.response?.data?.message || 'Rol güncellenemedi');
        }
    };

    // Tablo Kolonları
    const userColumns = [
        {
            title: 'Kullanıcı',
            key: 'user',
            fixed: 'left', // Mobilde solda sabit kalsın
            width: 250,
            render: (record) => (
                <Space>
                    <Avatar icon={<UserOutlined />} src={record.avatar} />
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-800">{record.name}</span>
                        <span className="text-xs text-gray-500">{record.email}</span>
                    </div>
                </Space>
            )
        },
        {
            title: 'Rol',
            dataIndex: 'role',
            key: 'role',
            width: 120,
            render: (role) => {
                const colors = { admin: 'red', doctor: 'blue', patient: 'green' };
                const labels = { admin: 'Admin', doctor: 'Doktor', patient: 'Hasta' };
                return <Tag color={colors[role] || 'default'}>{labels[role] || role}</Tag>;
            }
        },
        {
            title: 'Durum',
            key: 'status',
            width: 150,
            render: (record) => {
                if (record.role === 'doctor') {
                    return record.isDoctorApproved ? (
                        <Badge status="success" text="Onaylı" />
                    ) : (
                        <Badge status="warning" text="Onay Bekliyor" />
                    );
                }
                return <Badge status="default" text="Standart" />;
            }
        },
        {
            title: 'Kayıt Tarihi',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 150,
            render: (date) => date ? new Date(date).toLocaleDateString('tr-TR') : '-'
        },
        {
            title: 'İşlemler',
            key: 'actions',
            fixed: 'right',
            width: 180,
            render: (record) => (
                <Space>
                    {/* Doktor Belgesi Varsa İndir Butonu */}
                    {record.role === 'doctor' && record.doctorDocuments && (
                        <Tooltip title="Belgeyi İndir">
                            <Button
                                type="dashed"
                                size="small"
                                icon={<DownloadOutlined />}
                                onClick={() => handleDownloadDocument(record.id, record.name)}
                            />
                        </Tooltip>
                    )}

                    {/* Rol Düzenle Butonu */}
                    <Tooltip title="Rolü Düzenle">
                        <Button 
                            type="default" 
                            size="small" 
                            icon={<EditOutlined />} 
                            onClick={() => openEditModal(record)}
                        />
                    </Tooltip>

                    {/* Sil Butonu */}
                    <Popconfirm
                        title="Kullanıcıyı silmek istediğinize emin misiniz?"
                        onConfirm={() => handleDeleteUser(record.id)}
                        okText="Evet"
                        cancelText="İptal"
                    >
                        <Tooltip title="Sil">
                            <Button danger size="small" icon={<DeleteOutlined />} />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    // Client-side Arama Filtrelemesi
    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <div className='p-4 max-w-[1600px] mx-auto'>
            
            {/* 1. Bekleyen Doktorlar Kartı */}
            {pendingDoctors && pendingDoctors.length > 0 && (
                <Card
                    className="mb-6 shadow-md border-orange-200"
                    title={
                        <div className="flex items-center text-orange-600">
                            <SafetyCertificateOutlined className="mr-2 text-xl" />
                            <span className="text-lg font-semibold">Onay Bekleyen Doktorlar ({pendingDoctors.length})</span>
                        </div>
                    }
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pendingDoctors.map((doctor) => (
                            <div key={doctor.id} className="border rounded-lg p-4 bg-white hover:shadow-lg transition-shadow flex justify-between items-start">
                                <div className="flex gap-3">
                                    <Avatar size={48} icon={<UserOutlined />} src={doctor.user?.avatar} />
                                    <div>
                                        <div className="font-bold text-gray-800">{doctor.user?.name}</div>
                                        <div className="text-blue-600 text-sm font-medium">{doctor.speciality}</div>
                                        {doctor.user?.doctorDocuments && (
                                            <div className="text-xs text-green-600 mt-1 flex items-center">
                                                <FileTextOutlined className="mr-1" /> Belge Mevcut
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {doctor.user?.doctorDocuments && (
                                        <Button
                                            size="small"
                                            icon={<EyeOutlined />}
                                            onClick={() => handleDownloadDocument(doctor.user.id, doctor.user?.name)}
                                        >
                                            Belge
                                        </Button>
                                    )}
                                    <Button
                                        type="primary"
                                        size="small"
                                        icon={<CheckCircleOutlined />}
                                        onClick={() => handleApproveDoctor(doctor.user.id)}
                                    >
                                        Onayla
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* 2. Kullanıcı Yönetimi */}
            <Card
                className="shadow-md"
                title={<span className="text-lg font-semibold">Kullanıcı Listesi</span>}
            >
                {/* Filtreleme Alanı */}
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                    <div className="w-full md:w-1/3">
                        <Search
                            placeholder="İsim veya Email ile ara..."
                            onSearch={setSearchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            allowClear
                            enterButton
                        />
                    </div>
                    <div className="w-full md:w-1/4">
                        <Select
                            placeholder="Rol Filtrele"
                            className="w-full"
                            value={selectedRole || undefined}
                            onChange={handleRoleFilter}
                            allowClear
                        >
                            <Option value="">Tümü</Option>
                            <Option value="admin">Yöneticiler</Option>
                            <Option value="doctor">Doktorlar</Option>
                            <Option value="patient">Hastalar</Option>
                        </Select>
                    </div>
                </div>

                {/* Tablo */}
                <Table
                    columns={userColumns}
                    dataSource={filteredUsers}
                    rowKey="id" // C# id (int)
                    loading={loading}
                    scroll={{ x: 1000 }} // Responsive Scroll
                    pagination={{
                        pageSize: 10,
                        showTotal: (total) => `Toplam ${total} kayıt`,
                        showSizeChanger: true
                    }}
                />
            </Card>

            {/* Rol Düzenleme Modalı */}
            <Modal
                title="Kullanıcı Rolünü Düzenle"
                open={isEditModalVisible}
                onCancel={() => setIsEditModalVisible(false)}
                footer={null}
            >
                {editingUser && (
                    <Form
                        form={roleForm}
                        layout="vertical"
                        onFinish={handleUpdateRole}
                        initialValues={{ role: editingUser.role }}
                    >
                        <div className="mb-4 p-3 bg-gray-50 rounded">
                            <p><strong>Kullanıcı:</strong> {editingUser.name}</p>
                            <p><strong>Email:</strong> {editingUser.email}</p>
                        </div>

                        <Form.Item
                            name="role"
                            label="Yeni Rol"
                            rules={[{ required: true, message: 'Lütfen bir rol seçin' }]}
                        >
                            <Select>
                                <Option value="patient">Hasta</Option>
                                <Option value="doctor">Doktor</Option>
                                <Option value="admin">Admin</Option>
                            </Select>
                        </Form.Item>

                        <div className="flex justify-end gap-2">
                            <Button onClick={() => setIsEditModalVisible(false)}>İptal</Button>
                            <Button type="primary" htmlType="submit">Güncelle</Button>
                        </div>
                    </Form>
                )}
            </Modal>
        </div>
    );
};

export default UserManagement;