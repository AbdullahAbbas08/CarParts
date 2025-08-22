using Data.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Reflection.Emit;

public class DatabaseContext : DbContext
{
    public DatabaseContext(DbContextOptions<DatabaseContext> options)
        : base(options)
    { }

    public DbSet<Part> Parts { get; set; }
    public DbSet<Merchant> Merchants { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Category> Categories { get; set; } 
    public DbSet<Localization> Localizations { get; set; }
    public DbSet<Brand> Brands { get; set; }
    public DbSet<ModelType> ModelTypes { get; set; }
    public DbSet<Offer> Offers { get; set; }
    public DbSet<VisitorRegister> VisitorRegisters { get; set; }
    public DbSet<Role> Roles { get; set; }
    public DbSet<UserRole> UserRoles { get; set; }
    public DbSet<Permission> Permissions { get; set; }
    public DbSet<Image> Images { get; set; }


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Merchant>()
            .HasMany(s => s.Parts)
            .WithOne(p => p.Merchant)
            .HasForeignKey(p => p.MerchantId);

        modelBuilder.Entity<Category>()
          .HasMany(c => c.Parts)
          .WithOne(p => p.Category)
          .HasForeignKey(p => p.CategoryId);

        // Offer relationships (توضيح العلاقات لتجنب الغموض)
        modelBuilder.Entity<Offer>()
            .HasOne(o => o.Part)
            .WithMany(p => p.Offers)
            .HasForeignKey(o => o.PartId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Offer>()
            .HasOne(o => o.FreePart)
            .WithMany() // لا نحتاج تجميع في Part للعروض المجانية
            .HasForeignKey(o => o.FreePartId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<UserRole>()
        .HasKey(ur => new { ur.UserId, ur.RoleId });

        modelBuilder.Entity<UserRole>()
            .HasOne(ur => ur.User)
            .WithMany(u => u.UserRoles)
            .HasForeignKey(ur => ur.UserId);

        modelBuilder.Entity<UserRole>()
            .HasOne(ur => ur.Role)
            .WithMany(r => r.UserRoles)
            .HasForeignKey(ur => ur.RoleId);

        modelBuilder.Entity<UserRole>()
        .HasOne(ur => ur.CreatedByUser)
        .WithOne()
        .HasForeignKey<UserRole>(ur => ur.CreatedByUserId)
        .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Merchant>()
       .HasOne(m => m.City)
       .WithMany(c => c.Merchants)
       .HasForeignKey(m => m.CityId)
       .OnDelete(DeleteBehavior.NoAction);  

    }
}
