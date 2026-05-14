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
  title: "Городской конкурс профессионального мастерства «Московские мастера»",
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

export default function App() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    const nextValue = type === "checkbox" ? checked : value;

    setForm((prev) => ({ ...prev, [name]: nextValue }));
    setErrors((prev) => ({ ...prev, [name]: undefined, submit: undefined }));
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
      <About />
      <Place />
      <Registration
        form={form}
        errors={errors}
        submitted={submitted}
        isSubmitting={isSubmitting}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />
      <Footer />
    </main>
  );
}

function Hero() {
  return (
    <section className="hero">
      <PatternBackground />
      <div className="heroOverlay" />

      <header className="topbar shell">
        <img src={BRAND_ASSETS.logoWhite} alt="Московские мастера" className="topLogo" />
      </header>

      <div className="heroGrid shell">
        <div className="heroContent">
          <div className="eyebrow"><Icon name="train" /> Финал конкурса · Поезд жизни</div>
          <h1>{EVENT.title}</h1>
          <p className="lead">{EVENT.subtitle} — событие о профессионализме, заботе и людях, которые каждый день помогают другим.</p>

          <div className="infoGrid">
            <InfoPill icon="calendar" label="Дата" value={EVENT.shortDate} />
            <InfoPill icon="clock" label="Сбор гостей" value={EVENT.guestArrival} />
            <InfoPill icon="pin" label="Место" value={EVENT.place} />
          </div>

          <div className="actions">
            <a href="#registration" className="button buttonLight">Получить билет гостя <Icon name="arrow" /></a>
            <a href="#place" className="button buttonGhost">Когда и где</a>
          </div>
        </div>

        <div className="ticketWrap">
          <div className="ticketDecor decorOne" />
          <div className="ticketDecor decorTwo" />
          <article className="ticket">
            <img src={BRAND_ASSETS.patternLogo} alt="Фирменный паттерн Московские мастера" className="ticketPattern" />
            <div className="ticketBody">
              <div className="ticketHead">
                <div>
                  <p>Билет гостя</p>
                  <h2>Поезд жизни</h2>
                </div>
                <div className="ticketIcon"><Icon name="train" /></div>
              </div>
              <div className="ticketData">
                <TicketLine label="Маршрут" value="Забота · Профессия · Признание" />
                <TicketLine label="Отправление" value={`${EVENT.shortDate} · ${EVENT.startTime}`} />
                <TicketLine label="Станция" value={EVENT.place} />
                <p className="ticketNote">После отправки формы данные попадут в список гостей, а подтверждение придет на указанную почту.</p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section className="section shell">
      <div className="aboutGrid">
        <article className="card cardWide">
          <p className="sectionLabel">О мероприятии</p>
          <h2>Финальная станция большого профессионального маршрута</h2>
          <p>Финал конкурса «Московские мастера» по профессии «Помощник по уходу» объединит участников, экспертов, представителей организаций социальной защиты и гостей мероприятия. Это пространство, где профессиональные навыки, человеческое участие и уважение к труду помощника по уходу становятся главным содержанием дня.</p>
        </article>
        <article className="card redCard">
          <PatternBackground small />
          <div className="redCardOverlay" />
          <div className="cardInner">
            <div className="badgeIcon"><Icon name="check" /></div>
            <h3>Зарегистрируйтесь заранее</h3>
            <p>Заполните короткую форму. Данные попадут в список гостей, а подтверждение регистрации будет отправлено на электронную почту.</p>
          </div>
        </article>
      </div>
    </section>
  );
}

function Place() {
  return (
    <section id="place" className="placeSection">
      <div className="shell section">
        <p className="sectionLabel">Когда и где</p>
        <h2 className="sectionTitle">Информация для гостей</h2>
        <div className="detailGrid">
          <DetailCard icon="calendar" title="Дата" text={EVENT.date} />
          <DetailCard icon="clock" title="Сбор гостей" text={EVENT.guestArrival} />
          <DetailCard icon="clock" title="Начало" text={EVENT.startTime} />
          <DetailCard icon="pin" title="Адрес" text={EVENT.address} />
        </div>

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
              <p className="mapCoords">Координаты: {EVENT.coordinates.lat}, {EVENT.coordinates.lon}</p>
            </div>
            <a href={EVENT.routeUrl} target="_blank" rel="noreferrer" className="button buttonRed mapButton">Открыть маршрут</a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Registration({ form, errors, submitted, isSubmitting, onChange, onSubmit }) {
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
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="form">
              <FormField icon="user" label="ФИО" name="fullName" value={form.fullName} onChange={onChange} placeholder="Иванов Иван Иванович" error={errors.fullName} />
              <FormField icon="briefcase" label="Должность" name="position" value={form.position} onChange={onChange} placeholder="Помощник по уходу" error={errors.position} />
              <FormField icon="building" label="Организация" name="organization" value={form.organization} onChange={onChange} placeholder="Название организации" error={errors.organization} />
              <FormField icon="mail" label="Электронная почта" name="email" type="email" value={form.email} onChange={onChange} placeholder="example@mail.ru" error={errors.email} />
              <FormField icon="phone" label="Телефон" name="phone" type="tel" value={form.phone} onChange={onChange} placeholder="+7 999 000-00-00" error={errors.phone} />

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

function FormField({ icon, label, name, value, onChange, placeholder, type = "text", error }) {
  return (
    <label className="field">
      <span className="fieldLabel">{label}</span>
      <span className={`inputWrap ${error ? "inputError" : ""}`}>
        <Icon name={icon} />
        <input name={name} value={value} onChange={onChange} placeholder={placeholder} type={type} aria-invalid={Boolean(error)} />
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
