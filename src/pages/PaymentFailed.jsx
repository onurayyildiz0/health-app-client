import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Result, Button } from 'antd';

const PaymentFailed = () => {
  useEffect(() => {
    localStorage.removeItem('pendingAppointment');
    localStorage.removeItem('doctorData');
    localStorage.removeItem('pendingAppointmentId');
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', height: '100vh' }}>
      <Result
        status="error"
        title="Ödeme Başarısız"
        subTitle="İşlem sırasında bir hata oluştu."
        extra={[
          <Link to="/dashboard/patient/create-appointment" key="retry">
            <Button type="primary">Tekrar Dene</Button>
          </Link>,
          <Link to="/" key="home">
            <Button>Ana Sayfa</Button>
          </Link>,
        ]}
      />
    </div>
  );
};

export default PaymentFailed;
