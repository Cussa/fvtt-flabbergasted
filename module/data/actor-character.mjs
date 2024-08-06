import FlabbergastedActorBase from "./actor-base.mjs";
import { DATA_COMMON } from "./common.mjs";

export default class FlabbergastedCharacter extends FlabbergastedActorBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    // Iterate over trais names and create a new SchemaField for each.
    schema.traits = new fields.SchemaField(Object.keys(CONFIG.FLABBERGASTED.traits).reduce((obj, trait) => {
      obj[trait] = new fields.NumberField({ ...DATA_COMMON.requiredInteger, initial: 1, min: 1, max: 8 });
      return obj;
    }, {}));

    schema.luckCoin = new fields.NumberField({ ...DATA_COMMON.requiredInteger, initial: 0, min: 0, max: 3 });
    schema.status = new fields.NumberField({ ...DATA_COMMON.requiredInteger, initial: 1, min: 1, max: 3 });

    schema.readies = new fields.NumberField({ ...DATA_COMMON.requiredInteger, initial: 0, min: 0 });

    schema.relatioship = new fields.StringField({ required: true, blank: true });

    schema.archetype = new fields.StringField({ required: false, blank: true });

    schema.title = new fields.StringField({ required: false, blank: true });
    schema.estate = new fields.StringField({ required: false, blank: true });
    schema.profession = new fields.StringField({ required: false, blank: true });

    schema.flaw = new fields.StringField({ required: true, blank: true });

    schema.nickname = new fields.StringField({ required: false, blank: true });
    schema.nicknameUsed = new fields.BooleanField({ initial: false });

    schema.dilemma = new fields.StringField({ required: true, blank: true });

    schema.mementos = new fields.StringField({ required: false, blank: true });

    schema.socialStanding = new fields.NumberField({ ...DATA_COMMON.requiredInteger, initial: 0, min: -10, max: 10 });

    schema.notes = new fields.StringField({ required: true, blank: true });

    return schema;
  }

  // prepareDerivedData() {
  //   // Loop through ability scores, and add their modifiers to our sheet output.
  //   for (const key in this.abilities) {
  //     // Calculate the modifier using d20 rules.
  //     this.abilities[key].mod = Math.floor((this.abilities[key].value - 10) / 2);
  //     // Handle ability label localization.
  //     this.abilities[key].label = game.i18n.localize(CONFIG.FLABBERGASTED.abilities[key]) ?? key;
  //   }
  // }

  // getRollData() {
  //   const data = {};

  //   // Copy the ability scores to the top level, so that rolls can use
  //   // formulas like `@str.mod + 4`.
  //   if (this.abilities) {
  //     for (let [k, v] of Object.entries(this.abilities)) {
  //       data[k] = foundry.utils.deepClone(v);
  //     }
  //   }

  //   data.lvl = this.attributes.level.value;

  //   return data
  // }
}