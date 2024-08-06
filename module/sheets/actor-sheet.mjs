import {
  onManageActiveEffect,
  prepareActiveEffectCategories,
} from '../helpers/effects.mjs';
import { rollTemplate } from '../helpers/templates.mjs';

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class FlabbergastedActorSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['flabbergasted', 'sheet', 'actor'],
      width: 800,
      height: 660,
      tabs: [
        {
          navSelector: '.sheet-tabs',
          contentSelector: '.sheet-body',
          initial: 'features',
        },
      ],
    });
  }

  /** @override */
  get template() {
    return `systems/flabbergasted/templates/actor/actor-${this.actor.type}-sheet.hbs`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = super.getData();

    // Use a safe clone of the actor data for further operations.
    const actorData = this.document.toPlainObject();

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actorData.system;
    context.flags = actorData.flags;

    // Adding a pointer to CONFIG.FLABBERGASTED
    context.config = CONFIG.FLABBERGASTED;

    // Prepare character data and items.
    if (actorData.type == 'character') {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    // Prepare NPC data and items.
    if (actorData.type == 'npc') {
      this._prepareItems(context);
    }

    // Enrich biography info for display
    // Enrichment turns text like `[[/r 1d20]]` into buttons
    const rollData = this.actor.getRollData();
    context.enrichedDescription = await TextEditor.enrichHTML(
      this.actor.system.description,
      {
        // Whether to show secret blocks in the finished html
        secrets: this.document.isOwner,
        // Necessary in v11, can be removed in v12
        async: true,
        // Data to fill in for inline rolls
        rollData: rollData,
        // Relative UUID resolution
        relativeTo: this.actor,
      }
    );
    context.enrichedBackground = await TextEditor.enrichHTML(
      this.actor.system.background,
      {
        // Whether to show secret blocks in the finished html
        secrets: this.document.isOwner,
        // Necessary in v11, can be removed in v12
        async: true,
        // Data to fill in for inline rolls
        rollData: rollData,
        // Relative UUID resolution
        relativeTo: this.actor,
      }
    );

    // Prepare active effects
    context.effects = prepareActiveEffectCategories(
      // A generator that returns all effects stored on the actor
      // as well as any items
      this.actor.allApplicableEffects()
    );

    return context;
  }

  /**
   * Character-specific context modifications
   *
   * @param {object} context The context object to mutate
   */
  _prepareCharacterData(context) {
    // This is where you can enrich character-specific editor fields
    // or setup anything else that's specific to this type

    context.socialStandingValues = [];
    for (let index = -10; index <= 10; index++) {
      if (index == 0) {
        context.socialStandingValues.push(0);
        continue;
      }

      if (index < 0 && context.system.socialStanding < 0 && index >= context.system.socialStanding) {
        context.socialStandingValues.push(Math.abs(index));
        continue;
      }

      if (index > 0 && context.system.socialStanding > 0 && index <= context.system.socialStanding) {
        context.socialStandingValues.push(index);
        continue;
      }

      context.socialStandingValues.push("");
    }

    context.traits = [];
    for (const trait of Object.keys(CONFIG.FLABBERGASTED.traits)) {
      const t = {
        id: trait,
        label: CONFIG.FLABBERGASTED.traits[trait],
        value: this.actor.system.traits[trait],
        max: 4 //TODO: check if Club has upgrade
      };
      context.traits.push(t);
    }
  }

  /**
   * Organize and classify Items for Actor sheets.
   *
   * @param {object} context The context object to mutate
   */
  _prepareItems(context) {
    // Initialize containers.
    const gear = [];
    const features = [];
    const sceneCues = [];

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || Item.DEFAULT_ICON;
      // Append to gear.
      if (i.type === 'item') {
        gear.push(i);
      }
      // Append to features.
      else if (i.type === 'feature') {
        features.push(i);
      }
      // Append to spells.
      else if (i.type === 'sceneCue') {
        i.usages = [];
        let available = false;
        for (let index = 1; index <= i.system.maxUsage; index++) {
          let usage = {
            disabled: index <= i.system.availableUsage ? "" : "disabled",
            checked: index > i.system.used ? "" : "checked"
          };

          i.usages.push(usage);
        }
        i.canUse = i.system.availableUsage > 0 && i.system.used < i.system.availableUsage;
        switch (i.system.socialStanding) {
          case -1:
            i.socialStandingChange = "Dignity";
            break;
          case 1:
            i.socialStandingChange = "Scandal";
            break;
          default:
            i.socialStandingChange = "";
        }

        sceneCues.push(i);
      }
    }

    // Assign and return
    context.gear = gear;
    context.features = features;
    context.sceneCues = sceneCues;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Render the item sheet for viewing/editing prior to the editable check.
    html.on('click', '.item-edit', (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      item.sheet.render(true);
    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add Inventory Item
    html.on('click', '.item-create', this._onItemCreate.bind(this));

    // Delete Inventory Item
    html.on('click', '.item-delete', this._onItemDelete.bind(this));

    // Active Effect management
    html.on('click', '.effect-control', (ev) => {
      const row = ev.currentTarget.closest('li');
      const document =
        row.dataset.parentId === this.actor.id
          ? this.actor
          : this.actor.items.get(row.dataset.parentId);
      onManageActiveEffect(ev, document);
    });

    // Rollable abilities.
    html.on('click', '.rollable', this._onRoll.bind(this));
    html.on('click', '.rollable.trait', this._onTraitClick.bind(this));
    html.on('click', '.rollable.status', this._onStatusClick.bind(this));
    html.on('click', '.rollable.luck-coin', this._onLuckCoinClick.bind(this));
    html.on('click', '.rollable.nickname', this._onNicknameClick.bind(this));

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = (ev) => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains('inventory-header')) return;
        li.setAttribute('draggable', true);
        li.addEventListener('dragstart', handler, false);
      });
    }

    // Create context menu for items on both sheets
    this._contextMenu(html);
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: data,
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system['type'];

    // Finally, create the item!
    return await Item.create(itemData, { parent: this.actor });
  }

  async _onItemDelete(event) {
    event.preventDefault();
    const li = $(ev.currentTarget).parents('.item');
    const item = this.actor.items.get(li.data('itemId'));
    item.delete();
    li.slideUp(200, () => this.render(false));
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    // Handle item rolls.
    if (dataset.rollType) {

      if (dataset.rollType == "dignity")
        return this._updateSocialStanding(true);

      if (dataset.rollType == "scandal")
        return this._updateSocialStanding(false);

      const itemId = element.closest('.item').dataset.itemId;
      const item = this.actor.items.get(itemId);
      if (!item)
        return;

      if (dataset.rollType == 'item') {
        return item.roll();
      }
      if (dataset.rollType == 'scene-cue') {
        return await item.system.roll(this.actor);
      }

    }

    // Handle rolls that supply the formula directly.
    if (dataset.roll) {
      let label = dataset.label ? `[ability] ${dataset.label}` : '';
      let roll = new Roll(dataset.roll, this.actor.getRollData());
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        rollMode: game.settings.get('core', 'rollMode'),
      });
      return roll;
    }


  }

  _contextMenu(html) {
    ContextMenu.create(this, html, "div.scene-cue", this._getItemContextOptions());
  }

  _getItemContextOptions() {
    const canEdit = function (tr) {
      let result = false;
      const itemId = tr.data("item-id");

      if (game.user.isGM) {
        result = true;
      }
      else {
        result = this.actor.items.find(item => item._id === itemId)
          ? true
          : false;
      }

      return result;
    };

    return [
      {
        name: "SIDEBAR.Edit",
        icon: '<i class="fas fa-edit"></i>',
        condition: element => canEdit(element),
        callback: element => {
          const itemId = element.data("itemId");
          const item = this.actor.items.get(itemId);
          return item.sheet.render(true);
        },
      },
      {
        name: "SIDEBAR.Delete",
        icon: '<i class="fas fa-trash"></i>',
        condition: tr => canEdit(tr),
        callback: element => {
          const itemId = element.data("itemId");
          const item = this.actor.items.get(itemId);
          element.slideUp(200, () => this.render(false));
          item.delete();
        },
      },
    ];
  }

  async _updateSocialStanding(increaseDignity) {
    const increase = increaseDignity ? -1 : 1;
    let newSocialStanding = this.actor.system.socialStanding + increase;
    newSocialStanding = Math.max(-10, Math.min(10, newSocialStanding));
    await this.actor.update({ "system.socialStanding": newSocialStanding });
  }

  async _onTraitClick(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let field = element.dataset.field;
    let value = parseInt(element.dataset.actionValue ? element.dataset.actionValue : "0");

    if (event.altKey) {
      return this.actor.update({ [field]: (value - 1 >= 1) ? value - 1 : value });
    }
    else if (event.shiftKey) {
      let max = parseInt(element.dataset.actionMaxValue);
      return this.actor.update({ [field]: (value + 1 <= max) ? value + 1 : value });
    }
    else {
      return await this._rollTrait(element.dataset.trait);
    }
  }

  async _rollTrait(trait) {
    console.log(trait);
    let formula = `${this.actor.system.traits[trait]}d6cs>=5`;

    let roll = await new Roll(formula).roll();
    let traitKey = `FLABBERGASTED.Traits.${trait[0].toUpperCase() + trait.slice(1)}`;
    let content = `<h2>${game.i18n.localize(traitKey)}</h2>`;
    let totalText = "";
    switch (roll.total) {
      case 0:
        totalText = "(Fail)"
        break;
      case 1:
        totalText = "Success"
        break;
      default:
        totalText = "Successes"
        break;
    }

    const chatContent = await renderTemplate(rollTemplate, {
      flavor: content,
      formula: roll.formula,
      tooltip: await roll.getTooltip(),
      total: `${roll.total}`,
      totalText: totalText,
      totalClass: roll.total > 0 ? "success" : "failure"
    })
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      content: chatContent
    });
  }

  async _onStatusClick(event) {
    event.preventDefault();
    let value = 0;
    if (event.altKey)
      value = -1;
    else if (event.shiftKey)
      value = 1;
    const newValue = this.actor.system.status + value;
    await this.actor.update({ "system.status": Math.max(1, Math.min(3, newValue)) });
  }

  async _onLuckCoinClick(event) {
    event.preventDefault();
    let value = 0;
    if (event.altKey)
      value = -1;
    else if (event.shiftKey)
      value = 1;
    const newValue = this.actor.system.luckCoin + value;
    await this.actor.update({ "system.luckCoin": Math.max(0, Math.min(3, newValue)) });
  }

  async _onNicknameClick(event) {
    event.preventDefault();
    await this.actor.update({ "system.nicknameUsed": !event.altKey });
  }
}
