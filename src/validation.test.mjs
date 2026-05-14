import assert from "node:assert/strict";
import { EMPTY_FORM, validateRegistrationForm } from "./validation.js";

const validForm = {
  fullName: "Иванов Иван Иванович",
  position: "Помощник по уходу",
  organization: "Социальный дом",
  email: "ivanov@example.ru",
  phone: "+7 999 000-00-00",
  consent: true,
};

const cases = [
  ["valid form passes", validForm, true],
  ["empty form fails", EMPTY_FORM, false],
  ["invalid email fails", { ...validForm, email: "wrong-email" }, false],
  ["short phone fails", { ...validForm, phone: "12345" }, false],
  ["missing consent fails", { ...validForm, consent: false }, false],
  ["spaces-only full name fails", { ...validForm, fullName: "   " }, false],
  ["phone with 10 digits passes", { ...validForm, phone: "9990000000" }, true],
];

for (const [name, input, expectedValid] of cases) {
  const errors = validateRegistrationForm(input);
  const actualValid = Object.keys(errors).length === 0;
  assert.equal(actualValid, expectedValid, `${name}: expected ${expectedValid}, got ${actualValid}; errors=${JSON.stringify(errors)}`);
}

console.log(`OK: ${cases.length} validation tests passed`);
