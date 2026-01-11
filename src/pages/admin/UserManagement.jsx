import { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, Modal, message, Input, Select, Avatar, Popconfirm, Tooltip, Form, Badge } from 'antd';
import { UserOutlined, DeleteOutlined, CheckCircleOutlined, FileTextOutlined, EyeOutlined, DownloadOutlined, EditOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { 
    fetchAllUsers, 
    fetchPendingDoctors, 
    approveDoctorAccount, 
    removeUser, 
    modifyUserRole, 
    selectAllUsers, 
    selectPendingDoctors, 
    selectAdminLoading 
} from '../../store/slices/adminSlice';
import * as adminService from '../../api/adminService'; 
// NOT: adminService sadece download işlemi (Blob) için direkt import edildi.
// Redux state'i etkilemeyen bir browser stream işlemi olduğu için bu kabul edilebilir.

const { Search } = Input;
const { Option } = Select;

const UserManagement = () => {
    const dispatch = useDispatch();
    const users = useSelector(selectAllUsers);
    const pendingDoctors = useSelector(selectPendingDoctors);
    const loading = useSelector(selectAdminLoading);

    const [selectedRole, setSelectedRole] = useState('');
    const [searchText, setSearchText] = useState('');
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [roleForm] = Form.useForm();

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
            message.success(`Rol güncellendi: ${values.role}`);
            setIsEditModalVisible(false);
            setEditingUser(null);
        } catch {
            message.error('Rol güncellenemedi');
        }
    };

    // Bu işlem Redux store'u etkilemediği için service call olarak kaldı
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

    const userColumns = [
        {
            title: 'Kullanıcı', key: 'user', fixed: 'left', width: 250,
            render: (r) => <Space><Avatar icon={<UserOutlined />} src={r.avatar} /><div className="flex flex-col"><span className="font-medium">{r.name}</span><span className="text-xs text-gray-500">{r.email}</span></div></Space>
        },
        {
            title: 'Rol', dataIndex: 'role', key: 'role', width: 120,
            render: (role) => <Tag color={{ admin: 'red', doctor: 'blue', patient: 'green' }[role]}>{role.toUpperCase()}</Tag>
        },
        {
            title: 'Durum', key: 'status', width: 150,
            render: (r) => r.role === 'doctor' ? (r.isDoctorApproved ? <Badge status="success" text="Onaylı" /> : <Badge status="warning" text="Onay Bekliyor" />) : <Badge status="default" text="Standart" />
        },
        {
            title: 'İşlemler', key: 'actions', fixed: 'right', width: 180,
            render: (r) => (
                <Space>
                    {r.role === 'doctor' && r.doctorDocuments && <Tooltip title="Belge"><Button type="dashed" size="small" icon={<DownloadOutlined />} onClick={() => handleDownloadDocument(r.id, r.name)} /></Tooltip>}
                    <Tooltip title="Rol Düzenle"><Button size="small" icon={<EditOutlined />} onClick={() => openEditModal(r)} /></Tooltip>
                    <Popconfirm title="Silinsin mi?" onConfirm={() => handleDeleteUser(r.id)}><Button danger size="small" icon={<DeleteOutlined />} /></Popconfirm>
                </Space>
            )
        }
    ];

    const filteredUsers = users.filter(u => u.name?.toLowerCase().includes(searchText.toLowerCase()) || u.email?.toLowerCase().includes(searchText.toLowerCase()));

    return (
        <div className='p-4 max-w-[1600px] mx-auto'>
            {pendingDoctors?.length > 0 && (
                <Card className="mb-6 shadow-md border-orange-200" title={<div className="flex items-center text-orange-600"><SafetyCertificateOutlined className="mr-2" />Onay Bekleyenler ({pendingDoctors.length})</div>}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pendingDoctors.map((doc) => (
                            <div key={doc.id} className="border p-4 bg-white hover:shadow flex justify-between">
                                <div className="flex gap-3"><Avatar icon={<UserOutlined />} src={doc.user?.avatar} /><div><div className="font-bold">{doc.user?.name}</div><div className="text-blue-600 text-sm">{doc.speciality}</div></div></div>
                                <div className="flex flex-col gap-2">
                                    {doc.user?.doctorDocuments && <Button size="small" icon={<EyeOutlined />} onClick={() => handleDownloadDocument(doc.user.id, doc.user?.name)}>Belge</Button>}
                                    <Button type="primary" size="small" icon={<CheckCircleOutlined />} onClick={() => handleApproveDoctor(doc.user.id)}>Onayla</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            <Card className="shadow-md" title="Kullanıcı Listesi">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <Search placeholder="Ara..." onSearch={setSearchText} onChange={e => setSearchText(e.target.value)} className="w-full md:w-1/3" />
                    <Select placeholder="Rol Filtrele" className="w-full md:w-1/4" value={selectedRole || undefined} onChange={handleRoleFilter} allowClear><Option value="">Tümü</Option><Option value="admin">Admin</Option><Option value="doctor">Doktor</Option><Option value="patient">Hasta</Option></Select>
                </div>
                <Table columns={userColumns} dataSource={filteredUsers} rowKey="id" loading={loading} scroll={{ x: 1000 }} pagination={{ pageSize: 10 }} />
            </Card>

            <Modal title="Rol Düzenle" open={isEditModalVisible} onCancel={() => setIsEditModalVisible(false)} footer={null}>
                {editingUser && (
                    <Form form={roleForm} layout="vertical" onFinish={handleUpdateRole} initialValues={{ role: editingUser.role }}>
                        <div className="mb-4 bg-gray-50 p-3"><p><strong>{editingUser.name}</strong> ({editingUser.email})</p></div>
                        <Form.Item name="role" label="Yeni Rol" rules={[{ required: true }]}><Select><Option value="patient">Hasta</Option><Option value="doctor">Doktor</Option><Option value="admin">Admin</Option></Select></Form.Item>
                        <div className="flex justify-end gap-2"><Button onClick={() => setIsEditModalVisible(false)}>İptal</Button><Button type="primary" htmlType="submit">Güncelle</Button></div>
                    </Form>
                )}
            </Modal>
        </div>
    );
};

export default UserManagement;