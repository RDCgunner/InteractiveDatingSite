using API.Data;
using API.Entities;
using API.Extensions;
using API.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers 
{
    [Route("api/[controller]")]
    [ApiController]
    public class LikesController(ILikesRepository likesRepository) : BaseApiController
    {

        [HttpPost("{targetMemberId}")]
        public async Task<ActionResult> ToggleLike(string targetMemberId)
        {
            var user = User.GetMemberId();

            var like = await likesRepository.GetMemberLike(user, targetMemberId);

            if (user == targetMemberId) return BadRequest("You cannot like yourself");
            if (like == null) likesRepository.AddLike(new MemberLike
            {
                SourceMemberId = user,
                TargetMemberId = targetMemberId
            });

            else likesRepository.DeleteLike(like);

            if (await likesRepository.SaveAllChanges()) return Ok();

            return BadRequest("Failed to update like");

        }

        [HttpGet("list")]
        public async Task<ActionResult<IReadOnlyList<string>>> GetCurrentMemberLikeIds()
        {
            return Ok(await likesRepository.GetCurrentMemberLikeIds(User.GetMemberId()));
        }

        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<Member>>> GetMemberLikes(string predicate)
        {
            var members = await likesRepository.GetMemberLikes(predicate, User.GetMemberId());
            return Ok(members);

        }

    }
}
