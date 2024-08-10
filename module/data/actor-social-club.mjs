import FlabbergastedDataModel from "./base-model.mjs";
import { DATA_COMMON } from "./common.mjs";

export default class FlabbergastedSocialClub extends FlabbergastedDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};

    //club name = name
    //emblem = img
    schema.theme = new fields.StringField({ required: true, blank: true });
    schema.location = new fields.StringField({ required: true, blank: true });
    schema.rivalClubs = new fields.StringField({ required: true, blank: true });

    //TODO: member roles
    schema.slogan = new fields.StringField({ required: true, blank: true });
    schema.funds = new fields.NumberField({ ...DATA_COMMON.requiredInteger, initial: 0, min: 0 });
    schema.members = new fields.NumberField({ ...DATA_COMMON.requiredInteger, initial: 0, min: 0 });

    schema.description = new fields.StringField({ required: true, blank: true });
    schema.bigTrouble = new fields.StringField({ required: true, blank: true });
    schema.publicChallenges = new fields.StringField({ required: true, blank: true });

    schema.notableMembers = new fields.StringField({ required: true, blank: true });
    schema.trophies = new fields.StringField({ required: true, blank: true });

    schema.renown = new fields.NumberField({ ...DATA_COMMON.requiredInteger, initial: 0, min: 0 });

    //club upgrades = items - Think of how to show this on the Sheet

    return schema;
  }
}