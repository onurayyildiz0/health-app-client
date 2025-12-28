import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Result, Button, message } from 'antd';
import { useDispatch } from 'react-redux';
import { fetchMyAppointments } from '../store/slices/appointmentSlice';

const PaymentSuccess = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    localStorage.removeItem('pendingAppointment');
    localStorage.removeItem('doctorData');
    localStorage.removeItem('pendingAppointmentId');

    message.success('Randevunuz başarıyla oluşturuldu!');
    dispatch(fetchMyAppointments());
  }, [dispatch]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', height: '100vh' }}>
      <Result
        status="success"
        title="Ödeme Başarıyla Tamamlandı"
        subTitle="Randevunuz onaylandı."
        extra={[
          <Link to="/dashboard/patient/appointments" key="appointments">
            <Button type="primary">Randevularım</Button>
          </Link>,
          <Link to="/" key="home">
            <Button>Ana Sayfa</Button>
          </Link>,
        ]}
      />
    </div>
  );
};

export default PaymentSuccess;
