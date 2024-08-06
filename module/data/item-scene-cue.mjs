import FlabbergastedItemBase from "./item-base.mjs";
import { DATA_COMMON } from "./common.mjs";

export default class FlabbergastedSceneCue extends FlabbergastedItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.available = new fields.BooleanField({ initial: false });
    schema.socialStanding = new fields.NumberField({ ...DATA_COMMON.requiredInteger, initial: 0, min: -1, max: 1 });
    schema.maxUsage = new fields.NumberField({ ...DATA_COMMON.requiredInteger, initial: 0, min: 0, max: 3 });
    schema.availableUsage = new fields.NumberField({ ...DATA_COMMON.requiredInteger, initial: 0, min: 0, max: 3 });
    schema.used = new fields.NumberField({ ...DATA_COMMON.requiredInteger, initial: 0, min: 0, max: 3 });

    schema.hasExtraItems = new fields.BooleanField({ initial: false });

    schema.extraItem = new fields.SchemaField({
      item1: new fields.StringField({ required: false, blank: true }),
      item2: new fields.StringField({ required: false, blank: true }),
      item3: new fields.StringField({ required: false, blank: true }),
    });

    return schema;
  }

  async prepareData(context) {
    let socialStandingOptions =
    {
      choices: {
        "-1": "Dignity",
        0: "No changes",
        1: "Scandal"
      },
      chosen: `${this.socialStanding}`
    };
    context.socialStandingOptions = socialStandingOptions;
  }

  async roll(actor) {
    if (this.used >= this.availableUsage)
      return;

    const item = this.parent;

    // Initialize chat data.
    const speaker = ChatMessage.getSpeaker({ actor: actor });
    const rollMode = game.settings.get('core', 'rollMode');

    const label = `[Scene Cue] ${item.name}`;

    await item.update({ "system.used": this.used + 1 });
    if (this.socialStanding != 0)
      await actor.update({ "system.socialStanding": Math.min(Math.max(actor.system.socialStanding + this.socialStanding, -10), 10) });
    await ChatMessage.create({
      speaker: speaker,
      rollMode: rollMode,
      flavor: label,
      content: this.description ?? '',
    });
    console.log(actor.system.socialStanding);
  }
}