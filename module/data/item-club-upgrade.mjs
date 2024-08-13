import FlabbergastedItemBase from "./item-base.mjs";
import { DATA_COMMON } from "./common.mjs";
import { clubUpgradeTemplate } from "../helpers/templates.mjs";

export default class FlabbergastedClubUpgrade extends FlabbergastedItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.minRenown = new fields.NumberField({ ...DATA_COMMON.requiredInteger, initial: 0, min: 1, max: 15 });
    schema.readies = new fields.NumberField({ ...DATA_COMMON.requiredInteger, initial: 0, min: 0, max: 1000 });
    schema.extraRequirement = new fields.StringField({ required: false, blank: true });

    schema.hasUsage = new fields.BooleanField({ initial: false });
    schema.used = new fields.BooleanField({ initial: false });

    return schema;
  }

  async prepareData(context) {
    let hasUsageOptions =
    {
      choices: {
        false: "No",
        true: "Yes"
      },
      chosen: `${this.hasUsage}`
    };
    let isUsedOptions =
    {
      choices: {
        false: "No",
        true: "Yes"
      },
      chosen: `${this.used}`
    };
    context.hasUsageOptions = hasUsageOptions;
    context.isUsedOptions = isUsedOptions;
  }

  async roll(actor) {
    if (!this.hasUsage || this.used)
      return;

    const item = this.parent;

    // Initialize chat data.
    const speaker = ChatMessage.getSpeaker({ actor: actor });
    const rollMode = game.settings.get('core', 'rollMode');

    await item.update({ "system.used": true });

    const content = await renderTemplate(clubUpgradeTemplate, {
      clubUpgrade: item
    });

    await ChatMessage.create({
      speaker: speaker,
      rollMode: rollMode,
      content: content,
    });
  }
}