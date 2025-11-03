using API.Data;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;

using Microsoft.AspNetCore.Mvc;

namespace API.Controllers 
{
    [Route("api/[controller]")]
    [ApiController]
    public class LikesController(IUnitOfWork uow) : BaseApiController
    {

        [HttpPost("{targetMemberId}")]
        public async Task<ActionResult> ToggleLike(string targetMemberId)
        {
            var user = User.GetMemberId();

            var like = await uow.LikesRepository.GetMemberLike(user, targetMemberId);

            if (user == targetMemberId) return BadRequest("You cannot like yourself");
            if (like == null) uow.LikesRepository.AddLike(new MemberLike
            {
                SourceMemberId = user,
                TargetMemberId = targetMemberId
            });

            else uow.LikesRepository.DeleteLike(like);

            if (await uow.Complete()) return Ok();

            return BadRequest("Failed to update like");

        }

        [HttpGet("list")]
        public async Task<ActionResult<IReadOnlyList<string>>> GetCurrentMemberLikeIds()
        {
            return Ok(await uow.LikesRepository.GetCurrentMemberLikeIds(User.GetMemberId()));
        }

        [HttpGet]
        public async Task<ActionResult<PaginatedResult<Member>>> GetMemberLikes2(string predicate,[FromQuery] MemberParams memberParams)
        {
            var members = await uow.LikesRepository.GetMemberLikes2(predicate, User.GetMemberId(),memberParams);
            return Ok(members);

        }

    }
}
