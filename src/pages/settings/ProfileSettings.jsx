import { useState, useEffect } from 'react';
import {
    Card, Form, Input, Button, Avatar, Upload, message, Divider, Typography, Space, Modal
} from 'antd';
import {
    UserOutlined, MailOutlined, UploadOutlined, SaveOutlined, SafetyCertificateOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import {
    updateProfileStart, updateProfileSuccess, updateProfileFailure,
    selectUserLoading
} from '../../store/slices/userSlice';
import { selectUser, loginSuccess } from '../../store/slices/authSlice';
import * as userService from '../../api/userService';

// userService.js dosyasından named export olarak verifyIdentity'i de alalım 
// Eğer default export kullanıyorsanız userService.verifyIdentity şeklinde aşağıda kullanacağız.

const { Title, Text } = Typography;

const ProfileSettings = () => {
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const loading = useSelector(selectUserLoading);

    const [profileForm] = Form.useForm();
    const [avatarUrl, setAvatarUrl] = useState(user?.avatar);

    // --- YENİ STATE'LER ---
    const [isModalOpen, setIsModalOpen] = useState(false); // Modal görünürlüğü
    const [pendingValues, setPendingValues] = useState(null); // Form verilerini bekletmek için
    const [tcInput, setTcInput] = useState(""); // Modal içindeki input
    const [verifying, setVerifying] = useState(false); // Modal loading durumu

    useEffect(() => {
        if (user) {
            profileForm.setFieldsValue({
                name: user.name,
                email: user.email 
            });
            if (user.avatar !== undefined) {
                setAvatarUrl(user.avatar);
            }
        }
    }, [user, profileForm]);

    // Form Submit Butonuna Basıldığında Çalışır
    const onFinish = (values) => {
        // Eğer email değişmişse güvenlik kontrolü yap
        if (user.email !== values.email) {
            setPendingValues(values); // Verileri hafızaya al
            setIsModalOpen(true);     // Modalı aç
        } else {
            // Email değişmediyse direkt güncelle
            performUpdate(values);
        }
    };

    // Asıl güncelleme işlemini yapan fonksiyon
    const performUpdate = async (values) => {
        try {
            dispatch(updateProfileStart());

            const response = await userService.updateProfile({
                name: values.name,
                email: values.email,
                avatar: avatarUrl
            });

            const userData = response.user || response.data?.user || response.data || response;
            const msg = response.message || response.data?.message;

            dispatch(updateProfileSuccess(userData));
            
            dispatch(loginSuccess({
                user: userData,
                token: localStorage.getItem('token')
            }));

            if (values.email !== user.email) {
                message.info(msg || 'Lütfen yeni e-posta adresinize gönderilen doğrulama bağlantısına tıklayın.', 6);
                // Formu eski mail'e resetle (çünkü henüz doğrulanmadı)
                profileForm.setFieldsValue({ email: user.email });
            } else {
                message.success('Profil başarıyla güncellendi!');
                setAvatarUrl(userData.avatar);
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'Profil güncellenemedi';
            dispatch(updateProfileFailure(errorMsg));
            message.error(errorMsg);
        } finally {
            // Temizlik
            setIsModalOpen(false);
            setPendingValues(null);
            setTcInput("");
        }
    };

    // Modal içindeki "Doğrula ve Güncelle" butonu
    const handleVerifyAndSave = async () => {
        if (!tcInput) {
            message.warning("Lütfen TC Kimlik Numaranızı girin.");
            return;
        }

        setVerifying(true);
        try {
            // 1. Önce TC Doğrula
            // Not: userService'i import * as userService olarak aldıysanız:
            await userService.verifyIdentity(tcInput); 
            
            // 2. Başarılı ise bekleyen güncelleme işlemini yap
            message.success("Kimlik doğrulandı, profil güncelleniyor...");
            await performUpdate(pendingValues);

        } catch (error) {
            message.error(error.response?.data?.message || "Kimlik doğrulanamadı.");
        } finally {
            setVerifying(false);
        }
    };

    // ... Avatar yükleme kodları (Aynı kalacak) ...
    const handleAvatarChange = (info) => {
        if (info.file.status === 'uploading') return;
        const file = info.file.originFileObj || info.file;
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => setAvatarUrl(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const beforeUpload = (file) => {
        const isImage = file.type?.startsWith('image/');
        if (!isImage) {
            message.error('Sadece resim dosyaları yükleyebilirsiniz!');
            return Upload.LIST_IGNORE;
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Resim boyutu 2MB\'dan küçük olmalıdır!');
            return Upload.LIST_IGNORE;
        }
        return false; 
    };

    return (
        <div className="max-w-4xl mx-auto min-h-screen">
            <Title level={3} className="mb-6">
                <UserOutlined className="mr-2" />
                Profil Ayarları
            </Title>

            <Card className="mb-6">
                <div className="flex items-center gap-6 mb-6">
                    <Avatar size={100} icon={<UserOutlined />} src={avatarUrl} />
                    <div>
                        <Title level={4} className="!mb-1">{user?.name}</Title>
                        <Text type="secondary">{user?.email}</Text>
                        <div className="mt-2">
                            <Upload
                                name="avatar"
                                showUploadList={false}
                                beforeUpload={beforeUpload}
                                onChange={handleAvatarChange}
                                accept="image/*"
                            >
                                <Button icon={<UploadOutlined />}>Avatar Değiştir</Button>
                            </Upload>
                        </div>
                    </div>
                </div>

                <Divider />

                <Form
                    form={profileForm}
                    layout="vertical"
                    onFinish={onFinish} // handleUpdateProfile yerine onFinish kullanıyoruz
                >
                    <Form.Item
                        label="Ad Soyad"
                        name="name"
                        rules={[
                            { required: true, message: 'Lütfen adınızı girin' },
                            { min: 2, message: 'En az 2 karakter olmalı' }
                        ]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Ad Soyad" size="large" />
                    </Form.Item>

                    <Form.Item
                        label="E-posta"
                        name="email"
                        extra="E-posta adresinizi değiştirirseniz güvenlik gereği TC doğrulaması istenecektir."
                        rules={[
                            { required: true, message: 'Lütfen email adresinizi girin' },
                            { type: 'email', message: 'Geçerli bir email adresi girin' }
                        ]}
                    >
                        <Input
                            prefix={<MailOutlined />}
                            placeholder="E-posta"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button
                                type="primary"
                                htmlType="submit"
                                icon={<SaveOutlined />}
                                loading={loading}
                                size="large"
                            >
                                Değişiklikleri Kaydet
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>

            {/* --- TC DOĞRULAMA MODALI --- */}
            <Modal
                title={
                    <div className="flex items-center gap-2 text-orange-600">
                        <SafetyCertificateOutlined />
                        <span>Güvenlik Doğrulaması</span>
                    </div>
                }
                open={isModalOpen}
                onOk={handleVerifyAndSave}
                onCancel={() => {
                    setIsModalOpen(false);
                    setPendingValues(null);
                    setTcInput("");
                }}
                confirmLoading={verifying}
                okText="Doğrula ve Güncelle"
                cancelText="İptal"
            >
                <p className="mb-4">
                    E-posta adresinizi değiştirmek üzeresiniz. Güvenliğiniz için lütfen 
                    <b> TC Kimlik Numaranızı</b> girerek işlemi onaylayın.
                </p>
                <Input
                    placeholder="TC Kimlik Numaranız"
                    maxLength={11}
                    value={tcInput}
                    onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setTcInput(val);
                    }}
                    prefix={<UserOutlined />}
                />
            </Modal>
        </div>
    );
};

export default ProfileSettings;