import { useState, useEffect } from 'react';
import { Card, Button, TimePicker, message, Spin, Input, InputNumber } from 'antd';
import { EnvironmentOutlined, DollarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import axiosInstance from "../api/axios";

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

const defaultClocks = days.reduce((acc, day) => {
    acc[day] = { start: '08:00', end: '17:00' };
    return acc;
}, {});

export default function DoctorScheduleSettings() {
    const [clocks, setClocks] = useState(defaultClocks);
    const [location, setLocation] = useState('');
    const [consultationFee, setConsultationFee] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function fetchClocks() {
            try {
                setLoading(true);
                const res = await axiosInstance.get('/doctors/me');
                // Eğer clocks yoksa veya boşsa defaultClocks kullan
                if (res.data.clocks && Object.keys(res.data.clocks).length > 0) {
                    setClocks(res.data.clocks);
                } else {
                    setClocks(defaultClocks);
                }
                // Location bilgisini de set et
                if (res.data.location) {
                    setLocation(res.data.location);
                }
                // ConsultationFee bilgisini de set et
                if (res.data.consultationFee !== undefined) {
                    setConsultationFee(res.data.consultationFee);
                }
            } catch {
                message.error('Çalışma saatleri yüklenemedi');
            } finally {
                setLoading(false);
            }
        }
        fetchClocks();
    }, []);

    const handleChange = (day, type, value) => {
        if (type === 'start' && value) {
            // Başlangıç değişince bitişi otomatik 1 saat sonra ayarla
            const startTime = dayjs(value);
            const endTime = startTime.add(1, 'hour');
            setClocks(prev => ({
                ...prev,
                [day]: {
                    start: value.format('HH:mm'),
                    end: endTime.format('HH:mm'),
                },
            }));
        } else {
            setClocks(prev => ({
                ...prev,
                [day]: {
                    ...prev[day],
                    [type]: value ? value.format('HH:mm') : '',
                },
            }));
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await axiosInstance.put('/doctors/me/schedule', { clocks, location, consultationFee });
            message.success('Çalışma saatleri, lokasyon ve muayene ücreti kaydedildi');
        } catch {
            message.error('Kayıt başarısız');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card title="Çalışma Saatlerim ve Lokasyon" className="max-w-xl mx-auto mt-8">
            {loading ? <Spin /> : (
                <div className="space-y-4">
                    {/* Muayene Ücreti Input */}
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <DollarOutlined className="mr-2" />
                            Saat Başı Muayene Ücreti (TL)
                        </label>
                        <InputNumber
                            value={consultationFee}
                            onChange={setConsultationFee}
                            min={0}
                            step={50}
                            size="large"
                            placeholder="Ücret"
                            style={{ width: '100%' }}
                            formatter={value => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/₺\s?|(,*)/g, '')}
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            Hastalarınızın randevu alırken ödeyeceği saat başı muayene ücretinizi belirleyin
                        </p>
                    </div>

                    {/* Lokasyon Input */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <EnvironmentOutlined className="mr-2" />
                            Muayenehane/Hastane Lokasyonu
                        </label>
                        <Input
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Örn: Ankara, Çankaya, Kızılay Mahallesi..."
                            size="large"
                            prefix={<EnvironmentOutlined />}
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            Hastalarınızın sizi kolayca bulabilmesi için muayenehanenizin veya çalıştığınız hastanenin adresini girin
                        </p>
                    </div>

                    {/* Çalışma Saatleri */}
                    <div className="border-t pt-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Haftalık Çalışma Saatleri</h4>
                        {days.map(day => (
                            <div key={day} className="flex items-center gap-4 mb-3">
                                <span className="w-24 text-sm">{dayLabels[day]}</span>
                                <TimePicker
                                    value={clocks[day].start ? dayjs(clocks[day].start, 'HH:mm') : null}
                                    onChange={v => handleChange(day, 'start', v)}
                                    format="HH:mm"
                                    minuteStep={15}
                                    placeholder="Başlangıç"
                                />
                                <span>-</span>
                                <TimePicker
                                    value={clocks[day].end ? dayjs(clocks[day].end, 'HH:mm') : null}
                                    onChange={v => handleChange(day, 'end', v)}
                                    format="HH:mm"
                                    minuteStep={15}
                                    placeholder="Bitiş"
                                    disabledTime={() => ({
                                        disabledMinutes: () => {
                                            if (!clocks[day].start) return [];
                                            const startMinute = parseInt(clocks[day].start.split(':')[1]);
                                            return Array.from({length: 60}, (_, i) => i).filter(min => min !== startMinute);
                                        }
                                    })}
                                />
                            </div>
                        ))}
                    </div>
                    
                    <Button type="primary" onClick={handleSave} loading={saving} className="mt-4 w-full" size="large">
                        Kaydet
                    </Button>
                </div>
            )}
        </Card>
    );
}
