using System.Security.Claims;
using System.Text;
using API.Data;
using API.Entities;
using API.Helpers;
using API.Interfaces;
using API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Migrations.Operations;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddCors();
builder.Services.AddControllers();
builder.Services.AddDbContext<AppDbContext>(opt =>
{
    opt.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"));
});

builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IPhotoService, PhotoService>();

builder.Services.AddScoped<IMemberRepository, MemberRepository>();

builder.Services.Configure<CloudinarySettings>(builder.Configuration.GetSection("CloudPhotoSettings"));
//extracts from request the jwt token inside header and validates it
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var tokenKey = builder.Configuration["TokenKey"] ?? throw new Exception("Token key not found from main");
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(tokenKey)),
            ValidateIssuer = false,
            ValidateAudience = false
        };

    });

var app = builder.Build();

// Configure the HTTP request pipeline.

//app.UseAuthorization();
app.UseCors(options =>
{
    options.AllowAnyHeader().AllowAnyMethod().WithOrigins("http://localhost:4200", "https://localhost:4200");
});

app.UseAuthentication(); //who
app.UseAuthorization(); //R U Authorized ==needs to be after authentication

app.MapControllers();

//Seed data
using var scope = app.Services.CreateScope();
var services = scope.ServiceProvider;
try
{
    var context = services.GetRequiredService<AppDbContext>();
    await context.Database.MigrateAsync();
    await Seed.SeedUsers(context);
}
catch (Exception Ex)
{
    var logger = services.GetRequiredService<ILogger<Program>>();
    logger.LogError(Ex, "An error has occured during migration");
    throw;
}



app.Run();
