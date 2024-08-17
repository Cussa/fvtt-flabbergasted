export default async function endSessionHandler() {
  const allUpdates = [];
  const types = ["socialClub", "character"]
  const actors = await game.actors.filter(it => types.indexOf(it.type) > -1);
  for (const actor of actors) {
    for (const item of actor.items) {
      allUpdates.push(item.update({ "system.used": 0 }));
    }
  }

  Promise.all(allUpdates);
}

export async function checkAndCreateMacro(){
  if (!game.user.isGM)
    return;

  const macro = game.macros.getName("Reset Usages");
  if (macro)
    return;

  const command = `await CONFIG.FLABBERGASTED.endSessionHandler();`;
  Macro.create({
    name: "Reset Usages",
    type: 'script',
    img: "icons/magic/nature/symbol-sun-yellow.webp",
    command: command,
  });
}