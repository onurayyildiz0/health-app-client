import { useState, useEffect } from 'react';
import { Card, Button, TimePicker, message, Spin } from 'antd';
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
                console.log("çalışma saatleri :", clocks)
            } catch {
                message.error('Çalışma saatleri yüklenemedi');
            } finally {
                setLoading(false);
            }
        }
        fetchClocks();
    }, []);

    const handleChange = (day, type, value) => {
        setClocks(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                [type]: value ? value.format('HH:mm') : '',
            },
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await axiosInstance.put('/doctors/me/schedule', { clocks });
            message.success('Çalışma saatleri kaydedildi');
        } catch {
            message.error('Kayıt başarısız');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card title="Çalışma Saatlerim" className="max-w-xl mx-auto mt-8">
            {loading ? <Spin /> : (
                <div className="space-y-4">
                    {days.map(day => (
                        <div key={day} className="flex items-center gap-4">
                            <span className="w-24">{dayLabels[day]}</span>
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
                            />
                        </div>
                    ))}
                    <Button type="primary" onClick={handleSave} loading={saving} className="mt-4">Kaydet</Button>
                </div>
            )}
        </Card>
    );
}
