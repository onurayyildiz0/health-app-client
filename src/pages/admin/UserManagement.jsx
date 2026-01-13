import React, { useState, useEffect } from 'react';
import { 
    Card, Table, Tag, Button, Space, Modal, message, Input, Select, 
    Avatar, Popconfirm, Tooltip, Form, Badge, Descriptions, Divider, List 
} from 'antd';
import { 
    UserOutlined, DeleteOutlined, CheckCircleOutlined, EyeOutlined, 
    DownloadOutlined, EditOutlined, SafetyCertificateOutlined, 
    MedicineBoxOutlined, HistoryOutlined 
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { 
    fetchAllUsers, 
    fetchPendingDoctors, 
    approveDoctorAccount, 
    removeUser, 
    modifyUserRole, 
    fetchUserDetails, 
    clearSelectedUser, 
    selectAllUsers, 
    selectPendingDoctors, 
    selectAdminLoading,
    selectSelectedUser 
} from '../../store/slices/adminSlice';
import * as adminService from '../../api/adminService'; 

const { Search } = Input;
const { Option } = Select;


const roleMap = {
    admin: 'Yönetici', 
    doctor: 'Doktor',
    patient: 'Hasta'
};

const appointmentStatusMap = {
    booked: 'Rezerve',
    completed: 'Tamamlanmış',
    cancelled: 'İptal',
    pending: 'Beklemede' 
};

const getStatusColor = (status) => {
    switch (status) {
        case 'completed': return 'success'; 
        case 'cancelled': return 'error';   
        case 'booked': return 'processing'; 
        default: return 'default';
    }
};

const UserManagement = () => {
    const dispatch = useDispatch();
    
    
    const users = useSelector(selectAllUsers);
    const pendingDoctors = useSelector(selectPendingDoctors);
    const loading = useSelector(selectAdminLoading);
    const selectedUser = useSelector(selectSelectedUser); 

    
    const [selectedRole, setSelectedRole] = useState('');
    const [searchText, setSearchText] = useState('');
    
    
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [roleForm] = Form.useForm();

    
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

    
    useEffect(() => {
        dispatch(fetchAllUsers());
        dispatch(fetchPendingDoctors());
    }, [dispatch]);

    

    const handleApproveDoctor = async (doctorId) => {
        try {
            await dispatch(approveDoctorAccount(doctorId));
            message.success('Doktor hesabı onaylandı');
        } catch {
            message.error('Onaylama başarısız');
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            await dispatch(removeUser(userId));
            message.success('Kullanıcı silindi');
        } catch {
            message.error('Silme başarısız');
        }
    };

    const handleUpdateRole = async (values) => {
        try {
            await dispatch(modifyUserRole(editingUser.id, values.role));
            message.success(`Rol güncellendi: ${roleMap[values.role]}`);
            setIsEditModalVisible(false);
            setEditingUser(null);
        } catch {
            message.error('Rol güncellenemedi');
        }
    };

    const handleDownloadDocument = async (doctorId, doctorName) => {
        try {
            const response = await adminService.downloadDoctorDocument(doctorId);
            const blob = new Blob([response.data || response], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `doktor-belge-${doctorName || 'doc'}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch {
            message.error('Belge indirilemedi');
        }
    };

    const handleRoleFilter = (role) => {
        setSelectedRole(role || '');
        dispatch(fetchAllUsers(role || ''));
    };

    const openEditModal = (user) => {
        setEditingUser(user);
        roleForm.setFieldsValue({ role: user.role });
        setIsEditModalVisible(true);
    };

    const handleViewDetails = async (userId) => {
        await dispatch(fetchUserDetails(userId));
        setIsDetailModalVisible(true);
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalVisible(false);
        dispatch(clearSelectedUser()); 
    };

    
    const userColumns = [
        {
            title: 'Kullanıcı', key: 'user', fixed: 'left', width: 250,
            render: (r) => (
                <Space>
                    <Avatar icon={<UserOutlined />} src={r.avatar} />
                    <div className="flex flex-col">
                        <span className="font-medium">{r.name}</span>
                        <span className="text-xs text-gray-500">{r.email}</span>
                    </div>
                </Space>
            )
        },
        {
            title: 'Rol', dataIndex: 'role', key: 'role', width: 120,
            render: (role) => (
                
                <Tag color={{ admin: 'red', doctor: 'blue', patient: 'green' }[role]}>
                    {(roleMap[role] || role).toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'Durum', key: 'status', width: 150,
            render: (r) => r.role === 'doctor' ? (
                r.isDoctorApproved 
                    ? <Badge status="success" text="Onaylı" /> 
                    : <Badge status="warning" text="Onay Bekliyor" />
            ) : <Badge status="default" text="Standart" />
        },
        {
            title: 'İşlemler', key: 'actions', fixed: 'right', width: 220,
            render: (r) => (
                <Space>
                    {r.role === 'doctor' && !r.isDoctorApproved && (
                        <Tooltip title="Doktoru Onayla">
                            <Button 
                                type="primary" 
                                size="small" 
                                icon={<CheckCircleOutlined />} 
                                onClick={() => handleApproveDoctor(r.id)} 
                            />
                        </Tooltip>
                    )}
                    {r.role === 'doctor' && r.doctorDocuments && (
                        <Tooltip title="Belge İndir">
                            <Button 
                                type="dashed" 
                                size="small" 
                                icon={<DownloadOutlined />} 
                                onClick={() => handleDownloadDocument(r.id, r.name)} 
                            />
                        </Tooltip>
                    )}
                    <Tooltip title="Detaylar">
                         <Button 
                            size="small" 
                            icon={<EyeOutlined />} 
                            onClick={() => handleViewDetails(r.id)} 
                        />
                    </Tooltip>
                    <Tooltip title="Rol Düzenle">
                        <Button 
                            size="small" 
                            icon={<EditOutlined />} 
                            onClick={() => openEditModal(r)} 
                        />
                    </Tooltip>
                    <Popconfirm title="Silinsin mi?" onConfirm={() => handleDeleteUser(r.id)}>
                        <Button danger size="small" icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    const filteredUsers = users.filter(u => 
        u.name?.toLowerCase().includes(searchText.toLowerCase()) || 
        u.email?.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <div className='p-4 max-w-[1600px] mx-auto'>
            {/* ÜST KISIM: BEKLEYEN DOKTORLAR KARTI */}
            {pendingDoctors?.length > 0 && (
                <Card className="mb-6 shadow-md border-orange-200" title={<div className="flex items-center text-orange-600"><SafetyCertificateOutlined className="mr-2" />Onay Bekleyenler ({pendingDoctors.length})</div>}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pendingDoctors.map((doc) => (
                            <div key={doc.id} className="border p-4 bg-white hover:shadow flex justify-between">
                                <div className="flex gap-3">
                                    <Avatar icon={<UserOutlined />} src={doc.user?.avatar} />
                                    <div>
                                        <div className="font-bold">{doc.user?.name}</div>
                                        <div className="text-blue-600 text-sm">{doc.specialityNavigation?.name}</div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Button size="small" icon={<EyeOutlined />} onClick={() => handleViewDetails(doc.user.id)}>Detaylar</Button>
                                    {doc.user?.doctorDocuments && (
                                        <Button size="small" icon={<DownloadOutlined />} onClick={() => handleDownloadDocument(doc.user.id, doc.user?.name)}>Belge</Button>
                                    )}
                                    <Button type="primary" size="small" icon={<CheckCircleOutlined />} onClick={() => handleApproveDoctor(doc.user.id)}>Onayla</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* ORTA KISIM: KULLANICI LİSTESİ */}
            <Card className="shadow-md" title="Kullanıcı Listesi">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <Search 
                        placeholder="Ara (İsim veya Email)..." 
                        onSearch={setSearchText} 
                        onChange={e => setSearchText(e.target.value)} 
                        className="w-full md:w-1/3" 
                    />
                    <Select 
                        placeholder="Rol Filtrele" 
                        className="w-full md:w-1/4" 
                        value={selectedRole || undefined} 
                        onChange={handleRoleFilter} 
                        allowClear
                    >
                        <Option value="">Tümü</Option>
                        <Option value="admin">Yönetici</Option>
                        <Option value="doctor">Doktor</Option>
                        <Option value="patient">Hasta</Option>
                    </Select>
                </div>
                
                <Table 
                    columns={userColumns} 
                    dataSource={filteredUsers} 
                    rowKey="id" 
                    loading={loading} 
                    scroll={{ x: 1000 }} 
                    pagination={{ pageSize: 10 }} 
                />
            </Card>

            {/* MODAL 1: ROL DÜZENLEME */}
            <Modal title="Rol Düzenle" open={isEditModalVisible} onCancel={() => setIsEditModalVisible(false)} footer={null}>
                {editingUser && (
                    <Form form={roleForm} layout="vertical" onFinish={handleUpdateRole} initialValues={{ role: editingUser.role }}>
                        <div className="mb-4 bg-gray-50 p-3">
                            <p><strong>{editingUser.name}</strong> ({editingUser.email})</p>
                        </div>
                        <Form.Item name="role" label="Yeni Rol" rules={[{ required: true }]}>
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

            {/* MODAL 2: DETAYLI KULLANICI GÖRÜNÜMÜ */}
            <Modal 
                title={<Space><UserOutlined /> Kullanıcı Detayları</Space>}
                open={isDetailModalVisible} 
                onCancel={handleCloseDetailModal}
                width={800}
                footer={[
                    <Button key="close" onClick={handleCloseDetailModal}>Kapat</Button>
                ]}
            >
                {selectedUser ? (
                    <div className="flex flex-col gap-4">
                        {/* A. GENEL BİLGİLER */}
                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded border">
                            <Avatar size={64} src={selectedUser.avatar} icon={<UserOutlined />} />
                            <div className="flex-1">
                                <h3 className="text-xl font-bold m-0 text-gray-800">{selectedUser.name}</h3>
                                <p className="text-gray-500 m-0">{selectedUser.email}</p>
                                <div className="mt-2 flex gap-2">
                                    {/* GÜNCELLEME: roleMap kullanıldı */}
                                    <Tag color={selectedUser.role === 'admin' ? 'red' : selectedUser.role === 'doctor' ? 'blue' : 'green'}>
                                        {(roleMap[selectedUser.role] || selectedUser.role).toUpperCase()}
                                    </Tag>
                                    {selectedUser.isVerified && <Tag color="success">Email Doğrulanmış</Tag>}
                                    {selectedUser.role === 'doctor' && (
                                        selectedUser.isDoctorApproved 
                                        ? <Tag icon={<CheckCircleOutlined />} color="cyan">Doktor Onaylı</Tag> 
                                        : <Tag icon={<HistoryOutlined />} color="orange">Doktor Onayı Bekliyor</Tag>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* B. DOKTOR BİLGİLERİ */}
                        {selectedUser.role === 'doctor' && selectedUser.doctors && selectedUser.doctors.length > 0 && (
                            <>
                                <Divider orientation="left" className="text-blue-600"><MedicineBoxOutlined /> Doktor Bilgileri</Divider>
                                <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} size="small">
                                    <Descriptions.Item label="Uzmanlık">
                                        <span className="font-semibold text-blue-700">
                                            {selectedUser.doctors[0].specialityNavigation?.name || 'Belirtilmemiş'}
                                        </span>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Hastane">
                                        {selectedUser.doctors[0].hospital || 'Belirtilmemiş'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Deneyim">
                                        {selectedUser.doctors[0].experience ? `${selectedUser.doctors[0].experience} Yıl` : '-'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Muayene Ücreti">
                                        {selectedUser.doctors[0].consultationFee ? `${selectedUser.doctors[0].consultationFee} ₺` : '-'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Konum" span={2}>
                                        {selectedUser.doctors[0].fullLocation || selectedUser.doctors[0].location || '-'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Hakkında" span={2}>
                                        {selectedUser.doctors[0].about || <span className="text-gray-400">Bilgi girilmemiş.</span>}
                                    </Descriptions.Item>
                                </Descriptions>
                            </>
                        )}

                        {/* C. RANDEVU GEÇMİŞİ */}
                        {selectedUser.appointments && selectedUser.appointments.length > 0 ? (
                            <>
                                <Divider orientation="left"><HistoryOutlined /> Randevu Geçmişi ({selectedUser.appointments.length})</Divider>
                                <List
                                    size="small"
                                    bordered
                                    className="max-h-60 overflow-y-auto"
                                    dataSource={selectedUser.appointments}
                                    renderItem={(item) => (
                                        <List.Item>
                                            <div className="flex justify-between w-full items-center">
                                                <div>
                                                    <span className="font-semibold">{item.date}</span> 
                                                    <span className="mx-2 text-gray-400">|</span>
                                                    <span>{item.start} - {item.end}</span>
                                                </div>
                                                {/* GÜNCELLEME: appointmentStatusMap kullanıldı */}
                                                <Tag color={getStatusColor(item.status)}>
                                                    {(appointmentStatusMap[item.status] || item.status).toUpperCase()}
                                                </Tag>
                                            </div>
                                        </List.Item>
                                    )}
                                />
                            </>
                        ) : (
                            <div className="text-center text-gray-400 mt-2 italic">Henüz randevu kaydı bulunmuyor.</div>
                        )}
                        
                        {/* D. SİSTEM BİLGİLERİ */}
                        <Descriptions size="small" column={2} className="mt-4 bg-gray-50 p-2 rounded">
                            <Descriptions.Item label="TC Kimlik">{selectedUser.tc || '-'}</Descriptions.Item>
                            <Descriptions.Item label="Kayıt Tarihi">{new Date(selectedUser.createdAt).toLocaleDateString('tr-TR')}</Descriptions.Item>
                        </Descriptions>
                    </div>
                ) : (
                    <div className="flex justify-center items-center h-40">
                        <Space direction="vertical" align="center">
                           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                           <span>Bilgiler Yükleniyor...</span>
                        </Space>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default UserManagement;