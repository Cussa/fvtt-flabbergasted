/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  return loadTemplates([
    // Actor partials.
    'systems/flabbergasted/templates/actor/parts/actor-features.hbs',
    'systems/flabbergasted/templates/actor/parts/actor-items.hbs',
    'systems/flabbergasted/templates/actor/parts/actor-sceneCues.hbs',
    'systems/flabbergasted/templates/actor/parts/actor-effects.hbs',
    // Item partials
    'systems/flabbergasted/templates/item/parts/item-effects.hbs',
  ]);
};
