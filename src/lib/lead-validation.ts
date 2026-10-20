export const provinces = [
  "Azuay",
  "Bolívar",
  "Cañar",
  "Carchi",
  "Chimborazo",
  "Cotopaxi",
  "El Oro",
  "Esmeraldas",
  "Galápagos",
  "Guayas",
  "Imbabura",
  "Loja",
  "Los Ríos",
  "Manabí",
  "Morona Santiago",
  "Napo",
  "Orellana",
  "Pastaza",
  "Pichincha",
  "Santa Elena",
  "Santo Domingo de los Tsáchilas",
  "Sucumbíos",
  "Tungurahua",
  "Zamora Chinchipe",
] as const;
export interface LeadInput {
  full_name: string;
  phone: string;
  province: string;
  plan_id: string;
}
export type FieldErrors = Partial<Record<keyof LeadInput, string>>;
export function phoneInputValue(value: string): string {
  // Preserve existing Ecuadorian international numbers in their local form.
  return value
    .replace(/^\+593/, "0")
    .replace(/[^0-9]/g, "")
    .slice(0, 10);
}
export function validateLead(input: LeadInput): FieldErrors {
  const errors: FieldErrors = {};
  const name = input.full_name.trim();
  if (
    name.length < 2 ||
    name.length > 150 ||
    !/^[\p{L}\p{M} .’'−-]+$/u.test(name) ||
    !/\p{L}/u.test(name)
  )
    errors.full_name = "Ingresa un nombre válido de entre 2 y 150 caracteres.";
  const phone = input.phone.replace(/[ ()-]/g, "");
  if (
    !/^(0[2-7][0-9]{7}|09[0-9]{8}|\+593[2-7][0-9]{7}|\+5939[0-9]{8})$/.test(
      phone,
    )
  )
    errors.phone =
      "Ingresa un teléfono ecuatoriano válido, por ejemplo 0991234567.";
  if (!provinces.some((province) => province === input.province))
    errors.province = "Selecciona una provincia.";
  if (!input.plan_id) errors.plan_id = "Selecciona un plan disponible.";
  return errors;
}
