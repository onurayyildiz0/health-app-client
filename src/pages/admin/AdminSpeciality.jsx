import { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Modal, message, Input, Popconfirm, Tooltip, Form } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, MedicineBoxOutlined, AppstoreAddOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { 
    fetchAllSpecialities, 
    createSpeciality, 
    editSpeciality, 
    removeSpeciality, 
    selectAllSpecialities, 
    selectSpecialityLoading 
} from '../../store/slices/specialitySlice';

const AdminSpeciality = () => {
    const dispatch = useDispatch();
    const specialities = useSelector(selectAllSpecialities);
    const loading = useSelector(selectSpecialityLoading);

    const [searchText, setSearchText] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        dispatch(fetchAllSpecialities());
    }, [dispatch]);

    const handleOpenModal = (item = null) => {
        setEditingItem(item);
        item ? form.setFieldsValue({ name: item.name }) : form.resetFields();
        setIsModalVisible(true);
    };

    const handleSave = async (values) => {
        setModalLoading(true);
        try {
            if (editingItem) {
                await dispatch(editSpeciality(editingItem.id, values));
                message.success('Uzmanlık güncellendi');
            } else {
                await dispatch(createSpeciality(values));
                message.success('Uzmanlık eklendi');
            }
            setIsModalVisible(false);
            form.resetFields();
        } catch (error) {
            message.error(error.message || 'İşlem başarısız');
        } finally {
            setModalLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await dispatch(removeSpeciality(id));
            message.success('Uzmanlık silindi');
        } catch (error) {
            message.error('Silme başarısız');
        }
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 80, sorter: (a, b) => a.id - b.id },
        { title: 'Uzmanlık Adı', dataIndex: 'name', key: 'name', sorter: (a, b) => a.name.localeCompare(b.name), render: (text) => <div className="font-medium text-gray-700"><MedicineBoxOutlined className="mr-2 text-blue-500" />{text}</div> },
        {
            title: 'İşlemler', key: 'actions', width: 150, align: 'right',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Düzenle"><Button type="primary" ghost size="small" icon={<EditOutlined />} onClick={() => handleOpenModal(record)} /></Tooltip>
                    <Popconfirm title="Silmek istiyor musunuz?" onConfirm={() => handleDelete(record.id)} okText="Evet" cancelText="Hayır"><Tooltip title="Sil"><Button danger size="small" icon={<DeleteOutlined />} /></Tooltip></Popconfirm>
                </Space>
            )
        }
    ];

    const filteredData = specialities.filter(item => item.name.toLowerCase().includes(searchText.toLowerCase()));

    return (
        <div className="p-4 max-w-[1600px] mx-auto">
            <Card title={<div className="flex items-center gap-2"><AppstoreAddOutlined className="text-blue-600" /><span className="text-lg font-semibold">Uzmanlık Yönetimi</span></div>} extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal(null)}>Yeni Ekle</Button>} className="shadow-md">
                <div className="mb-4 max-w-md"><Input placeholder="Uzmanlık adı ara..." prefix={<SearchOutlined />} onChange={e => setSearchText(e.target.value)} allowClear /></div>
                <Table columns={columns} dataSource={filteredData} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
            </Card>

            <Modal title={editingItem ? "Düzenle" : "Yeni Ekle"} open={isModalVisible} onCancel={() => setIsModalVisible(false)} footer={null} destroyOnClose>
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Form.Item name="name" label="Uzmanlık Adı" rules={[{ required: true, message: 'Gerekli' }]}><Input /></Form.Item>
                    <div className="flex justify-end gap-2"><Button onClick={() => setIsModalVisible(false)}>İptal</Button><Button type="primary" htmlType="submit" loading={modalLoading}>{editingItem ? "Güncelle" : "Oluştur"}</Button></div>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminSpeciality;