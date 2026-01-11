import { useState, useEffect } from 'react';
import { Card, Button, TimePicker, message, Spin, Input, InputNumber, Row, Col, Typography } from 'antd';
import { EnvironmentOutlined, DollarOutlined, SaveOutlined, ClockCircleOutlined, SettingOutlined, InfoCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useDispatch, useSelector } from 'react-redux';
import { 
    fetchMyDoctorProfile, 
    updateDoctorSchedule, 
    selectCurrentDoctorProfile, 
    selectDoctorLoading 
} from '../store/slices/doctorSlice';

const { Title, Text } = Typography;

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const dayLabels = { monday: 'Pazartesi', tuesday: 'Salı', wednesday: 'Çarşamba', thursday: 'Perşembe', friday: 'Cuma', saturday: 'Cumartesi', sunday: 'Pazar' };
const emptyClocks = days.reduce((acc, day) => { acc[day] = { start: null, end: null }; return acc; }, {});

export default function DoctorScheduleSettings() {
    const dispatch = useDispatch();
    
    // Redux
    const profile = useSelector(selectCurrentDoctorProfile);
    const loading = useSelector(selectDoctorLoading);

    const [clocks, setClocks] = useState(emptyClocks);
    const [consultationFee, setConsultationFee] = useState(null);
    const [saving, setSaving] = useState(false);

    // 1. Profil Yükle
    useEffect(() => {
        // Eğer profile zaten varsa tekrar çekmeye gerek yok, ama garanti olsun diye çekiyoruz
        dispatch(fetchMyDoctorProfile());
    }, [dispatch]);

    // 2. Profile Değişince State Güncelle
    useEffect(() => {
        if (profile) {
            setConsultationFee(profile.consultationFee);
            if (profile.clocks) {
                let parsed = profile.clocks;
                if (typeof parsed === 'string') {
                    try { parsed = JSON.parse(parsed); } catch { parsed = {}; }
                }
                setClocks({ ...emptyClocks, ...parsed });
            } else {
                setClocks(emptyClocks);
            }
        }
    }, [profile]);

    const handleClockChange = (day, type, timeObj) => {
        const timeString = timeObj ? timeObj.format('HH:mm') : null;
        setClocks(prev => {
            const next = { ...prev };
            if (!next[day]) next[day] = { start: null, end: null };
            next[day] = { ...next[day], [type]: timeString };
            
            if (type === 'start' && timeObj) {
                // Başlangıç değişince bitişi otomatik ayarla veya senkronize et
                const startMinute = timeObj.minute();
                if (!next[day].end) {
                    next[day].end = timeObj.add(1, 'hour').format('HH:mm');
                } else {
                    const currentEnd = dayjs(next[day].end, 'HH:mm');
                    next[day].end = currentEnd.minute(startMinute).format('HH:mm');
                }
            }
            if (type === 'start' && !timeString) next[day].end = null;
            return next;
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await dispatch(updateDoctorSchedule({ clocks, consultationFee }));
            message.success('Ayarlar güncellendi');
        } catch {
            message.error('Hata oluştu');
        } finally {
            setSaving(false);
        }
    };

    if (loading && !profile) return <div className="flex justify-center items-center min-h-[400px]"><Spin size="large" /></div>;

    return (
        <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
            <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
                <div><Title level={2}>Çalışma Ayarları</Title><Text type="secondary">Muayenehane bilgileri ve haftalık plan</Text></div>
                <Button type="primary" size="large" icon={<SaveOutlined />} loading={saving} onClick={handleSave}>Kaydet</Button>
            </div>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={8}>
                    <Card title="Genel Bilgiler" className="shadow-md rounded-xl">
                        <label className="block mb-2">Muayene Ücreti (TL)</label>
                        <InputNumber placeholder='0.00' prefix={<DollarOutlined />} value={consultationFee} onChange={setConsultationFee} style={{ width: '100%' }} size="large" min={0} step={100} />
                    </Card>
                </Col>
                <Col xs={24} lg={16}>
                    <Card title="Haftalık Program" className="shadow-md rounded-xl" bodyStyle={{ padding: 0 }}>
                        <div className="bg-gray-50 px-6 py-3 border-b grid grid-cols-12 gap-4 font-bold text-gray-500"><div className="col-span-3">Gün</div><div className="col-span-9 flex gap-4"><span className="flex-1">Başlangıç</span><span className="flex-1">Bitiş</span></div></div>
                        <div className="divide-y">
                            {days.map(day => {
                                const startMoment = clocks[day]?.start ? dayjs(clocks[day].start, 'HH:mm') : null;
                                const endMoment = clocks[day]?.end ? dayjs(clocks[day].end, 'HH:mm') : null;
                                const startMinute = startMoment ? startMoment.minute() : null;

                                return (
                                    <div key={day} className="px-6 py-4 grid grid-cols-12 gap-4 items-center">
                                        <div className="col-span-3 font-medium">{dayLabels[day]}</div>
                                        <div className="col-span-9 flex gap-3">
                                            <TimePicker placeholder='00:00' format="HH:mm" value={startMoment} onChange={(v) => handleClockChange(day, 'start', v)} minuteStep={15} showNow={false} className="flex-1" />
                                            <TimePicker placeholder='00:00' format="HH:mm" value={endMoment} onChange={(v) => handleClockChange(day, 'end', v)} minuteStep={15} showNow={false} disabled={!startMoment} className="flex-1" 
                                                disabledMinutes={() => startMinute !== null ? [...Array(60).keys()].filter(m => m !== startMinute) : []} 
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