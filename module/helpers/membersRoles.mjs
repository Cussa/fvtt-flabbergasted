import { memberRolesDialogTemplate } from "./templates.mjs";

export async function prepareMembersRolesData(socialClub) {
  const membersRoles = []
  for (let index = 0; index < socialClub.system.membersRoles.roles.length; index++) {
    const role = socialClub.system.membersRoles.roles[index];

    const memberId = socialClub.system.membersRoles.memberId[index];
    const memberObject = await game.actors.get(memberId);

    membersRoles.push({
      role: role,
      member: {
        id: memberObject?.id || "",
        name: memberObject?.name || memberId
      },
      editable: index > 2
    })
  }
  console.log(membersRoles);
  return membersRoles;
}

async function _handleRender(html) {
  html.on("click", ".rollable.member-role-add", () => {
    console.log("WORKED");
    let div = html.find(".member-roles")[0];
    console.log(div);
    const toInsert ='<div class="info"><input type="text" class="role-edit" placeholder="Role"><input type="text" class="member-edit" placeholder="Name" /></div>';
    div.insertAdjacentHTML( 'beforeend', toInsert );
  });
}

export async function editMembersRoles(socialClub) {
  const membersRoles = await prepareMembersRolesData(socialClub);

  const content = await renderTemplate(memberRolesDialogTemplate, {
    membersRoles: membersRoles
  });

  await new Dialog(
    {
      title: game.i18n.localize("FLABBERGASTED.SocialClub.EditMembersRoles"),
      content: content,
      buttons: {
        save: {
          icon: '<i class="fas fa-save"></i>',
          label: game.i18n.localize("Save"),
          callback: async (html) => {
            const rolesFields = html.find(".role-edit");
            const membersFields = html.find(".member-edit");

            const roles = [];
            const members = [];
            for (let index = 0; index < rolesFields.length; index++) {
              roles.push(rolesFields[index].value ?? rolesFields[index].textContent);
              members.push(membersFields[index].value);
            }

            await socialClub.update({ "system.membersRoles.roles": roles, "system.membersRoles.memberId": members });
          }
        },
        cancel: {
          icon: '<i class="fas fa-xmark"></i>',
          label: game.i18n.localize("Cancel"),
        }
      },
      default: "save",
      render: _handleRender
    }).render(true);
}