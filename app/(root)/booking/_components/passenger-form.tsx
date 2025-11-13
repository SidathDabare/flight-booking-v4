"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import useFlightStore from "@/lib/store/use-flight-store";
import usePassengerStore from "@/lib/store/use-passenger-store";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

const calculateAge = (birthDate: string) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

const validateAgeForTravelerType = (
  dateOfBirth: string | undefined,
  travelerType: string,
  t: any
) => {
  // Return true if date is not yet entered or incomplete
  if (!dateOfBirth || !dateOfBirth.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return true;
  }

  const age = calculateAge(dateOfBirth);
  switch (travelerType) {
    case "HELD_INFANT":
      return age < 2
        ? true
        : t("passengerForm.validation.infantAge");
    case "CHILD":
      return age < 12 && age >= 2
        ? true
        : t("passengerForm.validation.childAge");
    case "ADULT":
      return age >= 12
        ? true
        : t("passengerForm.validation.adultAge");
    default:
      return true;
  }
};

// Form schema factory to support translations
const createFormSchema = (t: (key: string) => string) => z.object({
  firstName: z.string().min(2, t("passengerForm.validation.firstNameMin")),
  lastName: z.string().min(2, t("passengerForm.validation.lastNameMin")),
  email: z.string().email(t("passengerForm.validation.emailInvalid")),
  phoneNumber: z.string().min(10, t("passengerForm.validation.phoneMin")),
  dateOfBirth: z.string(),
  gender: z.enum(["MALE", "FEMALE"]),
  passportNumber: z
    .string()
    .min(6, t("passengerForm.validation.passportMin")),
});

type PassengerFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: "MALE" | "FEMALE";
  passportNumber: string;
};

interface PassengerFormProps {
  passengerId?: string;
  onComplete?: () => void;
  travelerType?: string;
}

export default function PassengerForm({
  passengerId,
  onComplete,
  travelerType = "ADULT",
}: PassengerFormProps) {
  const t = useTranslations("booking");
  const { toast } = useToast();
  const selectedFlight = useFlightStore((state) => state.selectedFlight);
  const { passengers, addPassenger, updatePassenger } = usePassengerStore();

  const existingPassenger = passengerId
    ? passengers.find((p) => p.id === passengerId)
    : undefined;

  const form = useForm<PassengerFormValues>({
    resolver: zodResolver(createFormSchema(t)),
    defaultValues: existingPassenger || {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      dateOfBirth: "",
      gender: "MALE",
      passportNumber: "",
    },
  });

  const validateDateOfBirth = (date: string) => {
    if (!date) return;

    // Only validate if it's a complete date
    if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const ageValidation = validateAgeForTravelerType(date, travelerType, t);
      if (typeof ageValidation === "string") {
        toast({
          title: t("passengerForm.toast.ageValidationError"),
          description: ageValidation,
          variant: "destructive",
        });
        form.setError("dateOfBirth", { message: ageValidation });
      } else {
        form.clearErrors("dateOfBirth");
      }
    }
  };

  async function onSubmit(values: PassengerFormValues) {
    if (!selectedFlight) {
      toast({
        title: t("passengerForm.toast.error"),
        description: t("passengerForm.toast.noFlight"),
        variant: "destructive",
      });
      return;
    }

    // Validate date on submit
    if (values.dateOfBirth) {
      const ageValidation = validateAgeForTravelerType(
        values.dateOfBirth,
        travelerType,
        t
      );
      if (typeof ageValidation === "string") {
        toast({
          title: t("passengerForm.toast.ageValidationError"),
          description: ageValidation,
          variant: "destructive",
        });
        return;
      }
    }

    try {
      const passengerData = {
        ...values,
        travelerType,
      };

      if (passengerId) {
        updatePassenger(passengerId, passengerData);
        toast({
          title: t("passengerForm.toast.success"),
          description: t("passengerForm.toast.updated"),
        });
      } else {
        addPassenger(passengerData);
        form.reset();
        toast({
          title: t("passengerForm.toast.success"),
          description: t("passengerForm.toast.added"),
        });
      }
      onComplete?.();
    } catch (error) {
      toast({
        title: t("passengerForm.toast.error"),
        description: error instanceof Error ? error.message : t("passengerForm.toast.failedSave"),
        variant: "destructive",
      });
    }
  }

  const getFormStyle = () => {
    switch (travelerType) {
      case "HELD_INFANT":
        return "bg-pink-50";
      case "CHILD":
        return "bg-blue-50";
      default:
        return "";
    }
  };

  const getBannerStyle = () => {
    switch (travelerType) {
      case "HELD_INFANT":
        return "bg-pink-100";
      case "CHILD":
        return "bg-blue-100";
      default:
        return "";
    }
  };

  const getTravelerTypeText = () => {
    switch (travelerType) {
      case "HELD_INFANT":
        return t("passengerForm.travelerType.infant");
      case "CHILD":
        return t("passengerForm.travelerType.child");
      default:
        return "";
    }
  };

  return (
    <Card className={cn("p-2 md:px-4 border-none", getFormStyle())}>
      <Form {...form}>
        {(travelerType === "CHILD" || travelerType === "HELD_INFANT") && (
          <div className={cn("mb-6 rounded-lg p-4", getBannerStyle())}>
            <p
              className={cn(
                "text-sm font-medium",
                travelerType === "HELD_INFANT"
                  ? "text-pink-800"
                  : "text-blue-800"
              )}
            >
              {getTravelerTypeText()}
            </p>
          </div>
        )}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4 md:col-span-2 lg:col-span-1">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("passengerForm.fields.firstName")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("passengerForm.placeholders.firstName")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("passengerForm.fields.lastName")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("passengerForm.placeholders.lastName")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("passengerForm.fields.dateOfBirth")}</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        onBlur={(e) => {
                          field.onBlur();
                          validateDateOfBirth(e.target.value);
                        }}
                        onChange={(e) => {
                          field.onChange(e);
                          // Clear any existing errors while typing
                          form.clearErrors("dateOfBirth");
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("passengerForm.fields.gender")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200">
                          <SelectValue placeholder={t("passengerForm.placeholders.gender")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-slate-200 dark:border-slate-600 shadow-xl">
                        <SelectItem value="MALE">{t("passengerForm.gender.male")}</SelectItem>
                        <SelectItem value="FEMALE">{t("passengerForm.gender.female")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4 md:col-span-2 lg:col-span-1">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("passengerForm.fields.email")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("passengerForm.placeholders.email")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("passengerForm.fields.phoneNumber")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("passengerForm.placeholders.phoneNumber")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="passportNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("passengerForm.fields.passportNumber")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("passengerForm.placeholders.passportNumber")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Button type="submit" className="w-full mt-6">
            {passengerId ? t("passengerForm.button.update") : t("passengerForm.button.add")}
          </Button>
        </form>
      </Form>
    </Card>
  );
}
