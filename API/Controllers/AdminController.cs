using API.DTO;
using API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController(UserManager<AppUser> userManager) : BaseApiController
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
                Console.WriteLine("User:" + user.Email);
            }

            var orderedList = userList.OrderByDescending(x => x.Email).Reverse();
            return Ok(orderedList);
        }


        [HttpGet("photos-to-moderate")]
        [Authorize(Policy = "ModeratePhotoRole")]
        public ActionResult GetPhotosForModeration()
        {
            return Ok("Only moderators can moderate photos");
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

    }
}
