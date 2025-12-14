import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Spin, message, Card, Typography, Button } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import axios from 'axios';
import axiosInstance from '../api/axios';

const { Title, Text } = Typography;

const PaymentPage = () => {
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [appointment, setAppointment] = useState(null);
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

          <Button 
            type="primary"
            size="large"
            onClick={handlePayment} 
            disabled={loading}
            loading={loading}
            block
          >
            {loading ? 'Yükleniyor...' : 'Ödeme Yap'}
          </Button>
        </Card>
      ) : (
        // Iyzico Formunun Yerleşeceği Alan
        <div id="iyzipay-checkout-form" className="responsive"></div>
      )}
    </div>
  );
};

export default PaymentPage;