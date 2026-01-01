import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Result, Button, Card, message } from 'antd';

const AppointmentFailed = () => {
  const navigate = useNavigate();
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const pendingAppointment = localStorage.getItem('pendingAppointment');

    // Eğer pendingAppointment yoksa ana sayfaya at
    if (!pendingAppointment) {
      message.warning('İşlem bilgisi bulunamadı, ana sayfaya yönlendiriliyorsunuz.');
      navigate('/');
      return;
    }

    setIsValid(true);
    // Hata sayfasından çıkıldığında verileri temizle
    // Not: Kullanıcı "Tekrar Dene" derse formdaki state'ler zaten Formik üzerinde duruyor olabilir
    // veya sıfırdan başlaması gerekebilir. Burada temizlemek en güvenlisidir.
    localStorage.removeItem('pendingAppointment');
    localStorage.removeItem('doctorData');
    localStorage.removeItem('pendingAppointmentId');
  }, [navigate]);

  if (!isValid) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-lg rounded-3xl shadow-xl border-0 animate-fade-in">
        <Result
          status="error"
          title="Bir Sorun Oluştu"
          subTitle="Randevu oluşturulurken beklenmeyen bir hata meydana geldi. Lütfen tekrar deneyiniz."
          extra={[
            <Link key="1" to="/dashboard/patient/create-appointment">
              <Button type="primary" danger size="large" className="rounded-xl w-full mb-3 shadow-lg shadow-red-200">
                Tekrar Dene
              </Button>
            </Link>,
            <Link key="2" to="/">
              <Button size="large" className="rounded-xl w-full">
                Ana Sayfa
              </Button>
            </Link>
          ]}
        />
      </Card>
    </div>
  );
};

export default AppointmentFailed;