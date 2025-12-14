import React from 'react';
import { Link } from 'react-router-dom';
import { Result, Button } from 'antd'; 


const PaymentSuccess = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Result
        status="success"
        title="Ödeme Başarıyla Tamamlandı!"
        subTitle="Randevunuz onaylanmıştır. Randevu detaylarını profilinizden görebilirsiniz."
        extra={[
          <Link to="/" key="home">
            <Button type="primary">Ana Sayfaya Dön</Button>
          </Link>,
          <Link to="/appointments" key="appointments">
            <Button>Randevularım</Button>
          </Link>,
        ]}
      />
    </div>
  );
};

export default PaymentSuccess;