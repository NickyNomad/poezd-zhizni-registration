import React, { useState } from "react";
import { EMPTY_FORM, validateRegistrationForm } from "./validation.js";

const BRAND_ASSETS = {
  logoFull: "/brand/mm-logo-full.jpg",
  logoOutline: "/brand/mm-logo-outline.jpg",
  logoWhite: "/brand/mm-logo-white.png",
  patternLogo: "/brand/mm-pattern-logo.png",
  main: "/brand/mm-main.jpg",
  main2: "/brand/mm-main-2.jpg",
  wave: "/brand/wave-red-1.svg",
  dots: "/brand/dots.svg",
};
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzjIZGaF5_3In15ygykLGTiPM-YfO-r3gEzJLooH8flBqpho4zJetSj8Nux_GGbd_yH/exec";
const EVENT = {
  title: "Финал Городского конкурса профессионального мастерства «Московские мастера» по профессии «Помощник по уходу»",
  subtitle: "Финал конкурса по профессии «Помощник по уходу»",
  date: "26 мая 2026 года",
  shortDate: "26 мая 2026",
  guestArrival: "9:30",
  startTime: "11:00",
  place: "Loft Hall #2",
  address: "Москва, Ленинская слобода, 26 стр. 11",
  coordinates: {
    lat: 55.708592,
    lon: 37.651008,
  },
  mapUrl:
    "https://yandex.ru/maps/213/moscow/house/ulitsa_leninskaya_sloboda_26s11/Z04YcAJhSUUPQFtvfXtxeXlqZg%3D%3D/?ll=37.651008%2C55.708592&z=17",
  routeUrl:
    "https://yandex.ru/maps/213/moscow/?ll=37.651008%2C55.708592&mode=routes&rtext=~55.708592%2C37.651008&rtt=auto&ruri=~&z=17",
  mapEmbedUrl:
    "https://yandex.ru/map-widget/v1/?ll=37.651008%2C55.708592&mode=search&text=%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D0%B0%2C%20%D1%83%D0%BB%D0%B8%D1%86%D0%B0%20%D0%9B%D0%B5%D0%BD%D0%B8%D0%BD%D1%81%D0%BA%D0%B0%D1%8F%20%D0%A1%D0%BB%D0%BE%D0%B1%D0%BE%D0%B4%D0%B0%2C%2026%D1%8111&z=17",
};

const ORGANIZATIONS = [
  "ГБУ Социальный Дом \"Нагатино-Садовники\"",
  "ГБУ Геронтопсихиатрический центр \"Орехово-Борисово\"",
  "ГБУ Социальный дом \"Филимонки\"",
  "ГБУ Геронтологический центр \"Западный\"",
  "ГБУ Социальный дом \"Северное Измайлово\"",
  "ГБУ Геронтологический центр \"Северное Тушино\"",
  "ГБУ Социальный дом \"Чертаново\"",
  "ГБУ Геронтологический центр \"Юго-Западный\"",
  "ГБУ Геронтологический центр \"Люблино\"",
  "ГБУ Социальный дом \"Вешняки\"",
  "ГБУ Социальный дом \"Вешняки\" филиал \"Богородский\"",
  "ГБУ Социальный дом \"Дегунино\"",
  "ГБУ НПГЦ",
  "ГБУ НПГЦ - филиал Социальный дом им. О.В. Кербикова",
  "ГБУ Социальный дом \"Луговой\"",
  "ГБУ Геронтологический центр \"Левобережный\"",
  "ГБУ Социальный дом \"Москворечье\"",
  "ГБУ Социальный дом \"Люблино\"",
  "ГБУ Социальный дом \"Ярославский\"",
  "ГБУ Социальный дом \"Фили-Давыдково\"",
  "ГБУ Социальный дом \"Ступино\"",
  "ГБУ Геронтологический центр «Восточный»",
  "ГБУ Социальный дом \"Лосиноостровский\"",
  "ГБУ Социальный Дом \"Обручевский\"",
  "ГБУ Социальный Дом \"Обручевский\" - филиал Зюзино",
  "ГБУ Социальный Дом \"Обручевский\" - филиал Тропарево",
  "ГБУ Геронтологический центр \"Дмитровский\"",
  "ГКУ Центр социальной адаптации для лиц без определенного места жительства и занятий имени Е. П. Глинки",
  "ГБУ Комплекс социальных жилых домов",
  "ГБУ Научно-практический реабилитационный центр",
  "ГБУ Социальный дом \"Ступино\" Филиал \"Данки\""
 ];

function formatRussianPhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  const normalized = digits.startsWith("8") ? `7${digits.slice(1)}` : digits.startsWith("7") ? digits : `7${digits}`;
  const limited = normalized.slice(0, 11);
  const rest = limited.slice(1);
  const p1 = rest.slice(0, 3);
  const p2 = rest.slice(3, 6);
  const p3 = rest.slice(6, 8);
  const p4 = rest.slice(8, 10);

  let result = "+7";
  if (p1) result += ` ${p1}`;
  if (p2) result += ` ${p2}`;
  if (p3) result += `-${p3}`;
  if (p4) result += `-${p4}`;
  return result;
}

const getRepeatRegistrationForm = ({ email = "", phone = "", organization = "" }) => ({
  ...EMPTY_FORM,
  organization,
  email,
  phone,
  consent: true,
});

export default function App() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [repeatDefaults, setRepeatDefaults] = useState({ email: "", phone: "", organization: "" });

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    const nextValue = type === "checkbox" ? checked : name === "phone" ? formatRussianPhone(value) : value;

    setForm((prev) => ({ ...prev, [name]: nextValue }));
    setErrors((prev) => ({ ...prev, [name]: undefined, submit: undefined }));
  };

  const handleRepeatRegistration = () => {
    setSubmitted(false);
    setErrors({});
    setForm(getRepeatRegistrationForm(repeatDefaults));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateRegistrationForm(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    const payload = {
      fullName: form.fullName.trim(),
      position: form.position.trim(),
      organization: form.organization.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      createdAt: new Date().toISOString(),
      event: EVENT.title,
      source: "Timeweb landing",
    };

    setIsSubmitting(true);

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(payload),
      });

      setRepeatDefaults({
        email: payload.email,
        phone: payload.phone,
        organization: payload.organization,
      });
      setSubmitted(true);
      setForm(EMPTY_FORM);
    } catch (error) {
      setErrors({
        submit: "Не удалось отправить регистрацию. Попробуйте позже или свяжитесь с организаторами.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="page">
      <Hero />
      <Place />
      <Registration
        form={form}
        errors={errors}
        submitted={submitted}
        isSubmitting={isSubmitting}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onRepeat={handleRepeatRegistration}
      />
      <Footer />
    </main>
  );
}

function Hero() {
  return (
    <section className="hero heroWithTicket">
      <PatternBackground />
      <div className="heroOverlay" />

      <header className="topbar shell">
        <img src={BRAND_ASSETS.logoWhite} alt="Московские мастера" className="topLogo" />
      </header>

      <div className="heroTicketGrid shell">
        <div className="heroCopy">
          <h1>{EVENT.title}</h1>
          <p className="heroAboutText">
            Событие объединит участников, экспертов, представителей организаций социальной защиты и гостей мероприятия. Это пространство, где профессиональные навыки, человеческое участие и уважение к труду помощника по уходу становится главным содержанием дня.
          </p>
        </div>

        <div className="ticketWrap ticketWrapHero">
          <div className="ticketDecor decorOne" />
          <div className="ticketDecor decorTwo" />
          <article className="ticket eventTicket">
            <img src={BRAND_ASSETS.patternLogo} alt="Фирменный паттерн Московские мастера" className="ticketPattern" />
            <div className="ticketBody">
              <div className="ticketHead ticketHeadClean">
                <h2>Поезд жизни</h2>
                <div className="ticketIcon"><Icon name="train" /></div>
              </div>
              <div className="ticketData">
                <TicketLine label="Маршрут" value="Детство · Юность · Зрелость · Мудрость" />
                <TicketLine label="Дата" value={EVENT.date} />
                <TicketLine label="Сбор гостей" value={EVENT.guestArrival} />
                <TicketLine label="Отправление" value={EVENT.startTime} />
                <TicketLine label="Станция" value={`${EVENT.place}, ${EVENT.address}`} />
                <p className="ticketNote">Заполните форму регистрации ниже — электронный билет придет на указанную почту.</p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
function Place() {
  return (
    <section id="place" className="mapOnlySection">
      <div className="shell mapOnlyShell">
        <div className="mapCard" aria-label="Карта проезда к месту проведения">
          <div className="mapFrame">
            <iframe
              title="Яндекс Карта — Москва, Ленинская слобода, 26 стр. 11"
              src={EVENT.mapEmbedUrl}
              width="100%"
              height="100%"
              frameBorder="0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="mapPinOverlay" aria-hidden="true">
              <Icon name="pin" />
            </div>
          </div>
          <div className="mapInfo">
            <div>
              <h3>{EVENT.place}</h3>
              <p>{EVENT.address}</p>
            </div>
            <a href={EVENT.mapUrl} target="_blank" rel="noreferrer" className="button buttonRed mapButton">Открыть карту</a>
          </div>
        </div>
      </div>
    </section>
  );
}
function Registration({ form, errors, submitted, isSubmitting, onChange, onSubmit, onRepeat }) {
  return (
    <section id="registration" className="section shell">
      <div className="registrationGrid">
        <div>
          <p className="sectionLabel">Регистрация</p>
          <h2 className="sectionTitle">Ваш билет на финал конкурса</h2>
          <p className="sectionText">Укажите данные гостя. После отправки формы регистрация будет зафиксирована, а на указанную электронную почту придет подтверждение.</p>
        </div>

        <div className="formCard">
          {submitted ? (
            <div className="successBox">
              <div className="successIcon"><Icon name="check" /></div>
              <h3>Вы в списке гостей</h3>
              <p>Регистрация принята. Электронный билет отправлен на указанную почту.</p>
              <button type="button" className="repeatButton" onClick={onRepeat}>
                Зарегистрировать ещё одного гостя
              </button>
              <p className="successHint">Для следующей регистрации сохранятся организация, телефон и электронная почта. Их можно изменить вручную.</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="form">
              <FormField icon="user" label="ФИО" name="fullName" value={form.fullName} onChange={onChange} placeholder="Иванов Иван Иванович" error={errors.fullName} />
              <FormField icon="briefcase" label="Должность" name="position" value={form.position} onChange={onChange} placeholder="Помощник по уходу" error={errors.position} />
              <FormField
                icon="building"
                label="Организация"
                name="organization"
                value={form.organization}
                onChange={onChange}
                placeholder="Начните вводить название организации"
                error={errors.organization}
                list="organizations-list"
              />
              <datalist id="organizations-list">
                {ORGANIZATIONS.map((organization) => (
                  <option key={organization} value={organization} />
                ))}
              </datalist>
              <FormField icon="mail" label="Электронная почта" name="email" type="email" value={form.email} onChange={onChange} placeholder="example@mail.ru" error={errors.email} />
              <FormField
                icon="phone"
                label="Телефон"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={onChange}
                placeholder="+7 999 000-00-00"
                error={errors.phone}
                inputMode="tel"
                autoComplete="tel"
                maxLength={16}
              />

              <label className={`consent ${errors.consent ? "consentError" : ""}`}>
                <input type="checkbox" name="consent" checked={form.consent} onChange={onChange} />
                <span>Я согласен(на) на обработку персональных данных для регистрации на мероприятие.</span>
              </label>
              {errors.consent ? <p className="errorText">{errors.consent}</p> : null}

              <button type="submit" className="submitButton" disabled={isSubmitting}>
                {isSubmitting ? "Отправляем..." : "Зарегистрироваться"}
              </button>
              {errors.submit ? (
                <p className="formError">{errors.submit}</p>
              ) : null}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <PatternBackground small />
      <div className="footerOverlay" />
      <div className="shell footerInner">
        <img src={BRAND_ASSETS.logoWhite} alt="Московские мастера" className="footerLogo" />
        <div>
          <p className="footerTitle">По вопросам регистрации:</p>
          <p>+7 964 639-46-07</p>
		  <p>voronovaev1@social.mos.ru</p>
        </div>
      </div>
    </footer>
  );
}

function PatternBackground({ small = false }) {
  return <div className={`patternBg ${small ? "patternBgSmall" : ""}`} style={{ backgroundImage: `url(${BRAND_ASSETS.patternLogo})` }} aria-hidden="true" />;
}

function InfoPill({ icon, label, value }) {
  return (
    <div className="infoPill">
      <Icon name={icon} />
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}

function TicketLine({ label, value }) {
  return (
    <div className="ticketLine">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function DetailCard({ icon, title, text }) {
  return (
    <article className="detailCard">
      <div className="detailIcon"><Icon name={icon} /></div>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

function FormField({ icon, label, name, value, onChange, placeholder, type = "text", error, list, inputMode, autoComplete, maxLength }) {
  return (
    <label className="field">
      <span className="fieldLabel">{label}</span>
      <span className={`inputWrap ${error ? "inputError" : ""}`}>
        <Icon name={icon} />
        <input
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          type={type}
          list={list}
          inputMode={inputMode}
          autoComplete={autoComplete}
          maxLength={maxLength}
          aria-invalid={Boolean(error)}
        />
      </span>
      {error ? <span className="errorText">{error}</span> : null}
    </label>
  );
}

function Icon({ name }) {
  const props = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };

  switch (name) {
    case "train": return <svg {...props}><path d="M6 3h12a2 2 0 0 1 2 2v10a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V5a2 2 0 0 1 2-2Z"/><path d="M8 7h8"/><path d="M8 11h8"/><path d="M8 19l-2 2"/><path d="M16 19l2 2"/><circle cx="8.5" cy="15" r="1"/><circle cx="15.5" cy="15" r="1"/></svg>;
    case "calendar": return <svg {...props}><path d="M8 2v4"/><path d="M16 2v4"/><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18"/></svg>;
    case "pin": return <svg {...props}><path d="M12 21s7-5.2 7-12a7 7 0 1 0-14 0c0 6.8 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/></svg>;
    case "clock": return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    case "mail": return <svg {...props}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>;
    case "phone": return <svg {...props}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.7.6 2.5a2 2 0 0 1-.5 2.1L8 9.5a16 16 0 0 0 6.5 6.5l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.6.5 2.5.6a2 2 0 0 1 1.7 2Z"/></svg>;
    case "user": return <svg {...props}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>;
    case "building": return <svg {...props}><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 8h1"/><path d="M14 8h1"/><path d="M9 13h1"/><path d="M14 13h1"/><path d="M10 21v-4h4v4"/></svg>;
    case "briefcase": return <svg {...props}><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M3 12h18"/></svg>;
    case "check": return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/></svg>;
    case "arrow": return <svg {...props}><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>;
    default: return null;
  }
}
