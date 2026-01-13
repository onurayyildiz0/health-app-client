import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Result, Button, message, Card } from 'antd';
import { useDispatch } from 'react-redux';
import { fetchMyAppointments } from '../store/slices/appointmentSlice';

const AppointmentSuccess = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    
    const pendingAppointment = localStorage.getItem('pendingAppointment');

    if (!pendingAppointment) {
      message.warning('Randevu bilgisi bulunamadı, ana sayfaya yönlendiriliyorsunuz.');
      navigate('/');
      return;
    }

    setIsValid(true);
    
    localStorage.removeItem('pendingAppointment');
    localStorage.removeItem('doctorData');
    localStorage.removeItem('pendingAppointmentId');
    
    message.success('Randevu başarıyla onaylandı!');
    dispatch(fetchMyAppointments());
  }, [dispatch, navigate]);

  
  if (!isValid) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-lg rounded-3xl shadow-xl border-0 animate-fade-in">
        <Result
          status="success"
          title="Randevunuz Hazır!"
          subTitle="Randevu detaylarınız başarıyla oluşturuldu. E-posta adresinize bilgilendirme gönderilmiştir."
          extra={[
            <Link key="1" to="/dashboard/patient/appointments">
              <Button type="primary" size="large" className="rounded-xl mb-4 bg-green-600 w-full hover:bg-green-500 border-0 shadow-lg shadow-green-200">
                Randevularım
              </Button>
            </Link>,
            <Link key="2" to="/">
              <Button size="large" className="rounded-xl w-full mt-4">
                Ana Sayfa
              </Button>
            </Link>
          ]}
        />
      </Card>
    </div>
  );
};

export default AppointmentSuccess;