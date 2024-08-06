import FlabbergastedDataModel from "./base-model.mjs";

export default class FlabbergastedItemBase extends FlabbergastedDataModel {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};

    schema.description = new fields.StringField({ required: true, blank: true });

    return schema;
  }

  async prepareData(context) { }
}