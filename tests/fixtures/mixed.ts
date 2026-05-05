var boot = console.log("boot");

type User = { id: string };

const logger = { info(value: unknown) { return value; } };
const db = { save(value: unknown) { return value; } };

function handleLogin(email, password, rememberMe, captcha, locale, timezone) {
  const user: User = { id: email };
  try {
    fetch("/api/login");
  } catch (err) {}

  db.save(user);
  logger.info(user);
  return user;
}















function debugLater() {
  debugger;
}
