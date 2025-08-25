using API.Data;
using API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    // [Route("api/[controller]")] //localhost:5001/api/members
    // [ApiController]
    
    public class MembersController(AppDbContext context) : BaseApiController
    {
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AppUser>>> getMembers()
        {
            var members = await context.Users.ToListAsync();
            return members;
        }
        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult<AppUser>> getMember(string id)
        {
            var member = await context.Users.FindAsync(id);
            if (member == null) return NotFound();
            else return member;
        }

    }
    
}
