using API.Controllers;
using Data.DTOs;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

[Route("api/[controller]")]
[ApiController]
public class CategoriesController : _BaseController<Category, CategoryDto>
{
    private readonly ICategoryService _categoryService;

    public CategoriesController(ICategoryService categoryService) : base(categoryService)
    {
        _categoryService = categoryService;
    }
}
