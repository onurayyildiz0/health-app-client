import { useState, useEffect } from 'react';
import { 
    Card, Button, TimePicker, message, Spin, 
    Input, InputNumber, Row, Col, Typography 
} from 'antd';
import { 
    EnvironmentOutlined, 
    DollarOutlined, 
    SaveOutlined, 
    ClockCircleOutlined,
    SettingOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import axiosInstance from "../api/axios";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const days = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
];

const dayLabels = {
    monday: 'Pazartesi',
    tuesday: 'Salı',
    wednesday: 'Çarşamba',
    thursday: 'Perşembe',
    friday: 'Cuma',
    saturday: 'Cumartesi',
    sunday: 'Pazar',
};

// Başlangıçta boş saatler şablonu
const emptyClocks = days.reduce((acc, day) => {
    acc[day] = { start: null, end: null };
    return acc;
}, {});

export default function DoctorScheduleSettings() {
    // State Tanımları
    const [clocks, setClocks] = useState(emptyClocks);
    const [location, setLocation] = useState('');
    const [consultationFee, setConsultationFee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // 1. Verileri Yükle (GET /api/doctors/me)
    useEffect(() => {
        async function fetchProfile() {
            try {
                setLoading(true);
                const res = await axiosInstance.get('/doctors/me');
                
                const apiResponse = res.data;
                const doctorData = apiResponse.data;

                if (!doctorData) {
                    throw new Error("Veri formatı hatalı");
                }

                // --- Lokasyon ---
                setLocation(doctorData.location || '');

                // --- Ücret ---
                if (doctorData.consultationFee !== undefined && doctorData.consultationFee !== null) {
                    setConsultationFee(doctorData.consultationFee);
                }

                // --- Saatler ---
                if (doctorData.clocks) {
                    let parsedClocks = doctorData.clocks;

                    if (typeof parsedClocks === 'string') {
                        try {
                            parsedClocks = JSON.parse(parsedClocks);
                        } catch (e) {
                            console.error("Saat verisi parse edilemedi:", e);
                            parsedClocks = {};
                        }
                    }
                    setClocks(prev => ({ ...emptyClocks, ...parsedClocks }));
                } else {
                    setClocks(emptyClocks);
                }

            } catch (error) {
                console.error("Profil yüklenirken hata:", error);
                message.error('Profil bilgileri yüklenemedi.');
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, []);

    // 2. Saat Değişimi (TimePicker Event)
    const handleClockChange = (day, type, timeObj) => {
        const timeString = timeObj ? timeObj.format('HH:mm') : null;

        setClocks(prev => {
            const newClocks = { ...prev };
            
            if (!newClocks[day]) newClocks[day] = { start: null, end: null };

            // 1. Yeni değeri ata
            newClocks[day] = {
                ...newClocks[day],
                [type]: timeString
            };

            // 2. Başlangıç saati değiştiğinde senaryolar
            if (type === 'start' && timeObj) {
                const startMinute = timeObj.minute();

                // Senaryo A: Bitiş saati henüz yoksa, otomatik +1 saat ekle (aynı dakikayla)
                if (!newClocks[day].end) {
                    newClocks[day].end = timeObj.add(1, 'hour').format('HH:mm');
                } 
                // Senaryo B: Bitiş saati zaten varsa, onun dakikasını başlangıç dakikasına eşitle (Senkronizasyon)
                else {
                    const currentEnd = dayjs(newClocks[day].end, 'HH:mm');
                    // Saati koru, dakikayı başlangıca eşitle
                    const syncedEnd = currentEnd.minute(startMinute);
                    newClocks[day].end = syncedEnd.format('HH:mm');
                }
            }

            // 3. Başlangıç silinirse bitişi de sil
            if (type === 'start' && !timeString) {
                newClocks[day].end = null;
            }

            return newClocks;
        });
    };

    // 3. Kaydetme İşlemi (PUT /api/doctors/me/schedule)
    const handleSave = async () => {
        try {
            setSaving(true);
            
            const payload = {
                clocks: clocks,
                location: location,
                consultationFee: consultationFee
            };

            await axiosInstance.put('/doctors/me/schedule', payload);
            message.success('Çalışma ayarları başarıyla güncellendi');
        } catch (error) {
            console.error(error);
            message.error('Kaydetme işlemi başarısız oldu');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Spin size="large" tip="Profil bilgileri yükleniyor..." />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <Title level={2} className="!mb-1 !text-2xl md:!text-3xl text-gray-800">
                        <SettingOutlined className="mr-3 text-blue-600" />
                        Çalışma Ayarları
                    </Title>
                    <Text type="secondary" className="text-base">
                        Muayenehane bilgilerinizi ve haftalık çalışma planınızı buradan yönetebilirsiniz.
                    </Text>
                </div>
                <Button 
                    type="primary" 
                    size="large" 
                    icon={<SaveOutlined />} 
                    loading={saving}
                    onClick={handleSave}
                    className="shadow-md min-w-[140px] bg-blue-600 hover:bg-blue-500"
                >
                    Değişiklikleri Kaydet
                </Button>
            </div>

            <Row gutter={[24, 24]}>
                {/* SOL KOLON */}
                <Col xs={24} lg={10} xl={8}>
                    <Card 
                        title={<span className="text-lg font-semibold"><InfoCircleOutlined className="mr-2 text-blue-500"/>Genel Bilgiler</span>}
                        className="shadow-md rounded-xl h-full border-t-4 border-t-blue-500"
                    >
                        <div className="space-y-6">
                            {/* Ücret */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Muayene Ücreti (TL)
                                </label>
                                <InputNumber
                                    prefix={<DollarOutlined className="text-gray-400" />}
                                    value={consultationFee}
                                    onChange={setConsultationFee}
                                    style={{ width: '100%' }}
                                    size="large"
                                    placeholder="0.00"
                                    min={0}
                                    step={100}
                                    precision={2}
                                    className="rounded-lg"
                                />
                                <Text type="secondary" className="text-xs mt-1 block">
                                    * Hastalarınız randevu alırken bu ücreti görüntüleyecektir.
                                </Text>
                            </div>

                            {/* Lokasyon */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Klinik / Hastane Adresi
                                </label>
                                <TextArea
                                    prefix={<EnvironmentOutlined />}
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="Örn: Ankara Şehir Hastanesi, Kat 3, No: 302..."
                                    autoSize={{ minRows: 4, maxRows: 6 }}
                                    className="rounded-lg"
                                />
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <Title level={5} className="!text-blue-700 !mb-2 !text-sm">İpucu</Title>
                                <Paragraph className="text-blue-600 text-xs mb-0">
                                    Adresinizi detaylı girmek, hastalarınızın size daha kolay ulaşmasını sağlar. 
                                </Paragraph>
                            </div>
                        </div>
                    </Card>
                </Col>

                {/* SAĞ KOLON: Program */}
                <Col xs={24} lg={14} xl={16}>
                    <Card 
                        title={<span className="text-lg font-semibold"><ClockCircleOutlined className="mr-2 text-green-500"/>Haftalık Çalışma Programı</span>}
                        className="shadow-md rounded-xl border-t-4 border-t-green-500"
                        bodyStyle={{ padding: '0px' }}
                    >
                        <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 grid grid-cols-12 gap-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <div className="col-span-4 md:col-span-3">Gün</div>
                            <div className="col-span-8 md:col-span-9 flex gap-4">
                                <span className="flex-1">Başlangıç</span>
                                <span className="flex-1">Bitiş</span>
                            </div>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {days.map((day) => {
                                // Başlangıç saatini ve dakikasını hesapla
                                const startMoment = clocks[day]?.start ? dayjs(clocks[day].start, 'HH:mm') : null;
                                const startMinute = startMoment ? startMoment.minute() : null;

                                return (
                                    <div key={day} className="px-6 py-4 hover:bg-gray-50 transition-colors grid grid-cols-12 gap-4 items-center group">
                                        <div className="col-span-4 md:col-span-3 font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                                            {dayLabels[day]}
                                        </div>
                                        <div className="col-span-8 md:col-span-9 flex flex-col sm:flex-row gap-3">
                                            <TimePicker 
                                                format="HH:mm"
                                                placeholder="Başlangıç"
                                                value={startMoment}
                                                onChange={(val) => handleClockChange(day, 'start', val)}
                                                className="flex-1"
                                                minuteStep={15}
                                                showNow={false}
                                            />
                                            <span className="hidden sm:block text-gray-400 self-center">-</span>
                                            
                                            {/* Bitiş TimePicker */}
                                            <TimePicker 
                                                format="HH:mm"
                                                placeholder="Bitiş"
                                                value={clocks[day]?.end ? dayjs(clocks[day].end, 'HH:mm') : null}
                                                onChange={(val) => handleClockChange(day, 'end', val)}
                                                className="flex-1"
                                                showNow={false}
                                                disabled={!clocks[day]?.start}
                                                minuteStep={15}
                                                // ----------------------------------------------------------------
                                                // DÜZELTME: disabledMinutes ile seçilen dakika dışındakileri engelle
                                                // ----------------------------------------------------------------
                                                disabledMinutes={() => {
                                                    // Eğer başlangıç seçilmediyse boş dön
                                                    if (startMinute === null) return [];
                                                    
                                                    // 0'dan 59'a kadar tüm dakikaları içeren bir dizi oluştur
                                                    const allMinutes = [...Array(60).keys()];
                                                    
                                                    // Sadece başlangıç dakikası (startMinute) hariç hepsini devre dışı bırak
                                                    return allMinutes.filter(m => m !== startMinute);
                                                }}
                                                // Kullanıcıya ipucu vermek için (mouse ile üzerine gelince)
                                                title={startMinute !== null ? `Sadece :${startMinute.toString().padStart(2, '0')} seçilebilir` : ''}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}