# Sağlık ve Randevu Yönetim Sistemi - Frontend

## React & Node.js Bitirme Projesi

**Geliştirici:** İsmail Onur Ayyıldız

---

## Proje Tanımı

Bu proje, Sağlık ve Randevu Yönetim Sistemi'nin kullanıcı arayüzü (Client) tarafıdır. React ve Vite kullanılarak geliştirilmiş modern, hızlı ve responsive bir arayüz sunar.
Hastalar, Doktorlar ve Yöneticiler (Admin) için özelleştirilmiş paneller (Dashboard) içerir. Backend API ile haberleşerek randevu alma, doktor onayı, profil yönetimi ve değerlendirme işlemlerini gerçekleştirir.

---

## Kullanılan Teknolojiler

- **Core:** React.js, Vite
- **State Yönetimi:** Redux Toolkit
- **UI Kütüphanesi:** Ant Design (Antd)
- **Styling:** Tailwind CSS
- **Routing:** React Router DOM
- **HTTP İstemcisi:** Axios
- **Tarih/Saat Yönetimi:** Day.js
- **İkon Seti:** Ant Design Icons

---

## Özellikler

### 🏥 Hasta Paneli (Patient)
- **Randevu Yönetimi:** Uygun doktorları arama, randevu oluşturma, yaklaşan randevuları görüntüleme ve iptal etme.
- **Doktor Filtreleme:** Branşa, isme veya minimum puana göre doktor arama.
- **Favoriler:** Beğenilen doktorları favorilere ekleme/çıkarma.
- **Değerlendirme:** Geçmiş randevular için doktora puan verme ve yorum yapma.
- **Profil:** Kişisel sağlık bilgilerini ve hesap ayarlarını güncelleme.

### 👨‍⚕️ Doktor Paneli (Doctor)
- **Dashboard:** Günlük randevu özeti, toplam hasta sayısı ve puan durumu.
- **Takvim Yönetimi:** Çalışma saatlerini ve günlerini belirleme.
- **Randevu Takibi:** Gelen randevu taleplerini görüntüleme ve yönetme.
- **Profil Yönetimi:** Uzmanlık alanı, biyografi ve hastane bilgilerini düzenleme.

### 🛡️ Admin Paneli
- **Kullanıcı Yönetimi:** Sistemdeki tüm kullanıcıları listeleme ve silme.
- **Doktor Onayı:** Sisteme kayıt olan doktorların belgelerini inceleyip onaylama veya reddetme.
- **Sistem İzleme:** Genel istatistikleri görüntüleme.

### 🔐 Genel Özellikler
- **Auth:** JWT tabanlı güvenli giriş ve kayıt (Login/Register).
- **Responsive Tasarım:** Mobil ve masaüstü uyumlu arayüz.
- **Bildirimler:** İşlem sonuçları için kullanıcı dostu bildirimler (Toast messages).

---

## Kurulum ve Çalıştırma

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyin.

1. **Projeyi Klonlayın:**
   ```bash
   git clone <repo-url>
   cd health-app-client

2. **Bağımlılıkları Yükleyin:**
    npm install

3. **Çevre Değişkenlerini Ayarlayın:**
    VITE_API_URL=http://localhost:3000/api


4. **Projeyi Başlatın:**
    npm run dev