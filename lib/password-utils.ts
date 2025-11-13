// Password strength calculation types
export interface PasswordStrength {
  score: number;
  label: "Weak" | "Fair" | "Good" | "Strong";
  color: string;
  percentage: number;
  issues: string[];
  suggestions: string[];
}

// Helper function to calculate password strength
export const calculatePasswordStrength = (password: string): PasswordStrength => {
  let score = 0;
  const issues: string[] = [];
  const suggestions: string[] = [];

  // Check length
  if (password.length >= 8) score += 1;
  else issues.push("Password too short (minimum 8 characters)");

  if (password.length >= 12) score += 1;

  // Check for lowercase letters
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    issues.push("Missing lowercase letters");
    suggestions.push("Add lowercase letters (a-z)");
  }

  // Check for uppercase letters
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    issues.push("Missing uppercase letters");
    suggestions.push("Add uppercase letters (A-Z)");
  }

  // Check for numbers
  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    issues.push("Missing numbers");
    suggestions.push("Add numbers (0-9)");
  }

  // Check for special characters
  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  } else {
    issues.push("Missing special characters");
    suggestions.push("Add special characters (!@#$%^&*)");
  }

  // Determine strength label and color
  let label: "Weak" | "Fair" | "Good" | "Strong";
  let color: string;
  let percentage: number;

  if (score <= 2) {
    label = "Weak";
    color = "bg-red-500";
    percentage = 25;
  } else if (score <= 4) {
    label = "Fair";
    color = "bg-orange-500";
    percentage = 50;
  } else if (score <= 5) {
    label = "Good";
    color = "bg-yellow-500";
    percentage = 75;
  } else {
    label = "Strong";
    color = "bg-green-500";
    percentage = 100;
  }

  return { score, label, color, percentage, issues, suggestions };
};

// Helper function to generate a strong password suggestion
export const generateStrongPassword = (basePassword: string): string => {
  const specialChars = "!@#$%^&*";
  const numbers = "0123456789";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";

  // Start with the base or a default base
  let suggestion = basePassword || "Secure";

  // Ensure minimum length
  if (suggestion.length < 8) {
    suggestion += "Pass";
  }

  // Add missing components
  if (!/[A-Z]/.test(suggestion)) {
    suggestion = suggestion.charAt(0).toUpperCase() + suggestion.slice(1);
  }

  if (!/[a-z]/.test(suggestion)) {
    suggestion += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
  }

  if (!/[0-9]/.test(suggestion)) {
    suggestion += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }

  if (!/[^A-Za-z0-9]/.test(suggestion)) {
    suggestion += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
  }

  // Ensure length is at least 12 for a strong password
  while (suggestion.length < 12) {
    const randomSet = [uppercase, lowercase, numbers, specialChars][Math.floor(Math.random() * 4)];
    suggestion += randomSet.charAt(Math.floor(Math.random() * randomSet.length));
  }

  return suggestion;
};
