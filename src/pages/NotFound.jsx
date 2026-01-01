import { Button, Typography } from 'antd';
import { HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const NotFound = () => {
    const navigate = useNavigate();
    return (
        <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4 text-center'>
            <div className='max-w-lg'>
                <div className='text-9xl font-black text-gray-200 mb-4 select-none'>404</div>
                <Title level={2} className='!mb-4 !text-gray-800'>Sayfa Bulunamadı</Title>
                <Paragraph className='text-gray-500 text-lg mb-8'>
                    Aradığınız sayfa silinmiş, taşınmış veya hiç var olmamış olabilir.
                </Paragraph>
                <div className='flex gap-4 justify-center'>
                    <Button type="primary" size="large" icon={<HomeOutlined />} onClick={() => navigate('/')} className='rounded-xl h-12 px-6 bg-blue-600 shadow-lg shadow-blue-200'>Ana Sayfa</Button>
                    <Button size="large" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} className='rounded-xl h-12 px-6'>Geri Dön</Button>
                </div>
            </div>
        </div>
    );
};
export default NotFound;