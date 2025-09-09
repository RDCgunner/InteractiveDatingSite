using System;
using System.Security.Claims;

namespace API.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static string GetMemberId(this ClaimsPrincipal claimsPrincipal)

    { return claimsPrincipal.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new Exception("Cannot get member Id"); }
}
