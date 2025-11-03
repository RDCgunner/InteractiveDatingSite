using System;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class NameOfTheControllerController:Controller
{
    public ActionResult NameOfTheMethodInsideCtrl()
    {
        return PhysicalFile(Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "index.html"), "text/HTML");
    }
}
