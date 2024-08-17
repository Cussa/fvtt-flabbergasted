import endSessionHandler from "./endSession.mjs";

export const FLABBERGASTED = {};

/**
 * The set of Ability Scores used within the system.
 * @type {Object}
 */
FLABBERGASTED.traits = {
  bp: 'FLABBERGASTED.Traits.Bp',
  ce: 'FLABBERGASTED.Traits.Ce',
  ws: 'FLABBERGASTED.Traits.Ws',
  cp: 'FLABBERGASTED.Traits.Cp',
};

FLABBERGASTED.endSessionHandler = endSessionHandler;