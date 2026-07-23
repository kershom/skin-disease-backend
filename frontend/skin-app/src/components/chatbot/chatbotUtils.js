import { knowledgeBase } from "./knowledgeBase";

export const getBotReply = (question) => {
  const q = question.toLowerCase().trim();

  // About DermaLens
  if (
    q.includes("dermalens") ||
    q.includes("about") ||
    q.includes("website") ||
    q.includes("what is dermalens")
  ) {
    return knowledgeBase.about;
  }

  // Registration
  if (
    q.includes("register") ||
    q.includes("registration") ||
    q.includes("sign up") ||
    q.includes("signup") ||
    q.includes("create account")
  ) {
    return knowledgeBase.register;
  }

  // Login
  if (
    q.includes("login") ||
    q.includes("log in") ||
    q.includes("signin") ||
    q.includes("sign in")
  ) {
    return knowledgeBase.login;
  }

  // Upload
  if (
    q.includes("upload") ||
    q.includes("image") ||
    q.includes("scan") ||
    q.includes("analyze") ||
    q.includes("analyse")
  ) {
    return knowledgeBase.upload;
  }

  // Prediction
  if (
    q.includes("prediction") ||
    q.includes("predict") ||
    q.includes("ai")
  ) {
    return knowledgeBase.prediction;
  }

  // History
  if (
    q.includes("history") ||
    q.includes("previous") ||
    q.includes("old report")
  ) {
    return knowledgeBase.history;
  }

  // Reports
  if (
    q.includes("report") ||
    q.includes("download")
  ) {
    return knowledgeBase.reports;
  }

  // Privacy
  if (
    q.includes("privacy") ||
    q.includes("secure") ||
    q.includes("safe") ||
    q.includes("data")
  ) {
    return knowledgeBase.privacy;
  }

  // Supported Diseases
  if (
    q.includes("supported") ||
    q.includes("disease") ||
    q.includes("how many disease")
  ) {
    return knowledgeBase.diseases;
  }

  // Multiple Images
  if (
    q.includes("multiple") ||
    q.includes("many image") ||
    q.includes("two images")
  ) {
    return knowledgeBase.uploadmultiple;
  }

  // Accuracy
  if (
    q.includes("accuracy") ||
    q.includes("accurate")
  ) {
    return knowledgeBase.accuracy;
  }

  // Contact
  if (
    q.includes("contact") ||
    q.includes("support") ||
    q.includes("help")
  ) {
    return knowledgeBase.support;
  }

  return knowledgeBase.default;
};