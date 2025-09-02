using API.Data;
using API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    // [Route("api/[controller]")] //localhost:5001/api/members
    // [ApiController]
    [Authorize]
    public class MembersController(IMemberRepository memberRepository) : BaseApiController
    {
        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<Member>>> getMembers()
        {
            //var members = await context.Users.ToListAsync();
            //return members;
            return Ok(await memberRepository.GetMembersAsync());


        }
        
        [HttpGet("{id}")]
        public async Task<ActionResult<Member>> getMember(string id)
        {
            var member = await memberRepository.GetMemberByIdAsync(id);
            if (member == null) return NotFound();
            else return member;
        }

        [HttpGet("{id}/photos")]
        public async Task<ActionResult<IReadOnlyList<Photo>>> getMembersPhoto (String id)
        {
            return Ok(await memberRepository.GetPhotosForMemberAsync(id));
        }

    }
    
}
