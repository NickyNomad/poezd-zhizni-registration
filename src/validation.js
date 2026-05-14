export const EMPTY_FORM = {
  fullName: "",
  position: "",
  organization: "",
  email: "",
  phone: "",
  consent: false,
};

export function validateRegistrationForm(data) {
  const errors = {};

  if (!data.fullName.trim()) errors.fullName = "Укажите ФИО";
  if (!data.position.trim()) errors.position = "Укажите должность";
  if (!data.organization.trim()) errors.organization = "Укажите организацию";

  if (!data.email.trim()) {
    errors.email = "Укажите электронную почту";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.email = "Проверьте формат электронной почты";
  }

  if (!data.phone.trim()) {
    errors.phone = "Укажите телефон";
  } else if (data.phone.replace(/\D/g, "").length < 10) {
    errors.phone = "Проверьте номер телефона";
  }

  if (!data.consent) errors.consent = "Нужно согласие на обработку персональных данных";

  return errors;
}
