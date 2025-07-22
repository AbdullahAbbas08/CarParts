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
    public DbSet<Merchant> Sellers { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Category> Categories { get; set; } 
    public DbSet<SellerCategory> SellerCategories { get; set; } 
    public DbSet<Localization> Localizations { get; set; }
    public DbSet<CarsModel> CarsModels { get; set; }
    public DbSet<ModelType> ModelTypes { get; set; }
    public DbSet<Offer> Offers { get; set; }
    public DbSet<VisitorRegister> VisitorRegisters { get; set; }


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Merchant>()
            .HasMany(s => s.Parts)
            .WithOne(p => p.Seller)
            .HasForeignKey(p => p.SellerId);

        modelBuilder.Entity<Merchant>()
            .HasMany(s => s.SellerCategories)
            .WithOne(s => s.Seller)
            .HasForeignKey(f => f.SellerId);

        modelBuilder.Entity<Merchant>()
            .HasOne(s => s.User)
            .WithOne(s => s.Seller)
            .HasForeignKey<Merchant>(s => s.UserId);


        modelBuilder.Entity<Category>()
          .HasMany(c => c.Parts)
          .WithOne(p => p.Category)
          .HasForeignKey(p => p.CategoryId);
    }
}
