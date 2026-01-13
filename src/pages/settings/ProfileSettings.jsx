import { useState, useEffect } from 'react';
import {
    Card, Form, Input, Button, Avatar, Upload, message, Divider, Typography, Space, Modal
} from 'antd';
import {
    UserOutlined, MailOutlined, UploadOutlined, SaveOutlined, 
    SafetyCertificateOutlined, DeleteOutlined, ExclamationCircleOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'; 


import {
    updateProfileStart, updateProfileSuccess, updateProfileFailure,
    selectUserLoading, removeAccount
} from '../../store/slices/userSlice';
import { selectUser, loginSuccess, logout } from '../../store/slices/authSlice';


import * as userService from '../../api/userService';

const { Title, Text } = Typography;

const ProfileSettings = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector(selectUser);
    const loading = useSelector(selectUserLoading);

    const [profileForm] = Form.useForm();
    const [avatarUrl, setAvatarUrl] = useState(user?.avatar);

    
    const [isModalOpen, setIsModalOpen] = useState(false); 
    const [pendingValues, setPendingValues] = useState(null); 
    const [tcInput, setTcInput] = useState(""); 
    const [verifying, setVerifying] = useState(false); 
    
    
    const [actionType, setActionType] = useState(null);

    
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

    
    const onFinish = (values) => {
        
        if (user.email !== values.email) {
            setPendingValues(values);
            setActionType('EMAIL_UPDATE');
            setIsModalOpen(true);
        } else {
            
            performUpdate(values);
        }
    };

    
    const handleDeleteClick = () => {
        setActionType('DELETE_ACCOUNT');
        setIsModalOpen(true);
    };

    
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
            closeModal();
        }
    };

    
    const performDeleteAccount = async () => {
        try {
            await dispatch(removeAccount()); 
            
            message.success("Hesabınız başarıyla silindi. Giriş sayfasına yönlendiriliyorsunuz...");
            
            
            localStorage.removeItem('token');
            dispatch(logout()); 

            setTimeout(() => {
                navigate('/login'); 
            }, 1500);

        } catch (error) {
            message.error(error.response?.data?.message || "Hesap silinirken bir hata oluştu.");
            console.error(error);
        } finally {
            closeModal();
        }
    };

    
    const handleVerifyAndSave = async () => {
        if (!tcInput) {
            message.warning("Lütfen TC Kimlik Numaranızı girin.");
            return;
        }

        setVerifying(true);
        try {
            
            await userService.verifyIdentity(tcInput); 
            
            
            if (actionType === 'EMAIL_UPDATE') {
                message.loading({ content: "Kimlik doğrulandı, profil güncelleniyor...", key: 'process' });
                await performUpdate(pendingValues);
                message.success({ content: "Güncelleme tamamlandı!", key: 'process' });
            } 
            else if (actionType === 'DELETE_ACCOUNT') {
                message.loading({ content: "Kimlik doğrulandı, hesap siliniyor...", key: 'process' });
                await performDeleteAccount();
            }

        } catch (error) {
            message.error(error.response?.data?.message || "Kimlik doğrulanamadı, işlem iptal edildi.");
        } finally {
            setVerifying(false);
        }
    };

    
    const closeModal = () => {
        setIsModalOpen(false);
        setPendingValues(null);
        setTcInput("");
        setActionType(null);
    };

    
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
        <div className="max-w-4xl mx-auto min-h-screen pb-10">
            <Title level={3} className="mb-6">
                <UserOutlined className="mr-2" />
                Profil Ayarları
            </Title>

            <Card className="mb-6 shadow-sm">
                {/* --- AVATAR VE İSİM --- */}
                <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                    <Avatar size={100} icon={<UserOutlined />} src={avatarUrl} />
                    <div className="text-center md:text-left">
                        <Title level={4} className="!mb-1">{user?.name}</Title>
                        <Text type="secondary">{user?.email}</Text>
                        <div className="mt-3">
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

                {/* --- PROFİL FORMU --- */}
                <Form
                    form={profileForm}
                    layout="vertical"
                    onFinish={onFinish}
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
                        <Button
                            type="primary"
                            htmlType="submit"
                            icon={<SaveOutlined />}
                            
                            loading={loading && actionType !== 'DELETE_ACCOUNT'} 
                            size="large"
                        >
                            Değişiklikleri Kaydet
                        </Button>
                    </Form.Item>
                </Form>

                {/* --- TEHLİKELİ BÖLGE (HESAP SİLME) --- */}
                <Divider style={{ borderColor: '#ffccc7', marginTop: '40px' }} dashed />
                
                <div className="bg-red-50 p-6 rounded-lg border border-red-100 mt-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <Title level={5} type="danger" className="!mb-1">
                                <ExclamationCircleOutlined className="mr-2"/> 
                                Hesabı Sil
                            </Title>
                            <Text className="text-gray-600 text-sm">
                                Hesabınızı sildiğinizde tüm verileriniz kalıcı olarak silinir. 
                                <br />Bu işlem geri alınamaz.
                            </Text>
                        </div>
                        <Button 
                            type="primary" 
                            danger 
                            size="large" 
                            icon={<DeleteOutlined />} 
                            onClick={handleDeleteClick}
                        >
                            Hesabımı Sil
                        </Button>
                    </div>
                </div>
            </Card>

            {/* --- ORTAK TC KİMLİK DOĞRULAMA MODALI --- */}
            <Modal
                title={
                    <div className="flex items-center gap-2 text-orange-600">
                        <SafetyCertificateOutlined />
                        <span>Güvenlik Doğrulaması</span>
                    </div>
                }
                open={isModalOpen}
                onOk={handleVerifyAndSave}
                onCancel={closeModal}
                confirmLoading={verifying}
                okText={actionType === 'DELETE_ACCOUNT' ? "Onayla ve Sil" : "Doğrula ve Güncelle"}
                okButtonProps={{ danger: actionType === 'DELETE_ACCOUNT' }} 
                cancelText="İptal"
            >
                {actionType === 'DELETE_ACCOUNT' ? (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded text-sm">
                        <b>DİKKAT:</b> Hesabınızı silmek üzeresiniz. Bu işlem geri alınamaz! 
                        İşlemi onaylamak için lütfen <b>TC Kimlik Numaranızı</b> girin.
                    </div>
                ) : (
                    <p className="mb-4 text-gray-700">
                        E-posta adresinizi değiştirmek üzeresiniz. Güvenliğiniz için lütfen 
                        <b> TC Kimlik Numaranızı</b> girerek işlemi onaylayın.
                    </p>
                )}
                
                <Input
                    placeholder="TC Kimlik Numaranız"
                    maxLength={11}
                    value={tcInput}
                    onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setTcInput(val);
                    }}
                    prefix={<UserOutlined />}
                    size="large"
                    className="mt-2"
                />
            </Modal>
        </div>
    );
};

export default ProfileSettings;