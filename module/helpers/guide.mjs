export function registerGuideSetting() {
  game.settings.register("flabbergasted", "guide", {
    name: "Guide created",
    hint: "Basic Guide has been created and displayed.",
    scope: "world",
    config: false,
    type: Boolean,
    default: false,
  });
}

export async function checkAndShowGuideSetting() {
  if (game.settings.get("flabbergasted", "guide")) return;
  if (!game.user.isGM) return;

  const entry = await JournalEntry.create({
    name: "Flabbergasted - System",
    permission: { default: 2 },
    pages: [
      {
        name: "How to use the Flabbergasted System?",
        title: {
          show: false,
          level: 1
        },
        text: {
          content: /* html */ `
<h1 style="text-align:center">Hod Studio Publishing,<br>in collaboration with <a href="https://www.wanderers-tome.com/" target="_blank" rel="nofollow noopener">The Wanderer's Tome</a>,<br>proudly presents:</h1>
<img src="https://raw.githubusercontent.com/Cussa/fvtt-flabbergasted/main/assets/flabbergasted-system.webp">
<p>This is the official Foundry System for the "Flabbergasted" RPG, created by <a href="https://www.wanderers-tome.com/" target="_blank" rel="nofollow noopener">The Wanderer's Tome</a>!</p>
<p>The system does not contain any data for the game. You can create that, following the guide below.</p>
<p><em>Or you can purchase the <strong><a href="https://hodpub.com/product/flabbergasted/" target="_blank" rel="nofollow noopener">premium module</a></strong>, which contains all the core rules, converted to Foundry to give you the best experience possible!</em></p>
<h2>How to use the system?</h2>
<p>The system has three main "item" types: scene cues, flaws and social club upgrades.</p>
<img src="https://github.com/Cussa/fvtt-flabbergasted/raw/main/docs/items.png" alt="Items">
<p>For a full usage, you will need to use a special actor type called "Archetype".</p>
<p>Starting create the scene cues. After you have them ready, you can create the Archetype. Drag and drop the scene cues into the Archetype to link them.</p>
<img src="https://github.com/Cussa/fvtt-flabbergasted/raw/main/docs/archetype.png" alt="Archetype">
<p>With that ready, you can start to create the Characters. Drag and Drop the Archetype to the character sheet to automatically link all the Archetype information into the Character.</p>
<p>Right click a scene cue and edit that to increase the available usages. Leave the used field as zero.</p>
<img src="https://github.com/Cussa/fvtt-flabbergasted/raw/main/docs/scene-cue.png" alt="Scene Cue">
<p>Clicking on the scene cue will mark a usage and show the scene cue name and description into the chat. When the scene cue changes the social standing, the system will do that automatically.</p>
<p>To increate the traits, status or luck coin, use "Shift + Click". To reduce the value, use "Alt/Options + Click". Clicking on the trait will make a roll for the trait clicked, showing the result on the chat.</p>
<p>If necessary, click on the "Scandal" or "Dignity" button to increase the value.</p>
<p>Drag and drop the flaw to the character sheet. Hovering the mouse on the flaw will show a tooltip with their description.</p>
<p>You can click on the Nickname, if you have one, to mark it as used for the session.</p>
<img src="https://github.com/Cussa/fvtt-flabbergasted/raw/main/docs/character.png" alt="Character">
<p>Create the social club and after configure their information, drag and drop it to the character sheet to link them to the club.</p>
<p>You can create the club upgrades as you need them. Drag and drop the club upgrades to the Social Club sheet. It will validate the minimum renown level and the required readies, subtracting the readies automatically.</p>
<p>Some club upgrades influences the character sheet, like the Game Room, that allows Protagonists’ bravado & persuasion to be raised above 4 to a maximum cap of 8. When you have the social club linked to the character sheets, these kind of upgrades will load automatically.</p>
<img src="https://github.com/Cussa/fvtt-flabbergasted/raw/main/docs/social-club.png" alt="Social Club">
<p>The GM will have a special macro called "Reset day", which automatically resets all the usages for the Scene Cues and Social Club Upgrades.</p>
<img src="https://github.com/Cussa/fvtt-flabbergasted/raw/main/docs/reset-usage.png" alt="Reset Usage">
<hr>
<h3>Credits</h3>
<p>Foundry system created by Cussa Mitre/Hod Studio Publishing</p>
<p>Flabbergasted created by Fleur & Chelsea Sciortino/The Wanderers' Tome</p>
    `,
        },
      },
    ],
  });

  entry.sheet.render(true, {
    collapsed: true,
    width: 600,
    height: 600,
  });
  
  game.settings.set("flabbergasted", "guide", true);
}