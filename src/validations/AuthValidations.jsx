import * as Yup from 'yup';


export const LoginSchema = Yup.object().shape({
    email: Yup.string()
        .email('Geçersiz e-posta adresi')
        .required('E-posta adresi zorunludur'),
    password: Yup.string()
        .min(6, 'Şifre en az 6karakter olmalıdır')
        .required('Şifre zorunludur')
});

export const RegisterSchema = Yup.object().shape({
    name: Yup.string()
        .min(2, 'İsim en az 2 karakter olmalıdır')
        .max(50, 'İsim en fazla 50 karakter olabilir')
        .required('İsim zorunludur'),
    email: Yup.string()
        .email('Geçersiz e-posta adresi')
        .required('E-posta adresi zorunludur'),
    password: Yup.string()
        .min(6, 'Şifre en az 6 karakter olmalıdır')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir'
        )
        .required('Şifre zorunludur'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Şifreler eşleşmiyor')
        .required('Şifre tekrarı zorunludur'),
    role: Yup.string()
        .oneOf(['patient', 'doctor'], 'Geçerli bir rol seçiniz')
        .required('Rol seçimi zorunludur'),
    speciality: Yup.string().when('role', {
        is: 'doctor',
        then: () => Yup.string().required('Uzmanlık alanı zorunludur'),
        otherwise: () => Yup.string().notRequired()
    })
});