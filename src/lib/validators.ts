import {timeRe} from "@/lib/consts";
import {InputValidator} from "@/lib/types";

const requiredValidator: InputValidator = {
  isValid: val => !!val,
  error: "This field is required"
};

export const timeValidators: InputValidator[] = [
  {
    isValid: (timeStr) => timeRe.test(timeStr),
    error: "Invalid time"
  }
];

export const eventNameValidators: InputValidator[] = [requiredValidator];
