import FlabbergastedActorBase from "./actor-base.mjs";
import { DATA_COMMON } from "./common.mjs";

export default class FlabbergastedArchetype extends FlabbergastedActorBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.primaryTrait = new fields.StringField({ required: true, blank: false, initial: "bp" });
    schema.hasProfession = new fields.BooleanField({ initial: true });
    schema.readies = new fields.NumberField({ ...DATA_COMMON.requiredInteger, initial: 0, min: 0 });
    schema.journal = new fields.StringField({ required: true, blank: true });

    return schema;
  }

  async prepareData(context) {
    let hasProfessionOptions =
    {
      choices: {
        false: "Title/Estate",
        true: "Profession"
      },
      chosen: `${this.hasProfession}`
    };
    context.hasProfessionOptions = hasProfessionOptions;

    if (this.journal) {
      context.journal = await TextEditor.enrichHTML(
        this.journal,
        {
          // Necessary in v11, can be removed in v12
          async: true,
        }
      );
    }
  }
}