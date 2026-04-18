const DEPARTMENT_OPTIONS = [
  "Human Resources",
  "Finance",
  "Operations",
  "Information Technology",
  "Legal",
  "Procurement",
  "Compliance",
];

const NORMALIZED_DEPARTMENT_MAP = DEPARTMENT_OPTIONS.reduce((acc, item) => {
  acc[item.toLowerCase()] = item;
  return acc;
}, {});

const normalizeDepartment = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  return NORMALIZED_DEPARTMENT_MAP[trimmed.toLowerCase()] || "";
};

const isValidDepartment = (value) => {
  return !!normalizeDepartment(value);
};

module.exports = {
  DEPARTMENT_OPTIONS,
  normalizeDepartment,
  isValidDepartment,
};