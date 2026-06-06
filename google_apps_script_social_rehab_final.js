const SPREADSHEET_ID = "1uMBC_OFZYk0VzZyBbiOMBTjACJSqq2w1d5jvKr-c4Z4";
const SHEET_NAME = "Заявки";

// ID Google Slides-шаблона A5.
// ВАЖНО: это должен быть именно Google Slides, не PPTX.
// ID берется из ссылки: https://docs.google.com/presentation/d/ВОТ_ЭТА_ЧАСТЬ/edit
const SLIDES_TEMPLATE_ID = "ВСТАВЬ_ID_GOOGLE_SLIDES_ШАБЛОНА";

const EVENT = {
  title: "Финал Городского конкурса профессионального мастерства «Московские мастера» по профессии «Специалист по социальной реабилитации»",
  profession: "Специалист по социальной реабилитации",
  theme: "Новая реальность",
  route: "Оценка · Возможности · Навыки · Самостоятельность",
  date: "17 июня 2026 года",
  guestArrival: "9:30",
  startTime: "11:00",
  place: "Hertz Hall",
  address: "Москва, ул. Большая Почтовая, д.40, стр.10",
  mapUrl: "https://yandex.ru/maps/?text=%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D0%B0%2C%20%D1%83%D0%BB.%20%D0%91%D0%BE%D0%BB%D1%8C%D1%88%D0%B0%D1%8F%20%D0%9F%D0%BE%D1%87%D1%82%D0%BE%D0%B2%D0%B0%D1%8F%2C%20%D0%B4.40%2C%20%D1%81%D1%82%D1%80.10%20Hertz%20Hall&z=17",
  routeUrl: "https://yandex.ru/maps/?mode=routes&rtext=~%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D0%B0%2C%20%D1%83%D0%BB.%20%D0%91%D0%BE%D0%BB%D1%8C%D1%88%D0%B0%D1%8F%20%D0%9F%D0%BE%D1%87%D1%82%D0%BE%D0%B2%D0%B0%D1%8F%2C%20%D0%B4.40%2C%20%D1%81%D1%82%D1%80.10%20Hertz%20Hall&rtt=auto&z=17"
};

function doGet() {
  return jsonResponse({
    ok: true,
    message: "Google Apps Script работает",
    service: "Регистрация — новая реальность",
    spreadsheetId: SPREADSHEET_ID,
    sheetName: SHEET_NAME,
    time: new Date().toISOString()
  });
}

function doPost(e) {
  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(10000);

    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ ok: false, message: "Пустой POST-запрос" });
    }

    const rawData = JSON.parse(e.postData.contents);
    const data = normalizeData(rawData);
    const validation = validateData(data);

    if (!validation.ok) return jsonResponse(validation);

    const sheet = getSheet();
    ensureHeaders(sheet);

    const createdAt = new Date();
    const rowNumber = sheet.getLastRow() + 1;

    sheet.getRange(rowNumber, 1, 1, 10).setValues([[
      createdAt,
      data.fullName,
      data.position,
      data.organization,
      data.email,
      "",
      "Заявка получена",
      data.source || "Сайт регистрации",
      "",
      ""
    ]]);

    // Колонка F — телефон. Сначала формат «текст», потом значение.
    sheet.getRange(rowNumber, 6).setNumberFormat("@");
    sheet.getRange(rowNumber, 6).setValue(data.phone);

    try {
      const pdfBlob = createPersonalTicketPdf(data);
      sendTicketEmail(data, pdfBlob);

      sheet.getRange(rowNumber, 7).setValue("Письмо и PDF-билет отправлены");
      sheet.getRange(rowNumber, 9).setValue("");
      sheet.getRange(rowNumber, 10).setValue(new Date());

      return jsonResponse({ ok: true, message: "Регистрация принята, письмо и PDF-билет отправлены", row: rowNumber });
    } catch (sendError) {
      sheet.getRange(rowNumber, 7).setValue("Ошибка отправки письма/PDF");
      sheet.getRange(rowNumber, 9).setValue(sendError.message);
      sheet.getRange(rowNumber, 10).setValue(new Date());

      return jsonResponse({ ok: true, message: "Регистрация принята, но письмо или PDF не отправлены", row: rowNumber, error: sendError.message });
    }
  } catch (error) {
    return jsonResponse({ ok: false, message: error.message, stack: error.stack });
  } finally {
    try { lock.releaseLock(); } catch (error) {}
  }
}

function testDoPost() {
  const fakeEvent = {
    postData: {
      contents: JSON.stringify({
        fullName: "Тест Тестов",
        position: "Тестовая должность",
        organization: "Тестовая организация",
        email: "ВСТАВЬ_СВОЮ_ПОЧТУ",
        phone: "+7 999 000-00-00",
        source: "Apps Script test"
      })
    }
  };

  const result = doPost(fakeEvent);
  Logger.log(result.getContent());
}

function getSheet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error("Лист не найден: " + SHEET_NAME);
  return sheet;
}

function ensureHeaders(sheet) {
  const headers = ["Дата и время", "ФИО", "Должность", "Организация", "Электронная почта", "Телефон", "Статус письма", "Источник", "Ошибка", "Дата обработки"];
  const firstRow = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const hasHeaders = firstRow.some(function (cell) { return String(cell || "").trim() !== ""; });

  if (!hasHeaders) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }

  sheet.getRange("F:F").setNumberFormat("@");
}

function normalizeData(data) {
  return {
    fullName: String(data.fullName || "").trim(),
    position: String(data.position || "").trim(),
    organization: String(data.organization || "").trim(),
    email: String(data.email || "").trim().toLowerCase(),
    phone: String(data.phone || "").trim(),
    source: String(data.source || "Сайт регистрации").trim()
  };
}

function validateData(data) {
  if (!data.fullName) return { ok: false, message: "Не заполнено поле ФИО", field: "fullName" };
  if (!data.position) return { ok: false, message: "Не заполнено поле Должность", field: "position" };
  if (!data.organization) return { ok: false, message: "Не заполнено поле Организация", field: "organization" };
  if (!data.email) return { ok: false, message: "Не заполнено поле Электронная почта", field: "email" };
  if (!isValidEmail(data.email)) return { ok: false, message: "Некорректный email", field: "email" };
  if (!data.phone) return { ok: false, message: "Не заполнено поле Телефон", field: "phone" };
  if (data.phone.replace(/\D/g, "").length < 10) return { ok: false, message: "Некорректный номер телефона", field: "phone" };
  return { ok: true };
}

function createPersonalTicketPdf(data) {
  if (!SLIDES_TEMPLATE_ID || SLIDES_TEMPLATE_ID === "ВСТАВЬ_ID_GOOGLE_SLIDES_ШАБЛОНА") {
    throw new Error("Не указан SLIDES_TEMPLATE_ID — ID Google Slides-шаблона");
  }

  const safeName = sanitizeFileName(data.fullName);
  const copyName = "Билет гостя — " + safeName + " — Новая реальность";
  const templateFile = DriveApp.getFileById(SLIDES_TEMPLATE_ID);
  const copyFile = templateFile.makeCopy(copyName);
  const copyId = copyFile.getId();

  try {
    const presentation = SlidesApp.openById(copyId);

    presentation.replaceAllText("{{FULL_NAME}}", data.fullName);
    presentation.replaceAllText("{{POSITION}}", data.position);
    presentation.replaceAllText("{{ORGANIZATION}}", data.organization);
    presentation.replaceAllText("{{EMAIL}}", data.email);
    presentation.replaceAllText("{{PHONE}}", data.phone);
    presentation.replaceAllText("{{EVENT_TITLE}}", EVENT.title);
    presentation.replaceAllText("{{THEME}}", EVENT.theme);
    presentation.replaceAllText("{{ROUTE}}", EVENT.route);
    presentation.replaceAllText("{{DATE}}", EVENT.date);
    presentation.replaceAllText("{{GUEST_ARRIVAL}}", EVENT.guestArrival);
    presentation.replaceAllText("{{START_TIME}}", EVENT.startTime);
    presentation.replaceAllText("{{PLACE}}", EVENT.place);
    presentation.replaceAllText("{{ADDRESS}}", EVENT.address);

    presentation.saveAndClose();
    Utilities.sleep(1500);

    const exportUrl = "https://docs.google.com/presentation/d/" + copyId + "/export/pdf";
    const response = UrlFetchApp.fetch(exportUrl, {
      headers: { Authorization: "Bearer " + ScriptApp.getOAuthToken() },
      muteHttpExceptions: true
    });

    const responseCode = response.getResponseCode();
    if (responseCode !== 200) throw new Error("Не удалось экспортировать билет в PDF. Код ответа: " + responseCode);

    return response.getBlob().setName("Билет_" + safeName + ".pdf");
  } finally {
    try { DriveApp.getFileById(copyId).setTrashed(true); } catch (error) {}
  }
}

function sendTicketEmail(data, pdfBlob) {
  const subject = "Ваш билет гостя на финал конкурса «Московские мастера»";
  const htmlBody = buildTicketHtml(data);

  const plainBody =
    "Здравствуйте, " + data.fullName + "!\n\n" +
    "Ваша регистрация на финал конкурса «Московские мастера» подтверждена.\n\n" +
    "Концепция: " + EVENT.theme + "\n" +
    "Маршрут: " + EVENT.route + "\n" +
    "Дата: " + EVENT.date + "\n" +
    "Сбор гостей: " + EVENT.guestArrival + "\n" +
    "Начало: " + EVENT.startTime + "\n" +
    "Площадка: " + EVENT.place + "\n" +
    "Адрес: " + EVENT.address + "\n\n" +
    "Маршрут в Яндекс Картах: " + EVENT.routeUrl + "\n\n" +
    "Во вложении — именной билет в формате PDF для печати.\n\n" +
    "С уважением,\n" +
    "Организационный комитет конкурса «Московские мастера»";

  MailApp.sendEmail({
    to: data.email,
    subject: subject,
    body: plainBody,
    htmlBody: htmlBody,
    attachments: [pdfBlob],
    name: "Московские мастера"
  });
}

function buildTicketHtml(data) {
  const fullName = escapeHtml(data.fullName);
  const position = escapeHtml(data.position);
  const organization = escapeHtml(data.organization);
  const email = escapeHtml(data.email);
  const phone = escapeHtml(data.phone);

  return `
<!doctype html>
<html>
  <body style="margin:0; padding:0; background:#FFF4EA;">
    <div style="max-width:680px; margin:0 auto; padding:24px; font-family:Arial, Helvetica, sans-serif; color:#2A1719;">
      <div style="background:#D02027; border-radius:32px; overflow:hidden; box-shadow:0 16px 40px rgba(42,23,25,0.18);">
        <div style="padding:28px 28px 20px; background:#FF0020;">
          <div style="font-size:12px; line-height:1.4; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:#FFB689;">Электронный билет гостя</div>
          <h1 style="margin:10px 0 0; font-size:34px; line-height:1.08; font-weight:900; color:#ffffff;">${escapeHtml(EVENT.theme)}</h1>
          <p style="margin:14px 0 0; font-size:17px; line-height:1.5; color:#ffffff;">Финал конкурса «Московские мастера» по профессии «${escapeHtml(EVENT.profession)}»</p>
        </div>
        <div style="padding:24px 28px 28px; background:#ffffff;">
          <p style="margin:0 0 16px; font-size:18px; line-height:1.6;">Здравствуйте, <strong>${fullName}</strong>!</p>
          <p style="margin:0 0 22px; font-size:16px; line-height:1.6; color:#6D3B35;">Ваша регистрация подтверждена. Сохраните это письмо — оно подтверждает ваше присутствие в списке гостей мероприятия.</p>
          <div style="background:#FFF4EA; border-radius:24px; padding:20px; border:1px solid #FFB689;">
            ${ticketRow("Маршрут", EVENT.route)}
            ${ticketRow("Дата", EVENT.date)}
            ${ticketRow("Сбор гостей", EVENT.guestArrival)}
            ${ticketRow("Начало", EVENT.startTime)}
            ${ticketRow("Площадка", EVENT.place)}
            ${ticketRow("Адрес", EVENT.address)}
          </div>
          <div style="margin-top:18px; background:#FDF7F2; border-radius:20px; padding:18px; border-left:6px solid #F75A07;">
            <div style="font-size:12px; line-height:1.4; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:#D02027; margin-bottom:10px;">Данные регистрации</div>
            ${smallRow("ФИО", fullName)}
            ${smallRow("Должность", position)}
            ${smallRow("Организация", organization)}
            ${smallRow("Email", email)}
            ${smallRow("Телефон", phone)}
          </div>
          <div style="margin-top:22px; background:#ffffff; border:1px solid #FFB689; border-radius:22px; padding:18px;">
            <div style="font-size:12px; line-height:1.4; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:#D02027; margin-bottom:8px;">Как добраться</div>
            <p style="margin:0 0 14px; font-size:15px; line-height:1.6; color:#6D3B35;">${escapeHtml(EVENT.place)}<br>${escapeHtml(EVENT.address)}</p>
            <a href="${EVENT.routeUrl}" target="_blank" style="display:inline-block; background:#D02027; color:#ffffff; text-decoration:none; border-radius:999px; padding:13px 20px; font-size:15px; font-weight:700;">Открыть маршрут в Яндекс Картах</a>
          </div>
          <p style="margin:22px 0 0; font-size:15px; line-height:1.6; color:#6D3B35;">Во вложении — именной билет в формате PDF для печати.</p>
          <p style="margin:18px 0 0; font-size:15px; line-height:1.6; color:#2A1719;">С уважением,<br><strong>Организационный комитет конкурса «Московские мастера»</strong></p>
        </div>
      </div>
      <p style="margin:18px 0 0; text-align:center; font-size:12px; line-height:1.5; color:#9A4A3A;">Это письмо сформировано автоматически. Пожалуйста, не отвечайте на него.</p>
    </div>
  </body>
</html>`;
}

function ticketRow(label, value) {
  return `
    <div style="display:block; padding:10px 0; border-bottom:1px dashed rgba(247,90,7,0.35);">
      <div style="font-size:12px; line-height:1.4; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#9A4A3A;">${escapeHtml(label)}</div>
      <div style="margin-top:3px; font-size:18px; line-height:1.4; font-weight:900; color:#2A1719;">${escapeHtml(value)}</div>
    </div>`;
}

function smallRow(label, value) {
  return `
    <div style="margin:8px 0;">
      <span style="font-size:13px; color:#9A4A3A; font-weight:700;">${escapeHtml(label)}:</span>
      <span style="font-size:14px; color:#2A1719;">${value}</span>
    </div>`;
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function sanitizeFileName(value) {
  return String(value || "guest")
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 80);
}
