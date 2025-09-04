using System;
using API.DTO;
using API.Entities;
using API.Interfaces;

namespace API.Extensions;

public static class AppUserExtension 
{
    public static UserDto toDto(this AppUser appUser,ITokenService tokenService)
    {
        return new UserDto
        {
            Id = appUser.Id,
            Email = appUser.Email,
            DisplayName = appUser.DisplayName,
            Token = tokenService.CreateToken(appUser),
            ImageUrl = appUser.ImageUrl
        };
    }
}
