"use client";

import type { InputHTMLAttributes } from "react";
import { phoneInputValue } from "@/lib/lead-validation";

type PhoneInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "inputMode" | "maxLength" | "onInput" | "onPaste" | "defaultValue"
> & { defaultValue?: string };

export function PhoneInput({ defaultValue = "", ...props }: PhoneInputProps) {
  return (
    <input
      {...props}
      type="tel"
      inputMode="numeric"
      maxLength={10}
      pattern="[0-9]{1,10}"
      defaultValue={phoneInputValue(defaultValue)}
      onInput={(event) => {
        event.currentTarget.value = phoneInputValue(event.currentTarget.value);
      }}
      onPaste={(event) => {
        event.preventDefault();
        const input = event.currentTarget;
        const start = input.selectionStart ?? input.value.length;
        const end = input.selectionEnd ?? start;
        const pasted = phoneInputValue(event.clipboardData.getData("text"));
        input.value = phoneInputValue(
          input.value.slice(0, start) + pasted + input.value.slice(end),
        );
        const cursor = Math.min(start + pasted.length, input.value.length);
        input.setSelectionRange(cursor, cursor);
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }}
    />
  );
}
