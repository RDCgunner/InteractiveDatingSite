using System.Threading.Tasks;
using API.Data;
using API.DTO;
using API.Entities;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController(UserManager<AppUser> userManager, IUnitOfWork uow, IPhotoService photoService) : BaseApiController
    {
        [HttpGet("users-with-roles")]
        [Authorize(Policy = "RequireAdminRole")]
        public async Task<ActionResult> GetUsersWithRoles()
        {
            var users = await userManager.Users.ToListAsync();

            var userList = new List<UserManagerDTO>();

            foreach (var user in users)
            {
                var roles = await userManager.GetRolesAsync(user);
                // userList.Add(new
                // {
                //     user.Id,
                //     user.Email,
                //     Roles = roles.ToList()
                // });
                userList.Add(new UserManagerDTO {

                Id= user.Id,
                Email= user.Email!,
                Roles= roles.ToList()
                }
                );
                
            }

            var orderedList = userList.OrderByDescending(x => x.Email).Reverse();
            return Ok(orderedList);
        }




        [Authorize(Policy = "RequireAdminRole")]
        [HttpPost("edit-roles/{userId}")]
        public async Task<ActionResult> EditRoles(string userId, [FromQuery] string roles)
        {
            if (string.IsNullOrEmpty(roles)) return BadRequest("You must select at least one role!");
            var selectedRoles = roles.Split(",").ToArray();
            var user = await userManager.FindByIdAsync(userId);
            if (user == null) return BadRequest("Could not return an user");

            var userRoles = await userManager.GetRolesAsync(user);
            var result = await userManager.AddToRolesAsync(user, selectedRoles.Except(userRoles));
            if (!result.Succeeded) return BadRequest("Could not add the roles to provided user");

            result = await userManager.RemoveFromRolesAsync(user, userRoles.Except(selectedRoles));
            if (!result.Succeeded) return BadRequest("Could not remove  the roles to provided user");

            return Ok(await userManager.GetRolesAsync(user));
        }

        [HttpGet("photos-to-moderate")]
        [Authorize(Policy = "ModeratePhotoRole")]
        public async Task<ActionResult> GetPhotosForModeration()
        {
            var photos = await uow.MemberRepository.GetPhotosForMod();
            if (photos == null) return Ok();
            return Ok(photos);
        }

        [HttpPut("approve-photo/{photo_id}")]
        [Authorize(Policy = "ModeratePhotoRole")]
        public async Task<ActionResult> SetModerationApproved(int photo_id)
        {
            var approveAction = await uow.MemberRepository.ApprovePhoto(photo_id);

            if (!approveAction) return BadRequest("Unable to approve photo");

            if (await uow.Complete()) return Ok();

            return BadRequest("EOF");
                
            
        }

        [HttpPut("reject-photo/{photo_id}")]
        [Authorize(Policy = "ModeratePhotoRole")]
        public async Task<ActionResult> SetModerationDenied(int photo_id)
        {
            var deleteAction = await uow.MemberRepository.DeletePhoto(photo_id);
            switch (deleteAction)
            {
                case "0": return BadRequest("Photo id not found in datebase");

                case "1": return Ok();

                case "2": return BadRequest("Unspecified reason");
                
                default:
                    {
                        var result = await photoService.DeletePhotoAsync(deleteAction);
                        if (result.Error != null) return BadRequest(result.Error.Message);
                        if (await uow.Complete()) return Ok();
                        return BadRequest("EOL");
                    }
            }
           
        }

    }
}
