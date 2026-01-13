import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Home from './pages/Home'
import About from './pages/About'
import NotFound from './pages/NotFound'
import DashboardLayout from './layouts/DashboardLayout'
import PatientDashboard from './layouts/PatientDashboard'
import DoctorDashboard from './layouts/DoctorDashboard'
import AdminDashboard from './layouts/AdminDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import CreateAppointment from './pages/appointments/CreateAppointment'
import MyAppointments from './pages/appointments/MyAppointments'
import DoctorList from './pages/doctors/DoctorList'
import DoctorDetail from './pages/doctors/DoctorDetail'
import Favorites from './pages/patient/Favorites'
import DoctorAppointments from './pages/doctor/DoctorAppointments'
import UserManagement from './pages/admin/UserManagement'
import ProfileSettings from './pages/settings/ProfileSettings';
import Doctors from './pages/doctors/Doctors';
import { useSelector } from 'react-redux';
import { selectAuthLoading } from './store/slices/authSlice';
import LoadingSpinner from './components/LoadingSpinner';
import DoctorScheduleSettings from './components/DoctorScheduleSettings'
import DoctorTimeOff from './components/DoctorTimeOff'
import AppointmentSuccess from './pages/AppointmentSuccess'
import AppointmentFailed from './pages/AppointmentFailed'
import AdminAppointments from './pages/admin/AdminAppointments'
import VerifyEmailChange from './pages/VerifyEmailChange'
import VerifyEmail from './pages/VerifyEmail'
import DoctorInformations from './pages/doctor/DoctorInformations'
import AdminSpeciality from './pages/admin/AdminSpeciality'
import { ConfigProvider } from 'antd';
import trTR from 'antd/locale/tr_TR'; // Ant Design Türkçe dil dosyası


function App() {

  const loading = useSelector(selectAuthLoading);
  return (
    <ConfigProvider locale={trTR}>
      {/* Global Loading Spinner */}
      {loading && <LoadingSpinner tip="İşleminiz gerçekleştiriliyor..." />}

      <Router>
        <Routes>
          <Route index element={<Home />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/register' element={<Register />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route path='/reset-password/:token' element={<ResetPassword />} />
          <Route path='/about' element={<About />} />
          <Route path='/doctors' element={<Doctors />} />
          <Route path='/appointment-success' element={<AppointmentSuccess />} />
          <Route path='/appointment-failed' element={<AppointmentFailed />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/verify-email-change/:token" element={<VerifyEmailChange />} />
          {/* Dashboard Routes */}
          <Route path="/dashboard">
            {/* Patient Dashboard */}
            <Route
              path="patient"
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <DashboardLayout userRole="patient" />
                </ProtectedRoute>
              }
            >
              <Route index element={<PatientDashboard />} />
              <Route path="create-appointment" element={<CreateAppointment />} />
              <Route path="appointments" element={<MyAppointments />} />
              <Route path="favorites" element={<Favorites />} />
              <Route path="doctors" element={<DoctorList />} />
              <Route path="doctors/:id" element={<DoctorDetail />} />
              <Route path="settings" element={<ProfileSettings />} />
            </Route>

            {/* Doctor Dashboard */}
            <Route
              path="doctor"
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <DashboardLayout userRole="doctor" />
                </ProtectedRoute>
              }
            >
              <Route index element={<DoctorDashboard />} />
              <Route path="appointments" element={<DoctorAppointments />} />

              {/* Yeni Route */}
              <Route path="info" element={<DoctorInformations />} />

              <Route path='schedule' element={<DoctorScheduleSettings />} />
              <Route path="settings" element={<ProfileSettings />} />
              <Route path="timeoff" element={<DoctorTimeOff />} />
            </Route>

            {/* Admin Dashboard */}
            <Route
              path="admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout userRole="admin" />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="appointments" element={<AdminAppointments />} />
              <Route path="settings" element={<ProfileSettings />} />
              <Route path="specialities" element={<AdminSpeciality/>} />
            </Route>
          </Route>

          <Route path='*' element={<NotFound />} />
        </Routes>
      </Router>
    </ConfigProvider>
  )
}

export default App