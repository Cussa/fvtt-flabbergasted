import FlabbergastedDataModel from "./base-model.mjs";
import { DATA_COMMON } from "./common.mjs";

export default class FlabbergastedActorBase extends FlabbergastedDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};

    schema.description = new fields.StringField({ required: true, blank: true });
    schema.background = new fields.StringField({ required: true, blank: true });
    schema.age = new fields.NumberField({ ...DATA_COMMON.requiredInteger, initial: 20, min: 0 });

    return schema;
  }
}