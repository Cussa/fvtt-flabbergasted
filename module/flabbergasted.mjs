// Import document classes.
import { FlabbergastedActor } from './documents/actor.mjs';
import { FlabbergastedItem } from './documents/item.mjs';
// Import sheet classes.
import { FlabbergastedActorSheet } from './sheets/actor-sheet.mjs';
import { FlabbergastedItemSheet } from './sheets/item-sheet.mjs';
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from './helpers/templates.mjs';
import { FLABBERGASTED } from './helpers/config.mjs';
// Import DataModel classes
import * as models from './data/_module.mjs';
import { checkAndCreateMacro } from './helpers/endSession.mjs';
import { checkAndShowGuideSetting, registerGuideSetting } from './helpers/guide.mjs';

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', function () {
  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.flabbergasted = {
    FlabbergastedActor,
    FlabbergastedItem,
    rollItemMacro,
  };

  // Add custom constants for configuration.
  CONFIG.FLABBERGASTED = FLABBERGASTED;

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: '1d20 + @abilities.dex.mod',
    decimals: 2,
  };

  // Define custom Document and DataModel classes
  CONFIG.Actor.documentClass = FlabbergastedActor;

  // Note that you don't need to declare a DataModel
  // for the base actor/item classes - they are included
  // with the Character/NPC as part of super.defineSchema()
  CONFIG.Actor.dataModels = {
    character: models.FlabbergastedCharacter,
    npc: models.FlabbergastedNPC,
    socialClub: models.FlabbergastedSocialClub,
    archetype: models.FlabbergastedArchetype
  }
  CONFIG.Item.documentClass = FlabbergastedItem;
  CONFIG.Item.dataModels = {
    item: models.FlabbergastedItem,
    sceneCue: models.FlabbergastedSceneCue,
    clubUpgrade: models.FlabbergastedClubUpgrade,
    flaw: models.FlabbergastedFlaw
  }

  // Active Effects are never copied to the Actor,
  // but will still apply to the Actor from within the Item
  // if the transfer property on the Active Effect is true.
  CONFIG.ActiveEffect.legacyTransferral = false;

  // Register sheet application classes
  Actors.unregisterSheet('core', ActorSheet);
  Actors.registerSheet('flabbergasted', FlabbergastedActorSheet, {
    makeDefault: true,
    label: 'FLABBERGASTED.SheetLabels.Actor',
  });
  Items.unregisterSheet('core', ItemSheet);
  Items.registerSheet('flabbergasted', FlabbergastedItemSheet, {
    makeDefault: true,
    label: 'FLABBERGASTED.SheetLabels.Item',
  });

  registerGuideSetting();

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// If you need to add Handlebars helpers, here is a useful example:
Handlebars.registerHelper('toLowerCase', function (str) {
  return str.toLowerCase();
});

Handlebars.registerHelper('traitBoxes', function (id, max, value) {
  let accum = '';
  for (let i = 1; i <= 8; ++i) {
    const classDisabled = i > max ? "disabled" : "";
    const checked = i <= value ? "checked" : "";
    accum += `<input type="checkbox" name="cb" class="traits rollable trait ${classDisabled}"
      ${checked} data-field="system.traits.${id}" data-action-value="${value}"
        data-action-max-value="${max}" data-trait="${id}">`;
  }
  return accum;
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once('ready', async function  () {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on('hotbarDrop', (bar, data, slot) => createItemMacro(data, slot));

  checkAndCreateMacro();

  await checkAndShowGuideSetting();
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createItemMacro(data, slot) {
  // First, determine if this is a valid owned item.
  if (data.type !== 'Item') return;
  if (!data.uuid.includes('Actor.') && !data.uuid.includes('Token.')) {
    return ui.notifications.warn(
      'You can only create macro buttons for owned Items'
    );
  }
  // If it is, retrieve it based on the uuid.
  const item = await Item.fromDropData(data);

  // Create the macro command using the uuid.
  const command = `game.flabbergasted.rollItemMacro("${data.uuid}");`;
  let macro = game.macros.find(
    (m) => m.name === item.name && m.command === command
  );
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: 'script',
      img: item.img,
      command: command,
      flags: { 'flabbergasted.itemMacro': true },
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemUuid
 */
function rollItemMacro(itemUuid) {
  // Reconstruct the drop data so that we can load the item.
  const dropData = {
    type: 'Item',
    uuid: itemUuid,
  };
  // Load the item from the uuid.
  Item.fromDropData(dropData).then((item) => {
    // Determine if the item loaded and if it's an owned item.
    if (!item || !item.parent) {
      const itemName = item?.name ?? itemUuid;
      return ui.notifications.warn(
        `Could not find item ${itemName}. You may need to delete and recreate this macro.`
      );
    }

    // Trigger the item roll
    item.roll();
  });
}
