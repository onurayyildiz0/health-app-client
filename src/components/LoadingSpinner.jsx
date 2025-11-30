import { Spin } from 'antd';

/**
 * LOADING SPINNER
 * 
 * Global loading durumlarında kullanılır
 * Tüm ekranı kaplar, arkayı blur yapar
 */

const LoadingSpinner = ({ tip = 'Yükleniyor...' }) => {
    return (
        <div className='fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50'>
            <Spin size="large" tip={tip} fullscreen />
        </div>
    );
};

export default LoadingSpinner;