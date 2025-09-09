using System.Security.Claims;
using API.Data;
using API.DTO;
using API.Entities;
using API.Extensions;
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
        public async Task<ActionResult<IReadOnlyList<Photo>>> getMembersPhoto(String id)
        {
            return Ok(await memberRepository.GetPhotosForMemberAsync(id));
        }

        [HttpPut]
        public async Task<ActionResult> UpdateMember(MemberUpdateDto memberUpdateDto)
        {
            // Console.WriteLine($"UserId: {this.User.FindFirst(ClaimTypes.NameIdentifier).Value}");
            // var memberId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var memberId = User.GetMemberId(); //from Extension class
            // if (memberId == null) return BadRequest("Ooops - no Id found in token");
            var member = await memberRepository.GetMemberForUpdate(memberId);
            if (member == null) return BadRequest("Could not get member from Db");

            member.DisplayName = memberUpdateDto.DisplayName ?? member.DisplayName;
            member.Description = memberUpdateDto.Description ?? member.Description;
            member.City = memberUpdateDto.City ?? member.City;
            member.Country = memberUpdateDto.Country ?? member.Country;

            member.User.DisplayName = memberUpdateDto.DisplayName ?? member.User.DisplayName;

            if (await memberRepository.SaveAllAsync()) return NoContent(); //returns 204 request

            return BadRequest("End of update member reached! No update was performed");
        }

    }
    
}
