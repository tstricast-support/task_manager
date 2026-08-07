export const DEPARTMENTS = [
  { value: "I_LAB", label: "I Lab" },
  { value: "IPHOTO_BOOK", label: "IPhoto book" },
  { value: "I_LAB_STD", label: "I Lab Std" },
  { value: "DD_ENGINEERING", label: "DD Engineering" },
  { value: "OTHERS", label: "Others" },
];

export function departmentLabel(value) {
  return DEPARTMENTS.find((d) => d.value === value)?.label || value;
}