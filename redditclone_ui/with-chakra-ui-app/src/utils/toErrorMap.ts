import { FieldError } from "../generated/graphql";

export const toErrorMap = (errors: FieldError[]) => {
  const errorMap: Record<string, string> = {};
  errors.forEach(({ field, message }) => {
    field = field.toLowerCase();
    errorMap[field] = message;
  });

  return errorMap;
};
