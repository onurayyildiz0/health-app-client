import { useState, useEffect } from 'react';
import {
    Card,
    Form,
    Input,
    Button,
    Avatar,
    Upload,
    message,
    Divider,
    Typography,
    Space,
    Modal
} from 'antd';
import {
    UserOutlined,
    MailOutlined,
    LockOutlined,
    UploadOutlined,
    SaveOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import {
    updateProfileStart,
    updateProfileSuccess,
    updateProfileFailure,
    selectUserLoading,
    selectUserSuccessMessage
} from '../../store/slices/userSlice';
import { selectUser, loginSuccess } from '../../store/slices/authSlice';
import * as userService from '../../api/userService';

const { Title, Text } = Typography;

const ProfileSettings = () => {
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const loading = useSelector(selectUserLoading);
    const successMessage = useSelector(selectUserSuccessMessage);

    const [profileForm] = Form.useForm();
    const [avatarUrl, setAvatarUrl] = useState(user?.avatar);

    // Form'u kullanıcı bilgileri ile doldur
    useEffect(() => {
        if (user) {
            profileForm.setFieldsValue({
                name: user.name,
                email: user.email
            });
            // Sadece user.avatar tanımlıysa güncelle (undefined olmasın)
            if (user.avatar !== undefined) {
                setAvatarUrl(user.avatar);
            }
        }
    }, [user, profileForm]);

    // Başarı mesajını göster
    useEffect(() => {
        if (successMessage) {
            message.success(successMessage);
        }
    }, [successMessage]);

    // Profil güncelle
    const handleUpdateProfile = async (values) => {
        try {
            dispatch(updateProfileStart());
            const response = await userService.updateProfile({
                name: values.name,
                avatar: avatarUrl
            });

            // Backend response: { message: "...", user: {...} }
            const userData = response.user || response.data?.user || response.data || response;

            dispatch(updateProfileSuccess(userData));

            // Auth state'i de güncelle
            dispatch(loginSuccess({
                user: userData,
                token: localStorage.getItem('token')
            }));

            // Avatar state'ini güncelle
            setAvatarUrl(userData.avatar);

            message.success('Profil güncellendi! Sayfa yenileniyor...');

            // localStorage'ın güncellenmesini bekle ve sayfayı yenile
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (err) {
            dispatch(updateProfileFailure(err.message));
            message.error(err.message || 'Profil güncellenemedi');
        }
    };

    // Avatar yükleme - local preview (backend endpoint yok)
    const handleAvatarChange = (info) => {
        const file = info.file.originFileObj || info.file;

        if (file) {
            // Dosya tipi kontrolü
            const isImage = file.type?.startsWith('image/');
            if (!isImage) {
                message.error('Sadece resim dosyaları yükleyebilirsiniz!');
                return;
            }

            // Dosya boyutu kontrolü (2MB)
            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isLt2M) {
                message.error('Resim boyutu 2MB\'dan küçük olmalıdır!');
                return;
            }

            // Local preview için FileReader kullan
            const reader = new FileReader();
            reader.onload = (e) => {
                setAvatarUrl(e.target.result);
                message.success('Avatar önizlemesi yüklendi (kaydetmek için profili güncelleyin)');
            };
            reader.readAsDataURL(file);
        }
    };

    // beforeUpload - dosya yüklemeden önce kontrol
    const beforeUpload = (file) => {
        const isImage = file.type?.startsWith('image/');
        if (!isImage) {
            message.error('Sadece resim dosyaları yükleyebilirsiniz!');
            return false;
        }

        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Resim boyutu 2MB\'dan küçük olmalıdır!');
            return false;
        }

        return false; // Otomatik upload'u engelle
    };

    return (
        <div className="max-w-4xl mx-auto min-h-screen">
            <Title level={3} className="mb-6">
                <UserOutlined className="mr-2" />
                Profil Ayarları
            </Title>

            {/* Profil Bilgileri */}
            <Card className="mb-6">
                <div className="flex items-center gap-6 mb-6">
                    <Avatar
                        size={100}
                        icon={<UserOutlined />}
                        src={avatarUrl}
                    />
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
                                <Button icon={<UploadOutlined />}>
                                    Avatar Değiştir
                                </Button>
                            </Upload>
                        </div>
                    </div>
                </div>

                <Divider />

                <Form
                    form={profileForm}
                    layout="vertical"
                    onFinish={handleUpdateProfile}
                >
                    <Form.Item
                        label="Ad Soyad"
                        name="name"
                        rules={[
                            { required: true, message: 'Lütfen adınızı girin' },
                            { min: 2, message: 'En az 2 karakter olmalı' }
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="Ad Soyad"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        label="E-posta"
                        name="email"
                    >
                        <Input
                            prefix={<MailOutlined />}
                            placeholder="E-posta"
                            size="large"
                            disabled
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
                                Kaydet
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default ProfileSettings;
