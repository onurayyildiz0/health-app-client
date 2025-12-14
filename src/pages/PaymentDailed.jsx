import React from 'react';
import { Link } from 'react-router-dom';
import { Result, Button } from 'antd';

const PaymentFailed = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Result
        status="error"
        title="Ödeme Başarısız Oldu"
        subTitle="İşleminiz sırasında bir hata oluştu. Lütfen tekrar deneyiniz."
        extra={[
          <Link to="/payment" key="retry">
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