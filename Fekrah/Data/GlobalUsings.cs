// System
global using System;
global using System.IO;
global using System.Net;
global using System.Net.Http;
global using System.Text;
global using System.Text.Json;
global using System.Text.Json.Serialization;
global using System.Threading;
global using System.Threading.Tasks;
global using System.Linq;
global using System.Collections.Generic;

// ASP.NET Core
global using Microsoft.AspNetCore.Builder;
//global using Microsoft.AspNetCore.Hosting;
global using Microsoft.AspNetCore.Http;
//global using Microsoft.AspNetCore.Mvc;
//global using Microsoft.AspNetCore.Mvc.Filters;
//global using Microsoft.AspNetCore.Authorization;
//global using Microsoft.AspNetCore.Authentication;
//global using Microsoft.AspNetCore.Routing;

// Dependency Injection & Configuration
global using Microsoft.Extensions.Configuration;
global using Microsoft.Extensions.DependencyInjection;
//global using Microsoft.Extensions.Hosting;
global using Microsoft.Extensions.Logging;
global using Microsoft.Extensions.Options;

// Entity Framework Core
global using Microsoft.EntityFrameworkCore;
global using Microsoft.EntityFrameworkCore.Metadata.Builders;

// Validation & Attributes
global using System.ComponentModel;
global using System.ComponentModel.DataAnnotations;
global using System.ComponentModel.DataAnnotations.Schema;

// Custom Types (لو عندك)
global using Data.Models;
global using Data.DTOs;
global using Data.Services;
global using Data.Interfaces;
