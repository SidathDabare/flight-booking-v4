import { useState, useCallback } from "react";
import type { FormData } from "../_types";

interface UseContactFormReturn {
  formData: FormData;
  isSubmitting: boolean;
  formSuccess: boolean;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

/**
 * Custom hook for managing contact form state and submission
 */
export function useContactForm(): UseContactFormReturn {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { id, value } = e.target;
      setFormData((prev) => ({ ...prev, [id]: value }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      // Simulate form submission
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Form submitted:", formData);

      setIsSubmitting(false);
      setFormSuccess(true);

      // Reset form
      setFormData({ name: "", email: "", phone: "", message: "" });

      // Reset success message after 5 seconds
      setTimeout(() => setFormSuccess(false), 5000);
    },
    [formData]
  );

  return {
    formData,
    isSubmitting,
    formSuccess,
    handleInputChange,
    handleSubmit,
  };
}
