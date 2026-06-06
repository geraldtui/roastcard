/**
 * Hardcoded roast templates. Each contains a `{name}` placeholder that is
 * replaced with the recipient's name at send time. Tone is playful and clean.
 *
 * The `getRandomRoast` interface is intentionally minimal so the source can
 * later be swapped for an LLM call without changing callers.
 */
export const roasts: readonly string[] = [
  "You're not old, {name}, you're a classic — like a fax machine.",
  "Another year wiser, {name}, and yet here you are, still using your phone flashlight to find the light switch.",
  "You're aging like fine wine, {name} — confusing to younger people and best enjoyed sitting down.",
  "Don't worry about the candles, {name}, the cake can handle the heat better than your knees.",
  "You're at the age, {name}, where 'pulling an all-nighter' means not waking up to pee.",
  "You're not getting older, {name}, you're just becoming a limited edition.",
  "Studies show people who have the most birthdays live the longest, {name}. You're basically immortal.",
  "Today you're officially old enough to know better, {name}, but young enough to do it anyway.",
  "Your birthday suit could really use an iron these days, {name}, but we still love you.",
  "You don't look a day over fabulous, {name} — squint and the wrinkles disappear entirely.",
  "Remember when you were cool, {name}? Me neither, but here we are.",
  "You're like a fine cheese, {name}: a little sharper and a little funkier every year.",
  "Age is just a number, {name}, and in your case, a really big and impressive one.",
  "May your day be as bright, {name}, as your future was supposed to be.",
  "You've reached the age, {name}, where your back goes out more than you do.",
  "Congrats on surviving another lap around the sun without major incident, {name}. Mostly.",
  "You're not over the hill yet, {name}, but I can see you packing for the climb.",
  "Blowing out all those candles counts as your cardio for the year, {name}. Pace yourself.",
  "You're proof, {name}, that you can grow older without ever truly growing up.",
  "The good news, {name}: you still look great. The other news: you owe me $20.",
  "You're the reason the cake comes with a fire extinguisher now, {name}.",
  "Another year, {name}, another reminder that you peaked emotionally at age 7.",
  "You're like a software update, {name} — nobody asked for it, but here you are, taking forever.",
  "At your age, {name}, 'getting lucky' means finding your car in the parking lot.",
  "You're vintage now, {name}, which is just a fancy way of saying 'old but charming.'",
  "Don't think of it as getting older, {name}, think of it as leveling up with worse stats.",
  "You've still got it, {name} — it's just taking a little longer to find it each morning.",
  "May your wifi be strong, {name}, and your nap schedule be respected today.",
  "You're not just a year older, {name}, you're a year better at pretending you have it together.",
  "Here's to you, {name}: half your life behind you, and the other half spent looking for your glasses.",
  "You're aging gracefully, {name}, mostly because falling ungracefully hurts more now.",
  "You're the GOAT, {name} — Greatest Older Adult in the room, probably.",
  "Today we celebrate the day the world got a little weirder, {name}, in the best way.",
  "You've officially been alive long enough, {name}, to tell the same story three times at dinner.",
  "You're not old, {name}, you're 'experienced,' like a phone with no storage left.",
  "Wishing you a day filled with cake, naps, and gracefully ignoring your real age, {name}.",
];

/** Picks a roast uniformly at random and interpolates the recipient's name. */
export function getRandomRoast(name: string): string {
  const template = roasts[Math.floor(Math.random() * roasts.length)];
  return template.replaceAll("{name}", name);
}
