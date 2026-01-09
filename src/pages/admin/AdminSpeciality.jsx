import { useState, useEffect } from 'react';
import {
    Card,
    Table,
    Button,
    Space,
    Modal,
    message,
    Input,
    Popconfirm,
    Tooltip,
    Form
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    MedicineBoxOutlined,
    AppstoreAddOutlined
} from '@ant-design/icons';
import * as specialityService from '../../api/specialityService';

const AdminSpeciality = () => {
    const [specialities, setSpecialities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    
    // Modal State
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [editingItem, setEditingItem] = useState(null); // Düzenlenen kayıt, null ise yeni kayıt
    const [form] = Form.useForm();

    useEffect(() => {
        fetchSpecialities();
    }, []);

    // Verileri Çek
    const fetchSpecialities = async () => {
        setLoading(true);
        try {
            const response = await specialityService.getAllSpecialities();
            // Backend yapınıza göre response.data içindeki listeyi alıyoruz
            setSpecialities(response.data || response); 
        } catch (error) {
            message.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Modal Aç (Ekleme veya Düzenleme için)
    const handleOpenModal = (item = null) => {
        setEditingItem(item);
        if (item) {
            form.setFieldsValue({ name: item.name });
        } else {
            form.resetFields();
        }
        setIsModalVisible(true);
    };

    // Kaydet (Ekle veya Güncelle)
    const handleSave = async (values) => {
        setModalLoading(true);
        try {
            if (editingItem) {
                // Güncelleme İşlemi
                await specialityService.updateSpeciality(editingItem.id, values);
                message.success('Uzmanlık alanı güncellendi');
            } else {
                // Ekleme İşlemi
                await specialityService.addSpeciality(values);
                message.success('Yeni uzmanlık alanı eklendi');
            }
            setIsModalVisible(false);
            form.resetFields();
            fetchSpecialities(); // Listeyi yenile
        } catch (error) {
            // Backend'den gelen hata mesajını göster (örn: "Bu uzmanlık alanı zaten mevcut")
            const errorMsg = error.response?.data?.message || 'İşlem sırasında bir hata oluştu';
            message.error(errorMsg);
        } finally {
            setModalLoading(false);
        }
    };

    // Silme İşlemi
    const handleDelete = async (id) => {
        try {
            await specialityService.deleteSpeciality(id);
            message.success('Uzmanlık alanı silindi');
            fetchSpecialities(); // Listeyi yenile
        } catch (error) {
            message.error(error.message);
        }
    };

    // Tablo Kolonları
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
            sorter: (a, b) => a.id - b.id,
        },
        {
            title: 'Uzmanlık Adı',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (text) => (
                <div className="font-medium text-gray-700">
                    <MedicineBoxOutlined className="mr-2 text-blue-500" />
                    {text}
                </div>
            )
        },
        {
            title: 'İşlemler',
            key: 'actions',
            width: 150,
            align: 'right',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Düzenle">
                        <Button
                            type="primary"
                            ghost
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleOpenModal(record)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Bu uzmanlık alanını silmek istediğinize emin misiniz?"
                        description="Bu işlem geri alınamaz."
                        onConfirm={() => handleDelete(record.id)}
                        okText="Evet"
                        cancelText="Hayır"
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
    const filteredData = specialities.filter(item => 
        item.name.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <div className="p-4 max-w-[1600px] mx-auto">
            <Card
                title={
                    <div className="flex items-center gap-2">
                        <AppstoreAddOutlined className="text-blue-600" />
                        <span className="text-lg font-semibold">Uzmanlık Alanları Yönetimi</span>
                    </div>
                }
                extra={
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />} 
                        onClick={() => handleOpenModal(null)}
                    >
                        Yeni Ekle
                    </Button>
                }
                className="shadow-md"
            >
                {/* Arama Barı */}
                <div className="mb-4 max-w-md">
                    <Input
                        placeholder="Uzmanlık adı ara..."
                        prefix={<SearchOutlined className="text-gray-400" />}
                        onChange={e => setSearchText(e.target.value)}
                        allowClear
                    />
                </div>

                {/* Tablo */}
                <Table
                    columns={columns}
                    dataSource={filteredData}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            {/* Ekleme/Düzenleme Modalı */}
            <Modal
                title={editingItem ? "Uzmanlık Alanını Düzenle" : "Yeni Uzmanlık Alanı Ekle"}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSave}
                >
                    <Form.Item
                        name="name"
                        label="Uzmanlık Adı"
                        rules={[
                            { required: true, message: 'Lütfen uzmanlık adını giriniz' },
                            { min: 2, message: 'En az 2 karakter olmalıdır' }
                        ]}
                    >
                        <Input prefix={<MedicineBoxOutlined />} placeholder="Örn: Kardiyoloji" />
                    </Form.Item>

                    <Form.Item className="mb-0 flex justify-end">
                        <Space>
                            <Button onClick={() => setIsModalVisible(false)}>
                                İptal
                            </Button>
                            <Button type="primary" htmlType="submit" loading={modalLoading}>
                                {editingItem ? "Güncelle" : "Oluştur"}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminSpeciality;