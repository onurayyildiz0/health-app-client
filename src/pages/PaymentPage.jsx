import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Spin, message, Card, Typography, Button, Modal } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import axios from 'axios';
import axiosInstance from '../api/axios';

const { Title, Text } = Typography;

const PaymentPage = () => {
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [appointment, setAppointment] = useState(null);
  const [isNewAppointment, setIsNewAppointment] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const appointmentId = searchParams.get('appointmentId');

  // Randevu bilgilerini yükle
  useEffect(() => {
    const fetchAppointment = async () => {
      if (!appointmentId) {
        message.error('Randevu ID bulunamadı');
        navigate('/dashboard/patient/appointments');
        return;
      }

      try {
        setLoading(true);
        const res = await axiosInstance.get(`/appointments/${appointmentId}`);
        setAppointment(res.data);
        
        // Eğer randevu zaten ödenmişse
        if (res.data.paymentStatus === 'completed') {
          message.info('Bu randevu zaten ödenmiş');
          navigate('/dashboard/patient/appointments');
        }

        // Yeni oluşturulan randevu mu kontrol et
        const pendingId = localStorage.getItem('pendingAppointmentId');
        setIsNewAppointment(pendingId === appointmentId);
      } catch  {
        message.error('Randevu bilgileri yüklenemedi');
        navigate('/dashboard/patient/appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [appointmentId, navigate]);

  const handlePayment = async () => {
    if (!appointment) return;
    
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:3000/api/payment/start', {
        appointmentId: appointment._id
      });

      if (res.data.status === 'success') {
        setHtmlContent(res.data.checkoutFormContent);
      } else {
        message.error(res.data.errorMessage || 'Ödeme başlatılamadı');
      }
    } catch {
      message.error('Sunucu hatası');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPayment = async () => {
    if (!appointment) return;

    Modal.confirm({
      title: 'Ödemeyi İptal Et',
      content: isNewAppointment 
        ? 'Ödemeyi iptal ederseniz randevu "Ödeme Bekleniyor" durumunda kalacak. Daha sonra tekrar ödeme yapabilirsiniz. Devam etmek istiyor musunuz?'
        : 'Ödemeyi iptal etmek istediğinizden emin misiniz? Randevu iptal edilecektir.',
      okText: 'Evet, İptal Et',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: async () => {
        try {
          setCancelling(true);
          if (isNewAppointment) {
            // Yeni randevu için sadece geri dön, status zaten pending_payment
            message.info('Ödeme iptal edildi. Randevu "Ödeme Bekleniyor" durumunda kaldı.');
          } else {
            // Var olan randevu için iptal et
            await axiosInstance.patch(`/appointments/${appointment._id}/cancel`);
            message.success('Randevu başarıyla iptal edildi');
          }
          
          // localStorage temizle
          localStorage.removeItem('pendingAppointmentId');
          localStorage.removeItem('pendingAppointment');
          localStorage.removeItem('doctorData');
          
          navigate('/dashboard/patient/appointments');
        } catch (err) {
          message.error('İşlem sırasında hata oluştu');
        } finally {
          setCancelling(false);
        }
      },
    });
  };

  useEffect(() => {
    if (htmlContent) {
      const scriptRegex = /<script type="text\/javascript">([\s\S]*?)<\/script>/;
      const match = htmlContent.match(scriptRegex);
      
      if (match && match[1]) {
        try {
          // eslint-disable-next-line no-eval
          window.eval(match[1]); 
        } catch (error) {
          console.error("Script error:", error);
        }
      }
    }
  }, [htmlContent]);

  if (loading && !appointment) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} tip="Randevu bilgileri yükleniyor..." />
      </div>
    );
  }

  return (
    <div style={{ padding: '50px', maxWidth: '800px', margin: '0 auto' }}>
      {!htmlContent ? (
        <Card>
          <Title level={2}>Ödeme Ekranı</Title>
          
          {appointment && (
            <div style={{ marginBottom: '30px' }}>
              <Text strong>Doktor: </Text>
              <Text>{appointment.doctor?.user?.name || 'Yükleniyor...'}</Text>
              <br />
              <Text strong>Randevu Tarihi: </Text>
              <Text>{new Date(appointment.date).toLocaleDateString('tr-TR')}</Text>
              <br />
              <Text strong>Saat: </Text>
              <Text>{appointment.start}</Text>
              <br />
              <Text strong style={{ fontSize: '18px', color: '#1890ff' }}>Tutar: </Text>
              <Text strong style={{ fontSize: '18px', color: '#1890ff' }}>
                ₺{appointment.price || 0}
              </Text>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <Button 
              type="primary"
              size="large"
              onClick={handlePayment} 
              disabled={loading}
              loading={loading}
            >
              {loading ? 'Yükleniyor...' : 'Ödeme Yap'}
            </Button>
            <Button 
              size="large"
              danger
              onClick={handleCancelPayment}
              loading={cancelling}
              disabled={loading}
            >
              {cancelling ? 'İptal Ediliyor...' : 'İptal Et'}
            </Button>
          </div>
        </Card>
      ) : (
        // Iyzico Formunun Yerleşeceği Alan
        <div id="iyzipay-checkout-form" className="responsive"></div>
      )}
    </div>
  );
};

export default PaymentPage;