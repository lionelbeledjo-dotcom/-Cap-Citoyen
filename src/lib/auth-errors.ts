export function translateAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login") || m.includes("invalid credentials")) return "Identifiants incorrects.";
  if (m.includes("email not confirmed")) return "Veuillez confirmer votre email avant de vous connecter.";
  if (m.includes("user already registered") || m.includes("already registered") || m.includes("already exists")) return "Cet email est déjà utilisé.";
  if (m.includes("password should be at least")) return "Le mot de passe doit contenir au moins 8 caractères.";
  if (m.includes("unable to validate email") || m.includes("invalid email")) return "Adresse email invalide.";
  if (m.includes("rate limit") || m.includes("too many")) return "Trop de tentatives. Réessayez dans quelques minutes.";
  if (m.includes("network")) return "Problème de connexion. Vérifiez votre réseau.";
  return message;
}
